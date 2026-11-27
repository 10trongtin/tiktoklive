'use client';

import React from 'react';
import { formatDuration, formatThousands } from '@/lib/formatters';
import { useUI } from '@/components/ui/ToastProvider';

export interface TeamHoursItem {
  id: string;
  name: string;
  minutes: number;
  widthPercent: number;
}

export interface ExecutiveOverviewProps {
  weekLabel: string;
  updatedTimeHm: string;
  kpiAchievedCount: number;
  totalStreamersCount: number;
  kpiAchievedPercent: number;
  totalTeamMinutes: number;
  totalValidSessionsCount: number;
  liveRoomsCount: number;
  liveViewersCount: number;
  zeroLiveCount: number;
  teamHours: TeamHoursItem[];
  projectSummaryLine: string;
  lowViewNote: string;
  skippedLiveNote: string;
  mostEffectiveNote: string;
}

export function ExecutiveClient(props: ExecutiveOverviewProps) {
  const { showToast } = useUI();

  const handleExportWeekly = () => {
    window.location.href = '/api/reports/export?type=weekly';
    // CN-03 Mục 8 M-05 NGUYÊN VĂN:
    showToast('Đã tải file bảng xếp hạng tuần (CSV mở bằng Excel).');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-h1">Tổng quan điều hành</h1>
          <p className="page-desc">
            {props.weekLabel} · Cập nhật hôm nay lúc {props.updatedTimeHm}
          </p>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleExportWeekly}
          >
            Xuất báo cáo tuần
          </button>
        </div>
      </div>

      {/* 4 Thẻ chỉ số điều hành */}
      <div className="kpi-grid-4">
        <div className="card">
          <div className="kpi-label">Đạt KPI tuần (≥ 4h live)</div>
          <div className="kpi-value">
            {props.kpiAchievedCount} / {props.totalStreamersCount}
          </div>
          <div className="kpi-sub up">{props.kpiAchievedPercent}% đội đạt</div>
        </div>

        <div className="card">
          <div className="kpi-label">Tổng giờ live toàn đội</div>
          <div className="kpi-value">
            {formatDuration(props.totalTeamMinutes)}
          </div>
          <div className="kpi-sub">
            {props.totalStreamersCount} streamer ·{' '}
            {props.totalValidSessionsCount} phiên hợp lệ
          </div>
        </div>

        <div className="card">
          <div className="kpi-label">Đang live lúc này</div>
          <div className="kpi-value red">{props.liveRoomsCount}</div>
          <div className="kpi-sub">
            {formatThousands(props.liveViewersCount)} người đang xem
          </div>
        </div>

        <div className="card">
          <div className="kpi-label">Chưa live phiên nào</div>
          <div className="kpi-value red">{props.zeroLiveCount}</div>
          <div className="kpi-sub">
            {/* CN-03 Mục 8 M-01 NGUYÊN VĂN */}
            Cần trưởng team nhắc trong hôm nay
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Khối Tổng giờ live theo team */}
        <div className="card">
          <h2
            style={{
              margin: '0 0 16px',
              fontSize: 18,
              fontFamily: 'var(--font-playfair), Georgia, serif',
            }}
          >
            Tổng giờ live theo team
          </h2>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              marginBottom: 18,
            }}
          >
            {props.teamHours.map((team) => (
              <div key={team.id}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 600,
                    fontSize: 13.5,
                    marginBottom: 5,
                  }}
                >
                  <span>{team.name}</span>
                  <span>{formatDuration(team.minutes)}</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${team.widthPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
            {props.projectSummaryLine}
          </div>
        </div>

        {/* Khối Cần chú ý tuần này */}
        <div className="card">
          <h2
            style={{
              margin: '0 0 16px',
              fontSize: 18,
              fontFamily: 'var(--font-playfair), Georgia, serif',
            }}
          >
            Cần chú ý tuần này
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="note">
              <strong>Live nhiều, view thấp:</strong> {props.lowViewNote}
            </div>

            <div className="note">
              <strong>Bỏ live:</strong> {props.skippedLiveNote}
            </div>

            <div className="note note-teal">
              <strong>Hiệu quả nhất:</strong> {props.mostEffectiveNote}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
