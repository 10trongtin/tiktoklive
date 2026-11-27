import { getCurrentSessionUser } from '@/lib/auth';
import { getActiveSeason, getAllAppData } from '@/lib/repository';
import { computeLeaderboard, getPeriodBounds } from '@/lib/scoring';
import {
  formatDayMonth,
  formatHourMinute,
  formatShortDateTime,
  getVietnamWeekBounds,
} from '@/lib/formatters';
import {
  StreamerDetailClient,
  StreamerDetailProfile,
  StreamerHistorySessionRow,
} from '@/app/chi-tiet-streamer/StreamerDetailClient';

export default async function StreamerDetailPage({
  searchParams,
}: {
  searchParams: Promise<{ streamerId?: string }>;
}) {
  // Mở công khai minh bạch cho mọi người xem (chỉ Admin mới hiện nút Xem phiên chờ duyệt; không lộ SĐT/Email)
  const user = await getCurrentSessionUser();

  const resolvedParams = await searchParams;
  const data = await getAllAppData();
  const activeStreamers = data.streamers.filter((s) => s.active);

  const options = activeStreamers.map((st) => ({
    id: st.id,
    label: `${st.displayName} — ${st.tiktokUsername}`,
  }));

  const targetStreamer =
    activeStreamers.find((s) => s.id === resolvedParams.streamerId) ??
    activeStreamers[0] ??
    null;

  if (!targetStreamer) {
    return (
      <StreamerDetailClient
        options={[]}
        selected={null}
        canApprove={user?.role === 'admin'}
      />
    );
  }

  const now = new Date();
  const activeSeason = getActiveSeason(data.seasons);
  const weekBounds = getVietnamWeekBounds(now);
  const seasonBounds = getPeriodBounds('tu_dau', activeSeason, now);

  const weeklyRank = computeLeaderboard({
    streamers: activeStreamers,
    sessions: data.liveSessions,
    startUtc: weekBounds.startUtc,
    endUtc: weekBounds.endUtc,
    minSessionMinutes: data.settings.minSessionMinutes,
    pointsPerValidSession: data.settings.pointsPerValidSession,
  });

  const seasonRank = computeLeaderboard({
    streamers: activeStreamers,
    sessions: data.liveSessions,
    startUtc: seasonBounds.startUtc,
    endUtc: seasonBounds.endUtc,
    minSessionMinutes: data.settings.minSessionMinutes,
    pointsPerValidSession: data.settings.pointsPerValidSession,
  });

  const myWeekRow = weeklyRank.find(
    (r) => r.streamer.id === targetStreamer.id
  );
  const mySeasonRow = seasonRank.find(
    (r) => r.streamer.id === targetStreamer.id
  );

  const seasonStartMs = seasonBounds.startUtc.getTime();
  const seasonEndMs = seasonBounds.endUtc.getTime();

  // Chỉ lấy phiên thuộc mùa giải hiện tại (QT-01 CN-04), mới nhất trên
  const mySeasonSessions = data.liveSessions
    .filter((s) => {
      if (s.streamerId !== targetStreamer.id) return false;
      const ms = new Date(s.startedAt).getTime();
      return ms >= seasonStartMs && ms <= seasonEndMs;
    })
    .sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );

  const completedReviewed = mySeasonSessions.filter(
    (s) => s.reviewStatus === 'da_duyet' || s.reviewStatus === 'tu_choi'
  );
  const approvedCount = completedReviewed.filter(
    (s) => s.reviewStatus === 'da_duyet'
  ).length;
  const validRatePercent =
    completedReviewed.length === 0
      ? 100
      : Math.round((approvedCount / completedReviewed.length) * 100);

  const peakSession = [...mySeasonSessions].sort(
    (a, b) => b.peakViewers - a.peakViewers
  )[0];

  const latestSession = mySeasonSessions[0] ?? null;
  const latestSnapshots = latestSession
    ? data.snapshots
        .filter((sn) => sn.sessionId === latestSession.id)
        .sort(
          (a, b) =>
            new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime()
        )
        .map((sn) => ({
          timeLabel: formatHourMinute(sn.capturedAt),
          viewers: sn.viewers,
        }))
    : [];

  // CN-04 Mục 8 M-02 NGUYÊN VĂN: "Phiên <giờ bắt đầu> – <giờ kết thúc> · snapshot mỗi 30 giây từ API"
  const latestChartTitleSub = latestSession
    ? `Phiên ${formatHourMinute(latestSession.startedAt)} – ${
        latestSession.endedAt
          ? formatHourMinute(latestSession.endedAt)
          : 'đang live'
      } · snapshot mỗi 30 giây từ API`
    : null;

  const history: StreamerHistorySessionRow[] = mySeasonSessions.map((s) => {
    let statusTagText = 'Chờ duyệt';
    let statusTagKind: StreamerHistorySessionRow['statusTagKind'] = 'amber';

    if (s.reviewStatus === 'dang_live') {
      statusTagText = '● LIVE';
      statusTagKind = 'live';
    } else if (s.reviewStatus === 'da_duyet') {
      statusTagText =
        s.finalPoints > 0 ? `Đã duyệt · +${s.finalPoints}đ` : 'Đã duyệt';
      statusTagKind = 'green';
    } else if (s.reviewStatus === 'tu_choi') {
      // QT-04 CN-04: Phiên dưới 30 phút hiện trạng thái "Từ chối · < 30 phút"
      const reason =
        s.durationMinutes < data.settings.minSessionMinutes
          ? '< 30 phút'
          : s.rejectReason || 'Từ chối';
      statusTagText = `Từ chối · ${reason}`;
      statusTagKind = 'red-soft';
    } else if (s.reviewStatus === 'cho_duyet_tay') {
      statusTagText = 'Chờ duyệt tay';
      statusTagKind = 'amber';
    }

    return {
      id: s.id,
      dateLabel: formatShortDateTime(s.startedAt),
      title: s.title,
      durationMinutes: s.durationMinutes,
      peakViewers: s.peakViewers,
      statusTagText,
      statusTagKind,
    };
  });

  const teamName =
    data.teams.find((t) => t.id === targetStreamer.teamId)?.name ?? '—';
  const projectName =
    data.projects.find((p) => p.id === targetStreamer.projectId)?.name ?? '—';

  const profile: StreamerDetailProfile = {
    id: targetStreamer.id,
    displayName: targetStreamer.displayName,
    avatarInitials: targetStreamer.avatarInitials,
    tiktokUsername: targetStreamer.tiktokUsername,
    teamName,
    projectName,
    joinedWeek: targetStreamer.joinedWeek,
    weekRank: myWeekRow?.rank ?? 1,
    weekPoints: myWeekRow?.points ?? 0,
    weekApprovedCount: myWeekRow?.validSessionsCount ?? 0,
    seasonTotalMinutes: mySeasonRow?.totalMinutes ?? 0,
    peakViewers: peakSession?.peakViewers ?? 0,
    peakSessionDateNote: peakSession
      ? `Phiên ngày ${formatDayMonth(peakSession.startedAt)}`
      : 'Chưa có phiên live',
    validRatePercent,
    approvedSessionsCount: approvedCount,
    totalCompletedSessionsCount: completedReviewed.length,
    latestChartTitleSub,
    latestSnapshots,
    latestChartPeak: latestSession?.peakViewers ?? 0,
    history,
  };

  return (
    <StreamerDetailClient
      options={options}
      selected={profile}
      canApprove={user?.role === 'admin'}
    />
  );
}
