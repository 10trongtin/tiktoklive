# 03 — Dữ liệu

> Suy từ chữ và dữ liệu mẫu trên giao diện. Tên trường viết tiếng Việt theo nhãn giao diện. Tên bảng / cột kỹ thuật chưa chốt — đội phát triển đặt, ghi lại vào DECISIONS-LOG.md.
> Trường có dấu "?" là suy ra, chưa chắc có — cần xác nhận.

## 1. Streamer
| Trường | Nguồn trên giao diện | Ghi chú |
|---|---|---|
| Họ và tên | Đăng ký tham gia | Bắt buộc |
| Tên hiển thị | "Minh Dự Picity" ở mọi bảng | Khác Họ và tên ("Ví dụ: Minh Dự"); cách sinh chưa rõ — CH-42 |
| Chữ viết tắt ảnh đại diện | "MD", "TA" | Không thấy ô tải ảnh đại diện |
| Số điện thoại / Zalo | Đăng ký tham gia | Bắt buộc |
| Tài khoản TikTok (@username) | Đăng ký tham gia | Bắt buộc; "không đổi giữa mùa" |
| Email công việc | Đăng ký tham gia | Không bắt buộc |
| Team | Đăng ký tham gia | Một streamer — một team |
| Dự án phụ trách | Đăng ký tham gia | Một streamer — một dự án |
| Tham gia từ tuần | Chi tiết streamer ("Tham gia từ tuần 1") | |
| Trạng thái theo dõi | Quản lý streamer | Đang theo dõi · ● Đang live · Chưa live tuần này |
| Đang live (có/không) | Bảng xếp hạng (● LIVE / Ngoại tuyến) | Lấy từ API |

## 2. Team
| Trường | Ví dụ |
|---|---|
| Tên team | Team Picity 1 · Team Picity 2 · Team Picity 3 |
| Số thành viên (tự tính) | 6 · 6 · 5 |
| Trưởng team? | Có nhắc "trưởng team Picity 3" — chưa rõ có lưu không (CH-09) |

## 3. Dự án
| Trường | Ví dụ |
|---|---|
| Tên dự án (đầy đủ) | Picity Central Park · Picity SkyZen · Picity High Park |
| Tên gọn (trong bảng) | Central Park · SkyZen · High Park |
| Số streamer phụ trách (tự tính) | 9 · 5 · 3 |

## 4. Mùa giải
| Trường | Nguồn | Ghi chú |
|---|---|---|
| Tên mùa giải | Tạo mùa giải mới | Ví dụ "Tuần 23/11 – 29/11", "Tháng 11/2026" |
| Ngày bắt đầu | Tạo mùa giải mới | |
| Ngày kết thúc | Tạo mùa giải mới | |
| Trạng thái | Danh sách mùa giải | Đang diễn ra · Đã khóa bảng |
| Số streamer (tự tính) | Danh sách | |
| Người dẫn đầu (tự tính) | Danh sách | |
| Luật áp dụng | Nhãn "Luật: ≥ 30 phút = 1 điểm" | Luật gắn theo mùa hay dùng chung: chưa rõ — CH-13 |

> Quan hệ Mùa giải – Tuần chưa rõ: bảng có cả "Tháng 11/2026" và "Tuần 09/11 – 15/11" là mùa giải (CH-01).

## 5. Phiên live (đối tượng trọng tâm)

> Đây là dữ liệu quan trọng nhất của hệ thống: điểm, xếp hạng, KPI, báo cáo thưởng đều tính từ đây. Cách thu thập chưa chốt — CH-00.

