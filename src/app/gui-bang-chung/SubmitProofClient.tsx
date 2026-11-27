'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUI } from '@/components/ui/ToastProvider';

export interface FlaggedSessionOption {
  id: string;
  label: string;
}

export function SubmitProofClient({
  flaggedSessions,
}: {
  flaggedSessions: FlaggedSessionOption[];
}) {
  const router = useRouter();
  const { showToast } = useUI();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [sessionId, setSessionId] = useState(flaggedSessions[0]?.id ?? '');
  const [reportedDuration, setReportedDuration] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [noteForAdmin, setNoteForAdmin] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedOk, setSubmittedOk] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      setErrorMsg('Chỉ chấp nhận tệp ảnh PNG hoặc JPG.');
      e.target.value = '';
      setSelectedFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Ảnh vượt quá dung lượng tối đa 10MB.');
      e.target.value = '';
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleDropzoneKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // 04-giao-dien.md mục 7: Vùng chọn ảnh mở được bằng phím Enter / Space
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openFilePicker();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!sessionId) {
      setErrorMsg('Hiện không có phiên thiếu dữ liệu nào cần bổ sung bằng chứng.');
      return;
    }
    if (!reportedDuration.trim()) {
      setErrorMsg('Vui lòng nhập Thời lượng trên ảnh cuối live (ví dụ: 0h47).');
      return;
    }
    if (!selectedFile) {
      setErrorMsg('Vui lòng chọn Ảnh màn hình cuối live.');
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('sessionId', sessionId);
      fd.append('reportedDurationText', reportedDuration.trim());
      fd.append('streamUrl', streamUrl.trim());
      fd.append('noteForAdmin', noteForAdmin.trim());
      fd.append('proofImage', selectedFile);

      const resp = await fetch('/api/proofs/upload', {
        method: 'POST',
        body: fd,
      });
      const payload = (await resp.json()) as { ok: boolean; error?: string };

      if (!resp.ok || !payload.ok) {
        setErrorMsg(payload.error || 'Không thể gửi bằng chứng.');
        return;
      }

      setSubmittedOk(true);
      setReportedDuration('');
      setStreamUrl('');
      setNoteForAdmin('');
      setSelectedFile(null);

      // CN-07 Mục 8 M-02 NGUYÊN VĂN:
      showToast('Đã gửi bằng chứng — phiên chuyển sang Chờ duyệt tay.');
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-h1">Gửi bằng chứng phiên live</h1>
          <p className="page-desc">
            Dành cho phiên bị gắn cờ “thiếu dữ liệu” · hạn gửi: 24 giờ sau khi
            kết thúc live
          </p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          {submittedOk && (
            <div className="note note-teal" style={{ marginBottom: 16 }}>
              {/* CN-07 Mục 8 M-01 NGUYÊN VĂN */}
              Đã gửi bằng chứng. Phiên chuyển sang trạng thái “Chờ duyệt tay” —
              theo dõi tại mục Phiên live của tôi.
            </div>
          )}

          {errorMsg && (
            <div
              className="note"
              style={{
                background: 'var(--red-bg)',
                borderLeftColor: 'var(--red)',
                color: 'var(--red)',
                marginBottom: 16,
              }}
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="proof-session">
                Phiên cần bổ sung bằng chứng *
              </label>
              <select
                id="proof-session"
                className="select"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                disabled={flaggedSessions.length === 0}
              >
                {flaggedSessions.length === 0 ? (
                  <option value="">
                    Không có phiên thiếu dữ liệu nào trong hạn 24 giờ
                  </option>
                ) : (
                  flaggedSessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="proof-duration">
                Thời lượng trên ảnh cuối live *
              </label>
              <input
                id="proof-duration"
                type="text"
                className="input"
                placeholder="Ví dụ: 0h47"
                value={reportedDuration}
                onChange={(e) => setReportedDuration(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="proof-link">
                Link phiên live đã kết thúc
              </label>
              <input
                id="proof-link"
                type="url"
                className="input"
                placeholder="https://www.tiktok.com/@…/live"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Ảnh màn hình cuối live *</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <div
                role="button"
                tabIndex={0}
                className="file-dropzone"
                onClick={openFilePicker}
                onKeyDown={handleDropzoneKeyDown}
              >
                <div style={{ fontWeight: 700, marginBottom: 4 }}>
                  {selectedFile
                    ? `Đã chọn: ${selectedFile.name}`
                    : 'Bấm để chọn ảnh'}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                  Ảnh phải thấy rõ thời lượng phiên và @username · PNG/JPG, tối
                  đa 10MB
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="proof-note">
                Ghi chú cho admin
              </label>
              <textarea
                id="proof-note"
                className="textarea"
                placeholder="Ví dụ: live bị rớt mạng ở phút 30, vào lại ngay sau đó…"
                value={noteForAdmin}
                onChange={(e) => setNoteForAdmin(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || flaggedSessions.length === 0}
            >
              Gửi bằng chứng
            </button>
          </form>
        </div>

        <div>
          <div className="card">
            <h2
              style={{
                margin: '0 0 12px',
                fontSize: 18,
                fontFamily: 'var(--font-playfair), Georgia, serif',
              }}
            >
              Ảnh hợp lệ là ảnh thế nào?
            </h2>
            {/* CN-07 Mục 8 M-03 NGUYÊN VĂN */}
            <ul
              style={{
                margin: 0,
                paddingLeft: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <li>Chụp màn hình tổng kết ngay khi kết thúc live trên TikTok.</li>
              <li>Thấy rõ: thời lượng, số người xem, ngày giờ.</li>
              <li>
                Không dùng ảnh của phiên cũ — admin đối chiếu được với lịch sử
                tài khoản.
              </li>
              <li>Phiên dưới 30 phút vẫn không tính điểm dù có bằng chứng.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
