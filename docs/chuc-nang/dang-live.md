# Đang Live

## 0. Thông tin tệp
| Mục | Nội dung |
|---|---|
| Mã chức năng | CN-02 |
| Phiên bản | 1.0 · 25/11/2026 |
| Phụ thuộc | 03-du-lieu.md › Phiên live, Cấu hình kết nối; CN-12 (tần suất kiểm tra) |
| Trạng thái | Nháp |

## 1. Mục tiêu
- Xem các phòng đang live ngay lúc này: ai live, tiêu đề, dự án, số người xem, đã live bao lâu.
- Mở nhanh phòng live trên TikTok.
- Cách ghi nhận theo giao diện: **tự động** — hệ thống tự phát hiện tài khoản TikTok đã đăng ký bắt đầu / kết thúc live (kiểm mỗi 5 phút khi chưa live, mỗi 30 giây khi đang live). Sale không phải bấm gì. Làm được bằng cách nào: CH-00.

## 2. Ai dùng
| Vai trò | Được làm gì ở chức năng này | Không được làm gì |
|---|---|---|
| Admin · Cấp điều hành · Streamer · Khách công khai | Mở công khai không cần đăng nhập; xem phòng đang phát, mở hộp Xem phòng live, mở Hồ sơ (Chi tiết streamer), mở TikTok | — |

## 3. Đường vào màn
1. Menu thanh bên "Đang Live" (có số đỏ = số phòng đang live), hoặc menu dưới "Đang Live".
2. Từ Bảng xếp hạng: nút "Vào phòng live".
- Hộp Xem phòng live mở từ: nút "Xem phòng live" trên thẻ, hoặc bấm người trong khối "Đang Live" ở Bảng xếp hạng.

## 4. Màn hình
Ảnh / wireframe: chưa có (khối `scr-live` và hộp `liveModal`).

### 4a. Màn Đang Live
| # | Tên ô / nút (đúng chữ trên màn) | Kiểu | Bắt buộc | Giới hạn & định dạng | Mặc định | Hành vi |
|---|---|---|---|---|---|---|
| 1 | Đang Live | Tiêu đề | — | — | — | — |
| 2 | "5 phòng đang phát · tự động làm mới mỗi 30 giây" | Chữ | — | Số phòng theo dữ liệu | — | — |
| 3 | "● LIVE · cập nhật vừa xong" | Nhãn đỏ | — | "vừa xong" (dưới 30 giây) hoặc "cách đây <số> giây" | vừa xong | Tự đếm lại |
| 4 | Thẻ "Tổng người đang xem" | Chỉ số | — | Số + "Cộng 5 phòng live" | — | Cộng người xem các phòng (QT-02) |
| 5 | Thẻ "Phòng đông nhất" | Chỉ số | — | Tên streamer + "<số> người xem · live <số> phút" | — | QT-03 |
| 6 | Thẻ "Phiên dài nhất hiện tại" | Chỉ số | — | "<số> phút" + "Đủ điều kiện tính điểm (≥ 30 phút)" | — | QT-04 |
| 7 | Thẻ phòng live (mỗi phòng một thẻ, lưới 3 cột) | Thẻ | — | Nhãn "● LIVE <số> phút"; ảnh; tiêu đề phiên; tên dự án đầy đủ; tên streamer; @TikTok; số + "người xem" | — | Thứ tự thẻ: CH-44 |
| 8 | Xem phòng live | Nút chính | — | — | — | Mở hộp 4b của phòng đó |
| 9 | Hồ sơ | Nút | — | — | — | Mở CN-04 Chi tiết streamer (của đúng streamer — cần xác nhận, mẫu không chọn sẵn) |

