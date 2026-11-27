# 00 — Thuật ngữ và tên chuẩn

> Mọi chữ dưới đây chép đúng từ giao diện mẫu. Dùng đúng chữ này trong code, màn hình, tài liệu.
> Một khái niệm có nhiều cách ghi trên giao diện thì liệt kê đủ, kèm nơi xuất hiện. Không tự gộp.

## 1. Tên sản phẩm
| Tên | Nơi xuất hiện |
|---|---|
| PICITY LÊN LIVE | Logo thanh bên ("PICITY" + "LÊN LIVE") |
| Picity Lên Live | Dòng đường dẫn đầu trang ("Picity Lên Live / …") |
| Hệ thống theo dõi livestream TikTok đội kinh doanh Picity | Dòng phụ dưới logo |

## 2. Vai trò / người dùng
| Tên trên giao diện | Nơi xuất hiện | Ghi chú |
|---|---|---|
| Admin / admin | Câu chữ nhiều màn ("admin duyệt", "Ghi chú cho admin") | |
| Quản trị viên hệ thống | Thanh bên, dưới tên "Admin Picity" | |
| Quản trị viên | Góc phải đầu trang, dưới tên "Admin Picity" | |
| Streamer | Nhóm menu "Streamer", cột "Streamer" | Nhân viên kinh doanh live TikTok |
| Người đăng ký | Cột bảng Duyệt đăng ký | Streamer đã gửi đăng ký, chưa được duyệt |
| Trưởng team / trưởng team | Tổng quan điều hành ("Cần trưởng team nhắc trong hôm nay") | Chưa rõ có tài khoản riêng — xem cau-hoi-mo CH-09 |
| Người xuất | Cột bảng Lịch sử xuất báo cáo | |
| Người duyệt | Mô tả "Bảng điểm chốt tháng" ("kèm người duyệt và giờ duyệt") | |
| (Sếp / điều hành) | Không có chữ trên màn; chỉ có tên màn "Tổng quan điều hành" | Không dùng làm tên vai trò khi chưa chốt — CH-09 |

## 3. Tên màn (chữ trên menu thanh bên · tiêu đề màn · menu dưới trên điện thoại)
| Menu thanh bên | Tiêu đề màn (H1) | Menu dưới (điện thoại) | Tệp chức năng |
|---|---|---|---|
| Bảng xếp hạng | Bảng xếp hạng | Xếp hạng | bang-xep-hang.md |
| Đang Live | Đang Live | Đang Live | dang-live.md |
| Tổng quan điều hành | Tổng quan điều hành | Tổng quan | tong-quan-dieu-hanh.md |
| Chi tiết streamer | Chi tiết streamer | — | chi-tiet-streamer.md |
| Dashboard của tôi | Xin chào, <tên> | Của tôi | dashboard-cua-toi.md |
| Đăng ký tham gia | Đăng ký tham gia | — | dang-ky-tham-gia.md |
| Gửi bằng chứng | Gửi bằng chứng phiên live | — | gui-bang-chung.md |
| Duyệt phiên live | Duyệt phiên live | Duyệt | duyet-phien-live.md |
| Duyệt đăng ký | Duyệt đăng ký | — | duyet-dang-ky.md |
| Quản lý streamer | Quản lý streamer · team · dự án | — | quan-ly-streamer.md |
| Mùa giải | Mùa giải | — | mua-giai.md |
| Luật điểm & API | Luật điểm & kết nối API | — | luat-diem-api.md |
| Báo cáo | Báo cáo | — | bao-cao.md |

Nhóm menu thanh bên: **Tổng quan** · **Streamer** · **Quản trị**.

## 4. Trạng thái
### 4.1 Trạng thái phát (streamer / phòng)
| Chữ | Nơi xuất hiện |
|---|---|
| ● LIVE | Cột Trạng thái Bảng xếp hạng; thẻ Đang Live ("● LIVE 42 phút"); hộp xem live |
| Ngoại tuyến | Cột Trạng thái Bảng xếp hạng |
| ● ĐANG LIVE | Bảng "Phiên live của tôi" |
| ● Đang live | Cột Trạng thái Quản lý streamer |
| đang live | Đầu trang ("5 đang live"), "Tối nay · đang live" |

### 4.2 Trạng thái phiên live
| Chữ | Nơi xuất hiện |
|---|---|
| Chờ duyệt | Phiên live của tôi; số "phiên chờ duyệt" |
| Chờ duyệt tay | Câu báo sau khi gửi bằng chứng |
| Đã duyệt | Lịch sử phiên live |
| Đã duyệt · +1đ | Lịch sử phiên live |
| Đã duyệt · tính vào 3h24 | Phiên live của tôi |
| Từ chối · < 30 phút | Lịch sử phiên live |
| Thiếu dữ liệu / “thiếu dữ liệu” | Gửi bằng chứng; Duyệt phiên live |
| Chưa có snapshot | Ô chọn phiên ở Gửi bằng chứng |

