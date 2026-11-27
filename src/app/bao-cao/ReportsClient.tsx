'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ReportType } from '@/types/domain';
import { useUI } from '@/components/ui/ToastProvider';

export interface ExportHistoryRow {
  id: string;
  reportName: string;
  reportType: ReportType;
  periodLabel: string;
  exportedByName: string;
  exportedAtLabel: string;
  streamerIdParam?: string;
}

export function ReportsClient({
  weekLabel,
  streamers,
  history,
}: {
  weekLabel: string;
  streamers: { id: string; label: string }[];
  history: ExportHistoryRow[];
}) {
  const router = useRouter();
  const { showToast } = useUI();
  const [selectedStreamerId, setSelectedStreamerId] = useState('');

  const triggerDownload = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // CN-13 Mục 8 M-01 NGUYÊN VĂN:
    showToast('Đã tải file bảng xếp hạng tuần (CSV mở bằng Excel).');
    setTimeout(() => {
      router.refresh();
    }, 900);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-h1">Báo cáo</h1>
          <p className="page-desc">
            Xuất Excel theo tuần, tháng hoặc theo từng streamer · căn cứ tính
            thưởng
          </p>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => triggerDownload('/api/reports/export?type=weekly')}
          >
            Tải báo cáo tuần này
          </button>
        </div>
      </div>

      {/* 3 Thẻ loại báo cáo */}
      <div className="grid-3" style={{ marginBottom: 22 }}>
        <div
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 14,
          }}
        >
          <div>
            <h2
              style={{
                margin: '0 0 8px',
                fontSize: 18,
                fontFamily: 'var(--font-playfair), Georgia, serif',
              }}
            >
              Báo cáo tuần
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 13.5,
                color: 'var(--text-muted)',
              }}
            >
              Ai đạt KPI, ai chưa live, team nào dẫn đầu —{' '}
              {weekLabel.toLowerCase()}.
            </p>
          </div>
          <button
            type="button"
            className="btn"
            onClick={() => triggerDownload('/api/reports/export?type=weekly')}
          >
            Tải xuống (.xlsx)
          </button>
        </div>

        <div
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 14,
          }}
        >
          <div>
            <h2
              style={{
                margin: '0 0 8px',
                fontSize: 18,
                fontFamily: 'var(--font-playfair), Georgia, serif',
              }}
            >
              Chi tiết phiên theo streamer
            </h2>
            <p
              style={{
                margin: '0 0 10px',
                fontSize: 13.5,
                color: 'var(--text-muted)',
              }}
            >
              Từng phiên: giờ bắt đầu, thời lượng, peak view, trạng thái duyệt.
            </p>
            <select
              className="select"
              aria-label="Chọn streamer để xuất chi tiết phiên"
              value={selectedStreamerId}
              onChange={(e) => setSelectedStreamerId(e.target.value)}
            >
              <option value="">Tất cả streamer</option>
              {streamers.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="btn"
            onClick={() =>
              triggerDownload(
                `/api/reports/export?type=streamer_detail${
                  selectedStreamerId
                    ? `&streamerId=${encodeURIComponent(selectedStreamerId)}`
                    : ''
                }`
              )
            }
          >
            Tải xuống (.xlsx)
          </button>
        </div>

        <div
          className="card gold-border"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 14,
          }}
        >
          <div>
            <h2
              style={{
                margin: '0 0 8px',
                fontSize: 18,
                fontFamily: 'var(--font-playfair), Georgia, serif',
              }}
            >
              Bảng điểm chốt tháng
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 13.5,
                color: 'var(--text-muted)',
              }}
            >
              Căn cứ tính thưởng — chỉ gồm phiên đã duyệt, kèm người duyệt và
              giờ duyệt.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-gold"
            onClick={() =>
              triggerDownload('/api/reports/export?type=monthly_closing')
            }
          >
            Tải xuống (.xlsx)
          </button>
        </div>
      </div>

      {/* Bảng Lịch sử xuất báo cáo */}
      <div className="card">
        <h2
          style={{
            margin: '0 0 14px',
            fontSize: 18,
            fontFamily: 'var(--font-playfair), Georgia, serif',
          }}
        >
          Lịch sử xuất báo cáo
        </h2>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Báo cáo</th>
                <th>Kỳ</th>
                <th>Người xuất</th>
                <th>Xuất lúc</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} data-label="Lịch sử xuất báo cáo">
                    Chưa có lượt xuất báo cáo nào.
                  </td>
                </tr>
              ) : (
                history.map((row) => (
                  <tr key={row.id}>
                    <td data-label="Báo cáo" style={{ fontWeight: 700 }}>
                      {row.reportName}
                    </td>
                    <td data-label="Kỳ">{row.periodLabel}</td>
                    <td data-label="Người xuất">{row.exportedByName}</td>
                    <td data-label="Xuất lúc">{row.exportedAtLabel}</td>
                    <td data-label="Thao tác">
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() =>
                          triggerDownload(
                            `/api/reports/export?type=${encodeURIComponent(
                              row.reportType === 'ranking_csv'
                                ? 'weekly'
                                : row.reportType
                            )}&redownload=1${
                              row.streamerIdParam
                                ? `&streamerId=${encodeURIComponent(
                                    row.streamerIdParam
                                  )}`
                                : ''
                            }`
                          )
                        }
                      >
                        Tải lại
                      </button>
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
          Báo cáo tuần tự động sẵn sàng vào 07:00 mỗi sáng thứ 2.
        </p>
      </div>
    </div>
  );
}
