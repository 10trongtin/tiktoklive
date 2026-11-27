'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { RankingPeriodTab } from '@/types/domain';
import {
  formatDuration,
  formatPeakView,
  formatSecondsAgoText,
  formatThousands,
} from '@/lib/formatters';
import { LiveModalRoomData, useUI } from '@/components/ui/ToastProvider';

export interface RankingTableEntry {
  rank: number;
  streamerId: string;
  displayName: string;
  avatarInitials: string;
  tiktokUsername: string;
  teamName: string;
  projectShortName: string;
  validSessionsCount: number;
  totalMinutes: number;
  peakViewers: number;
  points: number;
  isLive: boolean;
}

export interface PeriodRankingDataset {
  periodWord: 'tuần' | 'tháng' | 'từ đầu';
  totalMinutesAll: number;
  rows: RankingTableEntry[];
}

export function LeaderboardClient({
  weekLabel,
  weekSlug,
  initialSecondsAgo,
  canExport,
  canApprove,
  canOpenDetail,
  pendingSessionsCount,
  liveRooms,
  datasets,
}: {
  weekLabel: string;
  weekSlug: string;
  initialSecondsAgo: number;
  canExport: boolean;
  canApprove: boolean;
  canOpenDetail: boolean;
  pendingSessionsCount: number;
  liveRooms: LiveModalRoomData[];
  datasets: Record<RankingPeriodTab, PeriodRankingDataset>;
}) {
  const { showToast, openLiveRoomModal } = useUI();

  const [activeTab, setActiveTab] = useState<RankingPeriodTab>('tuan_nay');
  const [page, setPage] = useState(1);
  const [secondsAgo, setSecondsAgo] = useState(Math.max(1, initialSecondsAgo));

  useEffect(() => {
    setSecondsAgo(Math.max(1, initialSecondsAgo));
    const timer = setInterval(() => {
      setSecondsAgo((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [initialSecondsAgo]);

  const currentData = datasets[activeTab];
  const allRows = currentData.rows;
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(allRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = allRows.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const podiumTop3 = allRows.slice(0, 3);
  const totalViewersNow = liveRooms.reduce(
    (acc, r) => acc + r.currentViewers,
    0
  );

  const handleExportCsv = () => {
    const header = [
      'Hạng',
      'Streamer',
      'TikTok',
      'Team',
      'Dự án',
      'Phiên',
      'Tổng giờ',
      'Peak',
      'Điểm',
    ];
    const lines = allRows.map((r) => [
      String(r.rank),
      `"${r.displayName.replace(/"/g, '""')}"`,
      r.tiktokUsername,
      `"${r.teamName}"`,
      `"${r.projectShortName}"`,
      String(r.validSessionsCount),
      formatDuration(r.totalMinutes),
      r.peakViewers > 0 ? String(r.peakViewers) : '—',
      String(r.points),
    ]);

    const csvContent =
      '\uFEFF' +
      [header.join(','), ...lines.map((l) => l.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // CN-01 Mục 8 T-01:
    a.download = `picity-len-live-bang-xep-hang-tuan-${weekSlug}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Ghi nhận lịch sử xuất ngầm trên máy chủ
    fetch('/api/reports/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reportType: 'ranking_csv',
        periodTab: activeTab,
      }),
    }).catch(() => {});

    // CN-01 Mục 8 M-01 NGUYÊN VĂN:
    showToast('Đã tải file bảng xếp hạng tuần (CSV mở bằng Excel).');
  };

  return (
    <div>
      {/* Đầu màn */}
      <div className="page-header">
        <div>
          <h1 className="page-h1">Bảng xếp hạng</h1>
          <p className="page-desc">
            {weekLabel} · {formatSecondsAgoText(secondsAgo, true)}
          </p>
        </div>

        <div className="page-actions">
          <div className="pill-tabs" role="tablist" aria-label="Chọn kỳ xếp hạng">
            {(
              [
                ['tuan_nay', 'Tuần này'],
                ['thang_nay', 'Tháng này'],
                ['tu_dau', 'Từ đầu'],
              ] as const
            ).map(([tabKey, label]) => (
              <button
                key={tabKey}
                type="button"
                role="tab"
                aria-selected={activeTab === tabKey}
                className={`pill-tab ${activeTab === tabKey ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tabKey);
                  setPage(1);
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {canExport && (
            <button
              type="button"
              className="btn"
              onClick={handleExportCsv}
            >
              Xuất Excel
            </button>
          )}
        </div>
      </div>

      {/* Thanh trạng thái nhanh */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 18,
          padding: '12px 18px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            flexWrap: 'wrap',
            fontSize: 13.5,
            fontWeight: 600,
          }}
        >
          <span style={{ color: 'var(--red)' }}>
            ● {liveRooms.length} phòng đang live
          </span>
          <span>·</span>
          <span>{formatThousands(totalViewersNow)} người đang xem</span>
          <span>·</span>
          <span>{pendingSessionsCount} phiên đang chờ duyệt</span>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/dang-live" className="btn btn-sm">
            Vào phòng live
          </Link>
          {canApprove && (
            <Link href="/duyet-phien-live" className="btn btn-gold btn-sm">
              Duyệt phiên chờ
            </Link>
          )}
        </div>
      </div>

      {/* 4 Thẻ chỉ số */}
      <div className="kpi-grid-4">
        <div className="card">
          <div className="kpi-label">Streamer tham gia</div>
          <div className="kpi-value">{allRows.length}</div>
          <div className="kpi-sub up">Đang được theo dõi trong mùa</div>
        </div>

        <div className="card">
          <div className="kpi-label">Đang live ngay lúc này</div>
          <div className="kpi-value red">{liveRooms.length}</div>
          <div className="kpi-sub">Cập nhật qua API mỗi 30 giây</div>
        </div>

        <div className="card">
          <div className="kpi-label">
            Tổng giờ live · {currentData.periodWord}
          </div>
          <div className="kpi-value">
            {formatDuration(currentData.totalMinutesAll)}
          </div>
          <div className="kpi-sub up">Chỉ tính phiên đã duyệt ≥ 30 phút</div>
        </div>

        <div className="card">
          <div className="kpi-label">Phiên chờ duyệt</div>
          <div className="kpi-value">{pendingSessionsCount}</div>
          <div className="kpi-sub">
            {canApprove ? (
              <Link
                href="/duyet-phien-live"
                style={{ color: 'var(--gold)', fontWeight: 700 }}
              >
                Đi tới Duyệt phiên →
              </Link>
            ) : (
              'Đang chờ quản trị viên duyệt'
            )}
          </div>
        </div>
      </div>

      {/* Khối Đang Live ngang */}
      {liveRooms.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <strong style={{ fontSize: 16 }}>Đang Live</strong>
              <span className="tag tag-live">{liveRooms.length} phòng</span>
            </div>
            <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
              Bấm vào ảnh đại diện để xem phòng live
            </span>
          </div>

          <div className="live-strip">
            {liveRooms.map((room) => (
              <button
                key={room.sessionId}
                type="button"
                className="live-strip-item"
                onClick={() => openLiveRoomModal(room)}
              >
                <div className="avatar live-ring" style={{ marginBottom: 6 }}>
                  {room.avatarInitials}
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 12.5,
                    textAlign: 'center',
                  }}
                >
                  {room.streamerName}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--red)', fontWeight: 600 }}>
                  {room.currentViewers} đang xem
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bục 3 hạng */}
      {podiumTop3.length > 0 && (
        <div className="podium-grid">
          {podiumTop3.map((item) => (
            <div
              key={item.streamerId}
              className={`podium-card ${item.rank === 1 ? 'rank-1' : ''}`}
            >
              <div style={{ marginBottom: 10 }}>
                <span
                  className={`tag ${
                    item.rank === 1 ? 'tag-amber' : 'tag-gray'
                  }`}
                >
                  HẠNG {item.rank}
                </span>
              </div>
              <div
                className={`avatar lg ${item.isLive ? 'live-ring' : ''}`}
                style={{ margin: '0 auto 10px' }}
              >
                {item.avatarInitials}
              </div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>
                {item.displayName.toUpperCase()}
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: 'var(--text-muted)',
                  marginBottom: 8,
                }}
              >
                {item.tiktokUsername}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  fontWeight: 700,
                  fontSize: 18,
                  color: 'var(--navy)',
                }}
              >
                {item.points} điểm · {formatDuration(item.totalMinutes)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bảng xếp hạng */}
      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Hạng</th>
                <th>Streamer</th>
                <th>Team</th>
                <th>Dự án</th>
                <th className="num">Phiên</th>
                <th className="num">Tổng giờ</th>
                <th className="num">Peak view</th>
                <th className="num">Điểm</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={9} data-label="Bảng xếp hạng">
                    Chưa có streamer nào trong danh sách theo dõi.
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => (
                  <tr key={row.streamerId}>
                    <td data-label="Hạng" style={{ fontWeight: 800 }}>
                      #{row.rank}
                    </td>
                    <td data-label="Streamer">
                      <div className="person">
                        <div
                          className={`avatar ${row.isLive ? 'live-ring' : ''}`}
                        >
                          {row.avatarInitials}
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          {canOpenDetail ? (
                            <Link
                              href={`/chi-tiet-streamer?streamerId=${encodeURIComponent(
                                row.streamerId
                              )}`}
                              className="person-name"
                              style={{ textDecoration: 'underline' }}
                            >
                              {row.displayName}
                            </Link>
                          ) : (
                            <div className="person-name">{row.displayName}</div>
                          )}
                          <div className="person-sub">{row.tiktokUsername}</div>
                        </div>
                      </div>
                    </td>
                    <td data-label="Team">{row.teamName}</td>
                    <td data-label="Dự án">{row.projectShortName}</td>
                    <td data-label="Phiên" className="num">
                      {row.validSessionsCount}
                    </td>
                    <td data-label="Tổng giờ" className="num">
                      {formatDuration(row.totalMinutes)}
                    </td>
                    <td data-label="Peak view" className="num">
                      {formatPeakView(row.peakViewers)}
                    </td>
                    <td
                      data-label="Điểm"
                      className="num"
                      style={{ fontWeight: 700 }}
                    >
                      {row.points} điểm
                    </td>
                    <td data-label="Trạng thái">
                      {row.isLive ? (
                        <span className="tag tag-live">● LIVE</span>
                      ) : (
                        <span className="tag tag-gray">Ngoại tuyến</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            marginTop: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Hiển thị {pageRows.length} trong {allRows.length} streamer · Bằng
            điểm xếp theo tổng giờ live giảm dần
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="btn btn-sm"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ← Trước
            </button>
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              Trang {safePage} / {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-sm"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Sau →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