### 5.1 Trường
| Nhóm | Trường | Nguồn trên giao diện | Ghi chú / câu hỏi |
|---|---|---|---|
| Ai | Streamer | mọi màn | |
| Ai | Tài khoản nền tảng (@username TikTok) | "Hệ thống chỉ theo dõi đúng @username này" | Lưu @username tại thời điểm phiên, vì đổi tài khoản giữa mùa thì "Các phiên ở tài khoản cũ dừng tính từ thời điểm đổi" |
| Ai | Nền tảng | Chỉ thấy TikTok | Có nền tảng khác (Facebook, YouTube…): CH-00 |
| Khi nào | Giờ bắt đầu | "19/11 · 19:15 – 21:03" | Ghi tới phút trên giao diện; độ chính xác lưu trữ: CH-00 |
| Khi nào | Giờ kết thúc | như trên | Phiên đang live chưa có giờ kết thúc |
| Khi nào | Thời lượng | "1h48", "0h24" | Tự tính = kết thúc − bắt đầu (suy ra). Phiên có quãng mất dữ liệu (vd "API lỗi 5 phút") tính thế nào: CH-36 |
| Khi nào | Thời lượng trên ảnh cuối live | Gửi bằng chứng ("Ví dụ: 0h47") | Do sale nhập; lệch với thời lượng tự ghi thì lấy số nào: CH-19 |
| Nội dung | Tiêu đề phiên | Lịch sử phiên live; thẻ Đang Live | Lấy tự động từ nền tảng (suy ra) — CH-29 |
| Nội dung | Link phiên live | Gửi bằng chứng: "Link phiên live đã kết thúc" (không bắt buộc) | Phiên ghi nhận tự động có lưu link không: CH-00 |
| Nội dung | Dự án được nói tới | Thẻ Đang Live hiện tên dự án theo **từng phiên** (vd Thanh Anh — dự án phụ trách Central Park — live "Xem nhà mẫu SkyZen buổi tối", dự án "Picity SkyZen") | Dự án của phiên lấy từ đâu (sale chọn / theo tiêu đề / theo dự án phụ trách); một phiên nói nhiều dự án: CH-48 |
| Đo đếm | Số người đang xem | Đang Live | Lúc đang live |
| Đo đếm | Peak view | mọi màn | Số người xem cao nhất trong phiên (suy ra) |
| Đo đếm | Điểm đo người xem theo thời gian | "snapshot mỗi 30 giây từ API" | Một phiên — nhiều điểm đo |
| Nguồn | Nguồn ghi nhận | Suy ra từ các màn | Giá trị thấy được: **Tự động (API)**; **Tự động + bằng chứng của sale**. Không thấy: **Admin nhập tay**, **Sale tự khai** — CH-00 |
| Nguồn | Cờ dữ liệu | Duyệt phiên live; Gửi bằng chứng | Đủ điều kiện · ≥ 30 phút / Dưới 30 phút · theo luật không tính điểm / Thiếu dữ liệu (kèm lý do: "API lỗi 5 phút", "Chưa có snapshot") |
| Nguồn | Bằng chứng đính kèm | Gửi bằng chứng | 0..1 bản ghi Bằng chứng (mục 6) |
| Duyệt | Điểm nháp | Duyệt phiên live | "+1 điểm nháp" / "0 điểm" |
| Duyệt | Trạng thái duyệt | Lịch sử; Phiên live của tôi | Xem 5.2 |
| Duyệt | Người duyệt, giờ duyệt | "Bảng điểm chốt tháng … kèm người duyệt và giờ duyệt" | |
| Duyệt | Lý do từ chối | "Lý do được ghi vào lịch sử streamer"; nhãn "Từ chối · < 30 phút" | Không có ô nhập lý do — CH-05 |
| Duyệt | Điểm đã chốt | Sau khi duyệt | 1 nếu ≥ 30 phút, 0 nếu dưới |
| Kỳ | Tuần / tháng / mùa giải chứa phiên | suy ra | Theo giờ bắt đầu hay giờ kết thúc; phiên qua nửa đêm / qua tuần: CH-35 |

