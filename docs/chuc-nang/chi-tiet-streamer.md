# Chi tiết streamer

## 0. Thông tin tệp
| Mục | Nội dung |
|---|---|
| Mã chức năng | CN-04 |
| Phiên bản | 1.0 · 25/11/2026 |
| Phụ thuộc | 03-du-lieu.md › Streamer, Phiên live, Điểm; CN-08 Duyệt phiên live |
| Trạng thái | Nháp |

## 1. Mục tiêu
- Xem hồ sơ một streamer và lịch sử phiên live trong mùa giải hiện tại: điểm, tổng giờ, peak, tỉ lệ phiên hợp lệ, biểu đồ người xem phiên gần nhất.

## 2. Ai dùng
| Vai trò | Được làm gì ở chức năng này | Không được làm gì |
|---|---|---|
| Admin | Chọn bất kỳ streamer, xem, đi tới phiên chờ duyệt, mở TikTok | — |
| Cấp điều hành · Streamer · Khách công khai | Mở công khai không cần đăng nhập; chọn xem minh bạch hồ sơ, lịch sử phiên và biểu đồ người xem của bất kỳ streamer nào, mở TikTok (không hiển thị SĐT/email) | Xem phiên chờ duyệt |

## 3. Đường vào màn
1. Menu thanh bên "Chi tiết streamer" (nhóm Streamer).
2. Nút "Hồ sơ" ở thẻ Đang Live; nút "Chi tiết" ở Quản lý streamer.
- Vào từ "Hồ sơ" / "Chi tiết" thì mở đúng streamer đó (cần xác nhận — mẫu luôn mở người đầu danh sách).

## 4. Màn hình
Ảnh / wireframe: chưa có (khối `scr-detail`).

| # | Tên ô / nút (đúng chữ trên màn) | Kiểu | Bắt buộc | Giới hạn & định dạng | Mặc định | Hành vi |
|---|---|---|---|---|---|---|
| 1 | Chi tiết streamer | Tiêu đề | — | Mô tả: "Hồ sơ và lịch sử phiên live trong mùa giải hiện tại" | — | — |
| 2 | Chọn streamer | Danh sách chọn | — | Mỗi dòng "<tên> — @<TikTok>" | Người đầu danh sách | Đổi → cập nhật tên, ảnh, dòng thông tin, Điểm, Tổng giờ, Peak. Danh sách gồm ai: CH-28 |
| 3 | Ảnh chữ viết tắt + tên | Chữ | — | — | — | — |
| 4 | Nhãn "Hạng 1 · Tuần này" | Nhãn vàng | — | "Hạng <số> · Tuần này" | — | Mẫu không đổi khi đổi người (cần làm theo người được chọn — cần xác nhận) |
| 5 | Nhãn "Đã duyệt" | Nhãn xanh | — | Trạng thái đăng ký | — | — |
| 6 | Dòng thông tin | Chữ | — | "@<TikTok> · <Team> · <Dự án> · Tham gia từ tuần <số>" | — | — |
| 7 | Xem phiên chờ duyệt | Nút | — | — | — | Mở CN-08 (lọc theo streamer này hay không: CH-40) |
| 8 | Mở TikTok ↗ | Nút liên kết | — | — | — | Mở TikTok tab mới |
| 9 | Thẻ "Điểm tuần này" | Chỉ số | — | Số + "<số> phiên đã duyệt" | — | — |
| 10 | Thẻ "Tổng giờ live" | Chỉ số | — | Thời lượng + dòng phụ (mẫu "Cao nhất đội tuần này") | — | Kỳ tính (tuần / mùa): CH-51 |
| 11 | Thẻ "Peak viewers" | Chỉ số | — | Số + "Phiên tối 18/11" | — | Lấy phiên có peak cao nhất |
| 12 | Thẻ "Tỉ lệ phiên hợp lệ" | Chỉ số | — | "<%>" + "<số duyệt> / <tổng> phiên được duyệt" | — | QT-02 |
| 13 | Biểu đồ "Người xem theo thời gian — phiên gần nhất" | Biểu đồ đường | — | Dòng phụ "Phiên 19:02 – 22:45 · snapshot mỗi 30 giây từ API"; điểm cao nhất ghi "Peak <số>"; trục giờ | — | QT-03 |
| 14 | Bảng "Lịch sử phiên live": Ngày · Tiêu đề phiên · Thời lượng · Peak · Trạng thái | Bảng | — | Ngày "dd/mm · HH:mm"; Trạng thái: "Đã duyệt · +1đ", "Đã duyệt", "Từ chối · < 30 phút" | — | Thứ tự: mới nhất trên (theo mẫu) |

## 5. Quy tắc nghiệp vụ
| Mã | Quy tắc (một câu, kiểm được) |
|---|---|
| QT-01 | Chỉ hiện dữ liệu của mùa giải hiện tại. |
| QT-02 | Tỉ lệ phiên hợp lệ = số phiên được duyệt / tổng số phiên, ghi %. Phiên chờ duyệt có nằm trong mẫu số không: CH-51. |
| QT-03 | Biểu đồ lấy số người xem đo mỗi 30 giây của phiên gần nhất. |
| QT-04 | Phiên dưới 30 phút hiện trạng thái "Từ chối · < 30 phút". |

## 6. Trạng thái (nếu có)
Không có thao tác đổi trạng thái ở màn này.

## 7. Dữ liệu đọc / ghi
- Đọc: Streamer, Đăng ký (trạng thái), Phiên live (lịch sử, điểm đo người xem), Điểm, hạng tuần.
- Ghi: không có.

## 8. Câu chữ hiển thị (chép NGUYÊN VĂN, AI không tự viết câu khác)
| Mã | Khi nào | Câu hiển thị |
|---|---|---|
| M-01 | Mô tả màn | "Hồ sơ và lịch sử phiên live trong mùa giải hiện tại" |
| M-02 | Dòng phụ biểu đồ | "Phiên <giờ bắt đầu> – <giờ kết thúc> · snapshot mỗi 30 giây từ API" |
| M-03 | Thẻ tỉ lệ | "<số> / <số> phiên được duyệt" |

## 9. Tiêu chí nghiệm thu
| Mã | Cho trước | Khi | Thì | Quy tắc |
|---|---|---|---|---|
| AC-01 | Đang xem Minh Dự | Chọn "Gia Trung Picity — @giatrungpicity" | Tên, ảnh, dòng thông tin, Điểm, Tổng giờ, Peak đổi theo Gia Trung | — |
| AC-02 | 4 phiên, 4 được duyệt | Mở màn | "100%" và "4 / 4 phiên được duyệt" | QT-02 |
| AC-03 | Phiên 0h24 | Mở màn | Lịch sử hiện "Từ chối · < 30 phút" | QT-04 |
| AC-04 | Phiên gần nhất peak 312 | Mở màn | Biểu đồ đánh dấu "Peak 312" | QT-03 |
| AC-05 | Vào từ nút Hồ sơ của Ngọc Trâm | Mở màn | Hiện Ngọc Trâm (cần xác nhận) | — |
| AC-06 | — | Bấm Xem phiên chờ duyệt | Mở Duyệt phiên live | — |

## 10. Ngoài phạm vi (KHÔNG làm)
- Sửa hồ sơ streamer trên màn này.
- Xem mùa giải cũ.

## 11. Câu hỏi mở
- CH-28, CH-32 (dữ liệu mẫu lệch: 4/4 hợp lệ nhưng lịch sử có phiên từ chối; Điểm 1 nhưng có 2 phiên đã duyệt ≥ 30 phút), CH-40, CH-51.
