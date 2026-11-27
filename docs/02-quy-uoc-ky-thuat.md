# 02 — Quy ước kỹ thuật

> Chỉ ghi những gì thấy được trong giao diện mẫu. Công nghệ, máy chủ, cơ sở dữ liệu: giao diện không nói → xem CH-33. Không tự chọn.

## 1. Nền tảng hiển thị
- Ứng dụng web chạy trên trình duyệt, dùng cho cả máy tính và điện thoại (có khung riêng cho màn hẹp).
- Có hỗ trợ chế độ tối theo cài đặt thiết bị (cần xác nhận có bắt buộc không — CH-34).
- Có tôn trọng cài đặt "giảm chuyển động" của thiết bị: tắt hiệu ứng nhấp nháy và chuyển cảnh.

## 2. Responsive (mốc độ rộng màn hình)
| Độ rộng | Thay đổi |
|---|---|
| > 1020px | Thanh bên cố định bên trái; hàng chỉ số 4 cột; lưới 3 cột |
| ≤ 1020px | Hàng chỉ số còn 2 cột; lưới 3 cột còn 2 cột |
| ≤ 820px | Ẩn thanh bên, hiện nút "☰ Menu" để mở; ẩn ô tìm kiếm đầu trang; ẩn tên + vai trò người dùng ở đầu trang; lưới thành 1 cột; hiện menu dưới 5 mục; bảng chuyển thành dạng thẻ, mỗi ô kèm nhãn cột |

## 3. Ngôn ngữ
- Giao diện tiếng Việt có dấu. Không thấy lựa chọn ngôn ngữ khác.

## 4. Định dạng
| Loại | Cách viết | Ví dụ trên giao diện |
|---|---|---|
| Thời lượng | `<giờ>h<phút 2 chữ số>` ; 0 phút → `0h00` | 3h43 · 0h24 · 28h40 · 212h45 |
| Thời lượng ngắn (thẻ live) | `<số> phút` | ● LIVE 42 phút |
| Ngày | `dd/mm` | 18/11 |
| Ngày giờ phiên | `dd/mm · HH:mm – HH:mm` | 19/11 · 19:15 – 21:03 |
| Ngày giờ ngắn | `dd/mm · HH:mm` | 18/11 · 19:02 |
| Ngày tương đối | Hôm nay / Hôm qua / Thứ 2 + giờ | Hôm nay 09:12 · Hôm qua 17:20 · Thứ 2 · 08:05 |
| Kỳ tuần | `Tuần dd/mm – dd/mm` | Tuần 16/11 – 22/11 |
| Kỳ tháng | `Tháng mm/yyyy` | Tháng 11/2026 |
| Số lớn | Dấu chấm ngăn hàng nghìn | 4.812 / 10.000 |
| Số thập phân | Dấu phẩy | 1,6 tỷ |
| Phần trăm | `<số>%` | 85% · 100% |
| Số điện thoại (bảng duyệt) | Che giữa | 0932 ••• 118 |
| Thời gian cập nhật | `<số> giây trước` / `vừa xong` / `cách đây <số> giây` | Cập nhật 12 giây trước |

## 5. Cập nhật dữ liệu
- Kiểm tra trạng thái khi chưa live: mỗi 5 phút. Khi đang live: mỗi 30 giây (màn Luật điểm & API).
- Màn Đang Live ghi "tự động làm mới mỗi 30 giây".
- Cách trang tự tải lại (đẩy từ máy chủ hay hỏi định kỳ): chưa rõ — CH-30.

## 5b. Tích hợp ghi nhận phiên live — ĐỀ XUẤT, CHỜ KHÁCH CHỐT (CH-00)
> Không làm khi CH-00 chưa có câu trả lời trong DECISIONS-LOG.md. Không ghi tên nhà cung cấp cụ thể cho tới khi khách chọn.
- Nguồn: **dịch vụ đọc phòng live bên thứ ba** (không chính thức). Có phí; có thể hỏng khi nền tảng thay đổi; cần xem điều khoản.
- Kiểm tra hàng loạt tài khoản đã duyệt có đang live không: mỗi 30–60 giây (giao diện mẫu ghi 5 phút khi chưa live — chờ chốt).
- Thấy live → mở kết nối theo dõi phòng: nhận người xem, like, bình luận, quà, sự kiện kết thúc.
- Dịch vụ không lưu lịch sử, không cho giờ bắt đầu → hệ thống tự ghi giờ phát hiện bắt đầu / kết thúc, người xem mỗi phút, tự tính cao nhất / trung bình / thời lượng.
- Mỗi mã phòng live = 1 phiên.
- Số kết nối cùng lúc giới hạn theo gói (vd 20 hoặc 50); quá giới hạn xử lý thế nào: CH-11.
- Mỗi kết nối có thời lượng tối đa → tự kết nối lại; mất dữ liệu thì gắn cờ "Thiếu dữ liệu".
- Dữ liệu chỉ dùng nội bộ.
- Chạy thử 1 tuần với 3–5 tài khoản trước khi làm thật.

## 6. Tệp
- Ảnh bằng chứng: PNG/JPG, tối đa 10MB.
- Tệp xuất: nút ghi "Xuất Excel" và "(.xlsx)"; bản mẫu thực tế tải CSV — CH-15.

## 7. Liên kết ngoài
- Nút mở TikTok mở tab mới.

## 8. Công nghệ & hạ tầng đã chốt (27/11/2026 — xem DECISIONS-LOG.md)
- Khung ứng dụng: **Next.js (App Router, TypeScript)**.
- Cơ sở dữ liệu, xác thực & lưu trữ ảnh bằng chứng: **Supabase** (`PostgreSQL`, `Supabase Auth`, `Supabase Storage` bucket `session-proofs`, `Row Level Security`).
- Múi giờ chuẩn hệ thống: `Asia/Ho_Chi_Minh` (`UTC+7`); tuần tính từ Thứ 2 `00:00` đến Chủ nhật `23:59`, phiên live thuộc ngày/tuần/mùa của **giờ bắt đầu**.
- Tích hợp đọc phòng live: qua giao diện `LiveTrackingProvider` (kết nối dịch vụ bên thứ ba hoặc chế độ mô phỏng kiểm thử).
- Thông báo: lưu bảng thông báo nội bộ (chuông đầu trang) kèm `NotificationChannel` chờ cấu hình Zalo OA.