### 5.2 Trạng thái phiên (theo giao diện)
| Trạng thái | Khi nào |
|---|---|
| ● ĐANG LIVE | Hệ thống thấy tài khoản đang live (tự mở phiên) |
| Chờ duyệt | Phiên đã kết thúc, có dữ liệu, chờ admin |
| Thiếu dữ liệu (cờ) | Dữ liệu tự động bị hụt; chờ sale gửi bằng chứng trong 24 giờ |
| Chờ duyệt tay | Sale đã gửi bằng chứng |
| Đã duyệt | Admin bấm "✓ Duyệt — chốt điểm" |
| Từ chối | Admin bấm "✕ Từ chối"; mẫu có "Từ chối · < 30 phút" |
- Quá 24 giờ không gửi bằng chứng thì sao: CH-18. Phiên dưới 30 phút có phải qua duyệt không: CH-04.

### 5.3 Cách phiên đi vào điểm và xếp hạng (Đã chốt 27/11/2026 — xem DECISIONS-LOG.md)
| Chỉ số | Cách tính đã chốt | Ghi chú |
|---|---|---|
| Điểm của phiên | Phiên đã duyệt, thời lượng ≥ 30 phút = 1 điểm; dưới 30 phút = 0 (tự động chuyển `Từ chối · < 30 phút`) | Không giới hạn số phiên tính điểm / ngày |
| Điểm của streamer trong kỳ | Cộng điểm các phiên đã duyệt ≥ 30 phút có trong kỳ | |
| Tổng giờ live trong kỳ | Cộng thời lượng các phiên **Đã duyệt và ≥ 30 phút** trong kỳ | Phiên chờ duyệt / dưới 30 phút / từ chối không cộng |
| Phiên (cột bảng xếp hạng) | Số phiên Đã duyệt ≥ 30 phút trong kỳ | |
| Hạng | Điểm giảm dần; bằng điểm → Tổng giờ live giảm dần; bằng tiếp → Peak view giảm dần | |
| Kỳ Tuần này / Tháng này / Từ đầu | Tính theo giờ bắt đầu phiên (UTC+7); "Từ đầu" = từ đầu mùa giải hiện tại | Rớt mạng live lại ≤ 5 phút gộp làm 1 phiên; trùng giờ chỉ lấy phiên dài hơn |
| KPI tuần | Tổng giờ live đã duyệt trong tuần ≥ 4h | |

### 5.4a Đề xuất cách ghi nhận phiên — ĐỀ XUẤT, CHỜ KHÁCH CHỐT (CH-00)
> Phần này không có trong giao diện mẫu. Đã báo khách, chưa được chốt. Không làm theo khi CH-00 chưa có câu trả lời trong DECISIONS-LOG.md.

**Cách làm đề xuất**
1. Sale đăng ký 1 lần @tài khoản TikTok.
2. Hệ thống mỗi 1–2 phút kiểm tra tài khoản có đang live không, qua **dịch vụ đọc phòng live bên thứ ba** (không chính thức).
3. Thấy đang live thì ghi số người xem **mỗi phút** cho tới khi tắt live.
4. **Mỗi mã phòng live = 1 phiên.** Một người nhiều phiên trong ngày thì cộng dồn theo ngày / tuần / tháng.
5. Dữ liệu tự động hụt → bằng chứng dự phòng: ảnh **Phân tích LIVE trong TikTok Studio**.

> Lệch với giao diện mẫu: giao diện ghi kiểm tra "mỗi 5 phút" khi chưa live và "mỗi 30 giây" khi đang live; đề xuất là 1–2 phút và đo mỗi phút. Giao diện yêu cầu "ảnh màn hình cuối live"; đề xuất dùng ảnh Phân tích LIVE trong TikTok Studio. Chờ khách chốt bên nào.

