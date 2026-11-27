import { redirect } from 'next/navigation';
import { getCurrentSessionUser } from '@/lib/auth';
import { getAllAppData } from '@/lib/repository';
import { computeLeaderboard } from '@/lib/scoring';
import { formatDuration, getVietnamWeekBounds } from '@/lib/formatters';
import {
  ManageStreamerRow,
  ManageStreamersClient,
} from '@/app/quan-ly-streamer/ManageStreamersClient';

export default async function ManageStreamersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await getCurrentSessionUser();
  if (!user || user.role !== 'admin') {
    redirect('/');
  }

  const resolvedSearch = await searchParams;
  const initialQuery = resolvedSearch.q ?? '';

  const data = await getAllAppData();
  const activeStreamers = data.streamers.filter((s) => s.active);
  const week = getVietnamWeekBounds(new Date());
  const startMs = week.startUtc.getTime();
  const endMs = week.endUtc.getTime();

  const weeklyRank = computeLeaderboard({
    streamers: activeStreamers,
    sessions: data.liveSessions,
    startUtc: week.startUtc,
    endUtc: week.endUtc,
    minSessionMinutes: data.settings.minSessionMinutes,
    pointsPerValidSession: data.settings.pointsPerValidSession,
  });

  const weeklyMinsMap = new Map(
    weeklyRank.map((r) => [r.streamer.id, r.totalMinutes])
  );

  const teamMap = new Map(data.teams.map((t) => [t.id, t]));
  const projMap = new Map(data.projects.map((p) => [p.id, p]));

  const rows: ManageStreamerRow[] = activeStreamers.map((st) => {
    // CH-04 & QT-01 CN-10: Phiên < 30 phút bị tự từ chối không tính là phiên hợp lệ;
    // kiểm tra streamer có phiên hợp lệ / đang live / chờ duyệt trong tuần hay chưa:
    const hasNonRejectedSessionThisWeek = data.liveSessions.some((sess) => {
      if (sess.streamerId !== st.id) return false;
      const ms = new Date(sess.startedAt).getTime();
      if (ms < startMs || ms > endMs) return false;
      return sess.reviewStatus !== 'tu_choi';
    });

    const isCurrentlyLive =
      st.isLive ||
      data.liveSessions.some(
        (sess) => sess.streamerId === st.id && sess.reviewStatus === 'dang_live'
      );

    let trackingStatus: ManageStreamerRow['trackingStatus'] = 'Đang theo dõi';
    if (isCurrentlyLive) {
      trackingStatus = '● Đang live';
    } else if (!hasNonRejectedSessionThisWeek) {
      trackingStatus = 'Chưa live tuần này';
    }

    return {
      id: st.id,
      displayName: st.displayName,
      avatarInitials: st.avatarInitials,
      tiktokUsername: st.tiktokUsername,
      teamName: teamMap.get(st.teamId)?.name ?? '—',
      projectShortName: projMap.get(st.projectId)?.shortName ?? '—',
      weekDurationFormatted: formatDuration(weeklyMinsMap.get(st.id) ?? 0),
      trackingStatus,
    };
  });

  const teamShortSummary = data.teams.map((t) => t.shortName).join(' · ');
  const teamMemberCountsSummary = data.teams
    .map((t) => activeStreamers.filter((s) => s.teamId === t.id).length)
    .join(' · ');

  const projectShortSummary = data.projects.map((p) => p.shortName).join(' · ');
  const projectMemberCountsSummary = data.projects
    .map((p) => activeStreamers.filter((s) => s.projectId === p.id).length)
    .join(' · ');

  return (
    <ManageStreamersClient
      initialQuery={initialQuery}
      activeCount={activeStreamers.length}
      teamShortSummary={teamShortSummary}
      teamMemberCountsSummary={teamMemberCountsSummary}
      projectShortSummary={projectShortSummary}
      projectMemberCountsSummary={projectMemberCountsSummary}
      teamCount={data.teams.length}
      projectCount={data.projects.length}
      rows={rows}
    />
  );
}
