import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  AppNotification,
  AuthSessionUser,
  LiveSession,
  Project,
  Registration,
  ReportExportRecord,
  Season,
  SessionProof,
  SessionSnapshot,
  Streamer,
  SystemSettings,
  Team,
  UserRole,
} from '@/types/domain';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import {
  makeAvatarInitials,
  makeStreamerDisplayName,
  normalizeTiktokUsername,
} from '@/lib/formatters';
import {
  evaluateEndedSession,
  shouldMergeReconnectedSession,
} from '@/lib/scoring';

export interface LocalAccountRecord {
  id: string;
  email: string;
  phone?: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  roleTitle: string;
  sidebarRoleTitle: string;
  avatarInitials: string;
  streamerId?: string;
}

export interface LocalDatabaseState {
  teams: Team[];
  projects: Project[];
  accounts: LocalAccountRecord[];
  seasons: Season[];
  settings: SystemSettings;
  registrations: Registration[];
  streamers: Streamer[];
  liveSessions: LiveSession[];
  snapshots: SessionSnapshot[];
  proofs: SessionProof[];
  reportExports: ReportExportRecord[];
  notifications: AppNotification[];
}

const LOCAL_DIR = path.join(process.cwd(), '.local-data');
const LOCAL_DB_PATH = path.join(LOCAL_DIR, 'store.json');
const LOCAL_UPLOADS_DIR = path.join(LOCAL_DIR, 'uploads');

export function hashPassword(raw: string): string {
  return crypto.createHash('sha256').update(`picity:${raw}`).digest('hex');
}

function createEmptyInitialState(): LocalDatabaseState {
  const nowIso = new Date().toISOString();
  const providerName =
    process.env.LIVE_PROVIDER_NAME?.trim() || 'TikTok Live Service';

  // KHÔNG cài cứng bất kỳ dữ liệu mẫu (streamer, phiên, điểm) nào — tuân thủ Luật 9 AGENTS.md!
  // Chỉ khởi tạo 3 Team chuẩn, 3 Dự án chuẩn, Luật điểm mặc định từ spec và tài khoản Admin/Điều hành hệ thống.
  return {
    teams: [
      { id: 'team-1', name: 'Team Picity 1', shortName: 'Picity 1', sortOrder: 1 },
      { id: 'team-2', name: 'Team Picity 2', shortName: 'Picity 2', sortOrder: 2 },
      { id: 'team-3', name: 'Team Picity 3', shortName: 'Picity 3', sortOrder: 3 },
    ],
    projects: [
      {
        id: 'proj-central-park',
        name: 'Picity Central Park',
        shortName: 'Central Park',
        sortOrder: 1,
      },
      {
        id: 'proj-skyzen',
        name: 'Picity SkyZen',
        shortName: 'SkyZen',
        sortOrder: 2,
      },
      {
        id: 'proj-high-park',
        name: 'Picity High Park',
        shortName: 'High Park',
        sortOrder: 3,
      },
    ],
    accounts: [
      {
        id: 'usr-admin',
        email: process.env.INITIAL_ADMIN_EMAIL || 'admin@picity.com.vn',
        phone: '0900000001',
        passwordHash: hashPassword(
          process.env.INITIAL_ADMIN_PASSWORD || 'Picity@2026'
        ),
        fullName: 'Admin Picity',
        role: 'admin',
        roleTitle: 'Quản trị viên',
        sidebarRoleTitle: 'Quản trị viên hệ thống',
        avatarInitials: 'AD',
      },
      {
        id: 'usr-executive',
        email: process.env.INITIAL_EXEC_EMAIL || 'dieuhanh@picity.com.vn',
        phone: '0900000002',
        passwordHash: hashPassword(
          process.env.INITIAL_EXEC_PASSWORD || 'Picity@2026'
        ),
        fullName: 'Ban Điều Hành Picity',
        role: 'executive',
        roleTitle: 'Cấp điều hành',
        sidebarRoleTitle: 'Cấp điều hành',
        avatarInitials: 'ĐH',
      },
    ],
    seasons: [],
    settings: {
      minSessionMinutes: 30,
      pointsPerValidSession: 1,
      tieBreaker: 'Tổng giờ live cao hơn',
      maxScoredSessionsPerDay: 'Không giới hạn',
      giftDiamondRule: 'Không tính điểm',
      missingDataRule: 'Duyệt tay bằng bằng chứng',
      weeklyKpiMinutes: 240,
      weeklyTargetSessions: 4,
      providerName,
      providerPlan:
        'Gói Basic · 10.000 request/ngày · tối đa 20 phòng live cùng lúc',
      dailyRequestLimit: 10000,
      maxConcurrentRooms: 20,
      checkIntervalOfflineSec: 300,
      checkIntervalLiveSec: 30,
      requestsUsedToday: 0,
      lastApiErrorNote: null,
      connectionStatus: 'connected',
      lastPolledAt: nowIso,
      autoOpenCloseSession: true,
      autoDraftPoints: true,
      autoApproveValidSessions: false,
      updatedAt: nowIso,
    },
    registrations: [],
    streamers: [],
    liveSessions: [],
    snapshots: [],
    proofs: [],
    reportExports: [],
    notifications: [],
  };
}

let writeQueue: Promise<unknown> = Promise.resolve();

