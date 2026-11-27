# Gửi bằng chứng phiên live

## 0. Thông tin tệp
| Mục | Nội dung |
|---|---|
| Mã chức năng | CN-07 |
| Phiên bản | 1.0 · 25/11/2026 |
| Phụ thuộc | 03-du-lieu.md › Phiên live, Bằng chứng; CN-08 Duyệt phiên live |
| Trạng thái | Nháp |

## 1. Mục tiêu
- Sale bổ sung ảnh màn hình cuối live cho phiên mà dữ liệu tự động bị thiếu, để admin duyệt tay.
- Cách ghi nhận theo giao diện: đây là **đường phụ**. Phiên vẫn do hệ thống tự phát hiện; sale chỉ gửi bằng chứng khi phiên bị gắn cờ "thiếu dữ liệu". Có cho sale tự khai phiên hoàn toàn bằng bằng chứng (hướng B) không: CH-00.

## 2. Ai dùng
| Vai trò | Được làm gì ở chức năng này | Không được làm gì |
|---|---|---|
| Streamer | Gửi bằng chứng cho phiên của mình bị gắn cờ | Gửi cho phiên không bị gắn cờ (suy ra) |
| Admin | Xem bằng chứng ở CN-08 | — |

## 3. Đường vào màn
1. Menu thanh bên "Gửi bằng chứng" (nhóm Streamer).
2. Nút "Gửi bằng chứng phiên" ở Dashboard của tôi.

## 4. Màn hình
Ảnh / wireframe: chưa có (khối `scr-proof`). Mô tả màn: "Dành cho phiên bị gắn cờ “thiếu dữ liệu” · hạn gửi: 24 giờ sau khi kết thúc live".

| # | Tên ô / nút (đúng chữ trên màn) | Kiểu | Bắt buộc | Giới hạn & định dạng | Mặc định | Hành vi |
|---|---|---|---|---|---|---|
| 1 | Phiên cần bổ sung bằng chứng * | Danh sách chọn | Có | Mỗi dòng "<dd/mm> · <giờ bắt đầu> – <giờ kết thúc> · <lý do cờ>", vd "19/11 · 21:05 – 21:52 · Thiếu dữ liệu (API lỗi 5 phút)", "18/11 · 20:00 – 20:44 · Chưa có snapshot" | Dòng đầu | Chỉ phiên của mình, bị gắn cờ, còn hạn (suy ra) |
| 2 | Thời lượng trên ảnh cuối live * | Ô nhập | Có | Gợi ý "Ví dụ: 0h47" | Trống | — |
| 3 | Link phiên live đã kết thúc | Ô nhập | Không | Gợi ý "https://www.tiktok.com/@…/live" | Trống | — |
| 4 | Ảnh màn hình cuối live * — "Bấm để chọn ảnh" | Vùng chọn tệp | Có | "Ảnh phải thấy rõ thời lượng phiên và @username · PNG/JPG, tối đa 10MB"; 1 ảnh | Trống | Chọn xong hiện "Đã chọn: <tên tệp>"; mở được bằng Enter / Space |
| 5 | Ghi chú cho admin | Ô nhiều dòng | Không | Gợi ý "Ví dụ: live bị rớt mạng ở phút 30, vào lại ngay sau đó…" | Trống | — |
| 6 | Gửi bằng chứng | Nút chính | — | — | — | Lưu; phiên sang "Chờ duyệt tay"; hiện M-01, M-02 |
| 7 | Khối "Ảnh hợp lệ là ảnh thế nào?" | Chữ | — | M-03 | — | — |

## 5. Quy tắc nghiệp vụ
| Mã | Quy tắc (một câu, kiểm được) |
|---|---|
| QT-01 | Chỉ gửi cho phiên bị gắn cờ thiếu dữ liệu. |
| QT-02 | Hạn gửi: 24 giờ sau khi kết thúc live. Quá hạn: CH-18. |
| QT-03 | Ảnh PNG/JPG, tối đa 10MB. |
| QT-04 | Gửi xong phiên chuyển sang "Chờ duyệt tay". |
| QT-05 | Phiên dưới 30 phút vẫn không tính điểm dù có bằng chứng. |

## 6. Trạng thái (nếu có)
| Từ | Sang | Ai / sự kiện | Điều kiện | Hệ quả (dữ liệu, thông báo) |
|---|---|---|---|---|
| Thiếu dữ liệu | Chờ duyệt tay | Streamer bấm Gửi bằng chứng | Đủ ô *, còn hạn | Lưu Bằng chứng; admin thấy nút "Xem ảnh bằng chứng" ở CN-08; có thông báo cho admin (mẫu chuông: "Hoàng Nam Picity gửi bằng chứng phiên 19/11") |

## 7. Dữ liệu đọc / ghi
- Đọc: Phiên live của mình có cờ thiếu dữ liệu.
- Ghi: Bằng chứng (phiên, thời lượng trên ảnh, link, ảnh, ghi chú, thời điểm gửi); đổi trạng thái phiên.

## 8. Câu chữ hiển thị (chép NGUYÊN VĂN, AI không tự viết câu khác)
| Mã | Khi nào | Câu hiển thị |
|---|---|---|
| M-01 | Gửi thành công (khung xanh) | "Đã gửi bằng chứng. Phiên chuyển sang trạng thái “Chờ duyệt tay” — theo dõi tại mục Phiên live của tôi." |
| M-02 | Gửi thành công (thông báo nổi) | "Đã gửi bằng chứng — phiên chuyển sang Chờ duyệt tay." |
| M-03 | Khối hướng dẫn | "Chụp màn hình tổng kết ngay khi kết thúc live trên TikTok." · "Thấy rõ: thời lượng, số người xem, ngày giờ." · "Không dùng ảnh của phiên cũ — admin đối chiếu được với lịch sử tài khoản." · "Phiên dưới 30 phút vẫn không tính điểm dù có bằng chứng." |
| M-04 | Đã chọn ảnh | "Đã chọn: <tên tệp>" |

## 9. Tiêu chí nghiệm thu
| Mã | Cho trước | Khi | Thì | Quy tắc |
|---|---|---|---|---|
| AC-01 | Phiên bị gắn cờ, còn hạn; điền đủ ô *, chọn ảnh JPG 2MB | Bấm Gửi bằng chứng | Hiện M-01, M-02; phiên thành "Chờ duyệt tay" | QT-04 |
| AC-02 | Chưa chọn ảnh | Bấm Gửi bằng chứng | Không gửi (câu lỗi cần xác nhận) | — |
| AC-03 | Ảnh 12MB | Chọn ảnh | Bị chặn (câu lỗi cần xác nhận) | QT-03 |
| AC-04 | Tệp PDF | Chọn | Bị chặn | QT-03 |
| AC-05 | Phiên kết thúc 25 giờ trước | Mở danh sách phiên | Không còn phiên đó (cần xác nhận — CH-18) | QT-02 |
| AC-06 | Phiên 0h24 có bằng chứng | Admin duyệt | 0 điểm | QT-05 |

## 10. Ngoài phạm vi (KHÔNG làm)
- Gửi nhiều ảnh cho một phiên (mẫu chỉ có 1 ảnh — cần xác nhận).
- Tự đọc chữ trên ảnh (CH-19).

## 11. Câu hỏi mở
- CH-00, CH-18, CH-19, CH-36.
