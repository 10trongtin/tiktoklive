import { describe, expect, it } from 'vitest';
import {
  formatDuration,
  formatLiveMinutes,
  formatLiveUpdatedAgo,
  formatPeakView,
  formatThousands,
  getVietnamWeekBounds,
  maskPhoneMiddle,
  normalizeTiktokUsername,
  parseDurationTextToMinutes,
} from '@/lib/formatters';
import {
  computeLeaderboard,
  deduplicateOverlappingSessions,
  evaluateEndedSession,
  shouldMergeReconnectedSession,
} from '@/lib/scoring';
import {
  canAccessRoute,
  canApproveSessions,
  canExportRankingExcel,
  getVisibleNavItems,
} from '@/lib/permissions';
import { LiveSession, Streamer } from '@/types/domain';

function buildStreamer(overrides: Partial<Streamer>): Streamer {
  return {
    id: 'st-1',
    userId: 'u-1',
    registrationId: 'reg-1',
    fullName: 'Streamer Một',
    displayName: 'Streamer Một Picity',
    avatarInitials: 'SM',
    phoneZalo: '0912345678',
    tiktokUsername: '@streamer1',
    workEmail: null,
    teamId: 'team-1',
    projectId: 'proj-central-park',
    joinedWeek: 1,
    isLive: false,
    active: true,
    trackingStartedAt: '2026-11-16T00:00:00.000Z',
    createdAt: '2026-11-16T00:00:00.000Z',
    ...overrides,
  };
}

function buildSession(overrides: Partial<LiveSession>): LiveSession {
  return {
    id: 'sess-1',
    streamerId: 'st-1',
    seasonId: 'sea-1',
    projectId: 'proj-central-park',
    tiktokUsername: '@streamer1',
    roomId: 'room-1',
    title: 'Phiên kiểm thử',
    streamUrl: null,
    startedAt: '2026-11-18T12:00:00.000Z', // 19:00 giờ VN
    endedAt: '2026-11-18T13:00:00.000Z',
    durationMinutes: 60,
    currentViewers: 0,
    peakViewers: 120,
    source: 'auto_api',
    dataFlag: 'du_dieu_kien',
    dataFlagReason: null,
    reviewStatus: 'da_duyet',
    draftPoints: 1,
    finalPoints: 1,
    reviewedBy: 'usr-admin',
    reviewedByName: 'Admin Picity',
    reviewedAt: '2026-11-18T14:00:00.000Z',
    rejectReason: null,
    createdAt: '2026-11-18T12:00:00.000Z',
    ...overrides,
  };
}

describe('Quy ước định dạng (00-thuat-ngu.md & 02-quy-uoc-ky-thuat.md)', () => {
  it('định dạng đúng thời lượng giờhphút và phút ngắn', () => {
    expect(formatDuration(0)).toBe('0h00');
    expect(formatDuration(24)).toBe('0h24');
    expect(formatDuration(223)).toBe('3h43');
    expect(formatDuration(1720)).toBe('28h40');
    expect(formatLiveMinutes(42)).toBe('42 phút');
    expect(parseDurationTextToMinutes('0h47')).toBe(47);
    expect(parseDurationTextToMinutes('3h24')).toBe(204);
  });

  it('định dạng đúng số hàng nghìn, peak view = 0 và che SĐT giữa', () => {
    expect(formatThousands(4812)).toBe('4.812');
    expect(formatThousands(10000)).toBe('10.000');
    expect(formatPeakView(0)).toBe('—');
    expect(formatPeakView(312)).toBe('312');
    expect(maskPhoneMiddle('0932888118')).toBe('0932 ••• 118');
    expect(formatLiveUpdatedAgo(12)).toBe('vừa xong');
    expect(formatLiveUpdatedAgo(35)).toBe('cách đây 35 giây');
  });

  it('chuẩn hóa @username từ cả tên tài khoản lẫn URL TikTok (CH-52)', () => {
    expect(normalizeTiktokUsername('@MinhDuPicity')).toBe('@minhdupicity');
    expect(normalizeTiktokUsername('minhdupicity')).toBe('@minhdupicity');
    expect(
      normalizeTiktokUsername('https://www.tiktok.com/@ThanhAnh_Picity/live?enter_from=share')
    ).toBe('@thanhanh_picity');
    expect(normalizeTiktokUsername('không hợp lệ!!')).toBeNull();
  });

  it('tính tuần Thứ 2 – Chủ nhật theo múi giờ Việt Nam UTC+7 (CH-35)', () => {
    const bounds = getVietnamWeekBounds(new Date('2026-11-18T09:00:00+07:00'));
    expect(bounds.label).toBe('Tuần 16/11 – 22/11');
  });
});

