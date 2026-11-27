# Quản lý streamer · team · dự án

## 0. Thông tin tệp
| Mục | Nội dung |
|---|---|
| Mã chức năng | CN-10 |
| Phiên bản | 1.0 · 25/11/2026 |
| Phụ thuộc | 03-du-lieu.md › Streamer, Team, Dự án; CN-04 |
| Trạng thái | Nháp |

## 1. Mục tiêu
- Admin xem danh sách streamer đang theo dõi, giờ live tuần, trạng thái; lọc nhanh; nhắc người chưa live.

## 2. Ai dùng
| Vai trò | Được làm gì ở chức năng này | Không được làm gì |
|---|---|---|
| Admin | Xem, lọc, Chi tiết, Nhắc live | — |
| Vai trò khác | chưa rõ (CH-09) | — |

## 3. Đường vào màn
1. Menu "Quản lý streamer".
2. Gõ ô tìm kiếm đầu trang rồi Enter → mở màn này, đã lọc.

## 4. Màn hình
Ảnh / wireframe: chưa có (khối `scr-manage`). Mô tả: "<số> streamer đang được theo dõi · <số> team · <số> dự án".

| # | Tên ô / nút (đúng chữ trên màn) | Kiểu | Bắt buộc | Giới hạn & định dạng | Mặc định | Hành vi |
|---|---|---|---|---|---|---|
| 1 | Ô lọc "Lọc theo tên / @TikTok…" | Ô tìm | — | — | Trống | Gõ tới đâu lọc tới đó, không phân biệt hoa thường, khớp mọi chữ trong dòng |
| 2 | Thẻ "Streamer đang hoạt động" | Chỉ số | — | Số + "3 team · 3 dự án Picity" | — | — |
| 3 | Thẻ "Team" | Chỉ số | — | "Picity 1 · Picity 2 · Picity 3" + "6 · 6 · 5 thành viên" | — | — |
| 4 | Thẻ "Dự án" | Chỉ số | — | "Central Park · SkyZen · High Park" + "9 · 5 · 3 streamer phụ trách" | — | — |
| 5 | Bảng: Streamer · Team · Dự án · Giờ tuần · Trạng thái · Thao tác | Bảng | — | Trạng thái: "Đang theo dõi" / "● Đang live" / "Chưa live tuần này" | — | — |
| 6 | Chi tiết | Nút nhỏ | — | Dòng chưa có trạng thái "Chưa live tuần này" | — | Mở CN-04 |
| 7 | Nhắc live | Nút nhỏ | — | Dòng "Chưa live tuần này" thay cho Chi tiết | — | Mẫu chưa có hành vi — CH-14 |

## 5. Quy tắc nghiệp vụ
| Mã | Quy tắc (một câu, kiểm được) |
|---|---|
| QT-01 | "Chưa live tuần này" khi tuần hiện tại chưa có phiên nào; "● Đang live" khi đang live; còn lại "Đang theo dõi". (Mẫu: người đang live khác vẫn ghi "Đang theo dõi" — CH-32.) |
| QT-02 | "Giờ tuần" = tổng giờ live tuần hiện tại (gồm phiên nào: CH-03). |

## 6. Trạng thái (nếu có)
Không có thao tác đổi trạng thái. Ngừng theo dõi / xóa streamer: CH-25.

## 7. Dữ liệu đọc / ghi
- Đọc: Streamer, Team, Dự án, Phiên live tuần.
- Ghi: nhắc live (nếu có — CH-14).

## 8. Câu chữ hiển thị (chép NGUYÊN VĂN, AI không tự viết câu khác)
| Mã | Khi nào | Câu hiển thị |
|---|---|---|
| M-01 | Tìm từ đầu trang | "Kết quả tìm “<chữ>” trong Quản lý streamer." |

## 9. Tiêu chí nghiệm thu
| Mã | Cho trước | Khi | Thì | Quy tắc |
|---|---|---|---|---|
| AC-01 | Danh sách 6 dòng | Gõ "skyzen" vào ô lọc | Chỉ còn dòng có SkyZen | — |
| AC-02 | Ở màn khác | Gõ "@minhdu" ở ô đầu trang, Enter | Mở màn này, ô lọc có "@minhdu", hiện M-01 | — |
| AC-03 | Streamer không có phiên tuần này | Mở màn | "Chưa live tuần này" và nút Nhắc live | QT-01 |
| AC-04 | — | Bấm Chi tiết | Mở Chi tiết streamer của đúng người (cần xác nhận) | — |

## 10. Ngoài phạm vi (KHÔNG làm)
- Thêm / sửa / xóa streamer, team, dự án: giao diện không có (CH-25).

## 11. Câu hỏi mở
- CH-03, CH-09, CH-14, CH-25, CH-32.
