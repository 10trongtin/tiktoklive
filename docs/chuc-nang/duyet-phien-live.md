# Duyệt phiên live

## 0. Thông tin tệp
| Mục | Nội dung |
|---|---|
| Mã chức năng | CN-08 |
| Phiên bản | 1.0 · 25/11/2026 |
| Phụ thuộc | 03-du-lieu.md › Phiên live, Bằng chứng, Điểm; CN-07; CN-12 (công tắc Tự duyệt) |
| Trạng thái | Nháp |

## 1. Mục tiêu
- Admin xem từng phiên chờ duyệt và chốt điểm hoặc từ chối. "Điểm chỉ chốt lên bảng xếp hạng sau khi bạn duyệt từng phiên dưới đây".
- Cách ghi nhận theo giao diện: phiên do hệ thống tự ghi (kèm điểm nháp), cộng phiên có bằng chứng của sale; **mọi phiên đều qua admin** vì "Tự duyệt phiên ≥ 30 phút" đang tắt.

## 2. Ai dùng
| Vai trò | Được làm gì ở chức năng này | Không được làm gì |
|---|---|---|
| Admin | Xem, Duyệt, Từ chối, Xem ảnh bằng chứng | — |
| Streamer | Không | Vào màn |
| Vai trò khác | chưa rõ (CH-07) | — |

## 3. Đường vào màn
1. Menu "Duyệt phiên live" (có số phiên chờ), menu dưới "Duyệt".
2. Nút "Duyệt phiên chờ", link "Đi tới Duyệt phiên →" (Bảng xếp hạng); "Xem phiên chờ duyệt" (Chi tiết streamer).

## 4. Màn hình
Ảnh / wireframe: chưa có (khối `scr-approve`).

| # | Tên ô / nút (đúng chữ trên màn) | Kiểu | Bắt buộc | Giới hạn & định dạng | Mặc định | Hành vi |
|---|---|---|---|---|---|---|
| 1 | Nhãn "<số> phiên chờ duyệt" | Nhãn vàng | — | — | — | Giảm khi xử lý xong một phiên |
| 2 | Thẻ phiên: ảnh, tên, "@TikTok · <dd/mm> · <bắt đầu> – <kết thúc>" | Thẻ | — | — | — | Một thẻ mỗi phiên chờ |
| 3 | Thời lượng | Chữ | — | "1h48" | — | — |
| 4 | Peak view | Chữ | — | Số | — | — |
| 5 | Điểm nháp | Chữ xanh ngọc | — | "+1 điểm nháp" / "0 điểm" | — | — |
| 6 | Nhãn đánh giá | Nhãn | — | "Đủ điều kiện · ≥ 30 phút" (xanh) · "Dưới 30 phút · theo luật không tính điểm" (đỏ) · "Thiếu dữ liệu · <lý do> — đã có ảnh bằng chứng đính kèm" (vàng) | — | — |
| 7 | ✓ Duyệt — chốt điểm | Nút chính | — | — | — | QT-02; thẻ biến mất; hiện M-01 |
| 8 | ✕ Từ chối | Nút đỏ | — | — | — | QT-03; thẻ biến mất; hiện M-02 |
| 9 | Xem ảnh bằng chứng | Nút | — | Chỉ có ở phiên thiếu dữ liệu | — | Mẫu chỉ hiện M-03; cách xem ảnh: CH-19 |
| 10 | Chú thích "Duyệt xong, điểm cộng ngay vào bảng xếp hạng tuần." | Chữ | — | — | — | — |
| 11 | Trạng thái rỗng | Thẻ | — | M-04 | — | Khi không còn phiên chờ |