async function ensureLocalStore(): Promise<LocalDatabaseState> {
  await fs.mkdir(LOCAL_UPLOADS_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(LOCAL_DB_PATH, 'utf-8');
    return JSON.parse(raw) as LocalDatabaseState;
  } catch {
    const initial = createEmptyInitialState();
    await fs.writeFile(LOCAL_DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
}

async function withMutateLocalStore<T>(
  mutator: (state: LocalDatabaseState) => Promise<T> | T
): Promise<T> {
  const nextOp = writeQueue.then(async () => {
    const state = await ensureLocalStore();
    const result = await mutator(state);
    await fs.writeFile(LOCAL_DB_PATH, JSON.stringify(state, null, 2), 'utf-8');
    return result;
  });
  writeQueue = nextOp.catch(() => {});
  return nextOp;
}

/**
 * Tự động đồng bộ trạng thái mùa giải theo ngày hiện tại (UTC+7):
 * - Chưa tới ngày bắt đầu: sap_dien_ra
 * - Trong khoảng [startDate, endDate]: dang_dien_ra
 * - Quá endDate: da_khoa_bang ("Mùa đã đóng sẽ khóa bảng — điểm đã chốt không sửa được")
 */
export function resolveSeasonStatusByDate(
  startDate: string,
  endDate: string,
  todayYmd: string
): Season['status'] {
  if (todayYmd < startDate) return 'sap_dien_ra';
  if (todayYmd > endDate) return 'da_khoa_bang';
  return 'dang_dien_ra';
}

export function getTodayVietnamYmd(now: Date = new Date()): string {
  const shifted = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const y = shifted.getUTCFullYear();
  const m = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  const d = String(shifted.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export async function getAllAppData() {
  if (isSupabaseConfigured()) {
    const supabase = (await createServiceRoleClient()) ?? (await createClient());
    const [
      teamsRes,
      projectsRes,
      seasonsRes,
      settingsRes,
      registrationsRes,
      streamersRes,
      sessionsRes,
      snapshotsRes,
      proofsRes,
      exportsRes,
      notificationsRes,
    ] = await Promise.all([
      supabase.from('teams').select('*').order('sort_order'),
      supabase.from('projects').select('*').order('sort_order'),
      supabase.from('seasons').select('*').order('start_date', { ascending: false }),
      supabase.from('system_settings').select('*').eq('id', 1).maybeSingle(),
      supabase
        .from('registrations')
        .select('*')
        .order('submitted_at', { ascending: false }),
      supabase.from('streamers').select('*').order('created_at', { ascending: true }),
      supabase
        .from('live_sessions')
        .select('*')
        .order('started_at', { ascending: false }),
      supabase
        .from('session_snapshots')
        .select('*')
        .order('captured_at', { ascending: true }),
      supabase.from('session_proofs').select('*'),
      supabase
        .from('report_exports')
        .select('*')
        .order('exported_at', { ascending: false }),
      supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false }),
    ]);

    const todayYmd = getTodayVietnamYmd();
    const seasons: Season[] = (seasonsRes.data ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      startDate: r.start_date,
      endDate: r.end_date,
      status:
        r.status === 'da_khoa_bang'
          ? 'da_khoa_bang'
          : resolveSeasonStatusByDate(r.start_date, r.end_date, todayYmd),
      ruleLabel: r.rule_label,
      createdAt: r.created_at,
    }));

    const s = settingsRes.data;
    const settings: SystemSettings = s
      ? {
          minSessionMinutes: s.min_session_minutes,
          pointsPerValidSession: s.points_per_valid_session,
          tieBreaker: s.tie_breaker,
          maxScoredSessionsPerDay: s.max_scored_sessions_per_day,
          giftDiamondRule: s.gift_diamond_rule,
          missingDataRule: s.missing_data_rule,
          weeklyKpiMinutes: s.weekly_kpi_minutes,
          weeklyTargetSessions: s.weekly_target_sessions,
          providerName: s.provider_name,
          providerPlan: s.provider_plan,
          dailyRequestLimit: s.daily_request_limit,
          maxConcurrentRooms: s.max_concurrent_rooms,
          checkIntervalOfflineSec: s.check_interval_offline_sec,
          checkIntervalLiveSec: s.check_interval_live_sec,
          requestsUsedToday: s.requests_used_today,
          lastApiErrorNote: s.last_api_error_note,
          connectionStatus: s.connection_status,
          lastPolledAt: s.last_polled_at,
          autoOpenCloseSession: s.auto_open_close_session,
          autoDraftPoints: s.auto_draft_points,
          autoApproveValidSessions: s.auto_approve_valid_sessions,
          updatedAt: s.updated_at,
        }
      : createEmptyInitialState().settings;

    return {
      teams: (teamsRes.data ?? []).map(
        (t): Team => ({
          id: t.id,
          name: t.name,
          shortName: t.short_name,
          sortOrder: t.sort_order,
        })
      ),
      projects: (projectsRes.data ?? []).map(
        (p): Project => ({
          id: p.id,
          name: p.name,
          shortName: p.short_name,
          sortOrder: p.sort_order,
        })
      ),
      seasons,
      settings,
      registrations: (registrationsRes.data ?? []).map(
        (reg): Registration => ({
          id: reg.id,
          fullName: reg.full_name,
          phoneZalo: reg.phone_zalo,
          tiktokUsername: reg.tiktok_username,
          workEmail: reg.work_email,
          teamId: reg.team_id,
          projectId: reg.project_id,
          committed: reg.committed,
          status: reg.status,
          submittedAt: reg.submitted_at,
          reviewedAt: reg.reviewed_at,
          reviewedBy: reg.reviewed_by,
          rejectReason: reg.reject_reason,
          provisionedEmail: reg.provisioned_email,
        })
      ),
      streamers: (streamersRes.data ?? []).map(
        (st): Streamer => ({
          id: st.id,
          userId: st.user_id,
          registrationId: st.registration_id,
          fullName: st.full_name,
          displayName: st.display_name,
          avatarInitials: st.avatar_initials,
          phoneZalo: st.phone_zalo,
          tiktokUsername: st.tiktok_username,
          workEmail: st.work_email,
          teamId: st.team_id,
          projectId: st.project_id,
          joinedWeek: st.joined_week,
          isLive: st.is_live,
          active: st.active,
          trackingStartedAt: st.tracking_started_at,
          createdAt: st.created_at,
        })
      ),
      liveSessions: (sessionsRes.data ?? []).map(
        (ls): LiveSession => ({
          id: ls.id,
          streamerId: ls.streamer_id,
          seasonId: ls.season_id,
          projectId: ls.project_id,
          tiktokUsername: ls.tiktok_username,
          roomId: ls.room_id,
          title: ls.title,
          streamUrl: ls.stream_url,
          startedAt: ls.started_at,
          endedAt: ls.ended_at,
          durationMinutes: ls.duration_minutes,
          currentViewers: ls.current_viewers,
          peakViewers: ls.peak_viewers,
          source: ls.source,
          dataFlag: ls.data_flag,
          dataFlagReason: ls.data_flag_reason,
          reviewStatus: ls.review_status,
          draftPoints: ls.draft_points,
          finalPoints: ls.final_points,
          reviewedBy: ls.reviewed_by,
          reviewedByName: ls.reviewed_by_name,
          reviewedAt: ls.reviewed_at,
          rejectReason: ls.reject_reason,
          createdAt: ls.created_at,
        })
      ),
      snapshots: (snapshotsRes.data ?? []).map(
        (sn): SessionSnapshot => ({
          id: sn.id,
          sessionId: sn.session_id,
          viewers: sn.viewers,
          capturedAt: sn.captured_at,
        })
      ),
      proofs: (proofsRes.data ?? []).map(
        (pr): SessionProof => ({
          id: pr.id,
          sessionId: pr.session_id,
          streamerId: pr.streamer_id,
          reportedDurationText: pr.reported_duration_text,
          streamUrl: pr.stream_url,
          imagePath: pr.image_path,
          imageFileName: pr.image_file_name,
          noteForAdmin: pr.note_for_admin,
          submittedAt: pr.submitted_at,
        })
      ),
      reportExports: (exportsRes.data ?? []).map(
        (ex): ReportExportRecord => ({
          id: ex.id,
          reportName: ex.report_name,
          reportType: ex.report_type,
          periodLabel: ex.period_label,
          exportedBy: ex.exported_by,
          exportedByName: ex.exported_by_name,
          exportedAt: ex.exported_at,
          queryParams: ex.query_params ?? {},
        })
      ),
      notifications: (notificationsRes.data ?? []).map(
        (no): AppNotification => ({
          id: no.id,
          recipientRole: no.recipient_role,
          recipientStreamerId: no.recipient_streamer_id,
          message: no.message,
          channel: no.channel,
          isRead: no.is_read,
          createdAt: no.created_at,
        })
      ),
    };
  }

  const state = await ensureLocalStore();
  const todayYmd = getTodayVietnamYmd();
  const syncedSeasons = state.seasons.map((s) => ({
    ...s,
    status:
      s.status === 'da_khoa_bang'
        ? 'da_khoa_bang'
        : resolveSeasonStatusByDate(s.startDate, s.endDate, todayYmd),
  }));

  return {
    teams: state.teams,
    projects: state.projects,
    seasons: syncedSeasons,
    settings: state.settings,
    registrations: state.registrations,
    streamers: state.streamers,
    liveSessions: state.liveSessions,
    snapshots: state.snapshots,
    proofs: state.proofs,
    reportExports: state.reportExports,
    notifications: state.notifications,
  };
}

export function getActiveSeason(seasons: Season[]): Season | null {
  return (
    seasons.find((s) => s.status === 'dang_dien_ra') ??
    seasons.find((s) => s.status === 'sap_dien_ra') ??
    seasons[0] ??
    null
  );
}

/**
 * Xác thực tài khoản cục bộ (khi chưa gắn Supabase URL) bằng Email hoặc SĐT + Mật khẩu
 */
