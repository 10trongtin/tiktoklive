import {
  LiveSession,
  RankingPeriodTab,
  Season,
  Streamer,
} from '@/types/domain';
import {
  getVietnamMonthBounds,
  getVietnamWeekBounds,
} from '@/lib/formatters';

const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

export interface StreamerRankingRow {
  rank: number;
  streamer: Streamer;
  validSessionsCount: number;
  totalMinutes: number;
  peakViewers: number;
  points: number;
  isLive: boolean;
}

/**
 * Tính mốc thời gian [startUtc, endUtc] cho 3 tab kỳ:
 * - tuan_nay: Thứ 2 00:00 -> Chủ nhật 23:59 (UTC+7)
 * - thang_nay: Ngày 01 -> cuối tháng hiện tại (UTC+7)
 * - tu_dau: Ngày bắt đầu mùa giải hiện tại -> Ngày kết thúc mùa giải hiện tại (CH-01)
 */
export function getPeriodBounds(
  tab: RankingPeriodTab,
  currentSeason: Season | null,
  now: Date = new Date()
): { startUtc: Date; endUtc: Date; periodWord: 'tuần' | 'tháng' | 'từ đầu' } {
  if (tab === 'tuan_nay') {
    const w = getVietnamWeekBounds(now);
    return { startUtc: w.startUtc, endUtc: w.endUtc, periodWord: 'tuần' };
  }
  if (tab === 'thang_nay') {
    const m = getVietnamMonthBounds(now);
    return { startUtc: m.startUtc, endUtc: m.endUtc, periodWord: 'tháng' };
  }

  if (currentSeason) {
    const [sy, sm, sd] = currentSeason.startDate.split('-').map(Number);
    const [ey, em, ed] = currentSeason.endDate.split('-').map(Number);
    const startUtc = new Date(Date.UTC(sy, sm - 1, sd, 0, 0, 0, 0) - VN_OFFSET_MS);
    const endUtc = new Date(Date.UTC(ey, em - 1, ed, 23, 59, 59, 999) - VN_OFFSET_MS);
    return { startUtc, endUtc, periodWord: 'từ đầu' };
  }

  return {
    startUtc: new Date(0),
    endUtc: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
    periodWord: 'từ đầu',
  };
}

/**
 * [CH-47] Cùng một streamer có các phiên chồng lấn thời gian thì chỉ giữ phiên có thời lượng dài hơn
 * để tính điểm và tổng giờ.
 */
