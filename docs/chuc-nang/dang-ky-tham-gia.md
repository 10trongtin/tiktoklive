# Đăng ký tham gia

## 0. Thông tin tệp
| Mục | Nội dung |
|---|---|
| Mã chức năng | CN-06 |
| Phiên bản | 1.0 · 25/11/2026 |
| Phụ thuộc | 03-du-lieu.md › Đăng ký tham gia, Streamer, Team, Dự án; CN-09 Duyệt đăng ký |
| Trạng thái | Nháp |

## 1. Mục tiêu
- Sale đăng ký tài khoản TikTok một lần cho cả mùa để hệ thống theo dõi live.
- Cách ghi nhận theo giao diện: sale khai **@username** (không phải link). Sau khi admin duyệt, hệ thống tự theo dõi tài khoản đó. Khách nói "sale sẽ đăng ký link cá nhân" — lệch với giao diện, xem CH-00, CH-52.

## 2. Ai dùng
| Vai trò | Được làm gì ở chức năng này | Không được làm gì |
|---|---|---|
| Streamer (người mới) | Điền, gửi, nhập lại | Tự duyệt |
| Admin | chưa rõ (đăng ký hộ?) — CH-10 | — |

## 3. Đường vào màn
1. Menu thanh bên "Đăng ký tham gia" (nhóm Streamer).
- Người chưa có tài khoản vào màn bằng cách nào: CH-10.

## 4. Màn hình
Ảnh / wireframe: chưa có (khối `scr-register`). Mô tả màn: "1 tài khoản TikTok cho cả mùa giải · điểm chỉ tính từ khi đăng ký được duyệt".

| # | Tên ô / nút (đúng chữ trên màn) | Kiểu | Bắt buộc | Giới hạn & định dạng | Mặc định | Hành vi |
|---|---|---|---|---|---|---|
| 1 | Họ và tên * | Ô nhập | Có | Gợi ý "Ví dụ: Minh Dự"; độ dài: CH-22 | Trống | — |
| 2 | Số điện thoại / Zalo * | Ô nhập số | Có | Gợi ý "09xx xxx xxx"; kiểm định dạng: CH-22 | Trống | — |
| 3 | Tài khoản TikTok * | Ô nhập | Có | Gợi ý "Ví dụ: @minhdupicity — không đổi giữa mùa"; chú thích "Hệ thống chỉ theo dõi đúng @username này." | Trống | Trùng tài khoản đã đăng ký: CH-22 |
| 4 | Email công việc | Ô nhập email | Không | Gợi ý "ten@picity.com.vn" | Trống | — |
| 5 | Team * | Danh sách chọn | Có | Team Picity 1 · Team Picity 2 · Team Picity 3 | Team Picity 1 | — |
| 6 | Dự án phụ trách * | Danh sách chọn | Có | Picity Central Park · Picity SkyZen · Picity High Park | Picity Central Park | — |
| 7 | Ô cam kết | Ô đánh dấu | Có | Chữ M-01 | Chưa đánh | Chưa đánh thì không gửi được |
| 8 | Gửi đăng ký | Nút chính | — | — | — | Đủ ô bắt buộc → lưu, trạng thái Chờ duyệt, hiện M-02 và M-03 |
| 9 | Nhập lại | Nút | — | — | — | Xóa trắng các ô |
| 10 | Khối "Quy trình 3 bước" | Chữ | — | M-04 | — | — |
| 11 | Ghi chú "Lưu ý:" | Chữ | — | M-05 | — | — |

## 5. Quy tắc nghiệp vụ
| Mã | Quy tắc (một câu, kiểm được) |
|---|---|
| QT-01 | Mỗi người đăng ký 1 tài khoản TikTok cho cả mùa giải. |
| QT-02 | Điểm chỉ tính từ thời điểm đăng ký được duyệt. |
| QT-03 | Đổi @username giữa mùa phải đăng ký lại và được duyệt lại; phiên ở tài khoản cũ dừng tính từ lúc đổi. |
| QT-04 | Thiếu ô có dấu * hoặc chưa đánh dấu cam kết thì không gửi được. Câu báo lỗi: chưa có (CH-22). |

