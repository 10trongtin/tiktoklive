'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDuration, formatPeakView } from '@/lib/formatters';

export interface SnapshotPointItem {
  timeLabel: string;
  viewers: number;
}

export interface StreamerHistorySessionRow {
  id: string;
  dateLabel: string;
  title: string;
  durationMinutes: number;
  peakViewers: number;
  statusTagText: string;
  statusTagKind: 'green' | 'amber' | 'red-soft' | 'live';
}

export interface StreamerDetailProfile {
  id: string;
  displayName: string;
  avatarInitials: string;
  tiktokUsername: string;
  teamName: string;
  projectName: string;
  joinedWeek: number;
  weekRank: number;
  weekPoints: number;
  weekApprovedCount: number;
  seasonTotalMinutes: number;
  peakViewers: number;
  peakSessionDateNote: string;
  validRatePercent: number;
  approvedSessionsCount: number;
  totalCompletedSessionsCount: number;
  latestChartTitleSub: string | null;
  latestSnapshots: SnapshotPointItem[];
  latestChartPeak: number;
  history: StreamerHistorySessionRow[];
}

export function StreamerDetailClient({
  options,
  selected,
  canApprove,
}: {
  options: { id: string; label: string }[];
  selected: StreamerDetailProfile | null;
  canApprove: boolean;
}) {
  const router = useRouter();

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextId = e.target.value;
    router.push(`/chi-tiet-streamer?streamerId=${encodeURIComponent(nextId)}`);
  };

  // Vẽ đường polyline SVG cho biểu đồ người xem phiên gần nhất
  const renderLineChart = (
    points: SnapshotPointItem[],
    peakValue: number
  ) => {
    if (points.length === 0) {
      return (
        <div
          style={{
            padding: '32px 16px',
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}
        >
          Chưa có dữ liệu snapshot người xem cho phiên gần nhất.
        </div>
      );
    }

    const width = 680;
    const height = 210;
    const padX = 36;
    const padY = 30;
    const maxV = Math.max(10, peakValue, ...points.map((p) => p.viewers));

    const coords = points.map((pt, idx) => {
      const x =
        points.length === 1
          ? width / 2
          : padX + (idx / (points.length - 1)) * (width - padX * 2);
      const y =
        height - padY - (pt.viewers / maxV) * (height - padY * 2);
      return { x, y, ...pt };
    });

    const polylinePoints = coords.map((c) => `${c.x},${c.y}`).join(' ');
    const peakCoord =
      coords.reduce(
        (best, cur) => (cur.viewers > best.viewers ? cur : best),
        coords[0]
      ) ?? coords[0];

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        role="img"
        aria-label="Người xem theo thời gian — phiên gần nhất"
      >
        <line
          x1={padX}
          y1={height - padY}
          x2={width - padX}
          y2={height - padY}
          stroke="var(--border)"
          strokeWidth="1"
        />
        <polyline
          fill="none"
          stroke="var(--navy)"
          strokeWidth="2.5"
          points={polylinePoints}
        />
        {coords.map((c, idx) => (
          <circle
            key={idx}
            cx={c.x}
            cy={c.y}
            r={c === peakCoord ? 5 : 3}
            fill={c === peakCoord ? 'var(--gold)' : 'var(--navy)'}
          />
        ))}
        {/* CN-04 AC-04: đánh dấu "Peak <số>" */}
        <text
          x={peakCoord.x}
          y={Math.max(16, peakCoord.y - 10)}
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fill="var(--amber)"
        >
          Peak {peakCoord.viewers}
        </text>
        {/* Trục giờ đầu - giữa - cuối */}
        <text
          x={coords[0].x}
          y={height - 8}
          textAnchor="start"
          fontSize="11"
          fill="var(--text-muted)"
        >
          {coords[0].timeLabel}
        </text>
        {coords.length > 2 && (
          <text
            x={coords[Math.floor(coords.length / 2)].x}
            y={height - 8}
            textAnchor="middle"
            fontSize="11"
            fill="var(--text-muted)"
          >
            {coords[Math.floor(coords.length / 2)].timeLabel}
          </text>
        )}
        {coords.length > 1 && (
          <text
            x={coords[coords.length - 1].x}
            y={height - 8}
            textAnchor="end"
            fontSize="11"
            fill="var(--text-muted)"
          >
            {coords[coords.length - 1].timeLabel}
          </text>
        )}
      </svg>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-h1">Chi tiết streamer</h1>
          <p className="page-desc">
            {/* CN-04 Mục 8 M-01 NGUYÊN VĂN */}
            Hồ sơ và lịch sử phiên live trong mùa giải hiện tại
          </p>
        </div>

        {options.length > 0 && selected && (
          <div className="page-actions">
            <select
              aria-label="Chọn streamer"
              className="select"
              style={{ minWidth: 270 }}
              value={selected.id}
              onChange={handleSelectChange}
            >
              {options.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!selected ? (
        <div className="card" style={{ textAlign: 'center', padding: 36 }}>
          Chưa có streamer nào được duyệt trong mùa giải hiện tại.
        </div>
      ) : (
        <>
          {/* Hồ sơ streamer */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              <div className="person">
                <div className="avatar lg">{selected.avatarInitials}</div>
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ fontWeight: 800, fontSize: 19 }}>
                      {selected.displayName}
                    </span>
                    <span className="tag tag-amber">
                      Hạng {selected.weekRank} · Tuần này
                    </span>
                    <span className="tag tag-green">Đã duyệt</span>
                  </div>
                  <div className="person-sub" style={{ marginTop: 4 }}>
                    {selected.tiktokUsername} · {selected.teamName} ·{' '}
                    {selected.projectName} · Tham gia từ tuần{' '}
                    {selected.joinedWeek}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {canApprove && (
                  <Link
                    href={`/duyet-phien-live?streamerId=${encodeURIComponent(
                      selected.id
                    )}`}
                    className="btn btn-sm"
                  >
                    Xem phiên chờ duyệt
                  </Link>
                )}
                <a
                  href={`https://www.tiktok.com/${selected.tiktokUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                >
                  Mở TikTok ↗
                </a>
              </div>
            </div>
          </div>

          {/* 4 Thẻ chỉ số */}
          <div className="kpi-grid-4">
            <div className="card">
              <div className="kpi-label">Điểm tuần này</div>
              <div className="kpi-value">{selected.weekPoints}</div>
              <div className="kpi-sub">
                {selected.weekApprovedCount} phiên đã duyệt
              </div>
            </div>

            <div className="card">
              <div className="kpi-label">Tổng giờ live</div>
              <div className="kpi-value">
                {formatDuration(selected.seasonTotalMinutes)}
              </div>
              <div className="kpi-sub">Trong mùa giải hiện tại</div>
            </div>

            <div className="card">
              <div className="kpi-label">Peak viewers</div>
              <div className="kpi-value">
                {formatPeakView(selected.peakViewers)}
              </div>
              <div className="kpi-sub">{selected.peakSessionDateNote}</div>
            </div>

            <div className="card">
              <div className="kpi-label">Tỉ lệ phiên hợp lệ</div>
              <div className="kpi-value">{selected.validRatePercent}%</div>
              <div className="kpi-sub">
                {/* CN-04 Mục 8 M-03 NGUYÊN VĂN */}
                {selected.approvedSessionsCount} /{' '}
                {selected.totalCompletedSessionsCount} phiên được duyệt
              </div>
            </div>
          </div>

          {/* Biểu đồ đường phiên gần nhất */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h2
              style={{
                margin: '0 0 4px',
                fontSize: 18,
                fontFamily: 'var(--font-playfair), Georgia, serif',
              }}
            >
              Người xem theo thời gian — phiên gần nhất
            </h2>
            {selected.latestChartTitleSub && (
              <p
                style={{
                  margin: '0 0 12px',
                  fontSize: 13,
                  color: 'var(--text-muted)',
                }}
              >
                {selected.latestChartTitleSub}
              </p>
            )}
            {renderLineChart(
              selected.latestSnapshots,
              selected.latestChartPeak
            )}
          </div>

          {/* Bảng Lịch sử phiên live */}
          <div className="card">
            <h2
              style={{
                margin: '0 0 14px',
                fontSize: 18,
                fontFamily: 'var(--font-playfair), Georgia, serif',
              }}
            >
              Lịch sử phiên live
            </h2>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ngày</th>
                    <th>Tiêu đề phiên</th>
                    <th className="num">Thời lượng</th>
                    <th className="num">Peak</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.history.length === 0 ? (
                    <tr>
                      <td colSpan={5} data-label="Lịch sử phiên live">
                        Streamer chưa có phiên live nào trong mùa giải hiện tại.
                      </td>
                    </tr>
                  ) : (
                    selected.history.map((h) => (
                      <tr key={h.id}>
                        <td data-label="Ngày">{h.dateLabel}</td>
                        <td data-label="Tiêu đề phiên" style={{ fontWeight: 600 }}>
                          {h.title}
                        </td>
                        <td data-label="Thời lượng" className="num">
                          {formatDuration(h.durationMinutes)}
                        </td>
                        <td data-label="Peak" className="num">
                          {formatPeakView(h.peakViewers)}
                        </td>
                        <td data-label="Trạng thái">
                          <span className={`tag tag-${h.statusTagKind}`}>
                            {h.statusTagText}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
