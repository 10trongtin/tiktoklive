'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { remindStreamerLiveAction } from '@/app/actions/streamers';
import { useUI } from '@/components/ui/ToastProvider';

export interface ManageStreamerRow {
  id: string;
  displayName: string;
  avatarInitials: string;
  tiktokUsername: string;
  teamName: string;
  projectShortName: string;
  weekDurationFormatted: string;
  trackingStatus: '● Đang live' | 'Chưa live tuần này' | 'Đang theo dõi';
}

export function ManageStreamersClient({
  initialQuery,
  activeCount,
  teamShortSummary,
  teamMemberCountsSummary,
  projectShortSummary,
  projectMemberCountsSummary,
  teamCount,
  projectCount,
  rows,
}: {
  initialQuery: string;
  activeCount: number;
  teamShortSummary: string;
  teamMemberCountsSummary: string;
  projectShortSummary: string;
  projectMemberCountsSummary: string;
  teamCount: number;
  projectCount: number;
  rows: ManageStreamerRow[];
}) {
  const { showToast } = useUI();
  const [filterText, setFilterText] = useState(initialQuery);
  const [remindingId, setRemindingId] = useState<string | null>(null);

  useEffect(() => {
    setFilterText(initialQuery);
  }, [initialQuery]);

  const filteredRows = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const haystack = [
        r.displayName,
        r.tiktokUsername,
        r.teamName,
        r.projectShortName,
        r.trackingStatus,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [rows, filterText]);

  const handleRemind = async (streamerId: string) => {
    setRemindingId(streamerId);
    try {
      const res = await remindStreamerLiveAction(streamerId);
      if (!res.ok) {
        showToast(res.error);
        return;
      }
      showToast(`Đã gửi nhắc live tuần này cho ${res.streamerName}.`);
    } finally {
      setRemindingId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-h1">Quản lý streamer · team · dự án</h1>
          <p className="page-desc">
            {activeCount} streamer đang được theo dõi · {teamCount} team ·{' '}
            {projectCount} dự án
          </p>
        </div>
        <div className="page-actions">
          <input
            type="search"
            className="input"
            style={{ minWidth: 260 }}
            placeholder="Lọc theo tên / @TikTok…"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
      </div>

      {initialQuery.trim() !== '' && (
        <div className="note note-teal" style={{ marginBottom: 16 }}>
          {/* CN-10 Mục 8 M-01 NGUYÊN VĂN */}
          Kết quả tìm “{initialQuery}” trong Quản lý streamer.
        </div>
      )}

      <div className="kpi-grid-3">
        <div className="card">
          <div className="kpi-label">Streamer đang hoạt động</div>
          <div className="kpi-value">{activeCount}</div>
          <div className="kpi-sub">
            {teamCount} team · {projectCount} dự án Picity
          </div>
        </div>

        <div className="card">
          <div className="kpi-label">Team</div>
          <div className="kpi-value" style={{ fontSize: 20 }}>
            {teamShortSummary}
          </div>
          <div className="kpi-sub">{teamMemberCountsSummary} thành viên</div>
        </div>

        <div className="card">
          <div className="kpi-label">Dự án</div>
          <div className="kpi-value" style={{ fontSize: 20 }}>
            {projectShortSummary}
          </div>
          <div className="kpi-sub">
            {projectMemberCountsSummary} streamer phụ trách
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Streamer</th>
                <th>Team</th>
                <th>Dự án</th>
                <th className="num">Giờ tuần</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} data-label="Streamer">
                    Không có streamer nào khớp điều kiện lọc.
                  </td>
                </tr>
              ) : (
                filteredRows.map((r) => (
                  <tr key={r.id}>
                    <td data-label="Streamer">
                      <div className="person">
                        <div
                          className={`avatar ${
                            r.trackingStatus === '● Đang live'
                              ? 'live-ring'
                              : ''
                          }`}
                        >
                          {r.avatarInitials}
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <div className="person-name">{r.displayName}</div>
                          <div className="person-sub">{r.tiktokUsername}</div>
                        </div>
                      </div>
                    </td>
                    <td data-label="Team">{r.teamName}</td>
                    <td data-label="Dự án">{r.projectShortName}</td>
                    <td data-label="Giờ tuần" className="num">
                      {r.weekDurationFormatted}
                    </td>
                    <td data-label="Trạng thái">
                      {r.trackingStatus === '● Đang live' && (
                        <span className="tag tag-live">● Đang live</span>
                      )}
                      {r.trackingStatus === 'Đang theo dõi' && (
                        <span className="tag tag-green">Đang theo dõi</span>
                      )}
                      {r.trackingStatus === 'Chưa live tuần này' && (
                        <span className="tag tag-amber">
                          Chưa live tuần này
                        </span>
                      )}
                    </td>
                    <td data-label="Thao tác">
                      {r.trackingStatus === 'Chưa live tuần này' ? (
                        <button
                          type="button"
                          className="btn btn-sm"
                          disabled={remindingId === r.id}
                          onClick={() => handleRemind(r.id)}
                        >
                          Nhắc live
                        </button>
                      ) : (
                        <Link
                          href={`/chi-tiet-streamer?streamerId=${encodeURIComponent(
                            r.id
                          )}`}
                          className="btn btn-sm"
                        >
                          Chi tiết
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
