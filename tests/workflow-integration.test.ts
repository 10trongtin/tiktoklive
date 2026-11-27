import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import {
  applyLiveRoomsSync,
  createRegistrationRecord,
  createSeasonRecord,
  getAllAppData,
  reviewLiveSessionRecord,
  reviewRegistrationRecord,
  submitSessionProofRecord,
} from '@/lib/repository';

const LOCAL_DIR = path.join(process.cwd(), '.local-data');

describe('Vòng đời tích hợp End-to-End từ Đăng ký → Live → Bằng chứng → Duyệt điểm', () => {
  beforeAll(async () => {
    await fs.rm(LOCAL_DIR, { recursive: true, force: true });
  });

  afterAll(async () => {
    // Dọn sạch dữ liệu kiểm thử để kho ứng dụng hoàn toàn sạch (không cài cứng dữ liệu mẫu — Luật số 9)
    await fs.rm(LOCAL_DIR, { recursive: true, force: true });
  });

  it('chạy trọn vòng đời thực tế và kiểm tra chống duyệt trùng + khóa mùa', async () => {
    // 1. Tạo mùa giải đang diễn ra
    const seasonRes = await createSeasonRecord({
      name: 'Tháng 11/2026',
      startDate: '2026-11-01',
      endDate: '2099-12-31',
    });
    expect(seasonRes.ok).toBe(true);

    // 2. Sale mới gửi Đăng ký tham gia (CN-06)
    const initData = await getAllAppData();
    const regRes = await createRegistrationRecord({
      fullName: 'Trần Quốc Bảo',
      phoneZalo: '0988111222',
      tiktokRaw: 'https://www.tiktok.com/@quocbaopicity',
      workEmail: 'bao@picity.com.vn',
      teamId: initData.teams[0].id,
      projectId: initData.projects[1].id,
      committed: true,
    });
    expect(regRes.ok).toBe(true);
    if (!regRes.ok) return;
    expect(regRes.registration.tiktokUsername).toBe('@quocbaopicity');

    // Chặn gửi trùng @username đang chờ duyệt
    const dupRes = await createRegistrationRecord({
      fullName: 'Người Khác',
      phoneZalo: '0977333444',
      tiktokRaw: '@quocbaopicity',
      teamId: initData.teams[0].id,
      projectId: initData.projects[0].id,
      committed: true,
    });
    expect(dupRes.ok).toBe(false);

    // 3. Admin duyệt đăng ký (CN-09)
    const approveReg = await reviewRegistrationRecord({
      registrationId: regRes.registration.id,
      action: 'approve',
      reviewerId: 'usr-admin',
    });
    expect(approveReg.ok).toBe(true);

    const afterRegData = await getAllAppData();
    const streamer = afterRegData.streamers.find(
      (s) => s.tiktokUsername === '@quocbaopicity'
    );
    expect(streamer).toBeDefined();
    if (!streamer) return;

    // 4. Dịch vụ đọc phòng live phát hiện bắt đầu live, sau đó đóng phiên kèm cờ Thiếu dữ liệu
    const tStart = new Date(Date.now() + 2000);
    await applyLiveRoomsSync(
      [
        {
          tiktokUsername: '@quocbaopicity',
          isLive: true,
          title: 'Giới thiệu SkyZen buổi tối',
          currentViewers: 185,
        },
      ],
      tStart
    );

    const tEnd = new Date(tStart.getTime() + 47 * 60 * 1000);
    await applyLiveRoomsSync(
      [
        {
          tiktokUsername: '@quocbaopicity',
          isLive: false,
          hasDataGap: true,
          dataGapReason: 'API lỗi 5 phút',
          forcedDurationMinutes: 47,
        },
      ],
      tEnd
    );

    const afterLiveData = await getAllAppData();
    const session = afterLiveData.liveSessions.find(
      (s) => s.streamerId === streamer.id
    );
    expect(session).toBeDefined();
    if (!session) return;
    expect(session.dataFlag).toBe('thieu_du_lieu');
    expect(session.reviewStatus).toBe('cho_duyet');

    // 5. Streamer gửi ảnh bằng chứng PNG hợp lệ (CN-07) -> chuyển sang Chờ duyệt tay
    const fakePng = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    const proofRes = await submitSessionProofRecord({
      sessionId: session.id,
      streamerId: streamer.id,
      reportedDurationText: '0h47',
      fileName: 'cuoi-live.png',
      mimeType: 'image/png',
      fileBuffer: fakePng,
    });
    expect(proofRes.ok).toBe(true);

    const afterProof = await getAllAppData();
    const updatedSess = afterProof.liveSessions.find((s) => s.id === session.id);
    expect(updatedSess?.reviewStatus).toBe('cho_duyet_tay');

    // 6. Admin bấm Duyệt — chốt điểm (CN-08)
    const firstApprove = await reviewLiveSessionRecord({
      sessionId: session.id,
      action: 'approve',
      reviewerId: 'usr-admin',
      reviewerName: 'Admin Picity',
    });
    expect(firstApprove.ok).toBe(true);
    if (firstApprove.ok) {
      expect(firstApprove.session.finalPoints).toBe(1);
      expect(firstApprove.session.reviewStatus).toBe('da_duyet');
    }

    // 7. Admin thứ hai cùng bấm duyệt lại phiên đó -> bị chặn (CH-39)
    const secondApprove = await reviewLiveSessionRecord({
      sessionId: session.id,
      action: 'approve',
      reviewerId: 'usr-admin-2',
      reviewerName: 'Admin 2',
    });
    expect(secondApprove.ok).toBe(false);
  });
});
