# Duyệt đăng ký

## 0. Thông tin tệp
| Mục | Nội dung |
|---|---|
| Mã chức năng | CN-09 |
| Phiên bản | 1.0 · 25/11/2026 |
| Phụ thuộc | 03-du-lieu.md › Đăng ký tham gia, Streamer; CN-06 |
| Trạng thái | Nháp |

## 1. Mục tiêu
- Admin kiểm tra @TikTok đúng người, đúng team rồi duyệt hoặc từ chối đăng ký. Tài khoản được duyệt vào danh sách theo dõi ngay.

## 2. Ai dùng
| Vai trò | Được làm gì ở chức năng này | Không được làm gì |
|---|---|---|
| Admin | Xem, Duyệt, Từ chối | — |
| Vai trò khác | chưa rõ (CH-07) | — |

## 3. Đường vào màn
1. Menu "Duyệt đăng ký" (có số đăng ký chờ).

## 4. Màn hình
Ảnh / wireframe: chưa có (khối `scr-regapprove`). Mô tả màn: "<số> đăng ký đang chờ · tài khoản được duyệt sẽ vào danh sách theo dõi ngay".

| # | Tên ô / nút (đúng chữ trên màn) | Kiểu | Bắt buộc | Giới hạn & định dạng | Mặc định | Hành vi |
|---|---|---|---|---|---|---|
| 1 | Cột "Người đăng ký" | Cột | — | Ảnh, họ tên, SĐT che giữa "0932 ••• 118" | — | — |
| 2 | Cột "@TikTok" | Cột | — | — | — | Mở trang TikTok để kiểm tra: không có (CH-53) |
| 3 | Cột "Team", "Dự án" | Cột | — | Tên đầy đủ | — | — |
| 4 | Cột "Gửi lúc" | Cột | — | "Hôm nay 09:12" / "Hôm qua 17:20" | — | — |
| 5 | Duyệt | Nút chính nhỏ | — | — | — | Dòng mờ đi, khóa 2 nút, M-01 |
| 6 | Từ chối | Nút đỏ nhỏ | — | — | — | Dòng mờ đi, khóa 2 nút, M-02 |
| 7 | Chú thích dưới bảng | Chữ | — | M-03 | — | — |

## 5. Quy tắc nghiệp vụ
| Mã | Quy tắc (một câu, kiểm được) |
|---|---|
| QT-01 | Duyệt → streamer vào danh sách theo dõi; bắt đầu ghi nhận phiên từ thời điểm duyệt. |
| QT-02 | Duyệt → gửi thông báo Zalo cho người đăng ký (theo câu ở CN-06; cách gửi CH-14). |
| QT-03 | Đã xử lý thì 2 nút bị khóa, không bấm lại được. |
| QT-04 | Từ chối: lý do, báo cho người đăng ký, được gửi lại không — CH-06. |

## 6. Trạng thái (nếu có)
| Từ | Sang | Ai / sự kiện | Điều kiện | Hệ quả (dữ liệu, thông báo) |
|---|---|---|---|---|
| Chờ duyệt | Đã duyệt | Admin bấm Duyệt | Đang Chờ duyệt | Tạo / kích hoạt Streamer "Đang theo dõi"; Zalo; giảm số menu |
| Chờ duyệt | (Từ chối) | Admin bấm Từ chối | Đang Chờ duyệt | Giảm số menu; báo người đăng ký: CH-06 |

## 7. Dữ liệu đọc / ghi
- Đọc: Đăng ký ở trạng thái Chờ duyệt.
- Ghi: trạng thái đăng ký, thời điểm duyệt, người duyệt (suy ra); Streamer.

## 8. Câu chữ hiển thị (chép NGUYÊN VĂN, AI không tự viết câu khác)
| Mã | Khi nào | Câu hiển thị |
|---|---|---|
| M-01 | Duyệt | "Đã duyệt <họ tên> — tài khoản đã vào danh sách theo dõi." |
| M-02 | Từ chối | "Đã từ chối đăng ký của <họ tên>." |
| M-03 | Chú thích | "Tài khoản được duyệt bắt đầu được ghi nhận phiên live kể từ thời điểm duyệt." |

## 9. Tiêu chí nghiệm thu
| Mã | Cho trước | Khi | Thì | Quy tắc |
|---|---|---|---|---|
| AC-01 | Đăng ký Chờ duyệt | Bấm Duyệt | M-01; dòng mờ, nút khóa; streamer có ở Quản lý streamer | QT-01, QT-03 |
| AC-02 | Như trên | Bấm Từ chối | M-02; dòng mờ, nút khóa | QT-03 |
| AC-03 | Duyệt lúc 10:00, người đó live từ 09:00 đến 11:00 | Phiên kết thúc | Cách tính phần trước 10:00 cần xác nhận (CH-41) | QT-01 |
| AC-04 | 3 đăng ký chờ | Duyệt 1 | Số trên menu còn 2 | — |

## 10. Ngoài phạm vi (KHÔNG làm)
- Sửa thông tin đăng ký trước khi duyệt (giao diện không có).

## 11. Câu hỏi mở
- CH-06, CH-07, CH-14, CH-41, CH-53.
