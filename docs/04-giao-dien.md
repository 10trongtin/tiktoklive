# 04 — Quy ước giao diện chung

## 1. Bố cục
- **Thanh bên trái** (rộng 272px, nền xanh navy đậm chuyển màu):
  - Logo chữ "P" + "PICITY LÊN LIVE" + dòng "Hệ thống theo dõi livestream TikTok đội kinh doanh Picity".
  - Khối mùa giải: "Mùa giải hiện tại" · "Tuần 16/11 – 22/11" · "17 streamer · 3 team · 3 dự án".
  - Menu theo 3 nhóm: Tổng quan · Streamer · Quản trị (xem 00-thuat-ngu.md mục 3).
  - Số đếm trên menu: "Đang Live" (số đỏ = số phòng đang live), "Duyệt phiên live" (số phiên chờ duyệt), "Duyệt đăng ký" (số đăng ký chờ).
  - Chân thanh bên: ảnh chữ "AD", "Admin Picity", "Quản trị viên hệ thống"; chấm xanh + "<tên dịch vụ> đã kết nối · cập nhật 12 giây trước".
- **Đầu trang** (dính trên cùng khi cuộn):
  - Nút "☰ Menu" (chỉ màn hẹp).
  - Đường dẫn: "Picity Lên Live / <tên màn>" — tên màn lấy theo menu thanh bên.
  - Ô tìm kiếm, chữ gợi ý "Tìm streamer, @TikTok, team…".
  - Ô đếm "<số> đang live" có chấm đỏ nhấp nháy.
  - Nút chuông, số đỏ = số thông báo chưa đọc.
  - Ảnh "AD", tên "Admin Picity", vai trò "Quản trị viên".
- **Vùng nội dung**: rộng tối đa 1280px, giữa màn.
- **Đầu mỗi màn**: tiêu đề lớn (H1) + dòng mô tả; bên phải là nút / tab của màn.
- **Menu dưới (điện thoại ≤ 820px)**: Xếp hạng · Đang Live · Của tôi · Duyệt · Tổng quan.

## 2. Hành vi khung chung
| Thành phần | Hành vi |
|---|---|
| Bấm mục menu | Mở màn tương ứng, tô đậm mục đang chọn (cả thanh bên và menu dưới), đổi tên trong đường dẫn, đóng thanh bên (màn hẹp), cuộn lên đầu |
| ☰ Menu | Mở / đóng thanh bên |
| Ô tìm kiếm + Enter | Mở Quản lý streamer, điền chữ vào ô lọc của màn đó, hiện câu "Kết quả tìm “<chữ>” trong Quản lý streamer." |
| Chuông | Hiện câu "3 thông báo mới: 4 phiên chờ duyệt · 3 đăng ký chờ duyệt · Hoàng Nam Picity gửi bằng chứng phiên 19/11." rồi ẩn số đỏ |
| Mốc "cập nhật … giây trước" | Tự đếm lại theo thời gian |

> Danh sách thông báo đầy đủ, bấm vào thông báo đi đâu: chưa có trong giao diện — CH-14.

## 3. Màu chính (lấy từ CSS)
| Tên | Mã màu | Dùng cho |
|---|---|---|
| Nền | #FBF9F4 | Nền trang |
| Bề mặt | #FFFFFF | Thẻ, bảng |
| Navy | #10294F · #1B3A68 | Tiêu đề, nút chính, tab đang chọn |
| Vàng (gold) | #B9975B · #C9A96A · #D9BC7A | Nút vàng, viền nhấn, thanh tiến độ |
| Xanh ngọc (teal) | #177A72 | Điểm nháp, công tắc bật, ghi chú xanh |
| Đỏ | #D92D20 | LIVE, số đang live, nút Từ chối |
| Xanh lá | #1E7A4C | Đã duyệt, tăng ▲ |
| Hổ phách | #8F620E | Nhãn vàng (Chờ duyệt, Hạng 1) |
| Chữ | #1C2739 · phụ #66707F | |
- Có bộ màu tối riêng khi thiết bị ở chế độ tối.

## 4. Kiểu chữ
- Chữ thường: Inter (400–800). Cỡ cơ bản 14.5px.
- Tiêu đề và số lớn: Playfair Display (500–700). H1 33px (màn hẹp 24px).

## 5. Thành phần dùng lại
| Thành phần | Mô tả |
|---|---|
| Thẻ chỉ số (KPI) | Nhãn nhỏ · số lớn · dòng phụ (xanh "▲" nếu tăng). Hàng 4 thẻ (một số màn 3 thẻ) |
| Nhãn (tag) | live (đỏ đặc), xanh lá, vàng, xám, đỏ nhạt, xanh ngọc |
| Nút | thường · chính (navy) · vàng · nguy hiểm (chữ đỏ) · nhỏ · bị khóa (mờ) |
| Tab tròn | Nhóm nút chọn một, nút đang chọn nền navy |
| Bảng | Tiêu đề cột in hoa; số canh phải; màn hẹp chuyển dạng thẻ |
| Người (person) | Ảnh chữ viết tắt tròn + tên đậm + dòng phụ (@TikTok hoặc SĐT) |
| Ghi chú (note) | Khung nền vàng nhạt; bản xanh nhạt cho câu báo thành công |
| Thanh tiến độ | Thanh vàng theo % |
| Công tắc | Bật = xanh ngọc |
| Thông báo nổi (toast) | Hiện giữa đáy màn khoảng 3,4 giây |
| Hộp thoại | Nền tối mờ; bấm ra ngoài hoặc nút Đóng để tắt |
| Chấm đỏ nhấp nháy | Báo đang live |

## 6. Trạng thái rỗng / đang tải / lỗi
- Rỗng có ở màn Duyệt phiên live: "Đã xử lý hết — không còn phiên nào chờ duyệt."
- Bảng xếp hạng: Peak view = 0 hiện "—".
- Trạng thái đang tải, lỗi mạng, lỗi máy chủ: **không có trong giao diện** — CH-31.
- Rỗng cho các màn khác (chưa có streamer, chưa có phiên, chưa có mùa): không có — CH-31.

## 7. Khả năng tiếp cận thấy trong mẫu
- Nút cao tối thiểu 40px; viền vàng khi chọn bằng bàn phím.
- Vùng chọn ảnh mở được bằng phím Enter / Space.
