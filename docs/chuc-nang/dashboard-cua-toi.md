# Dashboard của tôi

## 0. Thông tin tệp
| Mục | Nội dung |
|---|---|
| Mã chức năng | CN-05 |
| Phiên bản | 1.0 · 25/11/2026 |
| Phụ thuộc | 03-du-lieu.md › Streamer, Phiên live, Điểm, Luật điểm (mục tiêu tuần); CN-07 Gửi bằng chứng |
| Trạng thái | Nháp |

## 1. Mục tiêu
- Streamer xem hạng, điểm, giờ live của chính mình trong tuần, tiến độ tới mục tiêu tuần, và trạng thái từng phiên.
- Biết còn thiếu bao nhiêu phút để bắt kịp hạng trên / đạt mục tiêu.

## 2. Ai dùng
| Vai trò | Được làm gì ở chức năng này | Không được làm gì |
|---|---|---|
| Streamer | Xem dữ liệu của mình; bấm Gửi bằng chứng phiên | Xem dashboard của người khác (suy ra) |
| Admin | chưa rõ (mẫu admin thấy dashboard của Thanh Anh — CH-09) | — |

## 3. Đường vào màn
1. Menu thanh bên "Dashboard của tôi" (nhóm Streamer), hoặc menu dưới "Của tôi".
- Điều kiện: đã đăng nhập bằng tài khoản streamer đã được duyệt (suy ra — CH-08).

## 4. Màn hình
Ảnh / wireframe: chưa có (khối `scr-me`).

| # | Tên ô / nút (đúng chữ trên màn) | Kiểu | Bắt buộc | Giới hạn & định dạng | Mặc định | Hành vi |
|---|---|---|---|---|---|---|
| 1 | "Xin chào, <tên ngắn>" | Tiêu đề | — | vd "Xin chào, Thanh Anh" | — | — |
| 2 | Dòng thông tin | Chữ | — | "<tên hiển thị> · @<TikTok> · <Team> · <Dự án>" | — | — |
| 3 | Gửi bằng chứng phiên | Nút vàng | — | — | — | Mở CN-07 |
| 4 | Thẻ "Hạng của tôi tuần này" | Chỉ số | — | "<hạng> / <tổng>" + "Kém hạng 1 đúng <số> phút live" | — | QT-02 |
| 5 | Thẻ "Điểm đã chốt" | Chỉ số | — | Số + "+<số> phiên đang chờ duyệt" | — | QT-01 |
| 6 | Thẻ "Tổng giờ live tuần" | Chỉ số | — | Thời lượng + "Đạt <%> mục tiêu tuần (4h)" | — | QT-03 |
| 7 | Thẻ "Phiên hợp lệ" | Chỉ số | — | "<số> / <số>" + "Không có phiên bị từ chối" | — | Câu khi có phiên bị từ chối: CH-45 |
| 8 | Khối "Tiến độ mục tiêu tuần" — "Tổng giờ live" | Thanh tiến độ | — | "<giờ> / 4h00" | — | QT-03 |
| 9 | Khối "Tiến độ mục tiêu tuần" — "Số phiên ≥ 30 phút" | Thanh tiến độ | — | "<số> / 4 phiên" | — | Mục tiêu 4 phiên: không có trên màn Luật điểm — CH-17 |
| 10 | Ghi chú gợi ý | Ghi chú | — | Câu M-01 | — | — |
| 11 | Bảng "Phiên live của tôi": Ngày · Thời lượng · Trạng thái | Bảng | — | Ngày "Tối nay · đang live" hoặc "dd/mm · HH:mm"; Trạng thái "● ĐANG LIVE", "Chờ duyệt", "Đã duyệt · tính vào <giờ>" | — | — |
| 12 | Chú thích dưới bảng | Chữ | — | Câu M-02 | — | — |

## 5. Quy tắc nghiệp vụ
| Mã | Quy tắc (một câu, kiểm được) |
|---|---|
| QT-01 | "Điểm đã chốt" chỉ gồm phiên đã duyệt; phiên chờ duyệt hiện riêng ở dòng "+<số> phiên đang chờ duyệt". |
| QT-02 | "Kém hạng 1 đúng <số> phút live" = tổng giờ của hạng 1 trừ tổng giờ của tôi. Khi tôi là hạng 1: chưa có câu (CH-45). |
| QT-03 | % mục tiêu = tổng giờ live tuần / 4h00 (mẫu 3h24 → 85%). |
| QT-04 | Phiên lên bảng xếp hạng sau khi admin duyệt. |
| QT-05 | Phiên thiếu dữ liệu phải gửi ảnh trong vòng 24 giờ. |

## 6. Trạng thái (nếu có)
Chỉ hiển thị trạng thái phiên (xem CN-08). Không có thao tác đổi trạng thái.

## 7. Dữ liệu đọc / ghi
- Đọc: Streamer (của người đăng nhập), Phiên live, Điểm, hạng tuần, mục tiêu tuần.
- Ghi: không có.

## 8. Câu chữ hiển thị (chép NGUYÊN VĂN, AI không tự viết câu khác)
| Mã | Khi nào | Câu hiển thị |
|---|---|---|
| M-01 | Ghi chú tiến độ (mẫu) | "Chỉ cần thêm 36 phút live nữa là bạn bắt kịp tổng giờ của Minh Dự Picity (hạng 1). Còn 36 phút nữa là đạt mục tiêu 4h00 của tuần." |
| M-02 | Dưới bảng phiên | "Phiên lên bảng xếp hạng sau khi admin duyệt. Phiên thiếu dữ liệu: gửi ảnh màn hình cuối live tại mục Gửi bằng chứng trong vòng 24 giờ." |
| M-03 | Thẻ phiên hợp lệ | "Không có phiên bị từ chối" |
> M-01 lệch số với thẻ hạng ("Kém hạng 1 đúng 19 phút") — CH-32. Không tự sửa câu.

## 9. Tiêu chí nghiệm thu
| Mã | Cho trước | Khi | Thì | Quy tắc |
|---|---|---|---|---|
| AC-01 | 1 phiên đã duyệt, 1 phiên chờ duyệt | Mở màn | "Điểm đã chốt" 1, dòng "+1 phiên đang chờ duyệt" | QT-01 |
| AC-02 | Tôi 3h24, hạng 1 3h43 | Mở màn | "Kém hạng 1 đúng 19 phút live" | QT-02 |
| AC-03 | Tôi 3h24 | Mở màn | "Đạt 85% mục tiêu tuần (4h)", thanh 85% | QT-03 |
| AC-04 | Tôi đang live | Mở màn | Dòng đầu bảng "Tối nay · đang live", "● ĐANG LIVE" | — |
| AC-05 | — | Bấm Gửi bằng chứng phiên | Mở Gửi bằng chứng phiên live | — |
| AC-06 | Đăng nhập bằng streamer A | Mở màn | Chỉ thấy dữ liệu của A (cần xác nhận — CH-09) | — |

## 10. Ngoài phạm vi (KHÔNG làm)
- Sửa thông tin cá nhân, đổi @TikTok trên màn này (đổi tài khoản phải đăng ký lại — CN-06).

## 11. Câu hỏi mở
- CH-08, CH-09, CH-17, CH-32, CH-45.
