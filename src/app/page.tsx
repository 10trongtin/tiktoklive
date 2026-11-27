import { redirect } from 'next/navigation';
import { getCurrentSessionUser } from '@/lib/auth';
import { getActiveSeason, getAllAppData } from '@/lib/repository';
import { computeLeaderboard, getPeriodBounds } from '@/lib/scoring';
import { getVietnamWeekBounds } from '@/lib/formatters';
import {
  canApproveSessions,
  canExportRankingExcel,
} from '@/lib/permissions';
import { RankingPeriodTab } from '@/types/domain';
import { LiveModalRoomData } from '@/components/ui/ToastProvider';
import {
  LeaderboardClient,
  PeriodRankingDataset,
} from '@/app/LeaderboardClient';

export default async function LeaderboardPage() {
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect('/dang-nhap');
  }

  const data = await getAllAppData();
  const now = new Date();
  const activeSeason = getActiveSeason(data.seasons);
  const weekBounds = getVietnamWeekBounds(now);

  const teamMap = new Map(data.teams.map((t) => [t.id, t]));
  const projectMap = new Map(data.projects.map((p) => [p.id, p]));
  const streamerMap = new Map(data.streamers.map((s) => [s.id, s]));

  const activeLiveSet = new Set(
    data.liveSessions
      .filter((s) => s.reviewStatus === 'dang_live')
      .map((s) => s.streamerId)
  );

  const tabs: RankingPeriodTab[] = ['tuan_nay', 'thang_nay', 'tu_dau'];
  const datasets = {} as Record<RankingPeriodTab, PeriodRankingDataset>;

  for (const tab of tabs) {
    const bounds = getPeriodBounds(tab, activeSeason, now);
    const ranked = computeLeaderboard({
      streamers: data.streamers,
      sessions: data.liveSessions,
      startUtc: bounds.startUtc,
      endUtc: bounds.endUtc,
      minSessionMinutes: data.settings.minSessionMinutes,
      pointsPerValidSession: data.settings.pointsPerValidSession,
    });

    datasets[tab] = {
      periodWord: bounds.periodWord,
      totalMinutesAll: ranked.reduce((acc, r) => acc + r.totalMinutes, 0),
      rows: ranked.map((r) => ({
        rank: r.rank,
        streamerId: r.streamer.id,
        displayName: r.streamer.displayName,
        avatarInitials: r.streamer.avatarInitials,
        tiktokUsername: r.streamer.tiktokUsername,
        teamName: teamMap.get(r.streamer.teamId)?.name ?? '—',
        projectShortName:
          projectMap.get(r.streamer.projectId)?.shortName ?? '—',
        validSessionsCount: r.validSessionsCount,
        totalMinutes: r.totalMinutes,
        peakViewers: r.peakViewers,
        points: r.points,
        isLive: r.isLive || activeLiveSet.has(r.streamer.id),
      })),
    };
  }

  const liveRooms: LiveModalRoomData[] = data.liveSessions
    .filter((s) => {
      if (s.reviewStatus !== 'dang_live') return false;
      const st = streamerMap.get(s.streamerId);
      return Boolean(st && st.active);
    })
    .sort((a, b) => b.currentViewers - a.currentViewers)
    .map((sess) => {
      const st = streamerMap.get(sess.streamerId)!;
      const proj =
        projectMap.get(sess.projectId) ?? projectMap.get(st.projectId);
      const liveMinutes = Math.max(
        sess.durationMinutes,
        Math.max(
          1,
          Math.round(
            (now.getTime() - new Date(sess.startedAt).getTime()) / 60000
          )
        )
      );
      return {
        sessionId: sess.id,
        streamerId: st.id,
        streamerName: st.displayName,
        avatarInitials: st.avatarInitials,
        tiktokUsername: st.tiktokUsername,
        title: sess.title,
        projectName: proj?.name ?? 'Picity Central Park',
        currentViewers: sess.currentViewers,
        liveMinutes,
        streamUrl:
          sess.streamUrl ||
          `https://www.tiktok.com/${st.tiktokUsername}/live`,
      };
    });

  const pendingSessionsCount = data.liveSessions.filter(
    (s) => s.reviewStatus === 'cho_duyet' || s.reviewStatus === 'cho_duyet_tay'
  ).length;

  const secondsSincePoll = Math.max(
    1,
    Math.floor(
      (now.getTime() - new Date(data.settings.lastPolledAt).getTime()) / 1000
    )
  );

  return (
    <LeaderboardClient
      weekLabel={weekBounds.label}
      weekSlug={weekBounds.shortSlug}
      initialSecondsAgo={Math.min(secondsSincePoll, 59)}
      canExport={canExportRankingExcel(user.role)}
      canApprove={canApproveSessions(user.role)}
      canOpenDetail={user.role === 'admin' || user.role === 'executive'}
      pendingSessionsCount={pendingSessionsCount}
      liveRooms={liveRooms}
      datasets={datasets}
    />
  );
}