**Trường dữ liệu phiên theo đề xuất**
| Trường | Có trên giao diện mẫu? |
|---|---|
| @tài khoản | Có |
| Mã phòng live | Không — mới |
| Giờ bắt đầu, giờ kết thúc, thời lượng | Có |
| Người xem cao nhất | Có ("Peak view") |
| Người xem trung bình | Không — mới |
| Tổng lượt xem | Không — mới |
| Lượt thích (like) | Không — mới |
| Bình luận | Không — mới |
| Nguồn ghi nhận | Suy ra (tự động / bằng chứng) |
| Bằng chứng dự phòng | Có (ảnh), khác loại ảnh |

**Khả năng của dịch vụ đọc phòng live bên thứ ba (đề xuất, chờ chốt)**
- Kiểm tra hàng loạt tài khoản có đang live không, mỗi 30–60 giây.
- Khi đang live: nhận liên tục số người xem, like, bình luận, quà, và sự kiện kết thúc phiên.
- **Không lưu lịch sử, không cho giờ bắt đầu phiên.** Vì vậy hệ thống phải tự lưu:
  - **Giờ phát hiện bắt đầu** (lúc hệ thống thấy tài khoản đang live — có thể trễ hơn giờ bắt đầu thật tối đa một chu kỳ kiểm tra);
  - **Giờ phát hiện kết thúc** (lúc nhận sự kiện kết thúc hoặc không còn thấy live);
  - Người xem mỗi phút;
  - Tự tính: người xem cao nhất, người xem trung bình, thời lượng.
- Giới hạn số kết nối live cùng lúc theo gói (ví dụ 20 hoặc 50). Mỗi kết nối có thời lượng tối đa → hệ thống phải tự kết nối lại; quãng mất kết nối ghi vào cờ "Thiếu dữ liệu".
- Dữ liệu chỉ dùng nội bộ.

**Trường bổ sung cho Phiên live theo đề xuất**
| Trường | Giá trị / ghi chú |
|---|---|
| Nguồn ghi nhận | Tự động (dịch vụ đọc phòng live) · Tự động + bằng chứng của sale · (Admin nhập tay — chưa có trên giao diện, chờ chốt) |
| Giờ phát hiện bắt đầu | Do hệ thống ghi, không phải giờ nền tảng báo |
| Giờ phát hiện kết thúc | Do hệ thống ghi |
| Quãng mất kết nối | Thời điểm mất / nối lại, để biết phiên có thiếu dữ liệu không |
| Số quà | Có nhận được; luật hiện hành "Quà / diamond: Không tính điểm" |

**Rủi ro đã báo khách**
- Dịch vụ không chính thức, có thể hỏng khi nền tảng thay đổi.
- Có phí.
- Cần xem điều khoản sử dụng của nền tảng.
- Đề xuất chạy thử 1 tuần với 3–5 tài khoản trước khi làm thật.

### 5.4 Những trường hợp phiên chưa có luật (đưa vào câu hỏi mở)
- Phiên rớt mạng rồi vào lại: một phiên hay hai (CH-36).
- Hai phiên trùng giờ của cùng người / một tài khoản live nhiều nền tảng cùng lúc (CH-47).
- Một phiên nói nhiều dự án (CH-48).
- Phiên vắt qua nửa đêm, qua tuần, qua mùa (CH-35).

## 6. Bằng chứng
| Trường | Nguồn | Ghi chú |
|---|---|---|
| Phiên cần bổ sung bằng chứng | Gửi bằng chứng | Bắt buộc; chỉ phiên bị gắn cờ thiếu dữ liệu |
| Thời lượng trên ảnh cuối live | Gửi bằng chứng | Bắt buộc, ví dụ "0h47" |
| Link phiên live đã kết thúc | Gửi bằng chứng | Không bắt buộc |
| Ảnh màn hình cuối live | Gửi bằng chứng | Bắt buộc; PNG/JPG; tối đa 10MB; một ảnh |
| Ghi chú cho admin | Gửi bằng chứng | Không bắt buộc |
| Thời điểm gửi | suy ra (hạn 24 giờ) | |

