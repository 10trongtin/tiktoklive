import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentSessionUser } from '@/lib/auth';
import { getAllAppData } from '@/lib/repository';
import { computeLeaderboard } from '@/lib/scoring';
import {
  formatDuration,
  formatShortDateTime,
  getVietnamWeekBounds,
  makeShortGreetingName,
} from '@/lib/formatters';

export default async function MyDashboardPage() {
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect('/dang-nhap');
  }
  if (user.role !== 'streamer' || !user.streamerId) {
    redirect('/');
  }

  const data = await getAllAppData();
  const me = data.streamers.find((s) => s.id === user.streamerId);
  if (!me) {
    redirect('/');
  }

  const activeStreamers = data.streamers.filter((s) => s.active);
  const week = getVietnamWeekBounds(new Date());
  const startMs = week.startUtc.getTime();
  const endMs = week.endUtc.getTime();

  const weeklyLeaderboard = computeLeaderboard({
    streamers: activeStreamers,
    sessions: data.liveSessions,
    startUtc: week.startUtc,
    endUtc: week.endUtc,
    minSessionMinutes: data.settings.minSessionMinutes,
    pointsPerValidSession: data.settings.pointsPerValidSession,
  });

  const myRankRow = weeklyLeaderboard.find((r) => r.streamer.id === me.id);
  const topRankRow = weeklyLeaderboard[0];

  const myRank = myRankRow?.rank ?? activeStreamers.length;
  const myPoints = myRankRow?.points ?? 0;
  const myWeekMinutes = myRankRow?.totalMinutes ?? 0;
  const myValidSessionsCount = myRankRow?.validSessionsCount ?? 0;

  // QT-02 CN-05: "Kém hạng 1 đúng <số> phút live" = tổng giờ của hạng 1 trừ tổng giờ của tôi
  const diffToRank1Minutes = Math.max(
    0,
    (topRankRow?.totalMinutes ?? 0) - myWeekMinutes
  );

  // QT-03 CN-05: % mục tiêu = tổng giờ live tuần / 4h00
  const kpiTargetMins = data.settings.weeklyKpiMinutes; // 240
  const kpiSessionsTarget = data.settings.weeklyTargetSessions; // 4
  const kpiHoursPct = Math.round((myWeekMinutes / kpiTargetMins) * 100);
  const kpiSessionsPct = Math.min(
    100,
    Math.round((myValidSessionsCount / Math.max(1, kpiSessionsTarget)) * 100)
  );
  const remainingKpiMinutes = Math.max(0, kpiTargetMins - myWeekMinutes);

  const myWeekSessions = data.liveSessions
    .filter((s) => {
      if (s.streamerId !== me.id) return false;
      const ms = new Date(s.startedAt).getTime();
      return ms >= startMs && ms <= endMs;
    })
    .sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );

  const pendingCount = myWeekSessions.filter(
    (s) => s.reviewStatus === 'cho_duyet' || s.reviewStatus === 'cho_duyet_tay'
  ).length;
  const rejectedCount = myWeekSessions.filter(
    (s) => s.reviewStatus === 'tu_choi'
  ).length;
  const totalProcessed = myValidSessionsCount + rejectedCount;

  const teamName = data.teams.find((t) => t.id === me.teamId)?.name ?? '—';
  const projectName =
    data.projects.find((p) => p.id === me.projectId)?.name ?? '—';
  const greetingName = makeShortGreetingName(me.fullName);
  const weekDurationText = formatDuration(myWeekMinutes);

  let progressAdvice = '';
  if (myRank === 1) {
    progressAdvice =
      remainingKpiMinutes > 0
        ? `Bạn đang dẫn đầu bảng xếp hạng tuần! Còn ${remainingKpiMinutes} phút nữa là đạt mục tiêu 4h00 của tuần.`
        : 'Bạn đang giữ hạng 1 và đã hoàn thành mục tiêu 4h00 của tuần.';
  } else if (topRankRow) {
    progressAdvice = `Chỉ cần thêm ${diffToRank1Minutes} phút live nữa là bạn bắt kịp tổng giờ của ${topRankRow.streamer.displayName} (hạng 1). ${
      remainingKpiMinutes > 0
        ? `Còn ${remainingKpiMinutes} phút nữa là đạt mục tiêu 4h00 của tuần.`
        : 'Bạn đã đạt mục tiêu 4h00 của tuần.'
    }`;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-h1">Xin chào, {greetingName}</h1>
          <p className="page-desc">
            {me.displayName} · {me.tiktokUsername} · {teamName} · {projectName}
          </p>
        </div>

        <div className="page-actions">
          <Link href="/gui-bang-chung" className="btn btn-gold">
            Gửi bằng chứng phiên
          </Link>
        </div>
      </div>

      {/* 4 Thẻ chỉ số cá nhân */}
      <div className="kpi-grid-4">
        <div className="card">
          <div className="kpi-label">Hạng của tôi tuần này</div>
          <div className="kpi-value">
            {myRank} / {activeStreamers.length}
          </div>
          <div className="kpi-sub">
            {myRank === 1
              ? 'Đang dẫn đầu tuần này'
              : `Kém hạng 1 đúng ${diffToRank1Minutes} phút live`}
          </div>
        </div>

        <div className="card">
          <div className="kpi-label">Điểm đã chốt</div>
          <div className="kpi-value">{myPoints}</div>
          <div className="kpi-sub">+{pendingCount} phiên đang chờ duyệt</div>
        </div>

        <div className="card">
          <div className="kpi-label">Tổng giờ live tuần</div>
          <div className="kpi-value">{weekDurationText}</div>
          <div className="kpi-sub up">
            Đạt {kpiHoursPct}% mục tiêu tuần (4h)
          </div>
        </div>

        <div className="card">
          <div className="kpi-label">Phiên hợp lệ</div>
          <div className="kpi-value">
            {myValidSessionsCount} / {totalProcessed}
          </div>
          <div className="kpi-sub">
            {/* CN-05 Mục 8 M-03 NGUYÊN VĂN khi không có phiên bị từ chối */}
            {rejectedCount === 0
              ? 'Không có phiên bị từ chối'
              : `${rejectedCount} phiên bị từ chối`}
          </div>
        </div>
      </div>

      {/* Khối Tiến độ mục tiêu tuần */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2
          style={{
            margin: '0 0 14px',
            fontSize: 18,
            fontFamily: 'var(--font-playfair), Georgia, serif',
          }}
        >
          Tiến độ mục tiêu tuần
        </h2>

        <div className="grid-2" style={{ marginBottom: 14 }}>
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 600,
                fontSize: 13.5,
                marginBottom: 6,
              }}
            >
              <span>Tổng giờ live</span>
              <span>
                {weekDurationText} / {formatDuration(kpiTargetMins)}
              </span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${Math.min(100, kpiHoursPct)}%` }}
              />
            </div>
          </div>

          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 600,
                fontSize: 13.5,
                marginBottom: 6,
              }}
            >
              <span>Số phiên ≥ 30 phút</span>
              <span>
                {myValidSessionsCount} / {kpiSessionsTarget} phiên
              </span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${kpiSessionsPct}%` }}
              />
            </div>
          </div>
        </div>

        {progressAdvice && <div className="note">{progressAdvice}</div>}
      </div>

      {/* Bảng Phiên live của tôi */}
      <div className="card">
        <h2
          style={{
            margin: '0 0 14px',
            fontSize: 18,
            fontFamily: 'var(--font-playfair), Georgia, serif',
          }}
        >
          Phiên live của tôi
        </h2>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th className="num">Thời lượng</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {myWeekSessions.length === 0 ? (
                <tr>
                  <td colSpan={3} data-label="Phiên live của tôi">
                    Bạn chưa có phiên live nào trong tuần này.
                  </td>
                </tr>
              ) : (
                myWeekSessions.map((s) => (
                  <tr key={s.id}>
                    <td data-label="Ngày" style={{ fontWeight: 600 }}>
                      {s.reviewStatus === 'dang_live'
                        ? 'Tối nay · đang live'
                        : formatShortDateTime(s.startedAt)}
                    </td>
                    <td data-label="Thời lượng" className="num">
                      {formatDuration(s.durationMinutes)}
                    </td>
                    <td data-label="Trạng thái">
                      {s.reviewStatus === 'dang_live' && (
                        <span className="tag tag-live">● ĐANG LIVE</span>
                      )}
                      {s.reviewStatus === 'cho_duyet' && (
                        <span className="tag tag-amber">Chờ duyệt</span>
                      )}
                      {s.reviewStatus === 'cho_duyet_tay' && (
                        <span className="tag tag-amber">Chờ duyệt tay</span>
                      )}
                      {s.reviewStatus === 'da_duyet' && (
                        <span className="tag tag-green">
                          Đã duyệt · tính vào {weekDurationText}
                        </span>
                      )}
                      {s.reviewStatus === 'tu_choi' && (
                        <span className="tag tag-red-soft">
                          Từ chối ·{' '}
                          {s.durationMinutes < data.settings.minSessionMinutes
                            ? '< 30 phút'
                            : s.rejectReason || 'Từ chối'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p
          style={{
            marginTop: 14,
            marginBottom: 0,
            fontSize: 13,
            color: 'var(--text-muted)',
          }}
        >
          {/* CN-05 Mục 8 M-02 NGUYÊN VĂN */}
          Phiên lên bảng xếp hạng sau khi admin duyệt. Phiên thiếu dữ liệu: gửi
          ảnh màn hình cuối live tại mục Gửi bằng chứng trong vòng 24 giờ.
        </p>
      </div>
    </div>
  );
}
