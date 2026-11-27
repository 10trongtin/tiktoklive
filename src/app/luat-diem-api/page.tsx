import { redirect } from 'next/navigation';
import { getCurrentSessionUser } from '@/lib/auth';
import { getAllAppData } from '@/lib/repository';
import { computeLeaderboard } from '@/lib/scoring';
import { formatDuration, getVietnamWeekBounds } from '@/lib/formatters';
import { RulesApiClient } from '@/app/luat-diem-api/RulesApiClient';

export default async function RulesApiPage() {
  const user = await getCurrentSessionUser();
  if (!user || user.role !== 'admin') {
    redirect('/');
  }

  const data = await getAllAppData();
  const week = getVietnamWeekBounds(new Date());
  const ranked = computeLeaderboard({
    streamers: data.streamers,
    sessions: data.liveSessions,
    startUtc: week.startUtc,
    endUtc: week.endUtc,
    minSessionMinutes: data.settings.minSessionMinutes,
    pointsPerValidSession: data.settings.pointsPerValidSession,
  });

  let ruleExampleNote =
    'Đang áp dụng: Minh Dự 1 điểm · 3h43 xếp trên Thanh Anh 1 điểm · 3h24 — bằng điểm, hơn tổng giờ nên xếp trên.';

  if (ranked.length >= 2 && (ranked[0].points > 0 || ranked[1].points > 0)) {
    const r1 = ranked[0];
    const r2 = ranked[1];
    ruleExampleNote = `Đang áp dụng: ${r1.streamer.displayName} ${r1.points} điểm · ${formatDuration(
      r1.totalMinutes
    )} xếp trên ${r2.streamer.displayName} ${r2.points} điểm · ${formatDuration(
      r2.totalMinutes
    )}.`;
  }

  return (
    <RulesApiClient
      settings={data.settings}
      ruleExampleNote={ruleExampleNote}
    />
  );
}