describe('Luật tính điểm, phiên ngắn, gộp phiên và phân hạng (CN-01, CN-08, CN-12)', () => {
  it('phiên < 30 phút tự động chuyển Từ chối · < 30 phút và 0 điểm (CH-04)', () => {
    const res = evaluateEndedSession({
      durationMinutes: 24,
      hasDataGap: false,
      minSessionMinutes: 30,
      pointsPerValidSession: 1,
    });
    expect(res.reviewStatus).toBe('tu_choi');
    expect(res.dataFlag).toBe('duoi_30_phut');
    expect(res.rejectReason).toBe('< 30 phút');
    expect(res.draftPoints).toBe(0);
    expect(res.finalPoints).toBe(0);
  });

  it('phiên ≥ 30 phút khi tắt tự duyệt thì vào Chờ duyệt kèm +1 điểm nháp (CN-12 AC-01)', () => {
    const res = evaluateEndedSession({
      durationMinutes: 45,
      hasDataGap: false,
      autoDraftPoints: true,
      autoApproveValidSessions: false,
    });
    expect(res.reviewStatus).toBe('cho_duyet');
    expect(res.draftPoints).toBe(1);
    expect(res.finalPoints).toBe(0);
  });

  it('gộp phiên rớt mạng live lại cách nhau ≤ 5 phút (CH-36)', () => {
    const ended = buildSession({
      endedAt: '2026-11-18T13:00:00.000Z',
    });
    expect(
      shouldMergeReconnectedSession(ended, '2026-11-18T13:04:30.000Z', 5)
    ).toBe(true);
    expect(
      shouldMergeReconnectedSession(ended, '2026-11-18T13:06:00.000Z', 5)
    ).toBe(false);
  });

  it('cùng một người có 2 phiên trùng giờ chỉ tính 1 phiên dài hơn (CH-47)', () => {
    const shorter = buildSession({
      id: 's1',
      startedAt: '2026-11-18T12:00:00.000Z',
      endedAt: '2026-11-18T12:40:00.000Z',
      durationMinutes: 40,
    });
    const longer = buildSession({
      id: 's2',
      startedAt: '2026-11-18T12:15:00.000Z',
      endedAt: '2026-11-18T13:30:00.000Z',
      durationMinutes: 75,
    });
    const deduped = deduplicateOverlappingSessions([shorter, longer]);
    expect(deduped).toHaveLength(1);
    expect(deduped[0].id).toBe('s2');
  });

  it('xếp hạng đúng theo Điểm giảm dần, bằng điểm xét Tổng giờ live giảm dần, không tính phiên chờ duyệt (CN-01 AC-01..AC-04)', () => {
    const stA = buildStreamer({ id: 'a', displayName: 'Người A Picity' });
    const stB = buildStreamer({ id: 'b', displayName: 'Người B Picity' });
    const stC = buildStreamer({ id: 'c', displayName: 'Người C Picity' });

    const sessions: LiveSession[] = [
      // A: 1 phiên đã duyệt (223p = 3h43) + 1 phiên chờ duyệt (108p -> không được cộng!)
      buildSession({
        id: 'sa-1',
        streamerId: 'a',
        durationMinutes: 223,
        reviewStatus: 'da_duyet',
        finalPoints: 1,
      }),
      buildSession({
        id: 'sa-pending',
        streamerId: 'a',
        startedAt: '2026-11-19T12:00:00.000Z',
        endedAt: '2026-11-19T13:48:00.000Z',
        durationMinutes: 108,
        reviewStatus: 'cho_duyet',
        finalPoints: 0,
      }),
      // B: 1 phiên đã duyệt (204p = 3h24)
      buildSession({
        id: 'sb-1',
        streamerId: 'b',
        durationMinutes: 204,
        reviewStatus: 'da_duyet',
        finalPoints: 1,
      }),
      // C: 2 phiên đã duyệt (35p + 40p = 75p, nhưng 2 điểm -> phải xếp hạng 1!)
      buildSession({
        id: 'sc-1',
        streamerId: 'c',
        startedAt: '2026-11-17T12:00:00.000Z',
        endedAt: '2026-11-17T12:35:00.000Z',
        durationMinutes: 35,
        reviewStatus: 'da_duyet',
        finalPoints: 1,
      }),
      buildSession({
        id: 'sc-2',
        streamerId: 'c',
        startedAt: '2026-11-18T15:00:00.000Z',
        endedAt: '2026-11-18T15:40:00.000Z',
        durationMinutes: 40,
        reviewStatus: 'da_duyet',
        finalPoints: 1,
      }),
    ];

    const week = getVietnamWeekBounds(new Date('2026-11-18T09:00:00+07:00'));
    const board = computeLeaderboard({
      streamers: [stA, stB, stC],
      sessions,
      startUtc: week.startUtc,
      endUtc: week.endUtc,
    });

    expect(board[0].streamer.id).toBe('c');
    expect(board[0].points).toBe(2);
    expect(board[0].rank).toBe(1);

    // A và B cùng 1 điểm, A 223p > B 204p => A hạng 2, B hạng 3
    expect(board[1].streamer.id).toBe('a');
    expect(board[1].points).toBe(1);
    expect(board[1].totalMinutes).toBe(223);
    expect(board[2].streamer.id).toBe('b');
    expect(board[2].totalMinutes).toBe(204);
  });
});

