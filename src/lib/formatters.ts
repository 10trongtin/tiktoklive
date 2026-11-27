const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

/**
 * Chuyển một mốc thời gian sang Date tính theo giờ Việt Nam (UTC+7)
 * để đọc getUTCFullYear / getUTCMonth / getUTCDate / getUTCHours chính xác ở mọi máy chủ.
 */
export function toVietnamShiftedDate(input: string | Date): Date {
  const d = typeof input === 'string' ? new Date(input) : input;
  return new Date(d.getTime() + VN_OFFSET_MS);
}

function pad2(n: number): string {
  return String(Math.max(0, Math.floor(n))).padStart(2, '0');
}

/**
 * Định dạng thời lượng chuẩn theo 00-thuat-ngu.md & 02-quy-uoc-ky-thuat.md:
 * `<giờ>h<phút 2 chữ số>`, 0 phút -> `0h00` (ví dụ: 3h43, 0h24, 28h40, 212h45)
 */
export function formatDuration(totalMinutes: number): string {
  const safe = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;
  return `${hours}h${pad2(mins)}`;
}

/**
 * Định dạng thời lượng ngắn cho thẻ đang live: `<số> phút` (ví dụ: `42 phút`)
 */
export function formatLiveMinutes(totalMinutes: number): string {
  const safe = Math.max(1, Math.round(totalMinutes));
  return `${safe} phút`;
}

/**
 * Parse chuỗi thời lượng người dùng nhập ("0h47", "1h05", "47") ra số phút.
 */
export function parseDurationTextToMinutes(text: string): number | null {
  const trimmed = text.trim().toLowerCase();
  const hmMatch = trimmed.match(/^(\d+)\s*h\s*(\d{1,2})$/);
  if (hmMatch) {
    const h = Number(hmMatch[1]);
    const m = Number(hmMatch[2]);
    if (m >= 60) return null;
    return h * 60 + m;
  }
  const mOnly = trimmed.match(/^(\d+)\s*(phút|p|m)?$/);
  if (mOnly) {
    return Number(mOnly[1]);
  }
  return null;
}

/**
 * Ngày ngắn `dd/mm` (ví dụ: `18/11`)
 */
export function formatDayMonth(input: string | Date): string {
  const vn = toVietnamShiftedDate(input);
  return `${pad2(vn.getUTCDate())}/${pad2(vn.getUTCMonth() + 1)}`;
}

/**
 * Giờ phút `HH:mm` (ví dụ: `19:15`)
 */
export function formatHourMinute(input: string | Date): string {
  const vn = toVietnamShiftedDate(input);
  return `${pad2(vn.getUTCHours())}:${pad2(vn.getUTCMinutes())}`;
}

/**
 * Ngày giờ ngắn `dd/mm · HH:mm` (ví dụ: `18/11 · 19:02`)
 */
export function formatShortDateTime(input: string | Date): string {
  return `${formatDayMonth(input)} · ${formatHourMinute(input)}`;
}

/**
 * Ngày giờ phiên `dd/mm · HH:mm – HH:mm` (ví dụ: `19/11 · 19:15 – 21:03`)
 */
export function formatSessionTimeRange(
  startedAt: string | Date,
  endedAt?: string | Date | null
): string {
  const day = formatDayMonth(startedAt);
  const startHm = formatHourMinute(startedAt);
  if (!endedAt) {
    return `${day} · ${startHm} – đang live`;
  }
  const endHm = formatHourMinute(endedAt);
  return `${day} · ${startHm} – ${endHm}`;
}

/**
 * Ngày tương đối cho bảng Duyệt đăng ký & Lịch sử báo cáo:
 * `Hôm nay 09:12` / `Hôm qua 17:20` / `Thứ 2 · 08:05` / `18/11 · 19:02`
 */
export function formatRelativeDateTime(
  input: string | Date,
  now: Date = new Date(),
  useWeekdayForSameWeek = false
): string {
  const vnTarget = toVietnamShiftedDate(input);
  const vnNow = toVietnamShiftedDate(now);

  const targetDayKey = Date.UTC(
    vnTarget.getUTCFullYear(),
    vnTarget.getUTCMonth(),
    vnTarget.getUTCDate()
  );
  const nowDayKey = Date.UTC(
    vnNow.getUTCFullYear(),
    vnNow.getUTCMonth(),
    vnNow.getUTCDate()
  );
  const diffDays = Math.round((nowDayKey - targetDayKey) / (24 * 60 * 60 * 1000));
  const hm = formatHourMinute(input);

  if (diffDays === 0) return `Hôm nay ${hm}`;
  if (diffDays === 1) return `Hôm qua ${hm}`;

  if (useWeekdayForSameWeek && diffDays >= 0 && diffDays < 7) {
    const dayOfWeek = vnTarget.getUTCDay(); // 0 = CN, 1 = Thứ 2...
    const label = dayOfWeek === 0 ? 'Chủ nhật' : `Thứ ${dayOfWeek + 1}`;
    return `${label} · ${hm}`;
  }

  return formatShortDateTime(input);
}

/**
 * Lấy khoảng tuần (Thứ 2 00:00:00 -> Chủ nhật 23:59:59.999) theo giờ Việt Nam (UTC+7)
 */
