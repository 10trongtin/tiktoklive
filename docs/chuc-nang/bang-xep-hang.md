# Bảng xếp hạng

## 0. Thông tin tệp
| Mục | Nội dung |
|---|---|
| Mã chức năng | CN-01 |
| Phiên bản | 1.0 · 25/11/2026 |
| Phụ thuộc | 03-du-lieu.md › Streamer, Phiên live, Điểm, Luật điểm; CN-08 Duyệt phiên live; CN-02 Đang Live |
| Trạng thái | Nháp |

## 1. Mục tiêu
- Xem thứ hạng streamer theo điểm đã chốt, theo kỳ Tuần này / Tháng này / Từ đầu.
- Thấy nhanh ai đang live, bao nhiêu phiên chờ duyệt.
- Xuất bảng ra Excel.

## 2. Ai dùng
| Vai trò | Được làm gì ở chức năng này | Không được làm gì |
|---|---|---|
| Admin | Xem, đổi kỳ, xuất Excel, đi tới Duyệt phiên live, mở Chi tiết streamer | — |
| Cấp điều hành | Xem, đổi kỳ, xuất Excel, mở Chi tiết streamer | Duyệt phiên chờ |
| Streamer & Khách công khai (chưa đăng nhập) | Mở thẳng không cần đăng nhập; xem thông tin sự kiện & thể lệ, đổi kỳ, xem Đang Live, bấm tên mở Chi tiết streamer | Xuất Excel, Duyệt phiên chờ |

## 3. Đường vào màn
1. Mở trực tiếp đường dẫn gốc `/` (công khai cho mọi người không cần đăng nhập), menu thanh bên "Bảng xếp hạng" (nhóm Tổng quan), hoặc menu dưới "Xếp hạng" trên điện thoại.
- Là màn mở đầu tiên khi vào hệ thống.

## 4. Màn hình
Ảnh / wireframe: chưa có (theo giao diện mẫu, khối `scr-rank`).

| # | Tên ô / nút (đúng chữ trên màn) | Kiểu | Bắt buộc | Giới hạn & định dạng | Mặc định | Hành vi |
|---|---|---|---|---|---|---|
| 1 | Bảng xếp hạng | Tiêu đề | — | — | — | — |
| 2 | Dòng mô tả | Chữ | — | "Tuần 16/11 – 22/11 · Picity Central Park · Cập nhật 12 giây trước" | — | Số giây tự đếm lại. Tên dự án trên dòng này: CH-26 |
| 3 | Tuần này · Tháng này · Từ đầu | Tab chọn một | — | — | Tuần này | Đổi kỳ → vẽ lại bục 3 hạng, bảng, thẻ "Tổng giờ live" (QT-05) |
| 4 | Xuất Excel | Nút | — | — | — | Tải bảng xếp hạng (QT-07) — ẩn với Streamer & Khách công khai |
| 4b | Khung Sự kiện & Thể lệ thi đua công khai | Thẻ viền vàng | — | Hiện tên mùa giải hiện tại, khoảng thời gian, trạng thái mùa và dòng thể lệ minh bạch M-03; khách chưa đăng nhập có nút "Đăng ký tham gia" | — | Giúp mọi người nắm ngay sự kiện đang diễn ra và quy tắc xếp hạng |
| 5 | Thanh trạng thái: "5 phòng đang live" · "697 người đang xem" · "4 phiên đang chờ duyệt" | Chữ | — | Số lấy theo dữ liệu hiện tại | — | — |
| 6 | Vào phòng live | Nút | — | — | — | Mở CN-02 Đang Live |
| 7 | Duyệt phiên chờ | Nút vàng | — | — | — | Mở CN-08 Duyệt phiên live |
| 8 | Thẻ "Streamer tham gia" | Chỉ số | — | Số + "▲ +3 so với tuần trước" | — | — |
| 9 | Thẻ "Đang live ngay lúc này" | Chỉ số đỏ | — | Số + "Cập nhật qua API mỗi 30 giây" | — | — |
| 10 | Thẻ "Tổng giờ live · tuần" | Chỉ số | — | Thời lượng, vd 28h40 / 96h20 / 212h45 + "▲ 12% so với kỳ trước" | tuần | Chữ "tuần / tháng / từ đầu" đổi theo tab |
| 11 | Thẻ "Phiên chờ duyệt" | Chỉ số | — | Số + link "Đi tới Duyệt phiên →" | — | Link mở CN-08 |
| 12 | Khối "Đang Live" + nhãn "5 phòng" | Danh sách ngang | — | Mỗi người: ảnh viền đỏ, tên, "<số> đang xem" | — | Bấm một người → hộp Xem phòng live (CN-02 mục 4b) |
| 13 | Gợi ý "Bấm vào tên để xem chi tiết" | Chữ | — | — | — | Lệch: bấm mở hộp xem live, không mở Chi tiết streamer — CH-28 |
| 14 | Bục 3 hạng: "HẠNG 1" · "HẠNG 2" · "HẠNG 3" | 3 thẻ | — | Ảnh chữ viết tắt, TÊN IN HOA, @TikTok, "<điểm> điểm · <tổng giờ>" | — | Hạng 1 viền vàng, nhãn vàng; hạng 2–3 nhãn xám |
| 15 | Bảng: Hạng · Streamer · Team · Dự án · Phiên · Tổng giờ · Peak view · Điểm · Trạng thái | Bảng | — | Streamer = tên + @TikTok; Điểm = "<số> điểm"; Peak view = 0 thì "—"; Trạng thái "● LIVE" hoặc "Ngoại tuyến" | — | Sắp theo QT-01, QT-02 |
| 16 | Chú thích "Hiển thị 10 trong 17 streamer · Bằng điểm xếp theo tổng giờ live giảm dần" | Chữ | — | — | — | — |
| 17 | ← Trước · Trang 1 / 2 · Sau → | Phân trang | — | 10 dòng / trang | Trang 1, "← Trước" bị khóa | Mẫu bấm "Sau →" chỉ hiện câu M-02, không sang trang — CH-27 |