export async function verifyLocalCredentials(
  identifier: string,
  password: string
): Promise<AuthSessionUser | null> {
  const state = await ensureLocalStore();
  const norm = identifier.trim().toLowerCase();
  const digits = identifier.replace(/\s+/g, '');
  const hash = hashPassword(password);

  const acc = state.accounts.find(
    (a) =>
      (a.email.toLowerCase() === norm || (a.phone && a.phone === digits)) &&
      a.passwordHash === hash
  );
  if (!acc) return null;

  return {
    id: acc.id,
    email: acc.email,
    phone: acc.phone,
    fullName: acc.fullName,
    role: acc.role,
    roleTitle: acc.roleTitle,
    sidebarRoleTitle: acc.sidebarRoleTitle,
    avatarInitials: acc.avatarInitials,
    streamerId: acc.streamerId,
  };
}

export async function getLocalUserById(
  userId: string
): Promise<AuthSessionUser | null> {
  const state = await ensureLocalStore();
  const acc = state.accounts.find((a) => a.id === userId);
  if (!acc) return null;
  return {
    id: acc.id,
    email: acc.email,
    phone: acc.phone,
    fullName: acc.fullName,
    role: acc.role,
    roleTitle: acc.roleTitle,
    sidebarRoleTitle: acc.sidebarRoleTitle,
    avatarInitials: acc.avatarInitials,
    streamerId: acc.streamerId,
  };
}

/**
 * CN-11: Tạo mùa giải mới
 */
export async function createSeasonRecord(input: {
  name: string;
  startDate: string;
  endDate: string;
  createdBy?: string;
}): Promise<{ ok: true; season: Season } | { ok: false; error: string }> {
  const name = input.name.trim();
  if (!name || !input.startDate || !input.endDate) {
    return { ok: false, error: 'Vui lòng điền đầy đủ Tên mùa giải, Ngày bắt đầu và Ngày kết thúc.' };
  }
  if (input.endDate < input.startDate) {
    return { ok: false, error: 'Ngày kết thúc không được trước Ngày bắt đầu.' };
  }

  const todayYmd = getTodayVietnamYmd();
  const status = resolveSeasonStatusByDate(input.startDate, input.endDate, todayYmd);

  if (isSupabaseConfigured()) {
    const supabase = (await createServiceRoleClient()) ?? (await createClient());
    const { data, error } = await supabase
      .from('seasons')
      .insert({
        name,
        start_date: input.startDate,
        end_date: input.endDate,
        status,
        rule_label: 'Luật: ≥ 30 phút = 1 điểm',
        created_by: input.createdBy ?? null,
      })
      .select('*')
      .single();
    if (error || !data) {
      return { ok: false, error: error?.message ?? 'Không thể tạo mùa giải.' };
    }
    return {
      ok: true,
      season: {
        id: data.id,
        name: data.name,
        startDate: data.start_date,
        endDate: data.end_date,
        status: data.status,
        ruleLabel: data.rule_label,
        createdAt: data.created_at,
      },
    };
  }

  return withMutateLocalStore((state) => {
    const season: Season = {
      id: crypto.randomUUID(),
      name,
      startDate: input.startDate,
      endDate: input.endDate,
      status,
      ruleLabel: 'Luật: ≥ 30 phút = 1 điểm',
      createdAt: new Date().toISOString(),
    };
    state.seasons.unshift(season);
    return { ok: true as const, season };
  });
}

/**
 * CN-12: Lưu cấu hình công tắc tự động hóa & luật điểm
 */
