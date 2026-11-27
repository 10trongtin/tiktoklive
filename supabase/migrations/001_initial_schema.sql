-- PICITY LÊN LIVE — Initial PostgreSQL Schema & RLS for Supabase
-- Timezone convention: Asia/Ho_Chi_Minh (UTC+7)

create extension if not exists "pgcrypto";

-- 1. Teams (Danh mục Team chuẩn theo 00-thuat-ngu.md & 03-du-lieu.md)
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  short_name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- 2. Projects (Danh mục Dự án chuẩn theo 00-thuat-ngu.md & 03-du-lieu.md)
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  short_name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- 3. User Profiles & Roles (05-phan-quyen.md: admin | streamer | executive)
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  phone text,
  full_name text not null,
  role text not null check (role in ('admin', 'streamer', 'executive')),
  role_title text not null default 'Streamer',
  avatar_initials text not null default 'PC',
  created_at timestamptz not null default now()
);

-- 4. Seasons (CN-11 Mùa giải)
create table if not exists public.seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date not null,
  end_date date not null,
  status text not null default 'dang_dien_ra' check (status in ('sap_dien_ra', 'dang_dien_ra', 'da_khoa_bang')),
  rule_label text not null default 'Luật: ≥ 30 phút = 1 điểm',
  created_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now(),
  constraint seasons_date_check check (end_date >= start_date)
);

-- 5. System Settings (CN-12 Luật điểm & kết nối API)
create table if not exists public.system_settings (
  id int primary key default 1 check (id = 1),
  min_session_minutes int not null default 30,
  points_per_valid_session int not null default 1,
  tie_breaker text not null default 'Tổng giờ live cao hơn',
  max_scored_sessions_per_day text not null default 'Không giới hạn',
  gift_diamond_rule text not null default 'Không tính điểm',
  missing_data_rule text not null default 'Duyệt tay bằng bằng chứng',
  weekly_kpi_minutes int not null default 240,
  weekly_target_sessions int not null default 4,
  provider_name text not null default 'TikTok Live Connector',
  provider_plan text not null default 'Gói Basic · 10.000 request/ngày · tối đa 20 phòng live cùng lúc',
  daily_request_limit int not null default 10000,
  max_concurrent_rooms int not null default 20,
  check_interval_offline_sec int not null default 300,
  check_interval_live_sec int not null default 30,
  requests_used_today int not null default 0,
  last_api_error_note text,
  connection_status text not null default 'connected' check (connection_status in ('connected', 'disconnected', 'rate_limited')),
  last_polled_at timestamptz not null default now(),
  auto_open_close_session boolean not null default true,
  auto_draft_points boolean not null default true,
  auto_approve_valid_sessions boolean not null default false,
  updated_at timestamptz not null default now()
);

-- 6. Registrations (CN-06 Đăng ký tham gia & CN-09 Duyệt đăng ký)
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone_zalo text not null,
  tiktok_username text not null,
  work_email text,
  team_id uuid not null references public.teams(id),
  project_id uuid not null references public.projects(id),
  committed boolean not null default true,
  status text not null default 'cho_duyet' check (status in ('cho_duyet', 'da_duyet', 'tu_choi')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.user_profiles(id),
  reject_reason text,
  provisioned_email text
);

-- 7. Streamers (03-du-lieu.md mục 1 & CN-10 Quản lý streamer)
create table if not exists public.streamers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.user_profiles(id) on delete set null,
  registration_id uuid references public.registrations(id) on delete set null,
  full_name text not null,
  display_name text not null,
  avatar_initials text not null,
  phone_zalo text not null,
  tiktok_username text not null unique,
  work_email text,
  team_id uuid not null references public.teams(id),
  project_id uuid not null references public.projects(id),
  joined_week int not null default 1,
  is_live boolean not null default false,
  active boolean not null default true,
  tracking_started_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- 8. Live Sessions (03-du-lieu.md mục 5 — Đối tượng trọng tâm)
create table if not exists public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  streamer_id uuid not null references public.streamers(id) on delete cascade,
  season_id uuid references public.seasons(id) on delete set null,
  project_id uuid not null references public.projects(id),
  tiktok_username text not null,
  room_id text,
  title text not null default 'Phiên livestream TikTok',
  stream_url text,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_minutes int not null default 0,
  current_viewers int not null default 0,
  peak_viewers int not null default 0,
  source text not null default 'auto_api' check (source in ('auto_api', 'auto_with_proof')),
  data_flag text not null default 'du_dieu_kien' check (data_flag in ('du_dieu_kien', 'duoi_30_phut', 'thieu_du_lieu')),
  data_flag_reason text,
  review_status text not null default 'dang_live' check (review_status in ('dang_live', 'cho_duyet', 'cho_duyet_tay', 'da_duyet', 'tu_choi')),
  draft_points int not null default 0,
  final_points int not null default 0,
  reviewed_by uuid references public.user_profiles(id),
  reviewed_by_name text,
  reviewed_at timestamptz,
  reject_reason text,
  created_at timestamptz not null default now()
);