## 5. Quy tắc nghiệp vụ
| Mã | Quy tắc (một câu, kiểm được) |
|---|---|
| QT-01 | Xếp hạng theo Điểm giảm dần. |
| QT-02 | Bằng điểm thì ai có Tổng giờ live cao hơn xếp trên. |
| QT-03 | Điểm chỉ gồm phiên đã được admin duyệt ("Điểm chỉ chốt lên bảng xếp hạng sau khi bạn duyệt"). |
| QT-04 | Cột Trạng thái hiện "● LIVE" khi streamer đang live, ngược lại "Ngoại tuyến". |
| QT-05 | Tab chỉ đổi kỳ tính: Tuần này / Tháng này / Từ đầu. Mốc đầu – cuối của "Tháng này", "Từ đầu" (theo mùa hay theo lịch) chưa rõ — CH-01. |
| QT-06 | "Phiên" là số phiên được tính (dữ liệu mẫu: phiên 26 phút → Phiên 0). Có tính phiên chờ duyệt / dưới 30 phút vào Tổng giờ không: CH-03. |
| QT-07 | Xuất Excel tải bảng xếp hạng gồm: Hạng, Streamer, TikTok, Team, Dự án, Phiên, Tổng giờ, Peak, Điểm. Mẫu luôn xuất kỳ tuần dù đang ở tab khác (cần xác nhận — CH-15). |
| QT-08 | Hai streamer bằng cả điểm và tổng giờ: chưa rõ — CH-43. |

## 6. Trạng thái (nếu có)
Không có (màn chỉ xem).

## 7. Dữ liệu đọc / ghi
- Đọc: Streamer (tên, @TikTok, team, dự án, đang live), Phiên live (thời lượng, peak, trạng thái duyệt), Điểm, số phiên chờ duyệt, số người đang xem.
- Ghi: không có. (Có ghi Lịch sử xuất báo cáo khi Xuất Excel không: CH-15.)

## 8. Câu chữ hiển thị (chép NGUYÊN VĂN, AI không tự viết câu khác)
| Mã | Khi nào | Câu hiển thị |
|---|---|---|
| M-01 | Bấm Xuất Excel | "Đã tải file bảng xếp hạng tuần (CSV mở bằng Excel)." |
| M-02 | Bấm Sau → | "Đang hiển thị top 10 của tuần — bấm tab Tháng này hoặc Từ đầu để xem kỳ khác." |
| M-03 | Dòng thể lệ công khai | "Thể lệ minh bạch: Mỗi phiên live ≥ 30 phút đã duyệt = 1 điểm · Bằng điểm xếp theo Tổng giờ live cao hơn · Quà / diamond không tính điểm." |
| T-01 | Tên tệp tải | "picity-len-live-bang-xep-hang-tuan-16-11.csv" (mẫu) |

## 9. Tiêu chí nghiệm thu
| Mã | Cho trước | Khi | Thì | Quy tắc |
|---|---|---|---|---|
| AC-01 | A 2 điểm, B 1 điểm | Mở Bảng xếp hạng | A xếp trên B | QT-01 |
| AC-02 | A, B cùng 1 điểm; A 3h43, B 3h24 | Mở màn | A xếp trên B | QT-02 |
| AC-03 | Có phiên 1h48 đang Chờ duyệt | Mở màn | Điểm của phiên chưa được cộng | QT-03 |
| AC-04 | Admin vừa duyệt phiên ≥ 30 phút | Mở lại màn | Điểm streamer tăng 1 | QT-03 |
| AC-05 | Streamer đang live | Mở màn | Cột Trạng thái hiện "● LIVE" | QT-04 |
| AC-06 | Đang ở Tuần này | Bấm tab Tháng này | Bảng, bục 3 hạng, thẻ Tổng giờ đổi theo tháng; chữ thẻ thành "Tổng giờ live · tháng" | QT-05 |
| AC-07 | Streamer có Peak view 0 | Mở màn | Ô Peak view hiện "—" | — |
| AC-08 | Có 17 streamer | Mở màn | Hiện 10 dòng và chữ "Hiển thị 10 trong 17 streamer…" | — |
| AC-09 | — | Bấm Vào phòng live | Mở màn Đang Live | — |
| AC-10 | — | Bấm Duyệt phiên chờ | Mở màn Duyệt phiên live | — |
| AC-11 | — | Bấm Xuất Excel | Tải tệp, hiện M-01 | QT-07 |
| AC-12 | Màn rộng ≤ 820px | Mở màn | Bảng chuyển dạng thẻ, mỗi ô có nhãn cột | — |
| AC-13 | Đang ở trang 1 | Bấm Sau → | Sang trang 2 (cần xác nhận — CH-27) | — |
| AC-14 | Người không có quyền xem | Đăng nhập | Không thấy menu Bảng xếp hạng (cần xác nhận — CH-09) | — |

## 10. Ngoài phạm vi (KHÔNG làm)
- Lọc theo team, dự án: giao diện không có ô lọc.
- Sửa điểm tay trên bảng.

## 11. Câu hỏi mở
- CH-01 (kỳ Tháng này / Từ đầu so với mùa giải), CH-03 (Tổng giờ gồm phiên nào), CH-15 (định dạng xuất), CH-26 (dòng mô tả ghi một dự án), CH-27 (phân trang), CH-28 (bấm tên mở gì), CH-43 (bằng cả điểm và giờ).
