# 05 — Phân quyền

> Đã chốt ngày 27/11/2026 (xem DECISIONS-LOG.md): Hệ thống dùng Supabase Auth (Email/SĐT + mật khẩu), phân 3 vai trò chính (`Admin`, `Streamer`, `Cấp điều hành`), mở công khai màn `Đăng ký tham gia` cho sale mới.
> Nguyên tắc chung: không có quyền xem thì ẩn menu, không hiện nút mờ.

## 1. Vai trò
| Vai trò | Căn cứ / Quyền chính |
|---|---|
| Admin (Quản trị viên) | Toàn quyền duyệt phiên, duyệt đăng ký, quản lý streamer, mùa giải, luật điểm & API, báo cáo, xem tổng quan & chi tiết streamer |
| Streamer | Xem Bảng xếp hạng, Đang Live, Dashboard của tôi, Gửi bằng chứng phiên của mình |
| Cấp điều hành | Xem Bảng xếp hạng, Đang Live, Tổng quan điều hành, Chi tiết streamer, Báo cáo |
| Khách chưa có tài khoản | Mở công khai màn Đăng ký tham gia (`/dang-ky-tham-gia`) và màn Đăng nhập (`/dang-nhap`) |

## 2. Bảng vai trò × chức năng
| Chức năng | Admin | Streamer | Cấp điều hành |
|---|---|---|---|
| CN-01 Bảng xếp hạng — xem | Có | Có | Có |
| CN-01 Xuất Excel | Có | Không | Có |
| CN-01 Nút "Duyệt phiên chờ" | Có | Không | Không |
| CN-02 Đang Live — xem | Có | Có | Có |
| CN-03 Tổng quan điều hành — xem, xuất báo cáo tuần | Có | Không | Có |
| CN-04 Chi tiết streamer — xem mọi streamer | Có | Không | Có |
| CN-05 Dashboard của tôi | Không (ẩn menu) | Có — chỉ của mình | Không |
| CN-06 Đăng ký tham gia — gửi | Có / Công khai | Công khai | Không |
| CN-07 Gửi bằng chứng | Không (ẩn menu) | Có — chỉ phiên của mình | Không |
| CN-08 Duyệt phiên live — Duyệt / Từ chối | Có | Không | Không |
| CN-09 Duyệt đăng ký — Duyệt / Từ chối | Có | Không | Không |
| CN-10 Quản lý streamer — xem, Nhắc live | Có | Không | Không |
| CN-11 Mùa giải — tạo | Có | Không | Không |
| CN-12 Luật điểm & API — sửa, lưu | Có | Không | Không |
| CN-13 Báo cáo — tải | Có | Không | Có |

## 3. Phạm vi dữ liệu (chưa rõ — CH-09)
- Streamer có thấy phiên / điểm của người khác không (ngoài Bảng xếp hạng)?
- Trưởng team chỉ thấy team mình hay toàn bộ?
- Có giới hạn theo dự án không?

## 4. Số đếm trên menu
- Số trên "Duyệt phiên live", "Duyệt đăng ký" chỉ có nghĩa với người có quyền duyệt. Người không có quyền thì ẩn cả menu (theo nguyên tắc chung).
