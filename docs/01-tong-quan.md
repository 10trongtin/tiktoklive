# 01 — Tổng quan sản phẩm

## 1. Mục tiêu
- Bối cảnh (khách cho biết): đây là chương trình **thi đua livestream cho sale**. Sale live để giới thiệu, nói về dự án bất động sản. Ai live nhiều nhất thì được thưởng tiền. Sếp yêu cầu có bảng dashboard theo dõi sale livestream.
- Một người thường live **nhiều phiên**. Giao diện cho thấy: mỗi phiên ≥ 30 phút được 1 điểm, xếp hạng theo **điểm (tức số phiên hợp lệ)**, bằng điểm mới xét **tổng giờ live**. Điều này chưa chắc khớp với ý "ai live nhiều nhất" (nhiều phiên hay nhiều giờ) — câu hỏi ưu tiên cao CH-02.
- Thưởng tiền tính theo tuần, tháng hay mùa: chưa rõ — CH-46.
- Theo dõi việc livestream TikTok của đội kinh doanh Picity.
- Tự nhận biết phiên live qua kết nối API (dịch vụ đọc phòng live bên thứ ba), tính điểm nháp.
- Admin duyệt từng phiên thì điểm mới chốt lên bảng xếp hạng.
- Cho cấp điều hành xem ai đạt KPI tuần (≥ 4h live), ai chưa live, team nào dẫn đầu.
- Xuất báo cáo làm căn cứ tính thưởng ("Bảng điểm chốt tháng — Căn cứ tính thưởng").

## 2. Người dùng
| Người dùng | Việc chính (theo giao diện) |
|---|---|
| Streamer | Đăng ký tham gia, live, xem Dashboard của tôi, gửi bằng chứng cho phiên thiếu dữ liệu |
| Admin (Quản trị viên) | Duyệt đăng ký, duyệt phiên live, quản lý streamer · team · dự án, mùa giải, luật điểm & API, báo cáo |
| Cấp điều hành (chưa rõ tên vai trò) | Xem Tổng quan điều hành, xuất báo cáo tuần |
| Trưởng team (chưa rõ có tài khoản) | Được nhắc tên trong câu "Cần trưởng team nhắc trong hôm nay" |

> Giao diện mẫu chỉ có một người đăng nhập là "Admin Picity", thấy mọi menu. Ai thấy menu nào: xem 05-phan-quyen.md và CH-09.

## 3. Danh sách màn
| Mã | Màn | Nhóm menu | Tệp |
|---|---|---|---|
| CN-01 | Bảng xếp hạng | Tổng quan | chuc-nang/bang-xep-hang.md |
| CN-02 | Đang Live (kèm hộp Xem phòng live) | Tổng quan | chuc-nang/dang-live.md |
| CN-03 | Tổng quan điều hành | Tổng quan | chuc-nang/tong-quan-dieu-hanh.md |
| CN-04 | Chi tiết streamer | Streamer | chuc-nang/chi-tiet-streamer.md |
| CN-05 | Dashboard của tôi | Streamer | chuc-nang/dashboard-cua-toi.md |
| CN-06 | Đăng ký tham gia | Streamer | chuc-nang/dang-ky-tham-gia.md |
| CN-07 | Gửi bằng chứng phiên live | Streamer | chuc-nang/gui-bang-chung.md |
| CN-08 | Duyệt phiên live | Quản trị | chuc-nang/duyet-phien-live.md |
| CN-09 | Duyệt đăng ký | Quản trị | chuc-nang/duyet-dang-ky.md |
| CN-10 | Quản lý streamer · team · dự án | Quản trị | chuc-nang/quan-ly-streamer.md |
| CN-11 | Mùa giải | Quản trị | chuc-nang/mua-giai.md |
| CN-12 | Luật điểm & kết nối API | Quản trị | chuc-nang/luat-diem-api.md |
| CN-13 | Báo cáo | Quản trị | chuc-nang/bao-cao.md |

Phần chung (thanh bên, đầu trang, ô tìm kiếm, chuông thông báo, menu dưới điện thoại): xem 04-giao-dien.md.