describe('Phân quyền vai trò và ẩn menu (05-phan-quyen.md)', () => {
  it('ẩn các menu quản trị với Streamer và Cấp điều hành', () => {
    const streamerMenus = getVisibleNavItems('streamer').map((m) => m.code);
    expect(streamerMenus).toContain('CN-01');
    expect(streamerMenus).toContain('CN-04');
    expect(streamerMenus).toContain('CN-05');
    expect(streamerMenus).toContain('CN-07');
    expect(streamerMenus).not.toContain('CN-08');
    expect(streamerMenus).not.toContain('CN-03');

    const publicMenus = getVisibleNavItems(null).map((m) => m.code);
    expect(publicMenus).toEqual(['CN-01', 'CN-02', 'CN-04', 'CN-06']);

    const execMenus = getVisibleNavItems('executive').map((m) => m.code);
    expect(execMenus).toContain('CN-03');
    expect(execMenus).toContain('CN-13');
    expect(execMenus).not.toContain('CN-08');
    expect(execMenus).not.toContain('CN-12');

    // Khách chưa đăng nhập (role = null) xem được các trang công khai minh bạch, bị chặn các trang quản trị/nội bộ
    expect(canAccessRoute(null, '/')).toBe(true);
    expect(canAccessRoute(null, '/dang-live')).toBe(true);
    expect(canAccessRoute(null, '/chi-tiet-streamer')).toBe(true);
    expect(canAccessRoute(null, '/dang-ky-tham-gia')).toBe(true);
    expect(canAccessRoute(null, '/duyet-phien-live')).toBe(false);
    expect(canAccessRoute(null, '/dashboard-cua-toi')).toBe(false);
    expect(canAccessRoute(null, '/tong-quan-dieu-hanh')).toBe(false);
    expect(canAccessRoute(null, '/bao-cao')).toBe(false);

    expect(canApproveSessions('admin')).toBe(true);
    expect(canApproveSessions('executive')).toBe(false);
    expect(canApproveSessions(null)).toBe(false);
    expect(canExportRankingExcel('executive')).toBe(true);
    expect(canExportRankingExcel('streamer')).toBe(false);
    expect(canExportRankingExcel(null)).toBe(false);
  });
});
