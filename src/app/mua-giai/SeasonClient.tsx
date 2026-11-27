'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSeasonAction } from '@/app/actions/admin-config';
import { useUI } from '@/components/ui/ToastProvider';

export interface SeasonSummaryItem {
  id: string;
  name: string;
  dateRangeLabel: string;
  streamerCount: number;
  approvedSessionsCount: number;
  totalMinutesFormatted: string;
  leaderName: string;
  status: 'sap_dien_ra' | 'dang_dien_ra' | 'da_khoa_bang';
  remainingDays: number;
  dayProgressCurrent: number;
  dayProgressTotal: number;
  ruleLabel: string;
}

export function SeasonClient({
  currentSeason,
  seasons,
}: {
  currentSeason: SeasonSummaryItem | null;
  seasons: SeasonSummaryItem[];
}) {
  const router = useRouter();
  const { showToast } = useUI();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!name.trim() || !startDate || !endDate) {
      setErrorMsg('Vui lòng điền đầy đủ Tên mùa giải, Ngày bắt đầu và Ngày kết thúc.');
      return;
    }
    if (endDate < startDate) {
      setErrorMsg('Ngày kết thúc không được trước Ngày bắt đầu.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createSeasonAction({ name, startDate, endDate });
      if (!res.ok) {
        setErrorMsg(res.error);
        return;
      }
      setShowCreateForm(false);
      setName('');
      setStartDate('');
      setEndDate('');
      // CN-11 Mục 8 M-01 NGUYÊN VĂN:
      showToast('Đã tạo mùa giải mới — mùa sẽ bắt đầu theo ngày bạn đã chọn.');
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  const progressPct = currentSeason
    ? Math.min(
        100,
        Math.round(
          (currentSeason.dayProgressCurrent /
            Math.max(1, currentSeason.dayProgressTotal)) *
            100
        )
      )
    : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-h1">Mùa giải</h1>
          <p className="page-desc">
            Mùa đã đóng sẽ khóa bảng — điểm đã chốt không sửa được
          </p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowCreateForm((v) => !v)}
          >
            + Tạo mùa giải mới
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h2
            style={{
              margin: '0 0 14px',
              fontSize: 18,
              fontFamily: 'var(--font-playfair), Georgia, serif',
            }}
          >
            Tạo mùa giải mới
          </h2>

          {errorMsg && (
            <div
              className="note"
              style={{
                background: 'var(--red-bg)',
                borderLeftColor: 'var(--red)',
                color: 'var(--red)',
                marginBottom: 14,
              }}
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleCreate}>
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label" htmlFor="season-name">
                  Tên mùa giải
                </label>
                <input
                  id="season-name"
                  type="text"
                  className="input"
                  placeholder="Tuần 23/11 – 29/11"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="season-start">
                  Ngày bắt đầu
                </label>
                <input
                  id="season-start"
                  type="date"
                  className="input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="season-end">
                  Ngày kết thúc
                </label>
                <input
                  id="season-end"
                  type="date"
                  className="input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                Tạo mùa giải
              </button>
            </div>
          </form>
        </div>
      )}

      {currentSeason && (
        <div className="card gold-border" style={{ marginBottom: 22 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 10,
              marginBottom: 14,
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                Mùa giải hiện tại
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                {currentSeason.name}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {currentSeason.status === 'da_khoa_bang' ? (
                <span className="tag tag-gray">Đã khóa bảng</span>
              ) : (
                <span className="tag tag-green">
                  Đang diễn ra · còn {currentSeason.remainingDays} ngày
                </span>
              )}
              <span className="tag tag-amber">{currentSeason.ruleLabel}</span>
            </div>
          </div>

          <div className="kpi-grid-3" style={{ marginBottom: 16 }}>
            <div className="card" style={{ background: 'var(--surface-subtle)' }}>
              <div className="kpi-label">Streamer</div>
              <div className="kpi-value">{currentSeason.streamerCount}</div>
            </div>
            <div className="card" style={{ background: 'var(--surface-subtle)' }}>
              <div className="kpi-label">Phiên đã chốt</div>
              <div className="kpi-value" style={{ fontSize: 22 }}>
                {currentSeason.approvedSessionsCount} phiên ·{' '}
                {currentSeason.totalMinutesFormatted}
              </div>
            </div>
            <div className="card" style={{ background: 'var(--surface-subtle)' }}>
              <div className="kpi-label">Đang dẫn đầu</div>
              <div className="kpi-value" style={{ fontSize: 22 }}>
                {currentSeason.leaderName}
              </div>
            </div>
          </div>

          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              <span>Tiến độ mùa giải</span>
              <span>
                Ngày {currentSeason.dayProgressCurrent} /{' '}
                {currentSeason.dayProgressTotal}
              </span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mùa giải</th>
                <th>Thời gian</th>
                <th className="num">Streamer</th>
                <th>Người dẫn đầu</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {seasons.length === 0 ? (
                <tr>
                  <td colSpan={5} data-label="Mùa giải">
                    Chưa có mùa giải nào. Bấm &ldquo;+ Tạo mùa giải mới&rdquo; để bắt đầu kỳ thi đua.
                  </td>
                </tr>
              ) : (
                seasons.map((s) => (
                  <tr key={s.id}>
                    <td data-label="Mùa giải" style={{ fontWeight: 700 }}>
                      {s.name}
                    </td>
                    <td data-label="Thời gian">{s.dateRangeLabel}</td>
                    <td data-label="Streamer" className="num">
                      {s.streamerCount}
                    </td>
                    <td data-label="Người dẫn đầu">{s.leaderName}</td>
                    <td data-label="Trạng thái">
                      {s.status === 'da_khoa_bang' ? (
                        <span className="tag tag-gray">Đã khóa bảng</span>
                      ) : (
                        <span className="tag tag-green">Đang diễn ra</span>
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
