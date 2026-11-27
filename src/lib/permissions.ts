import { UserRole } from '@/types/domain';

export type MenuGroup = 'Tổng quan' | 'Streamer' | 'Quản trị';

export interface NavItemConfig {
  code: string;
  href: string;
  sidebarLabel: string; // Chữ chuẩn trên menu thanh bên (00-thuat-ngu.md mục 3)
  pageTitle: string; // Tiêu đề H1 chuẩn
  mobileBottomLabel?: string; // Menu dưới điện thoại ≤ 820px
  group: MenuGroup;
  allowedRoles: UserRole[];
  isPublic?: boolean;
  badgeType?: 'live' | 'pending_sessions' | 'pending_registrations';
}

/**
 * Danh sách 13 màn chuẩn từ 00-thuat-ngu.md mục 3 & phân quyền đã chốt 05-phan-quyen.md
 * Nguyên tắc chung: không có quyền xem thì ẩn menu, không hiện nút mờ.
 */
export const NAV_ITEMS: NavItemConfig[] = [
  {
    code: 'CN-01',
    href: '/',
    sidebarLabel: 'Bảng xếp hạng',
    pageTitle: 'Bảng xếp hạng',
    mobileBottomLabel: 'Xếp hạng',
    group: 'Tổng quan',
    allowedRoles: ['admin', 'streamer', 'executive'],
  },
  {
    code: 'CN-02',
    href: '/dang-live',
    sidebarLabel: 'Đang Live',
    pageTitle: 'Đang Live',
    mobileBottomLabel: 'Đang Live',
    group: 'Tổng quan',
    allowedRoles: ['admin', 'streamer', 'executive'],
    badgeType: 'live',
  },
  {
    code: 'CN-03',
    href: '/tong-quan-dieu-hanh',
    sidebarLabel: 'Tổng quan điều hành',
    pageTitle: 'Tổng quan điều hành',
    mobileBottomLabel: 'Tổng quan',
    group: 'Tổng quan',
    allowedRoles: ['admin', 'executive'],
  },
  {
    code: 'CN-04',
    href: '/chi-tiet-streamer',
    sidebarLabel: 'Chi tiết streamer',
    pageTitle: 'Chi tiết streamer',
    group: 'Streamer',
    allowedRoles: ['admin', 'executive'],
  },
  {
    code: 'CN-05',
    href: '/dashboard-cua-toi',
    sidebarLabel: 'Dashboard của tôi',
    pageTitle: 'Dashboard của tôi',
    mobileBottomLabel: 'Của tôi',
    group: 'Streamer',
    allowedRoles: ['streamer'],
  },
  {
    code: 'CN-06',
    href: '/dang-ky-tham-gia',
    sidebarLabel: 'Đăng ký tham gia',
    pageTitle: 'Đăng ký tham gia',
    group: 'Streamer',
    allowedRoles: ['admin', 'streamer'],
    isPublic: true,
  },
  {
    code: 'CN-07',
    href: '/gui-bang-chung',
    sidebarLabel: 'Gửi bằng chứng',
    pageTitle: 'Gửi bằng chứng phiên live',
    group: 'Streamer',
    allowedRoles: ['streamer'],
  },
  {
    code: 'CN-08',
    href: '/duyet-phien-live',
    sidebarLabel: 'Duyệt phiên live',
    pageTitle: 'Duyệt phiên live',
    mobileBottomLabel: 'Duyệt',
    group: 'Quản trị',
    allowedRoles: ['admin'],
    badgeType: 'pending_sessions',
  },
  {
    code: 'CN-09',
    href: '/duyet-dang-ky',
    sidebarLabel: 'Duyệt đăng ký',
    pageTitle: 'Duyệt đăng ký',
    group: 'Quản trị',
    allowedRoles: ['admin'],
    badgeType: 'pending_registrations',
  },
  {
    code: 'CN-10',
    href: '/quan-ly-streamer',
    sidebarLabel: 'Quản lý streamer',
    pageTitle: 'Quản lý streamer · team · dự án',
    group: 'Quản trị',
    allowedRoles: ['admin'],
  },
  {
    code: 'CN-11',
    href: '/mua-giai',
    sidebarLabel: 'Mùa giải',
    pageTitle: 'Mùa giải',
    group: 'Quản trị',
    allowedRoles: ['admin'],
  },
  {
    code: 'CN-12',
    href: '/luat-diem-api',
    sidebarLabel: 'Luật điểm & API',
    pageTitle: 'Luật điểm & kết nối API',
    group: 'Quản trị',
    allowedRoles: ['admin'],
  },
  {
    code: 'CN-13',
    href: '/bao-cao',
    sidebarLabel: 'Báo cáo',
    pageTitle: 'Báo cáo',
    group: 'Quản trị',
    allowedRoles: ['admin', 'executive'],
  },
];

export function canAccessRoute(role: UserRole | null, pathname: string): boolean {
  if (pathname === '/dang-nhap' || pathname === '/dang-ky-tham-gia') {
    return true;
  }
  if (!role) return false;
  const matched = NAV_ITEMS.find((item) => item.href === pathname);
  if (!matched) return true;
  return matched.allowedRoles.includes(role);
}

export function getVisibleNavItems(role: UserRole | null): NavItemConfig[] {
  if (!role) {
    return NAV_ITEMS.filter((i) => i.isPublic);
  }
  return NAV_ITEMS.filter((item) => item.allowedRoles.includes(role));
}

export function getMobileBottomNavItems(role: UserRole | null): NavItemConfig[] {
  // Thứ tự chuẩn 04-giao-dien.md mục 1: Xếp hạng · Đang Live · Của tôi · Duyệt · Tổng quan
  const orderCodes = ['CN-01', 'CN-02', 'CN-05', 'CN-08', 'CN-03'];
  const visible = getVisibleNavItems(role);
  return orderCodes
    .map((code) => visible.find((v) => v.code === code))
    .filter((item): item is NavItemConfig => Boolean(item));
}

export function canExportRankingExcel(role: UserRole | null): boolean {
  return role === 'admin' || role === 'executive';
}

export function canApproveSessions(role: UserRole | null): boolean {
  return role === 'admin';
}
