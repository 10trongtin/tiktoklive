import { redirect } from 'next/navigation';
import { getCurrentSessionUser } from '@/lib/auth';
import { getAllAppData } from '@/lib/repository';
import { computeLeaderboard } from '@/lib/scoring';
import {
  formatDuration,
  formatHourMinute,
  getVietnamWeekBounds,
} from '@/lib/formatters';
import {
  ExecutiveClient,
  TeamHoursItem,
} from '@/app/tong-quan-dieu-hanh/ExecutiveClient';

export default async function ExecutiveOverviewPage() {
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect('/dang-nhap');
  }
  if (user.role !== 'admin' && user.role !== 'executive') {
    redirect('/');
  }

  const data = await getAllAppData();
  const now = new Date();
  const weekBounds = getVietnamWeekBounds(now);
  const startMs = weekBounds.startUtc.getTime();
  const endMs = weekBounds.endUtc.getTime();

  const activeStreamers = data.streamers.filter((s) => s.active);
  const weeklyRank = computeLeaderboard({
    streamers: activeStreamers,
    sessions: data.liveSessions,
    startUtc: weekBounds.startUtc,
    endUtc: weekBounds.endUtc,
    minSessionMinutes: data.settings.minSessionMinutes,
    pointsPerValidSession: data.settings.pointsPerValidSession,
  });

  // QT-01 CN-03: Một streamer "đạt KPI tuần" khi tổng giờ live trong tuần ≥ 4h (240 phút)
  const kpiTargetMins = data.settings.weeklyKpiMinutes;
  const kpiAchievedCount = weeklyRank.filter(
    (r) => r.totalMinutes >= kpiTargetMins
  ).length;
  const kpiAchievedPercent =
    activeStreamers.length === 0
      ? 0
      : Math.round((kpiAchievedCount / activeStreamers.length) * 100);

  // QT-02 CN-03: Tổng giờ toàn đội = cộng giờ live mọi streamer trong tuần; bằng tổng các team & dự án
  const totalTeamMinutes = weeklyRank.reduce(
    (acc, r) => acc + r.totalMinutes,
    0
  );
  const totalValidSessionsCount = weeklyRank.reduce(
    (acc, r) => acc + r.validSessionsCount,
    0
  );

  const liveSessionsNow = data.liveSessions.filter(
    (s) => s.reviewStatus === 'dang_live'
  );
  const liveRoomsCount = liveSessionsNow.length;
  const liveViewersCount = liveSessionsNow.reduce(
    (acc, s) => acc + s.currentViewers,
    0
  );

  // QT-03 CN-03: Chưa live phiên nào (phiên < 30p bị tự từ chối không tính là đã live CH-04)
  const zeroLiveStreamers = activeStreamers.filter((st) => {
    const hasValidOrActiveThisWeek = data.liveSessions.some((sess) => {
      if (sess.streamerId !== st.id) return false;
      const ms = new Date(sess.startedAt).getTime();
      if (ms < startMs || ms > endMs) return false;
      return sess.reviewStatus !== 'tu_choi';
    });
    return !hasValidOrActiveThisWeek;
  });

  const rawTeamMinutes = data.teams.map((t) => {
    const mins = weeklyRank
      .filter((r) => r.streamer.teamId === t.id)
      .reduce((acc, r) => acc + r.totalMinutes, 0);
    return { id: t.id, name: t.name, minutes: mins };
  });
  const maxTeamMinutes = Math.max(1, ...rawTeamMinutes.map((t) => t.minutes));
  const teamHours: TeamHoursItem[] = rawTeamMinutes.map((t) => ({
    ...t,
    widthPercent:
      t.minutes === 0 ? 0 : Math.round((t.minutes / maxTeamMinutes) * 100),
  }));

  const projectParts = data.projects.map((p) => {
    const mins = weeklyRank
      .filter((r) => r.streamer.projectId === p.id)
      .reduce((acc, r) => acc + r.totalMinutes, 0);
    return `${p.shortName} ${formatDuration(mins)}`;
  });
  const projectSummaryLine = `Theo dự án: ${projectParts.join(' · ')}.`;

  // Mục Cần chú ý tuần này dựa trên dữ liệu thực tế
  const activeWithHours = weeklyRank.filter((r) => r.totalMinutes >= 60);
  const lowViewCandidate = [...activeWithHours].sort(
    (a, b) => a.peakViewers - b.peakViewers
  )[0];

  const lowViewNote = lowViewCandidate
    ? `${lowViewCandidate.streamer.displayName} — ${formatDuration(
        lowViewCandidate.totalMinutes
      )} live nhưng peak chỉ ${
        lowViewCandidate.peakViewers
      }. Nên hỗ trợ tiêu đề phiên và khung giờ vàng 19h–21h.`
    : 'Chưa phát hiện streamer live nhiều nhưng lượt xem thấp trong tuần này.';

  const skippedLiveNote =
    zeroLiveStreamers.length > 0
      ? `${zeroLiveStreamers.length} streamer chưa có phiên nào — cần trưởng team xác nhận lý do trước thứ 6.`
      : 'Toàn bộ streamer đang theo dõi đều đã lên live trong tuần này.';

  const topPerformer = weeklyRank[0];
  const mostEffectiveNote =
    topPerformer && topPerformer.totalMinutes > 0
      ? `${topPerformer.streamer.displayName} — ${formatDuration(
          topPerformer.totalMinutes
        )}, peak ${topPerformer.peakViewers}, đều đặn ${
          topPerformer.validSessionsCount
        } phiên/tuần.`
      : 'Chưa có dữ liệu phiên đã chốt trong tuần này.';

  return (
    <ExecutiveClient
      weekLabel={weekBounds.label}
      updatedTimeHm={formatHourMinute(now)}
      kpiAchievedCount={kpiAchievedCount}
      totalStreamersCount={activeStreamers.length}
      kpiAchievedPercent={kpiAchievedPercent}
      totalTeamMinutes={totalTeamMinutes}
      totalValidSessionsCount={totalValidSessionsCount}
      liveRoomsCount={liveRoomsCount}
      liveViewersCount={liveViewersCount}
      zeroLiveCount={zeroLiveStreamers.length}
      teamHours={teamHours}
      projectSummaryLine={projectSummaryLine}
      lowViewNote={lowViewNote}
      skippedLiveNote={skippedLiveNote}
      mostEffectiveNote={mostEffectiveNote}
    />
  );
}