### 4b. Hộp Xem phòng live
| # | Tên ô / nút | Kiểu | Bắt buộc | Giới hạn & định dạng | Mặc định | Hành vi |
|---|---|---|---|---|---|---|
| 1 | ● LIVE | Nhãn | — | — | — | — |
| 2 | Ảnh, tên streamer | Chữ | — | — | — | — |
| 3 | Tiêu đề phiên · dự án | Chữ | — | "<tiêu đề> · <dự án>" | — | — |
| 4 | "<số> người xem · đã live <số> phút" | Chữ | — | — | — | — |
| 5 | Mở trên TikTok ↗ | Nút liên kết | — | — | — | Mở TikTok ở tab mới (link tới phòng live của streamer — cần xác nhận; mẫu trỏ trang chủ TikTok) |
| 6 | Đóng | Nút | — | — | — | Đóng hộp; bấm ra vùng tối ngoài hộp cũng đóng |

## 5. Quy tắc nghiệp vụ
| Mã | Quy tắc (một câu, kiểm được) |
|---|---|
| QT-01 | Màn tự làm mới mỗi 30 giây. |
| QT-02 | "Tổng người đang xem" = cộng số người xem của mọi phòng đang live. |
| QT-03 | "Phòng đông nhất" = phòng có số người xem lớn nhất lúc này. |
| QT-04 | "Phiên dài nhất hiện tại" = phòng đã live lâu nhất; nếu ≥ 30 phút hiện "Đủ điều kiện tính điểm (≥ 30 phút)". Câu khi dưới 30 phút: chưa có (CH-45). |
| QT-05 | Chỉ hiện streamer đang được theo dõi (đăng ký đã duyệt) — suy ra, cần xác nhận. |
| QT-06 | Số đếm trên menu "Đang Live" và ô "<số> đang live" ở đầu trang = số phòng đang live. |

## 6. Trạng thái (nếu có)
Không có (chỉ xem). Trạng thái phát lấy từ kết nối API.

## 7. Dữ liệu đọc / ghi
- Đọc: Phiên live đang mở (streamer, tiêu đề, dự án, số người xem, số phút đã live).
- Ghi: không có.

## 8. Câu chữ hiển thị (chép NGUYÊN VĂN, AI không tự viết câu khác)
| Mã | Khi nào | Câu hiển thị |
|---|---|---|
| M-01 | Dòng mô tả | "<số> phòng đang phát · tự động làm mới mỗi 30 giây" |
| M-02 | Thẻ phiên dài nhất ≥ 30 phút | "Đủ điều kiện tính điểm (≥ 30 phút)" |
| M-03 | Mốc cập nhật | "vừa xong" / "cách đây <số> giây" |

## 9. Tiêu chí nghiệm thu
| Mã | Cho trước | Khi | Thì | Quy tắc |
|---|---|---|---|---|
| AC-01 | 5 phòng: 214, 186, 142, 97, 58 người xem | Mở màn | "Tổng người đang xem" = 697 | QT-02 |
| AC-02 | Như AC-01 | Mở màn | "Phòng đông nhất" là phòng 214 người | QT-03 |
| AC-03 | Phòng lâu nhất 42 phút | Mở màn | Thẻ hiện "42 phút" và "Đủ điều kiện tính điểm (≥ 30 phút)" | QT-04 |
| AC-04 | Một streamer vừa tắt live | Sau ≤ 30 giây | Thẻ của người đó biến mất, số đếm giảm | QT-01 |
| AC-05 | — | Bấm Xem phòng live | Hộp hiện đúng tên, tiêu đề, người xem, số phút của phòng đó | — |
| AC-06 | Hộp đang mở | Bấm Đóng hoặc bấm ra ngoài | Hộp đóng | — |
| AC-07 | — | Bấm Mở trên TikTok ↗ | Mở tab mới | — |
| AC-08 | Không ai live | Mở màn | Hiện trạng thái rỗng (cần xác nhận — chưa có câu, CH-31) | — |

## 10. Ngoài phạm vi (KHÔNG làm)
- Phát video live ngay trong hệ thống: mẫu chỉ có khung giả + nút mở TikTok (cần xác nhận — CH-29).
- Bình luận, quà trong phòng live.

## 11. Câu hỏi mở
- CH-29 (nhúng video / link phòng), CH-31 (trạng thái rỗng), CH-44 (thứ tự thẻ), CH-45 (câu khi phiên dài nhất < 30 phút).
