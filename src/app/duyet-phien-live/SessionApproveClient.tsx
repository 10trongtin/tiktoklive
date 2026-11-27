'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDuration, formatPeakView } from '@/lib/formatters';
import { reviewSessionAction } from '@/app/actions/sessions';
import { useUI } from '@/components/ui/ToastProvider';

export interface PendingSessionItem {
  id: string;
  streamerName: string;
  avatarInitials: string;
  tiktokUsername: string;
  timeRangeLabel: string;
  durationMinutes: number;
  peakViewers: number;
  draftPoints: number;
  dataFlag: 'du_dieu_kien' | 'duoi_30_phut' | 'thieu_du_lieu';
  dataFlagReason: string | null;
  hasProof: boolean;
  proofReportedDuration?: string;
  proofNote?: string | null;
  proofStreamUrl?: string | null;
}

export function SessionApproveClient({
  initialItems,
  filteredStreamerName,
}: {
  initialItems: PendingSessionItem[];
  filteredStreamerName?: string | null;
}) {
  const router = useRouter();
  const { showToast } = useUI();

  const [items, setItems] = useState(initialItems);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [viewingProofItem, setViewingProofItem] =
    useState<PendingSessionItem | null>(null);
  const [rejectingItem, setRejectingItem] =
    useState<PendingSessionItem | null>(null);
  const [rejectReason, setRejectReason] = useState('Nội dung live không thuộc dự án Picity');

  const handleApprove = async (item: PendingSessionItem) => {
    if (busyId) return;
    setBusyId(item.id);
    try {
      const res = await reviewSessionAction({
        sessionId: item.id,
        action: 'approve',
      });
      if (!res.ok) {
        showToast(res.error);
        router.refresh();
        return;
      }

      setItems((prev) => prev.filter((x) => x.id !== item.id));
      // CN-08 Mục 8 M-01 NGUYÊN VĂN:
      showToast(
        `Đã duyệt phiên của ${item.streamerName} (${formatDuration(
          item.durationMinutes
        )}) — điểm đã chốt lên Bảng xếp hạng.`
      );
      router.refresh();
    } finally {
      setBusyId(null);
    }
  };

  const confirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingItem || busyId) return;
    const target = rejectingItem;
    setBusyId(target.id);
    try {
      const res = await reviewSessionAction({
        sessionId: target.id,
        action: 'reject',
        rejectReason,
      });
      if (!res.ok) {
        showToast(res.error);
        router.refresh();
        return;
      }

      setItems((prev) => prev.filter((x) => x.id !== target.id));
      setRejectingItem(null);
      // CN-08 Mục 8 M-02 NGUYÊN VĂN:
      showToast(
        `Đã từ chối phiên của ${target.streamerName}. Lý do được ghi vào lịch sử streamer.`
      );
      router.refresh();
    } finally {
      setBusyId(null);
    }
  };

  const renderEvaluationTag = (item: PendingSessionItem) => {
    if (item.dataFlag === 'thieu_du_lieu') {
      const reason = item.dataFlagReason || 'API lỗi 5 phút';
      return (
        <span className="tag tag-amber">
          {item.hasProof
            ? `Thiếu dữ liệu · ${reason} — đã có ảnh bằng chứng đính kèm`
            : `Thiếu dữ liệu · ${reason}`}
        </span>
      );
    }
    if (item.durationMinutes >= 30) {
      return <span className="tag tag-green">Đủ điều kiện · ≥ 30 phút</span>;
    }
    return (
      <span className="tag tag-red-soft">
        Dưới 30 phút · theo luật không tính điểm
      </span>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-h1">Duyệt phiên live</h1>
          <p className="page-desc">
            Điểm chỉ chốt lên bảng xếp hạng sau khi bạn duyệt từng phiên dưới
            đây
            {filteredStreamerName ? ` · Đang lọc: ${filteredStreamerName}` : ''}
          </p>
        </div>
        <div className="page-actions">
          <span className="tag tag-amber">{items.length} phiên chờ duyệt</span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 36 }}>
          {/* CN-08 Mục 8 M-04 NGUYÊN VĂN */}
          Đã xử lý hết — không còn phiên nào chờ duyệt.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {items.map((item) => (
            <div key={item.id} className="card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 16,
                  flexWrap: 'wrap',
                  marginBottom: 14,
                }}
              >
                <div className="person">
                  <div className="avatar">{item.avatarInitials}</div>
                  <div>
                    <div className="person-name">{item.streamerName}</div>
                    <div className="person-sub">
                      {item.tiktokUsername} · {item.timeRangeLabel}
                    </div>
                  </div>
                </div>

                {renderEvaluationTag(item)}
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 28,
                  flexWrap: 'wrap',
                  padding: '12px 14px',
                  background: 'var(--surface-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: 14,
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Thời lượng
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>
                    {formatDuration(item.durationMinutes)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Peak view
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>
                    {formatPeakView(item.peakViewers)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Điểm nháp
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 16,
                      color: 'var(--teal)',
                    }}
                  >
                    {item.draftPoints > 0
                      ? `+${item.draftPoints} điểm nháp`
                      : '0 điểm'}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={busyId === item.id}
                  onClick={() => handleApprove(item)}
                >
                  ✓ Duyệt — chốt điểm
                </button>

                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={busyId === item.id}
                  onClick={() => setRejectingItem(item)}
                >
                  ✕ Từ chối
                </button>

                {item.dataFlag === 'thieu_du_lieu' && item.hasProof && (
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      setViewingProofItem(item);
                      // CN-08 Mục 8 M-03 NGUYÊN VĂN:
                      showToast(
                        `Ảnh bằng chứng của ${item.streamerName}: thời lượng ${
                          item.proofReportedDuration ||
                          formatDuration(item.durationMinutes)
                        } khớp dữ liệu API còn lại — có thể duyệt.`
                      );
                    }}
                  >
                    Xem ảnh bằng chứng
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p
        style={{
          marginTop: 16,
          fontSize: 13,
          color: 'var(--text-muted)',
        }}
      >
        Duyệt xong, điểm cộng ngay vào bảng xếp hạng tuần.
      </p>

      {/* Hộp xem ảnh bằng chứng thật từ Storage */}
      {viewingProofItem && (
        <div
          className="modal-backdrop"
          onClick={() => setViewingProofItem(null)}
        >
          <div
            className="modal-box"
            style={{ maxWidth: 640 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                margin: '0 0 8px',
                fontSize: 20,
                fontFamily: 'var(--font-playfair), Georgia, serif',
              }}
            >
              Ảnh bằng chứng — {viewingProofItem.streamerName}
            </h2>
            <p style={{ margin: '0 0 12px', fontSize: 13.5 }}>
              Thời lượng trên ảnh cuối live:{' '}
              <strong>{viewingProofItem.proofReportedDuration}</strong>
              {viewingProofItem.proofNote
                ? ` · Ghi chú: ${viewingProofItem.proofNote}`
                : ''}
            </p>

            <div
              style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                marginBottom: 14,
                background: 'var(--surface-subtle)',
                textAlign: 'center',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/proofs/${encodeURIComponent(viewingProofItem.id)}`}
                alt={`Ảnh bằng chứng ${viewingProofItem.streamerName}`}
                style={{ maxWidth: '100%', maxHeight: 420, objectFit: 'contain' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              {viewingProofItem.proofStreamUrl && (
                <a
                  href={viewingProofItem.proofStreamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                >
                  Mở trên TikTok ↗
                </a>
              )}
              <button
                type="button"
                className="btn"
                onClick={() => setViewingProofItem(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hộp nhập lý do Từ chối phiên (CH-05) */}
      {rejectingItem && (
        <div
          className="modal-backdrop"
          onClick={() => setRejectingItem(null)}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2
              style={{
                margin: '0 0 10px',
                fontSize: 20,
                fontFamily: 'var(--font-playfair), Georgia, serif',
              }}
            >
              Từ chối phiên của {rejectingItem.streamerName}
            </h2>
            <form onSubmit={confirmReject}>
              <div className="form-group">
                <label className="form-label" htmlFor="reject-reason">
                  Lý do từ chối (ghi vào lịch sử streamer)
                </label>
                <input
                  id="reject-reason"
                  type="text"
                  className="input"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                />
              </div>
              <div
                style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}
              >
                <button
                  type="button"
                  className="btn"
                  onClick={() => setRejectingItem(null)}
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="btn btn-danger"
                  disabled={busyId === rejectingItem.id}
                >
                  ✕ Từ chối
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
