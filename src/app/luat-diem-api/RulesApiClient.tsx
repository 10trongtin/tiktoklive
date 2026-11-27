'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SystemSettings } from '@/types/domain';
import { formatThousands } from '@/lib/formatters';
import { saveRulesAndApiConfigAction } from '@/app/actions/admin-config';
import { useUI } from '@/components/ui/ToastProvider';

export function RulesApiClient({
  settings,
  ruleExampleNote,
}: {
  settings: SystemSettings;
  ruleExampleNote: string;
}) {
  const router = useRouter();
  const { showToast } = useUI();

  const [autoOpenClose, setAutoOpenClose] = useState(
    settings.autoOpenCloseSession
  );
  const [autoDraft, setAutoDraft] = useState(settings.autoDraftPoints);
  const [autoApprove, setAutoApprove] = useState(
    settings.autoApproveValidSessions
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await saveRulesAndApiConfigAction({
        autoOpenCloseSession: autoOpenClose,
        autoDraftPoints: autoDraft,
        autoApproveValidSessions: autoApprove,
      });
      if (!res.ok) {
        showToast(res.error);
        return;
      }
      // CN-12 Mục 8 M-01 NGUYÊN VĂN:
      showToast(
        'Đã lưu luật điểm và cấu hình kết nối — áp dụng từ phiên live tiếp theo.'
      );
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-h1">Luật điểm &amp; kết nối API</h1>
          <p className="page-desc">
            Áp dụng cho mùa giải hiện tại · thay đổi luật chỉ nên thực hiện khi
            mở mùa mới
          </p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            Lưu thay đổi
          </button>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        {/* Khối Luật tính điểm hiện hành */}
        <div className="card">
          <h2
            style={{
              margin: '0 0 14px',
              fontSize: 18,
              fontFamily: 'var(--font-playfair), Georgia, serif',
            }}
          >
            Luật tính điểm hiện hành
          </h2>

          <div className="table-wrap">
            <table className="data-table">
              <tbody>
                <tr>
                  <td data-label="Luật">Phiên tối thiểu để tính điểm</td>
                  <td data-label="Giá trị" style={{ fontWeight: 700, textAlign: 'right' }}>
                    {settings.minSessionMinutes} phút
                  </td>
                </tr>
                <tr>
                  <td data-label="Luật">Điểm mỗi phiên hợp lệ</td>
                  <td data-label="Giá trị" style={{ fontWeight: 700, textAlign: 'right' }}>
                    {settings.pointsPerValidSession} điểm
                  </td>
                </tr>
                <tr>
                  <td data-label="Luật">Xếp hạng khi bằng điểm</td>
                  <td data-label="Giá trị" style={{ fontWeight: 700, textAlign: 'right' }}>
                    {settings.tieBreaker}
                  </td>
                </tr>
                <tr>
                  <td data-label="Luật">Số phiên tối đa tính điểm / ngày</td>
                  <td data-label="Giá trị" style={{ fontWeight: 700, textAlign: 'right' }}>
                    {settings.maxScoredSessionsPerDay}
                  </td>
                </tr>
                <tr>
                  <td data-label="Luật">Quà / diamond</td>
                  <td data-label="Giá trị" style={{ fontWeight: 700, textAlign: 'right' }}>
                    {settings.giftDiamondRule}
                  </td>
                </tr>
                <tr>
                  <td data-label="Luật">Phiên thiếu dữ liệu API</td>
                  <td data-label="Giá trị" style={{ fontWeight: 700, textAlign: 'right' }}>
                    {settings.missingDataRule}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="note" style={{ marginTop: 14 }}>
            {ruleExampleNote}
          </div>
        </div>

        {/* Khối Kết nối dịch vụ đọc phòng live & công tắc tự động hóa */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 10,
              marginBottom: 8,
              flexWrap: 'wrap',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 18,
                fontFamily: 'var(--font-playfair), Georgia, serif',
              }}
            >
              Kết nối {settings.providerName}
            </h2>
            <span
              className={`tag ${
                settings.connectionStatus === 'connected'
                  ? 'tag-green'
                  : 'tag-red-soft'
              }`}
            >
              {settings.connectionStatus === 'connected'
                ? '● Đang kết nối'
                : '● Mất kết nối'}
            </span>
          </div>

          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
            {settings.providerPlan}
          </div>

          <div className="table-wrap" style={{ marginBottom: 18 }}>
            <table className="data-table">
              <tbody>
                <tr>
                  <td data-label="Thông số">Check khi chưa live</td>
                  <td data-label="Giá trị" style={{ fontWeight: 700, textAlign: 'right' }}>
                    mỗi {Math.round(settings.checkIntervalOfflineSec / 60)} phút
                  </td>
                </tr>
                <tr>
                  <td data-label="Thông số">Check khi đang live</td>
                  <td data-label="Giá trị" style={{ fontWeight: 700, textAlign: 'right' }}>
                    mỗi {settings.checkIntervalLiveSec} giây
                  </td>
                </tr>
                <tr>
                  <td data-label="Thông số">Request đã dùng hôm nay</td>
                  <td data-label="Giá trị" style={{ fontWeight: 700, textAlign: 'right' }}>
                    {formatThousands(settings.requestsUsedToday)} /{' '}
                    {formatThousands(settings.dailyRequestLimit)}
                  </td>
                </tr>
                <tr>
                  <td data-label="Thông số">Lỗi API gần nhất</td>
                  <td data-label="Giá trị" style={{ fontWeight: 600, textAlign: 'right' }}>
                    {settings.lastApiErrorNote || 'Không có'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>Tự mở / đóng phiên</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                  Phát hiện bắt đầu và kết thúc live qua polling
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={autoOpenClose}
                aria-label="Tự mở / đóng phiên"
                className={`switch ${autoOpenClose ? 'on' : ''}`}
                onClick={() => setAutoOpenClose((v) => !v)}
              >
                <span className="switch-thumb" />
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>Tự tính điểm nháp</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                  Điểm chỉ chốt sau khi admin duyệt
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={autoDraft}
                aria-label="Tự tính điểm nháp"
                className={`switch ${autoDraft ? 'on' : ''}`}
                onClick={() => setAutoDraft((v) => !v)}
              >
                <span className="switch-thumb" />
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>Tự duyệt phiên ≥ 30 phút</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                  {autoApprove
                    ? 'Đang bật — phiên đủ 30 phút và không thiếu dữ liệu tự chốt điểm'
                    : 'Đang tắt — toàn bộ phiên đều duyệt tay'}
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={autoApprove}
                aria-label="Tự duyệt phiên ≥ 30 phút"
                className={`switch ${autoApprove ? 'on' : ''}`}
                onClick={() => setAutoApprove((v) => !v)}
              >
                <span className="switch-thumb" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
