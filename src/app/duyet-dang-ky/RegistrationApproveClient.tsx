'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { reviewRegistrationAction } from '@/app/actions/streamers';
import { useUI } from '@/components/ui/ToastProvider';

export interface RegistrationRowItem {
  id: string;
  fullName: string;
  avatarInitials: string;
  maskedPhone: string;
  tiktokUsername: string;
  teamName: string;
  projectName: string;
  submittedLabel: string;
  status: 'cho_duyet' | 'da_duyet' | 'tu_choi';
}

export function RegistrationApproveClient({
  rows,
}: {
  rows: RegistrationRowItem[];
}) {
  const router = useRouter();
  const { showToast } = useUI();

  const [processedMap, setProcessedMap] = useState<
    Record<string, RegistrationRowItem['status'] | undefined>
  >({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [credentialBanner, setCredentialBanner] = useState<{
    fullName: string;
    loginEmail: string;
    initialPassword: string;
  } | null>(null);

  const pendingCount = rows.filter((r) => {
    const localState = processedMap[r.id];
    const effective = localState ?? r.status;
    return effective === 'cho_duyet';
  }).length;

  const handleAction = async (
    row: RegistrationRowItem,
    action: 'approve' | 'reject'
  ) => {
    if (busyId) return;
    setBusyId(row.id);
    try {
      const res = await reviewRegistrationAction({
        registrationId: row.id,
        action,
      });
      if (!res.ok) {
        showToast(res.error);
        return;
      }

      setProcessedMap((prev) => ({
        ...prev,
        [row.id]: action === 'approve' ? 'da_duyet' : 'tu_choi',
      }));

      if (action === 'approve') {
        // CN-09 Mục 8 M-01 NGUYÊN VĂN:
        showToast(
          `Đã duyệt ${row.fullName} — tài khoản đã vào danh sách theo dõi.`
        );
        if (res.provisionedCredentials) {
          setCredentialBanner({
            fullName: row.fullName,
            loginEmail: res.provisionedCredentials.loginEmail,
            initialPassword: res.provisionedCredentials.initialPassword,
          });
        }
      } else {
        // CN-09 Mục 8 M-02 NGUYÊN VĂN:
        showToast(`Đã từ chối đăng ký của ${row.fullName}.`);
      }

      router.refresh();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-h1">Duyệt đăng ký</h1>
          <p className="page-desc">
            {pendingCount} đăng ký đang chờ · tài khoản được duyệt sẽ vào danh
            sách theo dõi ngay
          </p>
        </div>
      </div>

      {credentialBanner && (
        <div className="note note-teal" style={{ marginBottom: 16 }}>
          Tài khoản đăng nhập cho <strong>{credentialBanner.fullName}</strong>:{' '}
          <code>{credentialBanner.loginEmail}</code> · Mật khẩu khởi tạo:{' '}
          <code>{credentialBanner.initialPassword}</code>
        </div>
      )}

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Người đăng ký</th>
                <th>@TikTok</th>
                <th>Team</th>
                <th>Dự án</th>
                <th>Gửi lúc</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} data-label="Người đăng ký">
                    Không có đăng ký nào đang chờ duyệt.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const effectiveStatus = processedMap[row.id] ?? row.status;
                  const isHandled = effectiveStatus !== 'cho_duyet';
                  return (
                    <tr
                      key={row.id}
                      className={isHandled ? 'muted-row' : undefined}
                    >
                      <td data-label="Người đăng ký">
                        <div className="person">
                          <div className="avatar">{row.avatarInitials}</div>
                          <div style={{ textAlign: 'left' }}>
                            <div className="person-name">{row.fullName}</div>
                            <div className="person-sub">{row.maskedPhone}</div>
                          </div>
                        </div>
                      </td>
                      <td data-label="@TikTok">
                        <a
                          href={`https://www.tiktok.com/${row.tiktokUsername}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontWeight: 600,
                            color: 'var(--navy)',
                            textDecoration: 'underline',
                          }}
                        >
                          {row.tiktokUsername}
                        </a>
                      </td>
                      <td data-label="Team">{row.teamName}</td>
                      <td data-label="Dự án">{row.projectName}</td>
                      <td data-label="Gửi lúc">{row.submittedLabel}</td>
                      <td data-label="Thao tác">
                        <div
                          style={{
                            display: 'inline-flex',
                            gap: 8,
                            flexWrap: 'wrap',
                          }}
                        >
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            disabled={isHandled || busyId === row.id}
                            onClick={() => handleAction(row, 'approve')}
                          >
                            Duyệt
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            disabled={isHandled || busyId === row.id}
                            onClick={() => handleAction(row, 'reject')}
                          >
                            Từ chối
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
          {/* CN-09 Mục 8 M-03 NGUYÊN VĂN */}
          Tài khoản được duyệt bắt đầu được ghi nhận phiên live kể từ thời điểm
          duyệt.
        </p>
      </div>
    </div>
  );
}