## 4. Đường đi giữa các màn (theo nút trên giao diện)
| Từ màn | Bấm | Tới |
|---|---|---|
| Bảng xếp hạng | Vào phòng live | Đang Live |
| Bảng xếp hạng | Duyệt phiên chờ · Đi tới Duyệt phiên → | Duyệt phiên live |
| Bảng xếp hạng | Ảnh đại diện trong khối "Đang Live" | Hộp Xem phòng live |
| Đang Live | Xem phòng live | Hộp Xem phòng live |
| Đang Live | Hồ sơ | Chi tiết streamer |
| Chi tiết streamer | Xem phiên chờ duyệt | Duyệt phiên live |
| Chi tiết streamer · hộp Xem phòng live | Mở TikTok ↗ · Mở trên TikTok ↗ | Trang TikTok (tab mới) |
| Dashboard của tôi | Gửi bằng chứng phiên | Gửi bằng chứng phiên live |
| Quản lý streamer | Chi tiết | Chi tiết streamer |
| Mọi màn | Ô tìm kiếm đầu trang + Enter | Quản lý streamer (đã lọc) |

## 5. Vòng đời chính (theo giao diện)
1. Streamer gửi **Đăng ký tham gia** → trạng thái Chờ duyệt.
2. Admin **Duyệt đăng ký** → tài khoản vào danh sách theo dõi, bắt đầu ghi nhận phiên từ lúc duyệt.
3. Streamer live → hệ thống tự mở / đóng phiên, tự tính điểm nháp.
4. Phiên thiếu dữ liệu → streamer **Gửi bằng chứng** trong 24 giờ → Chờ duyệt tay.
5. Admin **Duyệt phiên live** → điểm chốt lên Bảng xếp hạng; hoặc Từ chối.
6. Hết mùa → bảng bị khóa, điểm đã chốt không sửa được.
7. Báo cáo tuần sẵn sàng 07:00 sáng thứ 2.

## 5b. Cách ghi nhận phiên live theo giao diện (trọng tâm của dự án)
Khách nói: "sale sẽ đăng ký link cá nhân để live. Thích live giờ nào live, mình làm sao tracking nó được." Giao diện HTML đang theo **cả hai cách, cách tự động là chính**:
1. **Tự động qua kết nối API (dịch vụ đọc phòng live bên thứ ba)**: sale đăng ký **@username TikTok** (không phải link). Hệ thống kiểm tra tài khoản mỗi 5 phút khi chưa live, mỗi 30 giây khi đang live; công tắc "Tự mở / đóng phiên" ("Phát hiện bắt đầu và kết thúc live qua polling"); đo người xem mỗi 30 giây; "Tự tính điểm nháp".
2. **Bổ sung bằng chứng khi dữ liệu tự động thiếu**: phiên bị gắn cờ "thiếu dữ liệu" → sale gửi ảnh màn hình cuối live (+ link phiên nếu có) trong 24 giờ → "Chờ duyệt tay".
3. **Admin duyệt mọi phiên**: "Tự duyệt phiên ≥ 30 phút" đang tắt — điểm chỉ chốt khi admin bấm "✓ Duyệt — chốt điểm".
- Không thấy cách **admin tự nhập phiên tay** và không thấy **sale tự khai phiên** khi không có dữ liệu tự động.
- Ảnh tham khảo khách gửi (sản phẩm bên khác) cho thấy cách tham gia khác: quét mã QR trong TikTok (Hồ sơ → Thêm bạn bè → quét → Đồng ý), tức kết bạn với tài khoản hệ thống để theo dõi. HTML không có bước này.
- Việc tự động ghi nhận giờ bắt đầu / kết thúc phiên từ tài khoản cá nhân có làm được không, bằng cách nào: **câu hỏi ưu tiên số 1 — CH-00** trong cau-hoi-mo.md. Không tự chọn hướng.

## 6. Phạm vi
- Làm: 13 màn trên, phần khung chung, xuất báo cáo, kết nối dịch vụ đọc phòng live theo các thông số ghi trên màn Luật điểm & API.

## 7. Ngoài phạm vi (theo giao diện)
- Quà / diamond: "Không tính điểm".
- Nền tảng ngoài TikTok: giao diện chỉ nhắc TikTok.
- Màn đăng nhập, quên mật khẩu, quản lý tài khoản người dùng: **không có trong giao diện** — chưa xác định là ngoài phạm vi hay thiếu (CH-08).
- Thêm / sửa / xóa team, dự án: **không có trong giao diện** (CH-25).