## 7. Đăng ký tham gia
| Trường | Ghi chú |
|---|---|
| Họ và tên, Số điện thoại / Zalo, Tài khoản TikTok, Email công việc, Team, Dự án phụ trách | Như mục Streamer |
| Cam kết (ô đánh dấu) | Bắt buộc đánh dấu |
| Gửi lúc | "Hôm nay 09:12" |
| Trạng thái | Chờ duyệt → Đã duyệt / (Từ chối) |
| Thời điểm duyệt | "bắt đầu được ghi nhận phiên live kể từ thời điểm duyệt" |

## 8. Điểm
- Điểm của một phiên: 1 điểm nếu phiên hợp lệ (≥ 30 phút), 0 nếu dưới 30 phút.
- Điểm nháp → Điểm đã chốt khi admin duyệt.
- Điểm của streamer trong kỳ (Tuần này / Tháng này / Từ đầu) = cộng điểm đã chốt các phiên trong kỳ (suy ra; dữ liệu mẫu có chỗ lệch — CH-02, CH-03).
- Quà / diamond: không tính điểm.

## 9. Luật điểm (giá trị đang hiển thị)
| Luật | Giá trị |
|---|---|
| Phiên tối thiểu để tính điểm | 30 phút |
| Điểm mỗi phiên hợp lệ | 1 điểm |
| Xếp hạng khi bằng điểm | Tổng giờ live cao hơn |
| Số phiên tối đa tính điểm / ngày | Không giới hạn |
| Quà / diamond | Không tính điểm |
| Phiên thiếu dữ liệu API | Duyệt tay bằng bằng chứng |
| Mục tiêu tuần | 4h00 (Dashboard của tôi, Tổng quan điều hành) — không có trên màn Luật điểm (CH-17) |

## 10. Cấu hình kết nối & tự động hóa
| Mục | Giá trị mẫu |
|---|---|
| Nhà cung cấp | Dịch vụ đọc phòng live bên thứ ba (chưa chốt tên) · Gói Basic |
| Giới hạn | 10.000 request/ngày · tối đa 20 phòng live cùng lúc |
| Check khi chưa live | mỗi 5 phút |
| Check khi đang live | mỗi 30 giây |
| Request đã dùng hôm nay | 4.812 / 10.000 |
| Lỗi API gần nhất | 19/11 · tự hồi phục sau 5 phút |
| Tự mở / đóng phiên | Bật |
| Tự tính điểm nháp | Bật |
| Tự duyệt phiên ≥ 30 phút | Tắt |

## 11. Lịch sử xuất báo cáo
| Trường | Ví dụ |
|---|---|
| Báo cáo | Báo cáo tuần · Bảng điểm chốt tháng · Chi tiết phiên — Team Picity 1 |
| Kỳ | Tuần 09/11 – 15/11 · Tháng 10/2026 |
| Người xuất | Admin Picity |
| Xuất lúc | Thứ 2 · 08:05 |

## 12. Thông báo
- Chuông đầu trang có số chưa đọc. Ví dụ nội dung: "4 phiên chờ duyệt · 3 đăng ký chờ duyệt · Hoàng Nam Picity gửi bằng chứng phiên 19/11".
- Thông báo qua Zalo khi đăng ký được duyệt. Cách lưu và gửi: CH-14.

## 13. Quan hệ
- Team 1 — n Streamer; Dự án 1 — n Streamer.
- Streamer 1 — 1 Tài khoản TikTok trong một mùa ("1 tài khoản TikTok cho cả mùa giải").
- Streamer 1 — n Phiên live; Phiên live 1 — n điểm đo người xem; Phiên live 1 — 0..1 Bằng chứng (suy ra).
- Mùa giải 1 — n Phiên live (theo khoảng ngày, suy ra).
- Đăng ký 1 — 1 Streamer (sau khi duyệt, suy ra).