create index if not exists idx_live_sessions_streamer_started on public.live_sessions(streamer_id, started_at desc);
create index if not exists idx_live_sessions_review_status on public.live_sessions(review_status);

-- 9. Session Viewer Snapshots (mỗi 30 giây từ API — CN-04 biểu đồ đường)
create table if not exists public.session_snapshots (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.live_sessions(id) on delete cascade,
  viewers int not null default 0,
  captured_at timestamptz not null default now()
);

create index if not exists idx_snapshots_session_captured on public.session_snapshots(session_id, captured_at asc);

-- 10. Session Proofs (CN-07 Gửi bằng chứng phiên live)
create table if not exists public.session_proofs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.live_sessions(id) on delete cascade,
  streamer_id uuid not null references public.streamers(id) on delete cascade,
  reported_duration_text text not null,
  stream_url text,
  image_path text not null,
  image_file_name text not null,
  note_for_admin text,
  submitted_at timestamptz not null default now()
);

-- 11. Report Exports History (CN-13 Báo cáo)
create table if not exists public.report_exports (
  id uuid primary key default gen_random_uuid(),
  report_name text not null,
  report_type text not null check (report_type in ('weekly', 'streamer_detail', 'monthly_closing', 'ranking_csv')),
  period_label text not null,
  exported_by uuid references public.user_profiles(id),
  exported_by_name text not null,
  exported_at timestamptz not null default now(),
  query_params jsonb not null default '{}'::jsonb
);

-- 12. Notifications (03-du-lieu.md mục 12 — Chuông thông báo & Zalo log)
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_role text check (recipient_role in ('admin', 'streamer', 'executive')),
  recipient_streamer_id uuid references public.streamers(id) on delete cascade,
  message text not null,
  channel text not null default 'in_app' check (channel in ('in_app', 'zalo_pending')),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Seed Danh mục chuẩn (KHÔNG cài cứng dữ liệu streamer/phiên mẫu — Luật số 9 AGENTS.md)
insert into public.teams (name, short_name, sort_order) values
  ('Team Picity 1', 'Picity 1', 1),
  ('Team Picity 2', 'Picity 2', 2),
  ('Team Picity 3', 'Picity 3', 3)
on conflict (name) do nothing;

insert into public.projects (name, short_name, sort_order) values
  ('Picity Central Park', 'Central Park', 1),
  ('Picity SkyZen', 'SkyZen', 2),
  ('Picity High Park', 'High Park', 3)
on conflict (name) do nothing;

insert into public.system_settings (id) values (1)
on conflict (id) do nothing;

-- Storage bucket cho ảnh bằng chứng PNG/JPG ≤ 10MB
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'session-proofs',
  'session-proofs',
  false,
  10485760,
  array['image/png', 'image/jpeg']
)
on conflict (id) do nothing;

-- Row Level Security
alter table public.teams enable row level security;
alter table public.projects enable row level security;
alter table public.user_profiles enable row level security;
alter table public.seasons enable row level security;
alter table public.system_settings enable row level security;
alter table public.registrations enable row level security;
alter table public.streamers enable row level security;
alter table public.live_sessions enable row level security;
alter table public.session_snapshots enable row level security;
alter table public.session_proofs enable row level security;
alter table public.report_exports enable row level security;
alter table public.notifications enable row level security;

-- Public read cho cổng công khai minh bạch cuộc thi (CN-01, CN-02, CN-04, CN-06)
-- Lưu ý: bảng streamers chỉ đọc qua Server Components (service role) để không lộ phone_zalo / work_email ra client
create policy "Public read teams" on public.teams for select using (true);
create policy "Public read projects" on public.projects for select using (true);
create policy "Public read seasons" on public.seasons for select using (true);
create policy "Public read settings" on public.system_settings for select using (true);
create policy "Public read sessions" on public.live_sessions for select using (true);
create policy "Public read snapshots" on public.session_snapshots for select using (true);
create policy "Public insert registrations" on public.registrations for insert with check (committed = true);

-- Authenticated read policies theo vai trò
create policy "Authenticated read profiles" on public.user_profiles for select to authenticated using (true);
create policy "Authenticated read streamers" on public.streamers for select to authenticated using (true);