## 6. Trạng thái (nếu có)
| Từ | Sang | Ai / sự kiện | Điều kiện | Hệ quả (dữ liệu, thông báo) |
|---|---|---|---|---|
| (chưa có) | Chờ duyệt | Streamer bấm Gửi đăng ký | Đủ ô bắt buộc | Hiện M-02, M-03; tăng số trên menu Duyệt đăng ký |
| Chờ duyệt | Đã duyệt / Từ chối | Admin (CN-09) | — | Xem CN-09 |

## 7. Dữ liệu đọc / ghi
- Đọc: danh sách Team, Dự án.
- Ghi: Đăng ký tham gia (mọi ô + thời điểm gửi + trạng thái Chờ duyệt).

## 8. Câu chữ hiển thị (chép NGUYÊN VĂN, AI không tự viết câu khác)
| Mã | Khi nào | Câu hiển thị |
|---|---|---|
| M-01 | Ô cam kết | "Tôi cam kết live bằng đúng tài khoản đã đăng ký, có mặt thật trong phiên live, và chấp nhận luật điểm của mùa giải (phiên dưới 30 phút không tính điểm)." |
| M-02 | Gửi thành công (khung xanh) | "Đã gửi — trạng thái: Chờ duyệt. Admin sẽ kiểm tra @TikTok của bạn trong giờ làm việc. Bạn nhận thông báo qua Zalo khi được duyệt." |
| M-03 | Gửi thành công (thông báo nổi) | "Đã gửi đăng ký — trạng thái: Chờ duyệt." |
| M-04 | Quy trình 3 bước | "Gửi đăng ký — điền form này 1 lần duy nhất cho cả mùa." · "Admin duyệt — kiểm tra @TikTok đúng người, đúng team." · "Bắt đầu live — hệ thống tự nhận diện phiên và tính điểm nháp, admin duyệt là chốt lên bảng." |
| M-05 | Lưu ý | "Lưu ý: đổi @username giữa mùa phải đăng ký lại và được duyệt lại. Các phiên ở tài khoản cũ dừng tính từ thời điểm đổi." |

## 9. Tiêu chí nghiệm thu
| Mã | Cho trước | Khi | Thì | Quy tắc |
|---|---|---|---|---|
| AC-01 | Điền đủ ô *, đánh dấu cam kết | Bấm Gửi đăng ký | Hiện M-02, M-03; đăng ký ở trạng thái Chờ duyệt | — |
| AC-02 | Bỏ trống Tài khoản TikTok | Bấm Gửi đăng ký | Không gửi; báo thiếu ô (câu cần xác nhận) | QT-04 |
| AC-03 | Chưa đánh dấu cam kết | Bấm Gửi đăng ký | Không gửi | QT-04 |
| AC-04 | Bỏ trống Email công việc | Bấm Gửi đăng ký | Vẫn gửi được | — |
| AC-05 | Đã điền | Bấm Nhập lại | Các ô trở về trống / mặc định | — |
| AC-06 | Bấm Gửi đăng ký 2 lần liên tiếp | — | Chỉ tạo 1 đăng ký (cần xác nhận) | QT-01 |
| AC-07 | @username đã có người đăng ký | Gửi | Bị chặn (cần xác nhận — CH-22) | QT-01 |

## 10. Ngoài phạm vi (KHÔNG làm)
- Tham gia bằng quét mã QR kết bạn trong TikTok (có ở ảnh tham khảo, không có trong HTML — CH-52).
- Gửi Zalo khi chưa chốt kênh (CH-14).

## 11. Câu hỏi mở
- CH-00, CH-10, CH-14, CH-20, CH-21, CH-22, CH-52.