## 5. Quy tắc nghiệp vụ
| Mã | Quy tắc (một câu, kiểm được) |
|---|---|
| QT-01 | Hàng chờ gồm phiên Chờ duyệt và Chờ duyệt tay, kể cả phiên dưới 30 phút (mẫu). Sắp xếp: CH-44. |
| QT-02 | Duyệt → phiên Đã duyệt, điểm nháp thành điểm đã chốt, cộng ngay vào bảng xếp hạng tuần; lưu người duyệt và giờ duyệt. |
| QT-03 | Từ chối → phiên Từ chối, 0 điểm, lý do ghi vào lịch sử streamer (ô lý do: CH-05). |
| QT-04 | Số trên menu, nhãn đầu màn, thẻ "Phiên chờ duyệt" ở Bảng xếp hạng cùng giảm sau mỗi lần xử lý. |
| QT-05 | Phiên đã xử lý không xử lý lại được (cần xác nhận — sửa sau duyệt: CH-24). |

## 6. Trạng thái (nếu có)
| Từ | Sang | Ai / sự kiện | Điều kiện | Hệ quả (dữ liệu, thông báo) |
|---|---|---|---|---|
| Chờ duyệt / Chờ duyệt tay | Đã duyệt | Admin bấm ✓ Duyệt — chốt điểm | Phiên còn đang chờ (bấm 2 lần / 2 admin cùng bấm chỉ tính 1 lần — CH-39) | Chốt điểm, cập nhật xếp hạng, M-01 |
| Chờ duyệt / Chờ duyệt tay | Từ chối | Admin bấm ✕ Từ chối | Như trên | 0 điểm, ghi lý do, M-02 |
- Báo cho streamer khi duyệt / từ chối: CH-14.

## 7. Dữ liệu đọc / ghi
- Đọc: Phiên live chờ duyệt, Bằng chứng.
- Ghi: Phiên live (trạng thái, điểm đã chốt, người duyệt, giờ duyệt, lý do từ chối).

## 8. Câu chữ hiển thị (chép NGUYÊN VĂN, AI không tự viết câu khác)
| Mã | Khi nào | Câu hiển thị |
|---|---|---|
| M-01 | Duyệt xong | "Đã duyệt phiên của <tên> (<thời lượng>) — điểm đã chốt lên Bảng xếp hạng." |
| M-02 | Từ chối xong | "Đã từ chối phiên của <tên>. Lý do được ghi vào lịch sử streamer." |
| M-03 | Bấm Xem ảnh bằng chứng (mẫu) | "Ảnh bằng chứng của <tên>: thời lượng <thời lượng> khớp dữ liệu API còn lại — có thể duyệt." |
| M-04 | Hết phiên chờ | "Đã xử lý hết — không còn phiên nào chờ duyệt." |

## 9. Tiêu chí nghiệm thu
| Mã | Cho trước | Khi | Thì | Quy tắc |
|---|---|---|---|---|
| AC-01 | Phiên 1h48, +1 điểm nháp | Bấm ✓ Duyệt — chốt điểm | Thẻ biến mất, M-01, điểm streamer +1 trên Bảng xếp hạng | QT-02 |
| AC-02 | Phiên 0h24 | Bấm ✓ Duyệt — chốt điểm | Đã duyệt, 0 điểm | QT-02 |
| AC-03 | Phiên bất kỳ | Bấm ✕ Từ chối | Thẻ biến mất, M-02, không cộng điểm | QT-03 |
| AC-04 | 4 phiên chờ | Duyệt 1 phiên | Nhãn, số menu, thẻ KPI cùng thành 3 | QT-04 |
| AC-05 | Phiên thiếu dữ liệu | Mở màn | Có nút Xem ảnh bằng chứng; phiên khác không có | — |
| AC-06 | Còn 1 phiên | Xử lý xong | Hiện M-04 | — |
| AC-07 | 2 admin mở cùng phiên | Cùng bấm Duyệt | Chỉ chốt 1 lần (cần xác nhận — CH-39) | QT-05 |

## 10. Ngoài phạm vi (KHÔNG làm)
- Duyệt hàng loạt nhiều phiên một lần (giao diện không có).
- Sửa thời lượng phiên trước khi duyệt (giao diện không có — CH-19).

## 11. Câu hỏi mở
- CH-00, CH-04, CH-05, CH-07, CH-12, CH-14, CH-19, CH-24, CH-39, CH-44.
