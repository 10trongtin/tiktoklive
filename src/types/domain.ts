export type UserRole = 'admin' | 'streamer' | 'executive';

export type SeasonStatus = 'sap_dien_ra' | 'dang_dien_ra' | 'da_khoa_bang';

export type RegistrationStatus = 'cho_duyet' | 'da_duyet' | 'tu_choi';

export type SessionDataFlag = 'du_dieu_kien' | 'duoi_30_phut' | 'thieu_du_lieu';

export type SessionReviewStatus =
  | 'dang_live'
  | 'cho_duyet'
  | 'cho_duyet_tay'
  | 'da_duyet'
  | 'tu_choi';

export type RankingPeriodTab = 'tuan_nay' | 'thang_nay' | 'tu_dau';

export type ReportType =
  | 'weekly'
  | 'streamer_detail'
  | 'monthly_closing'
  | 'ranking_csv';

export interface Team {
  id: string;
  name: string; // "Team Picity 1"
  shortName: string; // "Picity 1"
  sortOrder: number;
}

export interface Project {
  id: string;
  name: string; // "Picity Central Park"
  shortName: string; // "Central Park"
  sortOrder: number;
}

export interface AuthSessionUser {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  role: UserRole;
  roleTitle: string; // "Quản trị viên" | "Streamer" | "Cấp điều hành"
  sidebarRoleTitle: string; // "Quản trị viên hệ thống" | "Streamer" | "Cấp điều hành"
  avatarInitials: string;
  streamerId?: string;
}

export interface Season {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: SeasonStatus;
  ruleLabel: string; // "Luật: ≥ 30 phút = 1 điểm"
  createdAt: string;
}

export interface SystemSettings {
  minSessionMinutes: number; // 30
  pointsPerValidSession: number; // 1
  tieBreaker: string; // "Tổng giờ live cao hơn"
  maxScoredSessionsPerDay: string; // "Không giới hạn"
  giftDiamondRule: string; // "Không tính điểm"
  missingDataRule: string; // "Duyệt tay bằng bằng chứng"
  weeklyKpiMinutes: number; // 240 (4h00)
  weeklyTargetSessions: number; // 4
  providerName: string;
  providerPlan: string; // "Gói Basic · 10.000 request/ngày · tối đa 20 phòng live cùng lúc"
  dailyRequestLimit: number;
  maxConcurrentRooms: number;
  checkIntervalOfflineSec: number; // 300 (5 phút)
  checkIntervalLiveSec: number; // 30 (30 giây)
  requestsUsedToday: number;
  lastApiErrorNote: string | null;
  connectionStatus: 'connected' | 'disconnected' | 'rate_limited';
  lastPolledAt: string;
  autoOpenCloseSession: boolean;
  autoDraftPoints: boolean;
  autoApproveValidSessions: boolean;
  updatedAt: string;
}

export interface Registration {
  id: string;
  fullName: string;
  phoneZalo: string;
  tiktokUsername: string; // "@username"
  workEmail: string | null;
  teamId: string;
  projectId: string;
  committed: boolean;
  status: RegistrationStatus;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  rejectReason: string | null;
  provisionedEmail?: string | null;
  provisionedPasswordHint?: string | null;
}

export interface Streamer {
  id: string;
  userId: string | null;
  registrationId: string | null;
  fullName: string;
  displayName: string; // "<Họ tên> Picity"
  avatarInitials: string;
  phoneZalo: string;
  tiktokUsername: string; // "@username"
  workEmail: string | null;
  teamId: string;
  projectId: string;
  joinedWeek: number;
  isLive: boolean;
  active: boolean;
  trackingStartedAt: string;
  createdAt: string;
}

export interface SessionSnapshot {
  id: string;
  sessionId: string;
  viewers: number;
  capturedAt: string;
}

export interface SessionProof {
  id: string;
  sessionId: string;
  streamerId: string;
  reportedDurationText: string; // "0h47"
  streamUrl: string | null;
  imagePath: string;
  imageFileName: string;
  noteForAdmin: string | null;
  submittedAt: string;
}

export interface LiveSession {
  id: string;
  streamerId: string;
  seasonId: string | null;
  projectId: string;
  tiktokUsername: string;
  roomId: string | null;
  title: string;
  streamUrl: string | null;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number;
  currentViewers: number;
  peakViewers: number;
  source: 'auto_api' | 'auto_with_proof';
  dataFlag: SessionDataFlag;
  dataFlagReason: string | null; // "API lỗi 5 phút" | "Chưa có snapshot"
  reviewStatus: SessionReviewStatus;
  draftPoints: number;
  finalPoints: number;
  reviewedBy: string | null;
  reviewedByName: string | null;
  reviewedAt: string | null;
  rejectReason: string | null;
  createdAt: string;
}

export interface ReportExportRecord {
  id: string;
  reportName: string;
  reportType: ReportType;
  periodLabel: string;
  exportedBy: string | null;
  exportedByName: string;
  exportedAt: string;
  queryParams: Record<string, string>;
}

export interface AppNotification {
  id: string;
  recipientRole: UserRole | null;
  recipientStreamerId: string | null;
  message: string;
  channel: 'in_app' | 'zalo_pending';
  isRead: boolean;
  createdAt: string;
}