export async function updateAutomationSettings(input: {
  autoOpenCloseSession: boolean;
  autoDraftPoints: boolean;
  autoApproveValidSessions: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const nowIso = new Date().toISOString();
  if (isSupabaseConfigured()) {
    const supabase = (await createServiceRoleClient()) ?? (await createClient());
    const { error } = await supabase
      .from('system_settings')
      .update({
        auto_open_close_session: input.autoOpenCloseSession,
        auto_draft_points: input.autoDraftPoints,
        auto_approve_valid_sessions: input.autoApproveValidSessions,
        updated_at: nowIso,
      })
      .eq('id', 1);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  return withMutateLocalStore((state) => {
    state.settings.autoOpenCloseSession = input.autoOpenCloseSession;
    state.settings.autoDraftPoints = input.autoDraftPoints;
    state.settings.autoApproveValidSessions = input.autoApproveValidSessions;
    state.settings.updatedAt = nowIso;
    return { ok: true as const };
  });
}

/**
 * CN-06: Gửi Đăng ký tham gia (màn mở công khai)
 */
export async function createRegistrationRecord(input: {
  fullName: string;
  phoneZalo: string;
  tiktokRaw: string;
  workEmail?: string;
  teamId: string;
  projectId: string;
  committed: boolean;
}): Promise<{ ok: true; registration: Registration } | { ok: false; error: string }> {
  const fullName = input.fullName.trim();
  const phoneClean = input.phoneZalo.trim().replace(/\s+/g, '');
  const tiktokUsername = normalizeTiktokUsername(input.tiktokRaw);
  const workEmail = input.workEmail?.trim() ? input.workEmail.trim().toLowerCase() : null;

  if (!fullName || fullName.length < 2) {
    return { ok: false, error: 'Vui lòng nhập Họ và tên hợp lệ.' };
  }
  if (!/^0\d{8,10}$/.test(phoneClean)) {
    return { ok: false, error: 'Vui lòng nhập Số điện thoại / Zalo hợp lệ (bắt đầu bằng số 0, 9–11 chữ số).' };
  }
  if (!tiktokUsername) {
    return { ok: false, error: 'Vui lòng nhập Tài khoản TikTok (@username hoặc link hồ sơ TikTok hợp lệ).' };
  }
  if (!input.teamId || !input.projectId) {
    return { ok: false, error: 'Vui lòng chọn đầy đủ Team và Dự án phụ trách.' };
  }
  if (!input.committed) {
    return { ok: false, error: 'Vui lòng đánh dấu vào ô cam kết trước khi gửi đăng ký.' };
  }

  const nowIso = new Date().toISOString();

  if (isSupabaseConfigured()) {
    const supabase = (await createServiceRoleClient()) ?? (await createClient());
    // Chặn trùng @username đang hoạt động hoặc đang chờ duyệt (AC-06, AC-07, CH-22)
    const [{ data: existingPending }, { data: existingStreamer }] = await Promise.all([
      supabase
        .from('registrations')
        .select('id')
        .eq('tiktok_username', tiktokUsername)
        .eq('status', 'cho_duyet')
        .maybeSingle(),
      supabase
        .from('streamers')
        .select('id')
        .eq('tiktok_username', tiktokUsername)
        .eq('active', true)
        .maybeSingle(),
    ]);

    if (existingPending || existingStreamer) {
      return {
        ok: false,
        error: `Tài khoản ${tiktokUsername} đã được đăng ký hoặc đang chờ duyệt.`,
      };
    }

    const { data, error } = await supabase
      .from('registrations')
      .insert({
        full_name: fullName,
        phone_zalo: phoneClean,
        tiktok_username: tiktokUsername,
        work_email: workEmail,
        team_id: input.teamId,
        project_id: input.projectId,
        committed: true,
        status: 'cho_duyet',
        submitted_at: nowIso,
      })
      .select('*')
      .single();

    if (error || !data) {
      return { ok: false, error: error?.message ?? 'Không thể gửi đăng ký.' };
    }

    await supabase.from('notifications').insert({
      recipient_role: 'admin',
      message: `${fullName} (${tiktokUsername}) vừa gửi đăng ký tham gia.`,
      channel: 'in_app',
    });

    return {
      ok: true,
      registration: {
        id: data.id,
        fullName: data.full_name,
        phoneZalo: data.phone_zalo,
        tiktokUsername: data.tiktok_username,
        workEmail: data.work_email,
        teamId: data.team_id,
        projectId: data.project_id,
        committed: data.committed,
        status: data.status,
        submittedAt: data.submitted_at,
        reviewedAt: null,
        reviewedBy: null,
        rejectReason: null,
      },
    };
  }

  return withMutateLocalStore((state) => {
    const dupReg = state.registrations.find(
      (r) =>
        r.status === 'cho_duyet' &&
        (r.tiktokUsername === tiktokUsername || r.phoneZalo === phoneClean)
    );
    const dupStreamer = state.streamers.find(
      (s) => s.active && s.tiktokUsername === tiktokUsername
    );
    if (dupReg || dupStreamer) {
      return {
        ok: false as const,
        error: `Tài khoản ${tiktokUsername} hoặc số điện thoại này đã được đăng ký.`,
      };
    }

    const registration: Registration = {
      id: crypto.randomUUID(),
      fullName,
      phoneZalo: phoneClean,
      tiktokUsername,
      workEmail,
      teamId: input.teamId,
      projectId: input.projectId,
      committed: true,
      status: 'cho_duyet',
      submittedAt: nowIso,
      reviewedAt: null,
      reviewedBy: null,
      rejectReason: null,
    };
    state.registrations.unshift(registration);
    state.notifications.unshift({
      id: crypto.randomUUID(),
      recipientRole: 'admin',
      recipientStreamerId: null,
      message: `${fullName} (${tiktokUsername}) gửi đăng ký chờ duyệt`,
      channel: 'in_app',
      isRead: false,
      createdAt: nowIso,
    });
    return { ok: true as const, registration };
  });
}

/**
 * CN-09: Admin Duyệt hoặc Từ chối đăng ký tham gia
 */
export async function reviewRegistrationRecord(input: {
  registrationId: string;
  action: 'approve' | 'reject';
  reviewerId: string;
  rejectReason?: string;
}): Promise<
  | {
      ok: true;
      registration: Registration;
      provisionedCredentials?: { loginEmail: string; initialPassword: string };
    }
  | { ok: false; error: string }
> {
  const nowIso = new Date().toISOString();

  if (isSupabaseConfigured()) {
    const adminClient = createServiceRoleClient();
    const supabase = adminClient ?? (await createClient());
    const { data: reg } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', input.registrationId)
      .maybeSingle();

    if (!reg || reg.status !== 'cho_duyet') {
      return { ok: false, error: 'Đăng ký này đã được xử lý trước đó.' };
    }

    if (input.action === 'reject') {
      const { error } = await supabase
        .from('registrations')
        .update({
          status: 'tu_choi',
          reviewed_at: nowIso,
          reviewed_by: input.reviewerId,
          reject_reason: input.rejectReason?.trim() || null,
        })
        .eq('id', input.registrationId)
        .eq('status', 'cho_duyet');
      if (error) return { ok: false, error: error.message };
      return {
        ok: true,
        registration: {
          id: reg.id,
          fullName: reg.full_name,
          phoneZalo: reg.phone_zalo,
          tiktokUsername: reg.tiktok_username,
          workEmail: reg.work_email,
          teamId: reg.team_id,
          projectId: reg.project_id,
          committed: reg.committed,
          status: 'tu_choi',
          submittedAt: reg.submitted_at,
          reviewedAt: nowIso,
          reviewedBy: input.reviewerId,
          rejectReason: input.rejectReason?.trim() || null,
        },
      };
    }

    const loginEmail =
      reg.work_email || `${reg.phone_zalo}@streamer.picity.local`;
    const initialPassword = `Picity@${reg.phone_zalo.slice(-4)}`;
    let createdUserId: string | null = null;

    if (adminClient) {
      const { data: authData } = await adminClient.auth.admin.createUser({
        email: loginEmail,
        password: initialPassword,
        email_confirm: true,
      });
      if (authData?.user) {
        createdUserId = authData.user.id;
        await adminClient.from('user_profiles').upsert({
          id: createdUserId,
          email: loginEmail,
          phone: reg.phone_zalo,
          full_name: reg.full_name,
          role: 'streamer',
          role_title: 'Streamer',
          avatar_initials: makeAvatarInitials(reg.full_name),
        });
      }
    }

    // Nếu đổi @username giữa mùa (QT-03 CN-06): ngừng tính tài khoản cũ của cùng SĐT/email
    await supabase
      .from('streamers')
      .update({ active: false, is_live: false })
      .eq('phone_zalo', reg.phone_zalo)
      .eq('active', true);

    const displayName = makeStreamerDisplayName(reg.full_name);
    const initials = makeAvatarInitials(reg.full_name);

    const { data: newStreamer, error: stErr } = await supabase
      .from('streamers')
      .insert({
        user_id: createdUserId,
        registration_id: reg.id,
        full_name: reg.full_name,
        display_name: displayName,
        avatar_initials: initials,
        phone_zalo: reg.phone_zalo,
        tiktok_username: reg.tiktok_username,
        work_email: reg.work_email,
        team_id: reg.team_id,
        project_id: reg.project_id,
        joined_week: 1,
        is_live: false,
        active: true,
        tracking_started_at: nowIso,
      })
      .select('*')
      .single();

    if (stErr || !newStreamer) {
      return { ok: false, error: stErr?.message ?? 'Không thể kích hoạt streamer.' };
    }

    await supabase
      .from('registrations')
      .update({
        status: 'da_duyet',
        reviewed_at: nowIso,
        reviewed_by: input.reviewerId,
        provisioned_email: loginEmail,
      })
      .eq('id', reg.id);

    // Hàng đợi thông báo Zalo (QT-02 CN-09)
    await supabase.from('notifications').insert({
      recipient_role: 'streamer',
      recipient_streamer_id: newStreamer.id,
      message: `Đăng ký ${reg.tiktok_username} đã được duyệt — bắt đầu theo dõi phiên live.`,
      channel: 'zalo_pending',
    });

    return {
      ok: true,
      registration: {
        id: reg.id,
        fullName: reg.full_name,
        phoneZalo: reg.phone_zalo,
        tiktokUsername: reg.tiktok_username,
        workEmail: reg.work_email,
        teamId: reg.team_id,
        projectId: reg.project_id,
        committed: reg.committed,
        status: 'da_duyet',
        submittedAt: reg.submitted_at,
        reviewedAt: nowIso,
        reviewedBy: input.reviewerId,
        rejectReason: null,
        provisionedEmail: loginEmail,
      },
      provisionedCredentials: { loginEmail, initialPassword },
    };
  }

  return withMutateLocalStore((state) => {
    const reg = state.registrations.find((r) => r.id === input.registrationId);
    if (!reg || reg.status !== 'cho_duyet') {
      return { ok: false as const, error: 'Đăng ký này đã được xử lý trước đó.' };
    }

    if (input.action === 'reject') {
      reg.status = 'tu_choi';
      reg.reviewedAt = nowIso;
      reg.reviewedBy = input.reviewerId;
      reg.rejectReason = input.rejectReason?.trim() || null;
      return { ok: true as const, registration: { ...reg } };
    }

    // Nếu người này đổi @username giữa mùa (QT-03 CN-06): dừng tính tài khoản cũ từ lúc duyệt mới
    for (const oldSt of state.streamers) {
      if (oldSt.active && oldSt.phoneZalo === reg.phoneZalo) {
        oldSt.active = false;
        oldSt.isLive = false;
      }
    }

    const streamerId = crypto.randomUUID();
    const userId = crypto.randomUUID();
    const loginEmail =
      reg.workEmail || `${reg.phoneZalo}@streamer.picity.local`;
    const initialPassword = `Picity@${reg.phoneZalo.slice(-4)}`;
    const displayName = makeStreamerDisplayName(reg.fullName);
    const initials = makeAvatarInitials(reg.fullName);

    const existingAccIdx = state.accounts.findIndex(
      (a) => a.phone === reg.phoneZalo || a.email.toLowerCase() === loginEmail.toLowerCase()
    );
    const accountRecord: LocalAccountRecord = {
      id: existingAccIdx >= 0 ? state.accounts[existingAccIdx].id : userId,
      email: loginEmail,
      phone: reg.phoneZalo,
      passwordHash: hashPassword(initialPassword),
      fullName: displayName,
      role: 'streamer',
      roleTitle: 'Streamer',
      sidebarRoleTitle: 'Streamer',
      avatarInitials: initials,
      streamerId,
    };

    if (existingAccIdx >= 0) {
      state.accounts[existingAccIdx] = accountRecord;
    } else {
      state.accounts.push(accountRecord);
    }

    const streamer: Streamer = {
      id: streamerId,
      userId: accountRecord.id,
      registrationId: reg.id,
      fullName: reg.fullName,
      displayName,
      avatarInitials: initials,
      phoneZalo: reg.phoneZalo,
      tiktokUsername: reg.tiktokUsername,
      workEmail: reg.workEmail,
      teamId: reg.teamId,
      projectId: reg.projectId,
      joinedWeek: 1,
      isLive: false,
      active: true,
      trackingStartedAt: nowIso,
      createdAt: nowIso,
    };
    state.streamers.push(streamer);

    reg.status = 'da_duyet';
    reg.reviewedAt = nowIso;
    reg.reviewedBy = input.reviewerId;
    reg.provisionedEmail = loginEmail;
    reg.provisionedPasswordHint = initialPassword;

    state.notifications.unshift({
      id: crypto.randomUUID(),
      recipientRole: 'streamer',
      recipientStreamerId: streamer.id,
      message: `Đăng ký ${reg.tiktokUsername} đã được duyệt — bắt đầu theo dõi phiên live.`,
      channel: 'zalo_pending',
      isRead: false,
      createdAt: nowIso,
    });

    return {
      ok: true as const,
      registration: { ...reg },
      provisionedCredentials: { loginEmail, initialPassword },
    };
  });
}

/**
 * CN-07: Gửi bằng chứng phiên live (PNG/JPG ≤ 10MB, trong hạn 24 giờ)
 */
export async function submitSessionProofRecord(input: {
  sessionId: string;
  streamerId: string;
  reportedDurationText: string;
  streamUrl?: string;
  noteForAdmin?: string;
  fileName: string;
  mimeType: string;
  fileBuffer: Buffer;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!['image/png', 'image/jpeg'].includes(input.mimeType)) {
    return { ok: false, error: 'Ảnh bằng chứng phải có định dạng PNG hoặc JPG.' };
  }
  if (input.fileBuffer.byteLength > 10 * 1024 * 1024) {
    return { ok: false, error: 'Ảnh màn hình cuối live vượt quá dung lượng tối đa 10MB.' };
  }
  if (!input.reportedDurationText.trim()) {
    return { ok: false, error: 'Vui lòng nhập Thời lượng trên ảnh cuối live (ví dụ: 0h47).' };
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const ext = input.mimeType === 'image/png' ? 'png' : 'jpg';
  const safeStorageKey = `${input.streamerId}/${input.sessionId}-${Date.now()}.${ext}`;

  if (isSupabaseConfigured()) {
    const supabase = (await createServiceRoleClient()) ?? (await createClient());
    const { data: sess } = await supabase
      .from('live_sessions')
      .select('*, streamers(display_name)')
      .eq('id', input.sessionId)
      .eq('streamer_id', input.streamerId)
      .maybeSingle();

    if (!sess || sess.data_flag !== 'thieu_du_lieu') {
      return { ok: false, error: 'Chỉ gửi bằng chứng cho phiên bị gắn cờ thiếu dữ liệu.' };
    }
    if (sess.ended_at) {
      const hoursSinceEnd =
        (now.getTime() - new Date(sess.ended_at).getTime()) / (3600 * 1000);
      if (hoursSinceEnd > 24) {
        return { ok: false, error: 'Đã quá hạn 24 giờ sau khi kết thúc live.' };
      }
    }

    const { error: upErr } = await supabase.storage
      .from('session-proofs')
      .upload(safeStorageKey, input.fileBuffer, {
        contentType: input.mimeType,
        upsert: true,
      });
    if (upErr) return { ok: false, error: upErr.message };

    await supabase.from('session_proofs').upsert({
      session_id: input.sessionId,
      streamer_id: input.streamerId,
      reported_duration_text: input.reportedDurationText.trim(),
      stream_url: input.streamUrl?.trim() || null,
      image_path: safeStorageKey,
      image_file_name: input.fileName,
      note_for_admin: input.noteForAdmin?.trim() || null,
      submitted_at: nowIso,
    });

    await supabase
      .from('live_sessions')
      .update({
        source: 'auto_with_proof',
        review_status: 'cho_duyet_tay',
      })
      .eq('id', input.sessionId);

    const dayStr = sess.started_at
      ? new Date(new Date(sess.started_at).getTime() + 7 * 3600 * 1000)
          .toISOString()
          .slice(5, 10)
          .split('-')
          .reverse()
          .join('/')
      : '';

    await supabase.from('notifications').insert({
      recipient_role: 'admin',
      message: `${sess.streamers?.display_name ?? 'Streamer'} gửi bằng chứng phiên ${dayStr}`,
      channel: 'in_app',
    });

    return { ok: true };
  }

  return withMutateLocalStore(async (state) => {
    const sess = state.liveSessions.find(
      (s) => s.id === input.sessionId && s.streamerId === input.streamerId
    );
    if (!sess || sess.dataFlag !== 'thieu_du_lieu') {
      return {
        ok: false as const,
        error: 'Chỉ gửi bằng chứng cho phiên bị gắn cờ thiếu dữ liệu.',
      };
    }
    if (sess.endedAt) {
      const hoursSinceEnd =
        (now.getTime() - new Date(sess.endedAt).getTime()) / (3600 * 1000);
      if (hoursSinceEnd > 24) {
        return {
          ok: false as const,
          error: 'Đã quá hạn 24 giờ sau khi kết thúc live.',
        };
      }
    }

    const flatFile = `${input.sessionId}-${Date.now()}.${ext}`;
    await fs.writeFile(path.join(LOCAL_UPLOADS_DIR, flatFile), input.fileBuffer);

    const existingProofIdx = state.proofs.findIndex(
      (p) => p.sessionId === input.sessionId
    );
    const proof: SessionProof = {
      id: existingProofIdx >= 0 ? state.proofs[existingProofIdx].id : crypto.randomUUID(),
      sessionId: input.sessionId,
      streamerId: input.streamerId,
      reportedDurationText: input.reportedDurationText.trim(),
      streamUrl: input.streamUrl?.trim() || null,
      imagePath: flatFile,
      imageFileName: input.fileName,
      noteForAdmin: input.noteForAdmin?.trim() || null,
      submittedAt: nowIso,
    };

    if (existingProofIdx >= 0) {
      state.proofs[existingProofIdx] = proof;
    } else {
      state.proofs.push(proof);
    }

    sess.source = 'auto_with_proof';
    sess.reviewStatus = 'cho_duyet_tay';

    const streamer = state.streamers.find((st) => st.id === input.streamerId);
    const vnStarted = new Date(new Date(sess.startedAt).getTime() + 7 * 3600 * 1000);
    const ddmm = `${String(vnStarted.getUTCDate()).padStart(2, '0')}/${String(
      vnStarted.getUTCMonth() + 1
    ).padStart(2, '0')}`;

    state.notifications.unshift({
      id: crypto.randomUUID(),
      recipientRole: 'admin',
      recipientStreamerId: null,
      message: `${streamer?.displayName ?? 'Streamer'} gửi bằng chứng phiên ${ddmm}`,
      channel: 'in_app',
      isRead: false,
      createdAt: nowIso,
    });

    return { ok: true as const };
  });
}

export async function readProofImageBuffer(
  imagePath: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const contentType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
  if (isSupabaseConfigured()) {
    const supabase = (await createServiceRoleClient()) ?? (await createClient());
    const { data, error } = await supabase.storage
      .from('session-proofs')
      .download(imagePath);
    if (error || !data) return null;
    const arr = await data.arrayBuffer();
    return { buffer: Buffer.from(arr), contentType };
  }

  const safeBase = path.basename(imagePath);
  try {
    const buf = await fs.readFile(path.join(LOCAL_UPLOADS_DIR, safeBase));
    return { buffer: buf, contentType };
  } catch {
    return null;
  }
}

/**
 * CN-08: Duyệt hoặc Từ chối phiên live (chống bấm đúp / 2 admin cùng duyệt CH-39, chặn mùa Đã khóa bảng CN-11 AC-04)
 */
export async function reviewLiveSessionRecord(input: {
  sessionId: string;
  action: 'approve' | 'reject';
  reviewerId: string;
  reviewerName: string;
  rejectReason?: string;
}): Promise<
  | { ok: true; session: LiveSession; streamerName: string }
  | { ok: false; error: string }
> {
  const nowIso = new Date().toISOString();
  const todayYmd = getTodayVietnamYmd();

  if (isSupabaseConfigured()) {
    const supabase = (await createServiceRoleClient()) ?? (await createClient());
    const { data: sess } = await supabase
      .from('live_sessions')
      .select('*, streamers(display_name), seasons(start_date, end_date, status)')
      .eq('id', input.sessionId)
      .maybeSingle();

    if (!sess) {
      return { ok: false, error: 'Không tìm thấy phiên live.' };
    }
    if (sess.review_status !== 'cho_duyet' && sess.review_status !== 'cho_duyet_tay') {
      return { ok: false, error: 'Phiên này đã được admin xử lý trước đó.' };
    }
    if (sess.seasons) {
      const seasonLocked =
        sess.seasons.status === 'da_khoa_bang' || todayYmd > sess.seasons.end_date;
      if (seasonLocked) {
        return {
          ok: false,
          error: 'Mùa giải chứa phiên này đã khóa bảng — điểm đã chốt không sửa được.',
        };
      }
    }

    const { data: settingsRow } = await supabase
      .from('system_settings')
      .select('min_session_minutes, points_per_valid_session')
      .eq('id', 1)
      .maybeSingle();

    const minMins = settingsRow?.min_session_minutes ?? 30;
    const pts = settingsRow?.points_per_valid_session ?? 1;
    const finalPoints =
      input.action === 'approve' && sess.duration_minutes >= minMins ? pts : 0;

    const { data: updated, error } = await supabase
      .from('live_sessions')
      .update({
        review_status: input.action === 'approve' ? 'da_duyet' : 'tu_choi',
        final_points: finalPoints,
        reviewed_by: input.reviewerId,
        reviewed_by_name: input.reviewerName,
        reviewed_at: nowIso,
        reject_reason:
          input.action === 'reject'
            ? input.rejectReason?.trim() || 'Không đạt yêu cầu duyệt'
            : null,
      })
      .eq('id', input.sessionId)
      .in('review_status', ['cho_duyet', 'cho_duyet_tay'])
      .select('*')
      .maybeSingle();

    if (error || !updated) {
      return { ok: false, error: 'Phiên vừa được xử lý bởi một quản trị viên khác.' };
    }

    return {
      ok: true,
      streamerName: sess.streamers?.display_name ?? 'Streamer',
      session: {
        id: updated.id,
        streamerId: updated.streamer_id,
        seasonId: updated.season_id,
        projectId: updated.project_id,
        tiktokUsername: updated.tiktok_username,
        roomId: updated.room_id,
        title: updated.title,
        streamUrl: updated.stream_url,
        startedAt: updated.started_at,
        endedAt: updated.ended_at,
        durationMinutes: updated.duration_minutes,
        currentViewers: updated.current_viewers,
        peakViewers: updated.peak_viewers,
        source: updated.source,
        dataFlag: updated.data_flag,
        dataFlagReason: updated.data_flag_reason,
        reviewStatus: updated.review_status,
        draftPoints: updated.draft_points,
        finalPoints: updated.final_points,
        reviewedBy: updated.reviewed_by,
        reviewedByName: updated.reviewed_by_name,
        reviewedAt: updated.reviewed_at,
        rejectReason: updated.reject_reason,
        createdAt: updated.created_at,
      },
    };
  }

  return withMutateLocalStore((state) => {
    const sess = state.liveSessions.find((s) => s.id === input.sessionId);
    if (!sess) {
      return { ok: false as const, error: 'Không tìm thấy phiên live.' };
    }
    if (sess.reviewStatus !== 'cho_duyet' && sess.reviewStatus !== 'cho_duyet_tay') {
      return { ok: false as const, error: 'Phiên này đã được xử lý trước đó.' };
    }

    if (sess.seasonId) {
      const season = state.seasons.find((se) => se.id === sess.seasonId);
      if (
        season &&
        (season.status === 'da_khoa_bang' || todayYmd > season.endDate)
      ) {
        return {
          ok: false as const,
          error: 'Mùa giải chứa phiên này đã khóa bảng — điểm đã chốt không sửa được.',
        };
      }
    }

    const streamer = state.streamers.find((st) => st.id === sess.streamerId);
    const minMins = state.settings.minSessionMinutes;
    const pts = state.settings.pointsPerValidSession;

    if (input.action === 'approve') {
      sess.reviewStatus = 'da_duyet';
      sess.finalPoints = sess.durationMinutes >= minMins ? pts : 0;
      sess.rejectReason = null;
    } else {
      sess.reviewStatus = 'tu_choi';
      sess.finalPoints = 0;
      sess.rejectReason =
        input.rejectReason?.trim() || 'Từ chối bởi quản trị viên';
    }
    sess.reviewedBy = input.reviewerId;
    sess.reviewedByName = input.reviewerName;
    sess.reviewedAt = nowIso;

    return {
      ok: true as const,
      session: { ...sess },
      streamerName: streamer?.displayName ?? 'Streamer',
    };
  });
}

/**
 * CN-10: Nhắc live streamer chưa có phiên trong tuần
 */
export async function sendLiveReminderRecord(
  streamerId: string
): Promise<{ ok: true; streamerName: string } | { ok: false; error: string }> {
  const nowIso = new Date().toISOString();
  if (isSupabaseConfigured()) {
    const supabase = (await createServiceRoleClient()) ?? (await createClient());
    const { data: st } = await supabase
      .from('streamers')
      .select('id, display_name')
      .eq('id', streamerId)
      .maybeSingle();
    if (!st) return { ok: false, error: 'Không tìm thấy streamer.' };

    await supabase.from('notifications').insert({
      recipient_role: 'streamer',
      recipient_streamer_id: st.id,
      message: `Nhắc lịch livestream tuần này cho ${st.display_name}.`,
      channel: 'in_app',
    });
    return { ok: true, streamerName: st.display_name };
  }

  return withMutateLocalStore((state) => {
    const st = state.streamers.find((s) => s.id === streamerId);
    if (!st) return { ok: false as const, error: 'Không tìm thấy streamer.' };
    state.notifications.unshift({
      id: crypto.randomUUID(),
      recipientRole: 'streamer',
      recipientStreamerId: st.id,
      message: `Admin vừa gửi lời nhắc lên live tuần này cho ${st.displayName}.`,
      channel: 'in_app',
      isRead: false,
      createdAt: nowIso,
    });
    return { ok: true as const, streamerName: st.displayName };
  });
}

/**
 * Đánh dấu đã đọc thông báo chuông đầu trang
 */
export async function markNotificationsRead(role: UserRole, streamerId?: string) {
  if (isSupabaseConfigured()) {
    const supabase = (await createServiceRoleClient()) ?? (await createClient());
    if (role === 'streamer' && streamerId) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_streamer_id', streamerId);
    } else {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_role', role);
    }
    return;
  }

  await withMutateLocalStore((state) => {
    for (const n of state.notifications) {
      if (role === 'streamer' && streamerId) {
        if (n.recipientStreamerId === streamerId) n.isRead = true;
      } else if (n.recipientRole === role) {
        n.isRead = true;
      }
    }
  });
}

/**
 * CN-13: Ghi lịch sử xuất báo cáo
 */
export async function recordReportExport(input: {
  reportName: string;
  reportType: ReportExportRecord['reportType'];
  periodLabel: string;
  exportedBy: string | null;
  exportedByName: string;
  queryParams?: Record<string, string>;
}): Promise<ReportExportRecord> {
  const nowIso = new Date().toISOString();
  if (isSupabaseConfigured()) {
    const supabase = (await createServiceRoleClient()) ?? (await createClient());
    const { data } = await supabase
      .from('report_exports')
      .insert({
        report_name: input.reportName,
        report_type: input.reportType,
        period_label: input.periodLabel,
        exported_by: input.exportedBy,
        exported_by_name: input.exportedByName,
        exported_at: nowIso,
        query_params: input.queryParams ?? {},
      })
      .select('*')
      .single();

    return {
      id: data?.id ?? crypto.randomUUID(),
      reportName: input.reportName,
      reportType: input.reportType,
      periodLabel: input.periodLabel,
      exportedBy: input.exportedBy,
      exportedByName: input.exportedByName,
      exportedAt: nowIso,
      queryParams: input.queryParams ?? {},
    };
  }

  return withMutateLocalStore((state) => {
    const rec: ReportExportRecord = {
      id: crypto.randomUUID(),
      reportName: input.reportName,
      reportType: input.reportType,
      periodLabel: input.periodLabel,
      exportedBy: input.exportedBy,
      exportedByName: input.exportedByName,
      exportedAt: nowIso,
      queryParams: input.queryParams ?? {},
    };
    state.reportExports.unshift(rec);
    return rec;
  });
}

/**
 * Đồng bộ trạng thái phòng live từ dịch vụ đọc live bên thứ ba (CN-02 & CN-12)
 * Xử lý:
 * - Chỉ tính phiên từ sau thời điểm streamer được duyệt (`trackingStartedAt`, QT-02 CN-06)
 * - Gộp phiên rớt mạng live lại ≤ 5 phút (`CH-36`)
 * - Ghi snapshot mỗi 30s khi đang live
 * - Phiên kết thúc < 30 phút tự chuyển `Từ chối · < 30 phút` (`CH-04`)
 */
export interface ExternalRoomSnapshot {
  tiktokUsername: string;
  isLive: boolean;
  roomId?: string;
  title?: string;
  currentViewers?: number;
  hasDataGap?: boolean;
  dataGapReason?: string;
  forcedDurationMinutes?: number; // phục vụ kiểm thử end-to-end
}

export async function applyLiveRoomsSync(
  snapshotsInput: ExternalRoomSnapshot[],
  now: Date = new Date()
): Promise<{ opened: number; updated: number; closed: number }> {
  const nowIso = now.toISOString();

  if (isSupabaseConfigured()) {
    const supabase = (await createServiceRoleClient()) ?? (await createClient());
    const data = await getAllAppData();
    if (!data.settings.autoOpenCloseSession) {
      await supabase
        .from('system_settings')
        .update({
          last_polled_at: nowIso,
          requests_used_today:
            data.settings.requestsUsedToday + snapshotsInput.length,
        })
        .eq('id', 1);
      return { opened: 0, updated: 0, closed: 0 };
    }

    const activeSeason = getActiveSeason(data.seasons);
    let opened = 0;
    let updated = 0;
    let closed = 0;

    for (const room of snapshotsInput) {
      const normHandle = normalizeTiktokUsername(room.tiktokUsername);
      const streamer = data.streamers.find(
        (s) => s.active && s.tiktokUsername === normHandle
      );
      if (!streamer) continue;
      if (now.getTime() < new Date(streamer.trackingStartedAt).getTime()) continue;

      const openSess = data.liveSessions.find(
        (ls) => ls.streamerId === streamer.id && ls.reviewStatus === 'dang_live'
      );

      if (room.isLive) {
        const viewers = Math.max(0, room.currentViewers ?? 0);
        if (openSess) {
          const mins =
            room.forcedDurationMinutes ??
            Math.max(
              1,
              Math.round(
                (now.getTime() - new Date(openSess.startedAt).getTime()) / 60000
              )
            );
          const peak = Math.max(openSess.peakViewers, viewers);
          await supabase
            .from('live_sessions')
            .update({
              current_viewers: viewers,
              peak_viewers: peak,
              duration_minutes: mins,
              title: room.title || openSess.title,
            })
            .eq('id', openSess.id);
          await supabase.from('session_snapshots').insert({
            session_id: openSess.id,
            viewers,
            captured_at: nowIso,
          });
          updated++;
        } else {
          // Kiểm tra gộp phiên rớt mạng ≤ 5 phút (CH-36)
          const recentClosed = data.liveSessions.find(
            (ls) =>
              ls.streamerId === streamer.id &&
              ls.reviewStatus !== 'dang_live' &&
              shouldMergeReconnectedSession(ls, now, 5)
          );
          if (recentClosed) {
            const mins = Math.max(
              1,
              Math.round(
                (now.getTime() - new Date(recentClosed.startedAt).getTime()) /
                  60000
              )
            );
            await supabase
              .from('live_sessions')
              .update({
                ended_at: null,
                review_status: 'dang_live',
                current_viewers: viewers,
                peak_viewers: Math.max(recentClosed.peakViewers, viewers),
                duration_minutes: mins,
                reject_reason: null,
              })
              .eq('id', recentClosed.id);
            await supabase
              .from('streamers')
              .update({ is_live: true })
              .eq('id', streamer.id);
            updated++;
          } else {
            const { data: created } = await supabase
              .from('live_sessions')
              .insert({
                streamer_id: streamer.id,
                season_id: activeSeason?.id ?? null,
                project_id: streamer.projectId, // CH-48: lấy theo Dự án phụ trách của streamer
                tiktok_username: streamer.tiktokUsername,
                room_id: room.roomId ?? `room-${Date.now()}`,
                title: room.title || 'Giới thiệu dự án Picity',
                stream_url: `https://www.tiktok.com/${streamer.tiktokUsername}/live`,
                started_at: nowIso,
                duration_minutes: room.forcedDurationMinutes ?? 1,
                current_viewers: viewers,
                peak_viewers: viewers,
                review_status: 'dang_live',
              })
              .select('id')
              .single();
            if (created) {
              await supabase.from('session_snapshots').insert({
                session_id: created.id,
                viewers,
                captured_at: nowIso,
              });
            }
            await supabase
              .from('streamers')
              .update({ is_live: true })
              .eq('id', streamer.id);
            opened++;
          }
        }
      } else if (openSess) {
        const totalMins =
          room.forcedDurationMinutes ??
          Math.max(
            openSess.durationMinutes,
            Math.round(
              (now.getTime() - new Date(openSess.startedAt).getTime()) / 60000
            )
          );
        const evalRes = evaluateEndedSession({
          durationMinutes: totalMins,
          hasDataGap: Boolean(room.hasDataGap),
          dataGapReason: room.dataGapReason ?? null,
          minSessionMinutes: data.settings.minSessionMinutes,
          pointsPerValidSession: data.settings.pointsPerValidSession,
          autoDraftPoints: data.settings.autoDraftPoints,
          autoApproveValidSessions: data.settings.autoApproveValidSessions,
        });

        await supabase
          .from('live_sessions')
          .update({
            ended_at: nowIso,
            duration_minutes: totalMins,
            current_viewers: 0,
            data_flag: evalRes.dataFlag,
            data_flag_reason: evalRes.dataFlagReason,
            review_status: evalRes.reviewStatus,
            draft_points: evalRes.draftPoints,
            final_points: evalRes.finalPoints,
            reject_reason: evalRes.rejectReason,
            reviewed_at:
              evalRes.reviewStatus === 'da_duyet' ? nowIso : null,
            reviewed_by_name:
              evalRes.reviewStatus === 'da_duyet' ? 'Hệ thống tự duyệt' : null,
          })
          .eq('id', openSess.id);

        await supabase
          .from('streamers')
          .update({ is_live: false })
          .eq('id', streamer.id);
        closed++;
      }
    }

    await supabase
      .from('system_settings')
      .update({
        last_polled_at: nowIso,
        requests_used_today: Math.min(
          data.settings.dailyRequestLimit,
          data.settings.requestsUsedToday + Math.max(1, snapshotsInput.length)
        ),
      })
      .eq('id', 1);

    return { opened, updated, closed };
  }

  return withMutateLocalStore((state) => {
    state.settings.lastPolledAt = nowIso;
    state.settings.requestsUsedToday = Math.min(
      state.settings.dailyRequestLimit,
      state.settings.requestsUsedToday + Math.max(1, snapshotsInput.length)
    );

    if (!state.settings.autoOpenCloseSession) {
      return { opened: 0, updated: 0, closed: 0 };
    }

    const activeSeason = getActiveSeason(state.seasons);
    let opened = 0;
    let updated = 0;
    let closed = 0;

    for (const room of snapshotsInput) {
      const normHandle = normalizeTiktokUsername(room.tiktokUsername);
      const streamer = state.streamers.find(
        (s) => s.active && s.tiktokUsername === normHandle
      );
      if (!streamer) continue;
      if (now.getTime() < new Date(streamer.trackingStartedAt).getTime()) continue;

      const openSess = state.liveSessions.find(
        (ls) => ls.streamerId === streamer.id && ls.reviewStatus === 'dang_live'
      );

      if (room.isLive) {
        const viewers = Math.max(0, room.currentViewers ?? 0);
        streamer.isLive = true;

        if (openSess) {
          openSess.currentViewers = viewers;
          openSess.peakViewers = Math.max(openSess.peakViewers, viewers);
          if (room.title) openSess.title = room.title;
          openSess.durationMinutes =
            room.forcedDurationMinutes ??
            Math.max(
              openSess.durationMinutes,
              Math.max(
                1,
                Math.round(
                  (now.getTime() - new Date(openSess.startedAt).getTime()) /
                    60000
                )
              )
            );
          state.snapshots.push({
            id: crypto.randomUUID(),
            sessionId: openSess.id,
            viewers,
            capturedAt: nowIso,
          });
          updated++;
        } else {
          const recentClosed = state.liveSessions.find(
            (ls) =>
              ls.streamerId === streamer.id &&
              ls.reviewStatus !== 'dang_live' &&
              shouldMergeReconnectedSession(ls, now, 5)
          );

          if (recentClosed) {
            recentClosed.endedAt = null;
            recentClosed.reviewStatus = 'dang_live';
            recentClosed.currentViewers = viewers;
            recentClosed.peakViewers = Math.max(
              recentClosed.peakViewers,
              viewers
            );
            recentClosed.rejectReason = null;
            recentClosed.durationMinutes =
              room.forcedDurationMinutes ??
              Math.max(
                1,
                Math.round(
                  (now.getTime() - new Date(recentClosed.startedAt).getTime()) /
                    60000
                )
              );
            state.snapshots.push({
              id: crypto.randomUUID(),
              sessionId: recentClosed.id,
              viewers,
              capturedAt: nowIso,
            });
            updated++;
          } else {
            const newId = crypto.randomUUID();
            const newSess: LiveSession = {
              id: newId,
              streamerId: streamer.id,
              seasonId: activeSeason?.id ?? null,
              projectId: streamer.projectId,
              tiktokUsername: streamer.tiktokUsername,
              roomId: room.roomId ?? `room-${Date.now()}`,
              title: room.title || 'Giới thiệu dự án Picity',
              streamUrl: `https://www.tiktok.com/${streamer.tiktokUsername}/live`,
              startedAt: nowIso,
              endedAt: null,
              durationMinutes: room.forcedDurationMinutes ?? 1,
              currentViewers: viewers,
              peakViewers: viewers,
              source: 'auto_api',
              dataFlag: 'du_dieu_kien',
              dataFlagReason: null,
              reviewStatus: 'dang_live',
              draftPoints: 0,
              finalPoints: 0,
              reviewedBy: null,
              reviewedByName: null,
              reviewedAt: null,
              rejectReason: null,
              createdAt: nowIso,
            };
            state.liveSessions.unshift(newSess);
            state.snapshots.push({
              id: crypto.randomUUID(),
              sessionId: newId,
              viewers,
              capturedAt: nowIso,
            });
            opened++;
          }
        }
      } else if (openSess) {
        streamer.isLive = false;
        const totalMins =
          room.forcedDurationMinutes ??
          Math.max(
            openSess.durationMinutes,
            Math.max(
              1,
              Math.round(
                (now.getTime() - new Date(openSess.startedAt).getTime()) / 60000
              )
            )
          );

        const evalRes = evaluateEndedSession({
          durationMinutes: totalMins,
          hasDataGap: Boolean(room.hasDataGap),
          dataGapReason: room.dataGapReason ?? null,
          minSessionMinutes: state.settings.minSessionMinutes,
          pointsPerValidSession: state.settings.pointsPerValidSession,
          autoDraftPoints: state.settings.autoDraftPoints,
          autoApproveValidSessions: state.settings.autoApproveValidSessions,
        });

        openSess.endedAt = nowIso;
        openSess.durationMinutes = totalMins;
        openSess.currentViewers = 0;
        openSess.dataFlag = evalRes.dataFlag;
        openSess.dataFlagReason = evalRes.dataFlagReason;
        openSess.reviewStatus = evalRes.reviewStatus;
        openSess.draftPoints = evalRes.draftPoints;
        openSess.finalPoints = evalRes.finalPoints;
        openSess.rejectReason = evalRes.rejectReason;

        if (evalRes.reviewStatus === 'da_duyet') {
          openSess.reviewedAt = nowIso;
          openSess.reviewedByName = 'Hệ thống tự duyệt';
        }
        closed++;
      }
    }

    return { opened, updated, closed };
  });
}
