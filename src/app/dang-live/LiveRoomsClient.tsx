'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  formatLiveMinutes,
  formatLiveUpdatedAgo,
  formatThousands,
} from '@/lib/formatters';
import { LiveModalRoomData, useUI } from '@/components/ui/ToastProvider';

export interface ActiveLiveCardItem extends LiveModalRoomData {
  canViewProfile: boolean;
}

export function LiveRoomsClient({
  rooms,
  initialSecondsAgo,
  minSessionMinutes,
}: {
  rooms: ActiveLiveCardItem[];
  initialSecondsAgo: number;
  minSessionMinutes: number;
}) {
  const router = useRouter();
  const { openLiveRoomModal } = useUI();
  const [secondsAgo, setSecondsAgo] = useState(Math.max(0, initialSecondsAgo));

  // QT-01 CN-02: Màn tự làm mới mỗi 30 giây, bộ đếm tự tăng mỗi giây
  useEffect(() => {
    setSecondsAgo(Math.max(0, initialSecondsAgo));
    const secTimer = setInterval(() => {
      setSecondsAgo((s) => s + 1);
    }, 1000);
    const refreshTimer = setInterval(() => {
      router.refresh();
      setSecondsAgo(0);
    }, 30000);

    return () => {
      clearInterval(secTimer);
      clearInterval(refreshTimer);
    };
  }, [initialSecondsAgo, router]);

  const totalViewers = rooms.reduce((acc, r) => acc + r.currentViewers, 0);
  const topViewerRoom = [...rooms].sort(
    (a, b) => b.currentViewers - a.currentViewers
  )[0];
  const longestRoom = [...rooms].sort(
    (a, b) => b.liveMinutes - a.liveMinutes
  )[0];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-h1">Đang Live</h1>
          <p className="page-desc">
            {/* CN-02 Mục 8 M-01 NGUYÊN VĂN */}
            {rooms.length} phòng đang phát · tự động làm mới mỗi 30 giây
          </p>
        </div>
        <div className="page-actions">
          <span className="tag tag-live">
            ● LIVE · cập nhật {formatLiveUpdatedAgo(secondsAgo)}
          </span>
        </div>
      </div>

      <div className="kpi-grid-3">
        <div className="card">
          <div className="kpi-label">Tổng người đang xem</div>
          <div className="kpi-value">{formatThousands(totalViewers)}</div>
          <div className="kpi-sub">Cộng {rooms.length} phòng live</div>
        </div>

        <div className="card">
          <div className="kpi-label">Phòng đông nhất</div>
          <div className="kpi-value" style={{ fontSize: 22 }}>
            {topViewerRoom ? topViewerRoom.streamerName : '—'}
          </div>
          <div className="kpi-sub">
            {topViewerRoom
              ? `${formatThousands(topViewerRoom.currentViewers)} người xem · live ${topViewerRoom.liveMinutes} phút`
              : 'Chưa có phòng đang phát'}
          </div>
        </div>

        <div className="card">
          <div className="kpi-label">Phiên dài nhất hiện tại</div>
          <div className="kpi-value">
            {longestRoom ? formatLiveMinutes(longestRoom.liveMinutes) : '0 phút'}
          </div>
          <div
            className={`kpi-sub ${
              longestRoom && longestRoom.liveMinutes >= minSessionMinutes
                ? 'up'
                : ''
            }`}
          >
            {longestRoom
              ? longestRoom.liveMinutes >= minSessionMinutes
                ? 'Đủ điều kiện tính điểm (≥ 30 phút)'
                : `Chưa đủ ${minSessionMinutes} phút để tính điểm`
              : 'Chưa có phòng đang phát'}
          </div>
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 36 }}>
          Hiện chưa có phòng nào đang live. Hệ thống tự động kiểm tra tài khoản đã duyệt và cập nhật ngay khi có streamer lên sóng.
        </div>
      ) : (
        <div className="grid-3">
          {rooms.map((room) => (
            <div key={room.sessionId} className="card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <span className="tag tag-live">
                  ● LIVE {formatLiveMinutes(room.liveMinutes)}
                </span>
                <span style={{ fontWeight: 700, color: 'var(--red)', fontSize: 13 }}>
                  {formatThousands(room.currentViewers)} người xem
                </span>
              </div>

              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                {room.title}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: 'var(--gold)',
                  fontWeight: 700,
                  marginBottom: 14,
                }}
              >
                {room.projectName}
              </div>

              <div className="person" style={{ marginBottom: 16 }}>
                <div className="avatar live-ring">{room.avatarInitials}</div>
                <div>
                  <div className="person-name">{room.streamerName}</div>
                  <div className="person-sub">{room.tiktokUsername}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => openLiveRoomModal(room)}
                >
                  Xem phòng live
                </button>
                {room.canViewProfile && (
                  <Link
                    href={`/chi-tiet-streamer?streamerId=${encodeURIComponent(
                      room.streamerId
                    )}`}
                    className="btn btn-sm"
                  >
                    Hồ sơ
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
