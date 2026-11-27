# Luật điểm & kết nối API

## 0. Thông tin tệp
| Mục | Nội dung |
|---|---|
| Mã chức năng | CN-12 |
| Phiên bản | 1.0 · 25/11/2026 |
| Phụ thuộc | 03-du-lieu.md › Luật điểm, Cấu hình kết nối, Phiên live (mục 5.4a đề xuất) |
| Trạng thái | Nháp |

## 1. Mục tiêu
- Admin xem luật tính điểm đang áp dụng, tình trạng kết nối với dịch vụ đọc phòng live, và bật / tắt các việc tự động.
- Cách ghi nhận theo giao diện: đây là nơi điều khiển **ghi nhận tự động** — tự mở / đóng phiên qua kiểm tra định kỳ, tự tính điểm nháp, tự duyệt (đang tắt). Dịch vụ cụ thể và độ tin cậy: CH-00.

## 2. Ai dùng
| Vai trò | Được làm gì ở chức năng này | Không được làm gì |
|---|---|---|
| Admin | Xem, bật / tắt tự động hóa, Lưu thay đổi | — |
| Vai trò khác | Không (suy ra) | Vào màn |

## 3. Đường vào màn
1. Menu "Luật điểm & API".
- Chân thanh bên luôn hiện tình trạng kết nối: chấm xanh + "<tên dịch vụ> đã kết nối · cập nhật <số> giây trước".

## 4. Màn hình
Ảnh / wireframe: chưa có (khối `scr-rules`). Mô tả: "Áp dụng cho mùa giải hiện tại · thay đổi luật chỉ nên thực hiện khi mở mùa mới".

| # | Tên ô / nút (đúng chữ trên màn) | Kiểu | Bắt buộc | Giới hạn & định dạng | Mặc định | Hành vi |
|---|---|---|---|---|---|---|
| 1 | Lưu thay đổi | Nút chính | — | — | — | Lưu; hiện M-01 |
| 2 | Khối "Luật tính điểm hiện hành" | Bảng 2 cột | — | 6 dòng ở mục 5 | — | Mẫu chỉ hiện chữ, không sửa được — CH-13 |
| 3 | Ghi chú ví dụ | Ghi chú | — | M-02 | — | — |
| 4 | Khối "Kết nối <tên dịch vụ>" + nhãn "● Đang kết nối" | Thẻ | — | Dòng "Gói Basic · 10.000 request/ngày · tối đa 20 phòng live cùng lúc" | — | — |
| 5 | Check khi chưa live | Chữ | — | "mỗi 5 phút" | — | — |
| 6 | Check khi đang live | Chữ | — | "mỗi 30 giây" | — | — |
| 7 | Request đã dùng hôm nay | Chữ | — | "4.812 / 10.000" | — | — |
| 8 | Lỗi API gần nhất | Chữ | — | "19/11 · tự hồi phục sau 5 phút" | — | — |
| 9 | Tự mở / đóng phiên | Công tắc | — | Chú thích "Phát hiện bắt đầu và kết thúc live qua polling" | Bật | — |
| 10 | Tự tính điểm nháp | Công tắc | — | Chú thích "Điểm chỉ chốt sau khi admin duyệt" | Bật | — |
| 11 | Tự duyệt phiên ≥ 30 phút | Công tắc | — | Chú thích "Đang tắt — toàn bộ phiên đều duyệt tay" | Tắt | Bật thì sao: CH-12 |

## 5. Quy tắc nghiệp vụ
| Mã | Quy tắc (một câu, kiểm được) |
|---|---|
| QT-01 | Phiên tối thiểu để tính điểm: **30 phút**. |
| QT-02 | Điểm mỗi phiên hợp lệ: **1 điểm**. |
| QT-03 | Xếp hạng khi bằng điểm: **Tổng giờ live cao hơn**. |
| QT-04 | Số phiên tối đa tính điểm / ngày: **Không giới hạn**. |
| QT-05 | Quà / diamond: **Không tính điểm**. |
| QT-06 | Phiên thiếu dữ liệu API: **Duyệt tay bằng bằng chứng**. |
| QT-07 | Thay đổi được lưu áp dụng từ phiên live tiếp theo. |
| QT-08 | "Thay đổi luật chỉ nên thực hiện khi mở mùa mới" — chỉ là khuyên hay chặn: CH-13. |

## 6. Trạng thái (nếu có)
- Kết nối: "● Đang kết nối". Các trạng thái khác (mất kết nối, hết lượt request) và cách báo: CH-11.

## 7. Dữ liệu đọc / ghi
- Đọc: Luật điểm, Cấu hình kết nối, số request, lỗi gần nhất.
- Ghi: công tắc tự động hóa; luật điểm (nếu cho sửa — CH-13).

## 8. Câu chữ hiển thị (chép NGUYÊN VĂN, AI không tự viết câu khác)
| Mã | Khi nào | Câu hiển thị |
|---|---|---|
| M-01 | Bấm Lưu thay đổi | "Đã lưu luật điểm và cấu hình kết nối — áp dụng từ phiên live tiếp theo." |
| M-02 | Ví dụ luật (mẫu) | "Đang áp dụng: Minh Dự 1 điểm · 3h43 xếp trên Thanh Anh 1 điểm · 3h24 — bằng điểm, hơn tổng giờ nên xếp trên." |

## 9. Tiêu chí nghiệm thu
| Mã | Cho trước | Khi | Thì | Quy tắc |
|---|---|---|---|---|
| AC-01 | Công tắc Tự duyệt đang tắt | Phiên 45 phút kết thúc | Phiên vào Duyệt phiên live, chưa có điểm chốt | QT-06 |
| AC-02 | Đổi công tắc | Bấm Lưu thay đổi | M-01; phiên sau dùng cấu hình mới | QT-07 |
| AC-03 | Tự mở / đóng phiên bật | Tài khoản bắt đầu live | Phiên tự mở trong vòng tối đa 5 phút (cần xác nhận — tần suất CH-00) | — |
| AC-04 | Đang live | Mỗi 30 giây | Có một điểm đo người xem (cần xác nhận — đề xuất mỗi phút) | — |

## 10. Ngoài phạm vi (KHÔNG làm)
- Đổi nhà cung cấp kết nối trên màn này (giao diện không có).
- Luật tính điểm theo quà / diamond.

## 11. Câu hỏi mở
- CH-00, CH-02, CH-11, CH-12, CH-13, CH-17.