export function deduplicateOverlappingSessions(sessions: LiveSession[]): LiveSession[] {
  const sorted = [...sessions].sort(
    (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
  );

  const accepted: LiveSession[] = [];
  for (const candidate of sorted) {
    const cStart = new Date(candidate.startedAt).getTime();
    const cEnd = candidate.endedAt
      ? new Date(candidate.endedAt).getTime()
      : cStart + candidate.durationMinutes * 60 * 1000;

    const overlapIdx = accepted.findIndex((existing) => {
      const eStart = new Date(existing.startedAt).getTime();
      const eEnd = existing.endedAt
        ? new Date(existing.endedAt).getTime()
        : eStart + existing.durationMinutes * 60 * 1000;
      return cStart < eEnd && eStart < cEnd;
    });

    if (overlapIdx === -1) {
      accepted.push(candidate);
    } else if (candidate.durationMinutes > accepted[overlapIdx].durationMinutes) {
      accepted[overlapIdx] = candidate;
    }
  }

  return accepted;
}

/**
 * [CH-36] Kiểm tra phiên mới có thể gộp vào phiên vừa kết thúc cách đó ≤ maxGapMinutes (5 phút) hay không.
 */
export function shouldMergeReconnectedSession(
  previousSession: LiveSession,
  newStartedAt: string | Date,
  maxGapMinutes = 5
): boolean {
  if (!previousSession.endedAt) return false;
  if (previousSession.streamerId === '') return false;
  const prevEndMs = new Date(previousSession.endedAt).getTime();
  const nextStartMs =
    typeof newStartedAt === 'string'
      ? new Date(newStartedAt).getTime()
      : newStartedAt.getTime();
  const gapMs = nextStartMs - prevEndMs;
  return gapMs >= 0 && gapMs <= maxGapMinutes * 60 * 1000;
}

/**
 * [CH-04] Đánh giá phiên khi kết thúc live:
 * - Nếu durationMinutes < minMinutes (30): tự động chuyển `tu_choi`, cờ `duoi_30_phut`, lý do `< 30 phút`, 0 điểm.
 * - Nếu có sự cố mất kết nối (hasDataGap): gắn cờ `thieu_du_lieu`, chờ sale gửi bằng chứng (`cho_duyet`).
 * - Nếu ≥ minMinutes và đủ dữ liệu: gắn `du_dieu_kien`, điểm nháp = pointsPerSession;
 *   nếu autoApprove bật thì chốt `da_duyet` luôn, ngược lại `cho_duyet`.
 */
export function evaluateEndedSession(params: {
  durationMinutes: number;
  hasDataGap: boolean;
  dataGapReason?: string | null;
  minSessionMinutes?: number;
  pointsPerValidSession?: number;
  autoDraftPoints?: boolean;
  autoApproveValidSessions?: boolean;
}): Pick<
  LiveSession,
  | 'dataFlag'
  | 'dataFlagReason'
  | 'reviewStatus'
  | 'draftPoints'
  | 'finalPoints'
  | 'rejectReason'
> {
  const minMinutes = params.minSessionMinutes ?? 30;
  const pts = params.pointsPerValidSession ?? 1;
  const autoDraft = params.autoDraftPoints ?? true;
  const autoApprove = params.autoApproveValidSessions ?? false;

  if (params.durationMinutes < minMinutes && !params.hasDataGap) {
    return {
      dataFlag: 'duoi_30_phut',
      dataFlagReason: null,
      reviewStatus: 'tu_choi',
      draftPoints: 0,
      finalPoints: 0,
      rejectReason: '< 30 phút',
    };
  }

  if (params.hasDataGap) {
    return {
      dataFlag: 'thieu_du_lieu',
      dataFlagReason: params.dataGapReason ?? 'Chưa có snapshot',
      reviewStatus: 'cho_duyet',
      draftPoints: autoDraft && params.durationMinutes >= minMinutes ? pts : 0,
      finalPoints: 0,
      rejectReason: null,
    };
  }

  const draft = autoDraft ? pts : 0;
  if (autoApprove) {
    return {
      dataFlag: 'du_dieu_kien',
      dataFlagReason: null,
      reviewStatus: 'da_duyet',
      draftPoints: draft,
      finalPoints: pts,
      rejectReason: null,
    };
  }

  return {
    dataFlag: 'du_dieu_kien',
    dataFlagReason: null,
    reviewStatus: 'cho_duyet',
    draftPoints: draft,
    finalPoints: 0,
    rejectReason: null,
  };
}

/**
 * [CH-02, CH-03, CH-35, CH-47]
 * Tính bảng xếp hạng cho kỳ đã chọn:
 * - Chỉ xét phiên có startedAt nằm trong [startUtc, endUtc]
 * - Chỉ cộng Điểm và Tổng giờ cho phiên `reviewStatus === 'da_duyet'` và `durationMinutes >= minSessionMinutes`
 * - Xếp hạng: Điểm giảm dần -> Tổng giờ live giảm dần -> Peak view giảm dần -> Tên tăng dần
 */
export function computeLeaderboard(params: {
  streamers: Streamer[];
  sessions: LiveSession[];
  startUtc: Date;
  endUtc: Date;
  minSessionMinutes?: number;
  pointsPerValidSession?: number;
}): StreamerRankingRow[] {
  const minMins = params.minSessionMinutes ?? 30;
  const ptsPerSession = params.pointsPerValidSession ?? 1;
  const startMs = params.startUtc.getTime();
  const endMs = params.endUtc.getTime();

  const rows: Omit<StreamerRankingRow, 'rank'>[] = params.streamers
    .filter((s) => s.active)
    .map((streamer) => {
      const inPeriodApprovedValid = params.sessions.filter((sess) => {
        if (sess.streamerId !== streamer.id) return false;
        const startedMs = new Date(sess.startedAt).getTime();
        if (startedMs < startMs || startedMs > endMs) return false;
        return sess.reviewStatus === 'da_duyet' && sess.durationMinutes >= minMins;
      });

      const deduped = deduplicateOverlappingSessions(inPeriodApprovedValid);
      const validSessionsCount = deduped.length;
      const totalMinutes = deduped.reduce((acc, s) => acc + s.durationMinutes, 0);
      const points = deduped.reduce(
        (acc, s) => acc + (s.finalPoints > 0 ? s.finalPoints : ptsPerSession),
        0
      );
      const peakViewers = deduped.reduce(
        (max, s) => (s.peakViewers > max ? s.peakViewers : max),
        0
      );

      return {
        streamer,
        validSessionsCount,
        totalMinutes,
        peakViewers,
        points,
        isLive: streamer.isLive,
      };
    });

  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.totalMinutes !== a.totalMinutes) return b.totalMinutes - a.totalMinutes;
    if (b.peakViewers !== a.peakViewers) return b.peakViewers - a.peakViewers;
    return a.streamer.displayName.localeCompare(b.streamer.displayName, 'vi');
  });

  return rows.map((row, idx) => ({
    ...row,
    rank: idx + 1,
  }));
}
