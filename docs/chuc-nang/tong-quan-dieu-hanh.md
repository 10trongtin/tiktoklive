# Tổng quan điều hành

## 0. Thông tin tệp
| Mục | Nội dung |
|---|---|
| Mã chức năng | CN-03 |
| Phiên bản | 1.0 · 25/11/2026 |
| Phụ thuộc | 03-du-lieu.md › Streamer, Team, Dự án, Phiên live, Luật điểm (mục tiêu tuần); CN-13 Báo cáo |
| Trạng thái | Nháp |

## 1. Mục tiêu
- Cho cấp điều hành (sếp) xem nhanh tình hình thi đua live trong tuần: bao nhiêu người đạt KPI, tổng giờ, ai chưa live, team / dự án nào live nhiều.
- Chỉ ra người cần chú ý.

## 2. Ai dùng
| Vai trò | Được làm gì ở chức năng này | Không được làm gì |
|---|---|---|
| Cấp điều hành (tên vai trò chưa rõ) | Xem, Xuất báo cáo tuần (suy ra) | Duyệt phiên (suy ra) |
| Admin | Xem, Xuất báo cáo tuần | — |
| Streamer / Trưởng team | chưa rõ (CH-09) | chưa rõ |

## 3. Đường vào màn
1. Menu thanh bên "Tổng quan điều hành" (nhóm Tổng quan), hoặc menu dưới "Tổng quan".
- Điều kiện: chưa rõ (CH-09).

## 4. Màn hình
Ảnh / wireframe: chưa có (khối `scr-boss`).

| # | Tên ô / nút (đúng chữ trên màn) | Kiểu | Bắt buộc | Giới hạn & định dạng | Mặc định | Hành vi |
|---|---|---|---|---|---|---|
| 1 | Tổng quan điều hành | Tiêu đề | — | — | — | — |
| 2 | "Tuần 16/11 – 22/11 · Cập nhật hôm nay lúc 09:41" | Chữ | — | Kỳ tuần hiện tại + giờ cập nhật | Tuần hiện tại | Không có ô chọn tuần khác |
| 3 | Xuất báo cáo tuần | Nút | — | — | — | Tải báo cáo (mẫu tải cùng tệp bảng xếp hạng tuần — CH-15) |
| 4 | Thẻ "Đạt KPI tuần (≥ 4h live)" | Chỉ số | — | "<số đạt> / <tổng>" + "<%> đội đạt · ▲ <%> tuần trước" | — | QT-01 |
| 5 | Thẻ "Tổng giờ live toàn đội" | Chỉ số | — | Thời lượng + "<số> streamer · <số> phiên hợp lệ" | — | QT-02 |
| 6 | Thẻ "Đang live lúc này" | Chỉ số đỏ | — | Số + "<số> người đang xem" | — | — |
| 7 | Thẻ "Chưa live phiên nào" | Chỉ số đỏ | — | Số + "Cần trưởng team nhắc trong hôm nay" | — | QT-03 |
| 8 | Khối "Tổng giờ live theo team" | Biểu đồ thanh ngang | — | Mỗi team: tên, thanh, thời lượng | — | Độ dài thanh theo tỉ lệ (cách quy đổi % chưa rõ — CH-49) |
| 9 | Dòng "Theo dự án: Central Park 18h20 · SkyZen 7h05 · High Park 3h15." | Chữ | — | — | — | Tổng giờ theo dự án |
| 10 | Khối "Cần chú ý tuần này" | Danh sách | — | 3 mục: "Live nhiều, view thấp:", "Bỏ live:", "Hiệu quả nhất:" | — | Cách chọn người cho từng mục: CH-50 |

## 5. Quy tắc nghiệp vụ
| Mã | Quy tắc (một câu, kiểm được) |
|---|---|
| QT-01 | Một streamer "đạt KPI tuần" khi tổng giờ live trong tuần ≥ 4h. Tổng giờ gồm phiên nào (đã duyệt / mọi phiên): CH-03. |
| QT-02 | "Tổng giờ live toàn đội" = cộng giờ live mọi streamer trong tuần; bằng tổng các team và bằng tổng các dự án (mẫu: 12h55 + 9h10 + 6h35 = 28h40). |
| QT-03 | "Chưa live phiên nào" = số streamer đang theo dõi không có phiên nào trong tuần. Phiên dưới 30 phút có tính là "đã live" không: CH-04. |
| QT-04 | Dữ liệu chỉ cho tuần hiện tại. |

## 6. Trạng thái (nếu có)
Không có.

## 7. Dữ liệu đọc / ghi
- Đọc: Streamer, Team, Dự án, Phiên live (thời lượng, peak, trạng thái), số người đang xem, mục tiêu tuần.
- Ghi: có thể ghi Lịch sử xuất báo cáo khi bấm Xuất báo cáo tuần (cần xác nhận — CH-15).

## 8. Câu chữ hiển thị (chép NGUYÊN VĂN, AI không tự viết câu khác)
| Mã | Khi nào | Câu hiển thị |
|---|---|---|
| M-01 | Thẻ chưa live | "Cần trưởng team nhắc trong hôm nay" |
| M-02 | Mục "Live nhiều, view thấp" (mẫu) | "Hoàng Nam Picity — 2h05 live nhưng peak chỉ 74. Nên hỗ trợ tiêu đề phiên và khung giờ vàng 19h–21h." |
| M-03 | Mục "Bỏ live" (mẫu) | "2 streamer chưa có phiên nào — trưởng team Picity 3 xác nhận lý do trước thứ 6." |
| M-04 | Mục "Hiệu quả nhất" (mẫu) | "Minh Dự Picity — 3h43, peak 312, đều đặn 3 phiên/tuần." |
| M-05 | Bấm Xuất báo cáo tuần (mẫu) | "Đã tải file bảng xếp hạng tuần (CSV mở bằng Excel)." |
> M-02 → M-04 là câu mẫu. Câu do hệ thống tự sinh hay người viết tay: CH-50.

## 9. Tiêu chí nghiệm thu
| Mã | Cho trước | Khi | Thì | Quy tắc |
|---|---|---|---|---|
| AC-01 | 17 streamer, 11 người có ≥ 4h trong tuần | Mở màn | Thẻ KPI hiện "11 / 17" và "65% đội đạt" | QT-01 |
| AC-02 | Một streamer đúng 4h00 | Mở màn | Được tính là đạt (≥) | QT-01 |
| AC-03 | Team 1 12h55, Team 2 9h10, Team 3 6h35 | Mở màn | Tổng giờ toàn đội 28h40 | QT-02 |
| AC-04 | 2 streamer không có phiên nào | Mở màn | Thẻ "Chưa live phiên nào" = 2 | QT-03 |
| AC-05 | — | Bấm Xuất báo cáo tuần | Tải tệp báo cáo tuần (nội dung cần xác nhận — CH-15) | — |
| AC-06 | Người không có quyền | Đăng nhập | Không thấy menu (cần xác nhận — CH-09) | — |

## 10. Ngoài phạm vi (KHÔNG làm)
- Chọn tuần cũ để xem lại: giao diện không có.
- Tính tiền thưởng trên màn này.

## 11. Câu hỏi mở
- CH-03, CH-04, CH-09, CH-15, CH-17 (số "11 / 17 đạt KPI" lệch dữ liệu bảng xếp hạng: người cao nhất 3h43 < 4h), CH-49, CH-50.
