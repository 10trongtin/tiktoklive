# 05 — Phân quyền

> Đã chốt ngày 27/11/2026 (xem DECISIONS-LOG.md): Hệ thống mở cổng công khai minh bạch cho mọi người xem cuộc thi (không cần đăng nhập ở `CN-01`, `CN-02`, `CN-04`, `CN-06`), và dùng Supabase Auth (Email/SĐT + mật khẩu) cho 3 vai trò nội bộ (`Admin`, `Streamer`, `Cấp điều hành`).
> Nguyên tắc chung: không có quyền xem thì ẩn menu, không hiện nút mờ; các trang công khai tuyệt đối không lộ SĐT/email cá nhân của streamer.

## 1. Vai trò
| Vai trò | Căn cứ / Quyền chính |
|---|---|
| Admin (Quản trị viên) | Toàn quyền duyệt phiên, duyệt đăng ký, quản lý streamer, mùa giải, luật điểm & API, báo cáo, xem tổng quan & chi tiết streamer |
| Streamer | Xem Bảng xếp hạng, Đang Live, Chi tiết streamer, Dashboard của tôi, Gửi bằng chứng phiên của mình |
| Cấp điều hành | Xem Bảng xếp hạng, Đang Live, Tổng quan điều hành, Chi tiết streamer, Báo cáo |
| Khách công khai (chưa đăng nhập) | Xem công khai minh bạch sự kiện đang diễn ra: Bảng xếp hạng (`/`), Đang Live (`/dang-live`), Chi tiết streamer (`/chi-tiet-streamer`), gửi Đăng ký tham gia (`/dang-ky-tham-gia`) và Đăng nhập (`/dang-nhap`) |

## 2. Bảng vai trò × chức năng
| Chức năng | Admin | Streamer | Cấp điều hành | Khách công khai |
|---|---|---|---|---|
| CN-01 Bảng xếp hạng & Khung sự kiện — xem | Có | Có | Có | Có |
| CN-01 Xuất Excel | Có | Không | Có | Không |
| CN-01 Nút "Duyệt phiên chờ" | Có | Không | Không | Không |
| CN-02 Đang Live & Hộp Xem phòng live — xem | Có | Có | Có | Có |
| CN-03 Tổng quan điều hành — xem, xuất báo cáo tuần | Có | Không | Có | Không |
| CN-04 Chi tiết streamer — xem đối chứng phiên & biểu đồ | Có | Có | Có | Có |
| CN-04 Nút "Xem phiên chờ duyệt" | Có | Không | Không | Không |
| CN-05 Dashboard của tôi | Không (ẩn menu) | Có — chỉ của mình | Không | Không |
| CN-06 Đăng ký tham gia — gửi | Có | Có | Không | Có |
| CN-07 Gửi bằng chứng | Không (ẩn menu) | Có — chỉ phiên của mình | Không | Không |
| CN-08 Duyệt phiên live — Duyệt / Từ chối | Có | Không | Không | Không |
| CN-09 Duyệt đăng ký — Duyệt / Từ chối | Có | Không | Không | Không |
| CN-10 Quản lý streamer — xem, Nhắc live | Có | Không | Không | Không |
| CN-11 Mùa giải — tạo | Có | Không | Không | Không |
| CN-12 Luật điểm & API — sửa, lưu | Có | Không | Không | Không |
| CN-13 Báo cáo — tải | Có | Không | Có | Không |

## 3. Phạm vi dữ liệu (chưa rõ — CH-09)
- Streamer có thấy phiên / điểm của người khác không (ngoài Bảng xếp hạng)?
- Trưởng team chỉ thấy team mình hay toàn bộ?
- Có giới hạn theo dự án không?

## 4. Số đếm trên menu
- Số trên "Duyệt phiên live", "Duyệt đăng ký" chỉ có nghĩa với người có quyền duyệt. Người không có quyền thì ẩn cả menu (theo nguyên tắc chung).
