# Mùa giải

## 0. Thông tin tệp
| Mục | Nội dung |
|---|---|
| Mã chức năng | CN-11 |
| Phiên bản | 1.0 · 25/11/2026 |
| Phụ thuộc | 03-du-lieu.md › Mùa giải, Phiên live, Điểm; CN-12 |
| Trạng thái | Nháp |

## 1. Mục tiêu
- Admin xem mùa đang chạy, các mùa đã khóa, và tạo mùa mới. "Mùa đã đóng sẽ khóa bảng — điểm đã chốt không sửa được".

## 2. Ai dùng
| Vai trò | Được làm gì ở chức năng này | Không được làm gì |
|---|---|---|
| Admin | Xem, tạo mùa giải mới | — |
| Vai trò khác | chưa rõ (CH-09) | Tạo mùa (suy ra) |

## 3. Đường vào màn
1. Menu "Mùa giải".

## 4. Màn hình
Ảnh / wireframe: chưa có (khối `scr-season`).

| # | Tên ô / nút (đúng chữ trên màn) | Kiểu | Bắt buộc | Giới hạn & định dạng | Mặc định | Hành vi |
|---|---|---|---|---|---|---|
| 1 | + Tạo mùa giải mới | Nút chính | — | — | — | Bấm lần 1 hiện khung tạo mới; bấm lần 2 ẩn |
| 2 | Khung mùa hiện tại: tên (vd "Tuần 16/11 – 22/11") | Thẻ viền vàng | — | — | — | — |
| 3 | Nhãn "Đang diễn ra · còn <số> ngày" | Nhãn xanh | — | — | — | — |
| 4 | Nhãn "Luật: ≥ 30 phút = 1 điểm" | Nhãn vàng | — | Theo luật hiện hành | — | — |
| 5 | Streamer · Phiên đã chốt · Đang dẫn đầu | 3 số liệu | — | "17" · "31 phiên · 28h40" · tên | — | — |
| 6 | Tiến độ tuần "Ngày <n> / 7" | Thanh tiến độ | — | % = n/7 | — | — |
| 7 | Bảng: Mùa giải · Thời gian · Streamer · Người dẫn đầu · Trạng thái | Bảng | — | Trạng thái "Đang diễn ra" / "Đã khóa bảng" | — | — |
| 8 | Khung "Tạo mùa giải mới": Tên mùa giải | Ô nhập | chưa rõ (CH-23) | Gợi ý "Tuần 23/11 – 29/11" | Trống | — |
| 9 | Ngày bắt đầu | Chọn ngày | chưa rõ | — | Trống | — |
| 10 | Ngày kết thúc | Chọn ngày | chưa rõ | — | Trống | — |
| 11 | Tạo mùa giải | Nút chính | — | — | — | Lưu, ẩn khung, hiện M-01 |

## 5. Quy tắc nghiệp vụ
| Mã | Quy tắc (một câu, kiểm được) |
|---|---|
| QT-01 | Mùa mới bắt đầu theo ngày đã chọn. |
| QT-02 | Mùa đã đóng thì khóa bảng; điểm đã chốt không sửa được. Ai / khi nào đóng mùa: CH-23. |
| QT-03 | Quan hệ mùa – tuần – tháng (bảng có cả "Tháng 11/2026" và các "Tuần"): CH-01. |

## 6. Trạng thái (nếu có)
| Từ | Sang | Ai / sự kiện | Điều kiện | Hệ quả (dữ liệu, thông báo) |
|---|---|---|---|---|
| (mới tạo) | Đang diễn ra | Tới ngày bắt đầu (suy ra) | — | — |
| Đang diễn ra | Đã khóa bảng | chưa rõ (tự động khi hết ngày hay admin bấm — CH-23) | — | Điểm không sửa được |
- Trạng thái mùa đã tạo nhưng chưa tới ngày bắt đầu: không có nhãn — CH-23.

## 7. Dữ liệu đọc / ghi
- Đọc: Mùa giải, số liệu tổng hợp.
- Ghi: Mùa giải (tên, ngày bắt đầu, ngày kết thúc).

## 8. Câu chữ hiển thị (chép NGUYÊN VĂN, AI không tự viết câu khác)
| Mã | Khi nào | Câu hiển thị |
|---|---|---|
| M-01 | Tạo xong | "Đã tạo mùa giải mới — mùa sẽ bắt đầu theo ngày bạn đã chọn." |

## 9. Tiêu chí nghiệm thu
| Mã | Cho trước | Khi | Thì | Quy tắc |
|---|---|---|---|---|
| AC-01 | — | Bấm + Tạo mùa giải mới | Hiện khung tạo mới | — |
| AC-02 | Điền tên, 2 ngày | Bấm Tạo mùa giải | Khung ẩn, M-01, mùa có trong bảng | QT-01 |
| AC-03 | Ngày kết thúc trước ngày bắt đầu | Bấm Tạo mùa giải | Bị chặn (cần xác nhận) | — |
| AC-04 | Mùa Đã khóa bảng | Thử duyệt / từ chối phiên thuộc mùa đó | Không được (cần xác nhận) | QT-02 |

## 10. Ngoài phạm vi (KHÔNG làm)
- Sửa, xóa mùa giải (giao diện không có).

## 11. Câu hỏi mở
- CH-01, CH-23, CH-24.
