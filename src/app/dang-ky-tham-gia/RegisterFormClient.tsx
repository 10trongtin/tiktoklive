'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Project, Team } from '@/types/domain';
import { submitRegistrationAction } from '@/app/actions/streamers';
import { useUI } from '@/components/ui/ToastProvider';

export function RegisterFormClient({
  teams,
  projects,
}: {
  teams: Team[];
  projects: Project[];
}) {
  const router = useRouter();
  const { showToast } = useUI();

  const defaultTeamId = teams[0]?.id ?? '';
  const defaultProjectId = projects[0]?.id ?? '';

  const [fullName, setFullName] = useState('');
  const [phoneZalo, setPhoneZalo] = useState('');
  const [tiktokRaw, setTiktokRaw] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [teamId, setTeamId] = useState(defaultTeamId);
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [committed, setCommitted] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedOk, setSubmittedOk] = useState(false);

  const handleReset = () => {
    setFullName('');
    setPhoneZalo('');
    setTiktokRaw('');
    setWorkEmail('');
    setTeamId(defaultTeamId);
    setProjectId(defaultProjectId);
    setCommitted(false);
    setErrorMsg(null);
    setSubmittedOk(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setErrorMsg(null);

    if (!fullName.trim() || !phoneZalo.trim() || !tiktokRaw.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ các ô bắt buộc có dấu *.');
      return;
    }
    if (!committed) {
      setErrorMsg('Vui lòng đánh dấu ô cam kết trước khi gửi đăng ký.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitRegistrationAction({
        fullName,
        phoneZalo,
        tiktokRaw,
        workEmail,
        teamId,
        projectId,
        committed,
      });

      if (!res.ok) {
        setErrorMsg(res.error);
        return;
      }

      setSubmittedOk(true);
      // CN-06 Mục 8 M-03 NGUYÊN VĂN:
      showToast('Đã gửi đăng ký — trạng thái: Chờ duyệt.');
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-h1">Đăng ký tham gia</h1>
          <p className="page-desc">
            1 tài khoản TikTok cho cả mùa giải · điểm chỉ tính từ khi đăng ký
            được duyệt
          </p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          {submittedOk && (
            <div className="note note-teal" style={{ marginBottom: 16 }}>
              {/* CN-06 Mục 8 M-02 NGUYÊN VĂN */}
              Đã gửi — trạng thái: Chờ duyệt. Admin sẽ kiểm tra @TikTok của bạn
              trong giờ làm việc. Bạn nhận thông báo qua Zalo khi được duyệt.
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
              <label className="form-label" htmlFor="reg-fullname">
                Họ và tên *
              </label>
              <input
                id="reg-fullname"
                type="text"
                className="input"
                placeholder="Ví dụ: Minh Dự"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">
                Số điện thoại / Zalo *
              </label>
              <input
                id="reg-phone"
                type="tel"
                className="input"
                placeholder="09xx xxx xxx"
                value={phoneZalo}
                onChange={(e) => setPhoneZalo(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-tiktok">
                Tài khoản TikTok *
              </label>
              <input
                id="reg-tiktok"
                type="text"
                className="input"
                placeholder="Ví dụ: @minhdupicity — không đổi giữa mùa"
                value={tiktokRaw}
                onChange={(e) => setTiktokRaw(e.target.value)}
              />
              <div className="form-hint">
                Hệ thống chỉ theo dõi đúng @username này.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">
                Email công việc
              </label>
              <input
                id="reg-email"
                type="email"
                className="input"
                placeholder="ten@picity.com.vn"
                value={workEmail}
                onChange={(e) => setWorkEmail(e.target.value)}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-team">
                  Team *
                </label>
                <select
                  id="reg-team"
                  className="select"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-project">
                  Dự án phụ trách *
                </label>
                <select
                  id="reg-project"
                  className="select"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 4 }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  cursor: 'pointer',
                  fontSize: 13.5,
                }}
              >
                <input
                  type="checkbox"
                  checked={committed}
                  onChange={(e) => setCommitted(e.target.checked)}
                  style={{ marginTop: 3, width: 18, height: 18, flexShrink: 0 }}
                />
                {/* CN-06 Mục 8 M-01 NGUYÊN VĂN */}
                <span>
                  Tôi cam kết live bằng đúng tài khoản đã đăng ký, có mặt thật
                  trong phiên live, và chấp nhận luật điểm của mùa giải (phiên
                  dưới 30 phút không tính điểm).
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                Gửi đăng ký
              </button>
              <button
                type="button"
                className="btn"
                onClick={handleReset}
                disabled={submitting}
              >
                Nhập lại
              </button>
            </div>
          </form>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h2
              style={{
                margin: '0 0 12px',
                fontSize: 18,
                fontFamily: 'var(--font-playfair), Georgia, serif',
              }}
            >
              Quy trình 3 bước
            </h2>
            {/* CN-06 Mục 8 M-04 NGUYÊN VĂN */}
            <ol
              style={{
                margin: 0,
                paddingLeft: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <li>Gửi đăng ký — điền form này 1 lần duy nhất cho cả mùa.</li>
              <li>Admin duyệt — kiểm tra @TikTok đúng người, đúng team.</li>
              <li>
                Bắt đầu live — hệ thống tự nhận diện phiên và tính điểm nháp,
                admin duyệt là chốt lên bảng.
              </li>
            </ol>
          </div>

          <div className="note">
            {/* CN-06 Mục 8 M-05 NGUYÊN VĂN */}
            Lưu ý: đổi @username giữa mùa phải đăng ký lại và được duyệt lại.
            Các phiên ở tài khoản cũ dừng tính từ thời điểm đổi.
          </div>
        </div>
      </div>
    </div>
  );
}