export function getVietnamWeekBounds(reference: Date = new Date()): {
  startUtc: Date;
  endUtc: Date;
  label: string;
  shortSlug: string;
} {
  const vn = toVietnamShiftedDate(reference);
  const dow = vn.getUTCDay(); // 0=Sun, 1=Mon...
  const diffToMonday = dow === 0 ? -6 : 1 - dow;

  const mondayShifted = new Date(
    Date.UTC(
      vn.getUTCFullYear(),
      vn.getUTCMonth(),
      vn.getUTCDate() + diffToMonday,
      0,
      0,
      0,
      0
    )
  );
  const sundayShifted = new Date(
    Date.UTC(
      mondayShifted.getUTCFullYear(),
      mondayShifted.getUTCMonth(),
      mondayShifted.getUTCDate() + 6,
      23,
      59,
      59,
      999
    )
  );

  const startUtc = new Date(mondayShifted.getTime() - VN_OFFSET_MS);
  const endUtc = new Date(sundayShifted.getTime() - VN_OFFSET_MS);
  const startLabel = `${pad2(mondayShifted.getUTCDate())}/${pad2(mondayShifted.getUTCMonth() + 1)}`;
  const endLabel = `${pad2(sundayShifted.getUTCDate())}/${pad2(sundayShifted.getUTCMonth() + 1)}`;

  return {
    startUtc,
    endUtc,
    label: `Tuần ${startLabel} – ${endLabel}`,
    shortSlug: `${pad2(mondayShifted.getUTCDate())}-${pad2(mondayShifted.getUTCMonth() + 1)}`,
  };
}

/**
 * Lấy khoảng tháng (ngày 01 -> cuối tháng) theo giờ Việt Nam (UTC+7)
 */
export function getVietnamMonthBounds(reference: Date = new Date()): {
  startUtc: Date;
  endUtc: Date;
  label: string;
  rangeShort: string;
} {
  const vn = toVietnamShiftedDate(reference);
  const year = vn.getUTCFullYear();
  const month = vn.getUTCMonth();

  const firstShifted = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  const lastShifted = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

  return {
    startUtc: new Date(firstShifted.getTime() - VN_OFFSET_MS),
    endUtc: new Date(lastShifted.getTime() - VN_OFFSET_MS),
    label: `Tháng ${pad2(month + 1)}/${year}`,
    rangeShort: `01/${pad2(month + 1)} – ${pad2(lastShifted.getUTCDate())}/${pad2(month + 1)}`,
  };
}

/**
 * Ngăn cách hàng nghìn bằng dấu chấm (`4.812`)
 */
export function formatThousands(value: number): string {
  const rounded = Math.round(value);
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Peak view: bằng 0 hiện "—" (CN-01 AC-07)
 */
export function formatPeakView(peak: number): string {
  if (!peak || peak <= 0) return '—';
  return formatThousands(peak);
}

/**
 * Che giữa số điện thoại ở bảng Duyệt đăng ký: `0932 ••• 118`
 */
export function maskPhoneMiddle(phone: string): string {
  const digits = phone.replace(/\s+/g, '');
  if (digits.length < 7) return digits;
  const prefix = digits.slice(0, 4);
  const suffix = digits.slice(-3);
  return `${prefix} ••• ${suffix}`;
}

/**
 * Thời gian cập nhật trên màn Đang Live: "vừa xong" (< 30s) hoặc "cách đây <số> giây"
 */
export function formatLiveUpdatedAgo(secondsAgo: number): string {
  const s = Math.max(0, Math.floor(secondsAgo));
  if (s < 30) return 'vừa xong';
  return `cách đây ${s} giây`;
}

/**
 * Thời gian cập nhật trên thanh bên / Bảng xếp hạng: "cập nhật <số> giây trước"
 */
export function formatSecondsAgoText(secondsAgo: number, capitalize = false): string {
  const s = Math.max(1, Math.floor(secondsAgo));
  const prefix = capitalize ? 'Cập nhật' : 'cập nhật';
  return `${prefix} ${s} giây trước`;
}

/**
 * Chuẩn hóa @username TikTok từ chuỗi nhập hoặc link hồ sơ/live TikTok (CH-52)
 */
export function normalizeTiktokUsername(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Nếu dán URL TikTok: https://www.tiktok.com/@minhdupicity/live?...
  const urlMatch = trimmed.match(/tiktok\.com\/@([a-zA-Z0-9._]+)/i);
  const handle = urlMatch ? urlMatch[1] : trimmed.replace(/^@+/, '');

  if (!/^[a-zA-Z0-9._]{2,32}$/.test(handle)) {
    return null;
  }
  return `@${handle.toLowerCase()}`;
}

/**
 * Sinh tên viết tắt 2 ký tự cho ảnh đại diện ("Nguyễn Minh Dự" -> "MD", "Thanh Anh" -> "TA")
 */
export function makeAvatarInitials(fullName: string): string {
  const clean = fullName.replace(/\bpicity\b/gi, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'PC';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const secondLast = parts[parts.length - 2][0] ?? '';
  const last = parts[parts.length - 1][0] ?? '';
  return `${secondLast}${last}`.toUpperCase();
}

/**
 * Sinh Tên hiển thị chuẩn ("Minh Dự" -> "Minh Dự Picity")
 */
export function makeStreamerDisplayName(fullName: string): string {
  const trimmed = fullName.trim().replace(/\s+/g, ' ');
  if (/picity$/i.test(trimmed)) return trimmed;
  const words = trimmed.split(' ');
  const shortTwoWords = words.length > 2 ? words.slice(-2).join(' ') : trimmed;
  return `${shortTwoWords} Picity`;
}

/**
 * Tên gọi ngắn cho câu "Xin chào, <tên>" ở Dashboard của tôi
 */
export function makeShortGreetingName(fullName: string): string {
  const clean = fullName.replace(/\bpicity\b/gi, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length <= 2) return clean;
  return words.slice(-2).join(' ');
}
