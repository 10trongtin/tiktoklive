# Báo cáo

## 0. Thông tin tệp
| Mục | Nội dung |
|---|---|
| Mã chức năng | CN-13 |
| Phiên bản | 1.0 · 25/11/2026 |
| Phụ thuộc | 03-du-lieu.md › Phiên live, Điểm, Lịch sử xuất báo cáo |
| Trạng thái | Nháp |

## 1. Mục tiêu
- Xuất Excel theo tuần, tháng hoặc theo từng streamer. "Bảng điểm chốt tháng" là căn cứ tính thưởng.

## 2. Ai dùng
| Vai trò | Được làm gì ở chức năng này | Không được làm gì |
|---|---|---|
| Admin | Tải mọi báo cáo, tải lại | — |
| Cấp điều hành | chưa rõ (CH-09) | — |

## 3. Đường vào màn
1. Menu "Báo cáo".

## 4. Màn hình
Ảnh / wireframe: chưa có (khối `scr-report`).

| # | Tên ô / nút (đúng chữ trên màn) | Kiểu | Bắt buộc | Giới hạn & định dạng | Mặc định | Hành vi |
|---|---|---|---|---|---|---|
| 1 | Tải báo cáo tuần này | Nút | — | — | — | Tải báo cáo tuần hiện tại |
| 2 | Thẻ "Báo cáo tuần" + Tải xuống (.xlsx) | Thẻ + nút | — | Mô tả: "Ai đạt KPI, ai chưa live, team nào dẫn đầu — tuần 16/11 – 22/11." | — | Tải |
| 3 | Thẻ "Chi tiết phiên theo streamer" + Tải xuống (.xlsx) | Thẻ + nút | — | "Từng phiên: giờ bắt đầu, thời lượng, peak view, trạng thái duyệt." | — | Chọn streamer / team / kỳ ở đâu: CH-15 |
| 4 | Thẻ "Bảng điểm chốt tháng" + Tải xuống (.xlsx) | Thẻ + nút | — | "Căn cứ tính thưởng — chỉ gồm phiên đã duyệt, kèm người duyệt và giờ duyệt." | — | Chọn tháng ở đâu: CH-15 |
| 5 | Bảng "Lịch sử xuất báo cáo": Báo cáo · Kỳ · Người xuất · Xuất lúc · Thao tác | Bảng | — | — | — | — |
| 6 | Tải lại | Nút nhỏ | — | — | — | Tải lại đúng tệp đã xuất (cần xác nhận) |
| 7 | Chú thích "Báo cáo tuần tự động sẵn sàng vào 07:00 mỗi sáng thứ 2." | Chữ | — | — | — | CH-16 |

## 5. Quy tắc nghiệp vụ
| Mã | Quy tắc (một câu, kiểm được) |
|---|---|
| QT-01 | Bảng điểm chốt tháng chỉ gồm phiên đã duyệt, kèm người duyệt và giờ duyệt. |
| QT-02 | Mỗi lần xuất ghi một dòng vào Lịch sử xuất báo cáo (suy ra từ bảng). |
| QT-03 | Báo cáo tuần tự sẵn sàng lúc 07:00 sáng thứ 2. |
| QT-04 | Định dạng tệp: nút ghi .xlsx; mẫu tải CSV và mọi nút tải cùng một tệp bảng xếp hạng tuần — CH-15. |

## 6. Trạng thái (nếu có)
Không có.

## 7. Dữ liệu đọc / ghi
- Đọc: Phiên live, Điểm, Streamer, Team, Dự án.
- Ghi: Lịch sử xuất báo cáo (báo cáo, kỳ, người xuất, thời điểm).

## 8. Câu chữ hiển thị (chép NGUYÊN VĂN, AI không tự viết câu khác)
| Mã | Khi nào | Câu hiển thị |
|---|---|---|
| M-01 | Tải xong (mẫu) | "Đã tải file bảng xếp hạng tuần (CSV mở bằng Excel)." |

## 9. Tiêu chí nghiệm thu
| Mã | Cho trước | Khi | Thì | Quy tắc |
|---|---|---|---|---|
| AC-01 | Tháng có phiên đã duyệt và phiên chờ duyệt | Tải Bảng điểm chốt tháng | Chỉ có phiên đã duyệt, có người duyệt và giờ duyệt | QT-01 |
| AC-02 | — | Tải một báo cáo | Lịch sử có thêm dòng với người xuất, thời điểm | QT-02 |
| AC-03 | Thứ 2, 07:00 | — | Báo cáo tuần trước sẵn sàng (cách nhận cần xác nhận — CH-16) | QT-03 |

## 10. Ngoài phạm vi (KHÔNG làm)
- Tính tiền thưởng trong hệ thống (giao diện chỉ ghi "Căn cứ tính thưởng" — CH-46).

## 11. Câu hỏi mở
- CH-09, CH-15, CH-16, CH-46.
