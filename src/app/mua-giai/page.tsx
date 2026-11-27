import { redirect } from 'next/navigation';
import { getCurrentSessionUser } from '@/lib/auth';
import {
  getActiveSeason,
  getAllAppData,
  getTodayVietnamYmd,
} from '@/lib/repository';
import { computeLeaderboard } from '@/lib/scoring';
import { formatDuration } from '@/lib/formatters';
import {
  SeasonClient,
  SeasonSummaryItem,
} from '@/app/mua-giai/SeasonClient';

const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

function formatYmdToDdMm(ymd: string): string {
  const [, m, d] = ymd.split('-');
  return `${d}/${m}`;
}

export default async function SeasonPage() {
  const user = await getCurrentSessionUser();
  if (!user || user.role !== 'admin') {
    redirect('/');
  }

  const data = await getAllAppData();
  const activeStreamers = data.streamers.filter((s) => s.active);
  const todayYmd = getTodayVietnamYmd();
  const [ty, tm, td] = todayYmd.split('-').map(Number);
  const todayMs = Date.UTC(ty, tm - 1, td);

  const items: SeasonSummaryItem[] = data.seasons.map((s) => {
    const [sy, sm, sd] = s.startDate.split('-').map(Number);
    const [ey, em, ed] = s.endDate.split('-').map(Number);
    const startUtc = new Date(Date.UTC(sy, sm - 1, sd, 0, 0, 0, 0) - VN_OFFSET_MS);
    const endUtc = new Date(
      Date.UTC(ey, em - 1, ed, 23, 59, 59, 999) - VN_OFFSET_MS
    );

    const leaderboard = computeLeaderboard({
      streamers: activeStreamers,
      sessions: data.liveSessions,
      startUtc,
      endUtc,
      minSessionMinutes: data.settings.minSessionMinutes,
      pointsPerValidSession: data.settings.pointsPerValidSession,
    });

    const approvedSessionsCount = leaderboard.reduce(
      (acc, r) => acc + r.validSessionsCount,
      0
    );
    const totalMins = leaderboard.reduce((acc, r) => acc + r.totalMinutes, 0);
    const top = leaderboard[0];
    const leaderName =
      top && (top.points > 0 || top.totalMinutes > 0)
        ? top.streamer.displayName
        : '—';

    const startDayMs = Date.UTC(sy, sm - 1, sd);
    const endDayMs = Date.UTC(ey, em - 1, ed);
    const totalDays = Math.max(
      1,
      Math.round((endDayMs - startDayMs) / (24 * 3600 * 1000)) + 1
    );
    const elapsedDays = Math.min(
      totalDays,
      Math.max(1, Math.round((todayMs - startDayMs) / (24 * 3600 * 1000)) + 1)
    );
    const remainingDays = Math.max(
      0,
      Math.round((endDayMs - todayMs) / (24 * 3600 * 1000))
    );

    return {
      id: s.id,
      name: s.name,
      dateRangeLabel: `${formatYmdToDdMm(s.startDate)} – ${formatYmdToDdMm(
        s.endDate
      )}`,
      streamerCount: activeStreamers.length,
      approvedSessionsCount,
      totalMinutesFormatted: formatDuration(totalMins),
      leaderName,
      status: s.status,
      remainingDays,
      dayProgressCurrent: elapsedDays,
      dayProgressTotal: totalDays,
      ruleLabel: s.ruleLabel,
    };
  });

  const activeSeasonRaw = getActiveSeason(data.seasons);
  const currentSummary = activeSeasonRaw
    ? items.find((i) => i.id === activeSeasonRaw.id) ?? null
    : null;

  return <SeasonClient currentSeason={currentSummary} seasons={items} />;
}