### 4.3 Nhãn đánh giá phiên ở màn Duyệt phiên live
| Chữ | Màu nhãn |
|---|---|
| Đủ điều kiện · ≥ 30 phút | xanh lá |
| Dưới 30 phút · theo luật không tính điểm | đỏ nhạt |
| Thiếu dữ liệu · API lỗi 5 phút — đã có ảnh bằng chứng đính kèm | vàng |

### 4.4 Trạng thái đăng ký
| Chữ | Nơi xuất hiện |
|---|---|
| Chờ duyệt | Câu báo sau khi gửi đăng ký |
| Đã duyệt | Nhãn cạnh tên ở Chi tiết streamer |
| (Đã từ chối) | Không có nhãn; chỉ có câu "Đã từ chối đăng ký của …" |

### 4.5 Trạng thái streamer ở Quản lý streamer
`Đang theo dõi` · `● Đang live` · `Chưa live tuần này`

### 4.6 Trạng thái mùa giải
`Đang diễn ra` · `Đang diễn ra · còn 2 ngày` · `Đã khóa bảng`

### 4.7 Trạng thái kết nối
`● Đang kết nối` · "<tên dịch vụ> đã kết nối"

## 5. Khái niệm nghiệp vụ
| Tên | Nghĩa theo giao diện |
|---|---|
| Mùa giải | Kỳ thi đua; "Mùa đã đóng sẽ khóa bảng — điểm đã chốt không sửa được". Quan hệ với Tuần chưa rõ (CH-01) |
| Tuần / Tuần này | Kỳ xếp hạng, ví dụ "Tuần 16/11 – 22/11" |
| Tháng này / Từ đầu | Các kỳ khác của bảng xếp hạng |
| Phiên / phiên live | Một lần live trên TikTok của một streamer |
| Phiên hợp lệ | Phiên được tính điểm (≥ 30 phút) |
| Phiên chờ duyệt | Phiên chưa được admin duyệt |
| Điểm nháp | Điểm hệ thống tự tính, chưa chốt |
| Điểm đã chốt / chốt điểm | Điểm sau khi admin duyệt |
| Tổng giờ / Tổng giờ live | Tổng thời lượng live |
| Peak view / Peak viewers / Peak | Số người xem cao nhất |
| người đang xem / người xem | Số người xem tại thời điểm |
| Bằng chứng / ảnh bằng chứng / Ảnh màn hình cuối live | Ảnh streamer gửi cho phiên thiếu dữ liệu |
| snapshot | Lần lấy dữ liệu người xem từ API ("snapshot mỗi 30 giây từ API") |
| Đạt KPI tuần (≥ 4h live) / mục tiêu tuần (4h) | Mục tiêu 4 giờ live mỗi tuần |
| Team | Team Picity 1 · Team Picity 2 · Team Picity 3 |
| Dự án / Dự án phụ trách | Picity Central Park · Picity SkyZen · Picity High Park (bảng ghi gọn: Central Park · SkyZen · High Park) |
| Dịch vụ đọc phòng live bên thứ ba | Dịch vụ kết nối lấy dữ liệu live. Giao diện mẫu ghi tên một nhà cung cấp cụ thể ("Kết nối <tên dịch vụ>"); tên chỉ điền khi khách chốt (CH-00) |
| Tài khoản TikTok / @TikTok / @username | Tài khoản streamer đăng ký để theo dõi |

## 6. Tên ô / cột / nút hay dùng
- Cột bảng xếp hạng: `Hạng` · `Streamer` · `Team` · `Dự án` · `Phiên` · `Tổng giờ` · `Peak view` · `Điểm` · `Trạng thái`
- Tab kỳ: `Tuần này` · `Tháng này` · `Từ đầu`
- Nút chung: `Xuất Excel` · `Vào phòng live` · `Duyệt phiên chờ` · `Xem phòng live` · `Hồ sơ` · `Mở TikTok ↗` · `Mở trên TikTok ↗` · `Đóng` · `Chi tiết` · `Nhắc live`
- Duyệt: `✓ Duyệt — chốt điểm` · `✕ Từ chối` · `Xem ảnh bằng chứng` · `Duyệt` · `Từ chối`
- Biểu mẫu: `Gửi đăng ký` · `Nhập lại` · `Gửi bằng chứng` · `+ Tạo mùa giải mới` · `Tạo mùa giải` · `Lưu thay đổi`
- Báo cáo: `Xuất báo cáo tuần` · `Tải báo cáo tuần này` · `Tải xuống (.xlsx)` · `Tải lại`
- Phân trang: `← Trước` · `Trang 1 / 2` · `Sau →`

## 7. Cách viết thời lượng, ngày giờ (giữ đúng khi hiển thị)
- Thời lượng: `3h43`, `0h24`, `0h00` (giờ + "h" + phút 2 chữ số); dưới 1 giờ ở thẻ live: `42 phút`.
- Ngày giờ phiên: `19/11 · 19:15 – 21:03`; ngày: `18/11 · 19:02`.
- Kỳ: `Tuần 16/11 – 22/11`, `Tháng 11/2026`, `01/11 – 30/11`.
