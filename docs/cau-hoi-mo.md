# Câu hỏi mở

> Gặp chỗ có mã CH ở đây thì dừng và hỏi. Trả lời xong ghi vào DECISIONS-LOG.md rồi mới làm.
> **Cập nhật 27/11/2026:** Toàn bộ câu hỏi mức Cao và các câu hỏi Vừa trọng tâm (`CH-00`, `CH-01`, `CH-02`, `CH-03`, `CH-04`, `CH-05`, `CH-06`, `CH-07`, `CH-08`, `CH-09`, `CH-10`, `CH-11`, `CH-14`, `CH-15`, `CH-18`, `CH-19`, `CH-22`, `CH-33`, `CH-35`, `CH-36`, `CH-46`, `CH-47`, `CH-48`, `CH-52`) đã được chốt và ghi tại `DECISIONS-LOG.md`.
> Mức: **Cao** = chặn thiết kế dữ liệu / tính điểm; **Vừa** = chặn một màn; **Thấp** = chi tiết hiển thị.

## A. Ghi nhận phiên live (trọng tâm — hỏi trước)

### CH-00 · Cao · Tự động ghi nhận giờ bắt đầu / kết thúc phiên live từ tài khoản cá nhân bằng cách nào?
Khách: "sale sẽ đăng ký link cá nhân để live. Thích live giờ nào live, mình làm sao tracking nó được." Giao diện mẫu đi theo hướng tự động là chính (kiểm tra định kỳ, tự mở / đóng phiên), bằng chứng chỉ là đường phụ khi thiếu dữ liệu, mọi phiên đều qua admin duyệt.
- **(A) Tự động qua dịch vụ / kết nối nền tảng.** Đã đề xuất với khách (chờ chốt): dịch vụ đọc phòng live bên thứ ba; kiểm tra hàng loạt tài khoản mỗi 30–60 giây; khi live nhận người xem, like, bình luận, quà, sự kiện kết thúc; dịch vụ không lưu lịch sử, không cho giờ bắt đầu → hệ thống tự ghi giờ phát hiện bắt đầu / kết thúc và người xem mỗi phút; giới hạn số kết nối cùng lúc theo gói (vd 20 hoặc 50), kết nối có thời lượng tối đa phải tự nối lại. Cần khách xác nhận: nền tảng nào (chỉ TikTok?), chấp nhận dịch vụ không chính thức, độ tin cậy (có thể hỏng khi nền tảng đổi), chi phí, điều khoản sử dụng; có chạy thử 1 tuần với 3–5 tài khoản không.
- **(B) Bán tự động.** Sale gửi link / ảnh bằng chứng (vd ảnh Phân tích LIVE trong TikTok Studio) sau mỗi phiên, admin duyệt. Rẻ, chắc chắn, nhưng tốn công sale và admin, dễ gian lận ảnh.
- Kèm: dùng (A) làm chính và (B) dự phòng như giao diện mẫu, hay chỉ một trong hai? Có cho **admin nhập phiên tay** không?

### CH-02 · Cao · Luật điểm và luật phân hạng
Khách nói "ai live nhiều nhất thì được thưởng". Giao diện: mỗi phiên ≥ 30 phút = 1 điểm, số phiên / ngày không giới hạn, xếp theo điểm, bằng điểm xét tổng giờ. Ảnh tham khảo: cả bảng cùng 1 điểm nhưng giờ khác nhau (3h43, 2h21, 1h36…) và xếp theo giờ → điểm không bằng giờ. Dữ liệu mẫu còn lệch: Minh Dự có 2 phiên đã duyệt ≥ 30 phút trong tuần nhưng chỉ 1 điểm.
- (A) Điểm = số phiên hợp lệ; tổng giờ chỉ để phân hạng khi bằng điểm (đúng như giao diện).
- (B) Điểm = số **ngày** có ít nhất một phiên đạt chuẩn (giải thích được vì sao nhiều người chỉ 1 điểm); tổng giờ để phân hạng.
- (C) Xếp hạng thẳng theo tổng giờ live, bỏ điểm.

### CH-03 · Cao · Tổng giờ live gồm những phiên nào?
Bảng xếp hạng mẫu đã tính cả phiên đang chờ duyệt (Ngọc Trâm 2h21) và phiên 26 phút; Dashboard lại ghi "Đã duyệt · tính vào 3h24".
- (A) Chỉ phiên đã duyệt (mọi độ dài).
- (B) Chỉ phiên đã duyệt và ≥ 30 phút.
- (C) Mọi phiên, kể cả đang chờ duyệt.

### CH-04 · Cao · Phiên quá ngắn (dưới 30 phút)
- (A) Vẫn vào hàng chờ duyệt (như màn Duyệt phiên live mẫu), duyệt xong 0 điểm.
- (B) Tự từ chối (như Lịch sử "Từ chối · < 30 phút"), không vào hàng chờ.
- Kèm: có cộng vào tổng giờ / tính là "đã live" ở Tổng quan điều hành không?

### CH-36 · Cao · Rớt mạng rồi live lại
- (A) Mỗi mã phòng live là một phiên riêng (theo đề xuất) → hai phiên ngắn có thể cùng dưới 30 phút.
- (B) Gộp các phiên cách nhau dưới N phút thành một phiên. N = ?

### CH-47 · Cao · Phiên trùng giờ
Cùng một người có hai phiên chồng giờ (hai tài khoản, hai thiết bị, hai nền tảng) thì tính thế nào?
- (A) Chỉ tính một (phiên dài hơn).
- (B) Cộng cả hai.

### CH-48 · Cao · Một phiên nói về nhiều dự án
Thẻ Đang Live hiện dự án theo từng phiên (Thanh Anh phụ trách Central Park nhưng live về SkyZen).
- (A) Dự án của phiên = dự án phụ trách của streamer.
- (B) Sale chọn dự án cho từng phiên (một hay nhiều).
- (C) Hệ thống đoán theo tiêu đề phiên.
- Kèm: giờ của phiên nhiều dự án chia thế nào trong báo cáo theo dự án?

### CH-46 · Cao · Thưởng tính theo kỳ nào?
- (A) Theo tuần. (B) Theo tháng ("Bảng điểm chốt tháng — Căn cứ tính thưởng"). (C) Theo mùa.
- Hệ thống có cần tính ra tiền thưởng không, hay chỉ xuất bảng điểm?

### CH-35 · Vừa · Phiên vắt qua nửa đêm / qua tuần / qua mùa
- (A) Tính theo giờ bắt đầu. (B) Tính theo giờ kết thúc. (C) Chia theo từng ngày.
- Múi giờ dùng để chia ngày / tuần: giờ Việt Nam? Tuần bắt đầu thứ 2 (mẫu "Tuần 16/11 – 22/11" là thứ 2 → chủ nhật)?

### CH-18 · Vừa · Quá hạn 24 giờ không gửi bằng chứng
- (A) Phiên tự bị từ chối. (B) Vẫn chờ, admin quyết.
- Ai / cái gì gắn cờ "thiếu dữ liệu": hệ thống tự gắn khi mất kết nối bao lâu?

### CH-19 · Vừa · Đối chiếu bằng chứng
Câu mẫu "thời lượng 0h47 khớp dữ liệu API còn lại — có thể duyệt".
- (A) Hệ thống tự so số sale nhập với dữ liệu tự ghi. (B) Admin tự xem ảnh.
- Lệch nhau thì lấy thời lượng nào? Admin có sửa được thời lượng trước khi duyệt không?

### CH-52 · Vừa · Tham gia bằng gì: link, @username hay quét mã kết bạn?
Khách nói "đăng ký link cá nhân"; HTML nhập @username; ảnh tham khảo dùng quét mã QR kết bạn với tài khoản hệ thống trong TikTok.
- (A) Nhập @username (như HTML). (B) Dán link hồ sơ, hệ thống tách @username. (C) Quét mã kết bạn.

## B. Mùa giải, kỳ, KPI
- **CH-01 · Cao** · Mùa giải và tuần: thanh bên ghi "Mùa giải hiện tại: Tuần 16/11 – 22/11"; bảng Mùa giải có "Tháng 11/2026 · Đang diễn ra" và các "Tuần … · Đã khóa bảng". (A) Mùa = tháng, gồm nhiều tuần; (B) mỗi tuần là một mùa. "Từ đầu" là từ đầu mùa hay từ đầu chương trình?
- **CH-17 · Vừa** · Mục tiêu tuần 4h và "4 phiên" (Dashboard) không có trên màn Luật điểm: cố định hay cấu hình được? Mẫu ghi "Đạt KPI 11 / 17" trong khi người cao nhất tuần chỉ 3h43 — số nào đúng?
- **CH-23 · Vừa** · Tạo mùa: ô nào bắt buộc; mùa được chồng ngày không; ai / khi nào đóng mùa (tự động khi hết ngày hay admin bấm — không thấy nút); mùa đã tạo chưa tới ngày thì trạng thái gì?
- **CH-24 · Vừa** · Trước khi khóa mùa có sửa được kết quả duyệt (duyệt nhầm) không?
- **CH-13 · Vừa** · Luật điểm trên màn chỉ là chữ, nhưng có nút "Lưu thay đổi": sửa được những gì? "chỉ nên thực hiện khi mở mùa mới" là khuyên hay chặn? Luật gắn theo từng mùa không?
- **CH-12 · Vừa** · Bật "Tự duyệt phiên ≥ 30 phút": phiên thiếu dữ liệu có tự duyệt không?
- **CH-43 · Thấp** · Bằng cả điểm và tổng giờ thì ai xếp trên? (A) Đồng hạng; (B) xét peak view; (C) ai đạt trước.

## C. Vai trò, đăng nhập, quyền
- **CH-08 · Cao** · Không có màn đăng nhập. (A) Đăng nhập bằng SĐT / Zalo; (B) tài khoản do admin cấp; (C) không cần đăng nhập cho phần xem.
- **CH-09 · Cao** · Có những vai trò nào (Admin, Streamer, cấp điều hành, Trưởng team)? Mỗi vai trò thấy menu nào, thấy dữ liệu của ai (của mình / team / tất cả)?
- **CH-07 · Vừa** · Ai được duyệt phiên và duyệt đăng ký: chỉ Admin, hay cả Trưởng team?
- **CH-10 · Vừa** · Người mới chưa có tài khoản mở màn Đăng ký tham gia bằng đường nào? Admin có đăng ký hộ được không?

## D. Đăng ký, streamer
- **CH-05 · Vừa** · Từ chối phiên: có bắt nhập lý do không? Có danh sách lý do sẵn không?
- **CH-06 · Vừa** · Từ chối đăng ký: có lý do, có báo người đăng ký, có gửi lại được không?
- **CH-20 · Vừa** · Đổi @username giữa mùa: điểm cũ giữ hay mất? Hai tài khoản có cùng lúc chờ duyệt không?
- **CH-21 · Vừa** · Một người nhiều tài khoản / một tài khoản dùng chung nhiều người có bị chặn không?
- **CH-22 · Vừa** · Kiểm tra dữ liệu khi đăng ký: định dạng SĐT, độ dài tên, trùng @username / SĐT; câu báo lỗi là gì?
- **CH-25 · Vừa** · Thêm / sửa / xóa streamer, team, dự án, ngừng theo dõi một streamer làm ở đâu? Giao diện không có.
- **CH-41 · Thấp** · Người đang live đúng lúc được duyệt đăng ký: phiên đó tính từ lúc nào?
- **CH-42 · Thấp** · "Tên hiển thị" (Minh Dự Picity) khác "Họ và tên" (Minh Dự): lấy từ tên TikTok, hay ghép tên + "Picity"?
- **CH-53 · Thấp** · Ở Duyệt đăng ký có cần link mở trang TikTok của người đăng ký để kiểm tra không?

## E. Kết nối, thông báo, báo cáo
- **CH-11 · Vừa** · Vượt giới hạn request / ngày hoặc số phòng live cùng lúc thì làm gì? Báo cho ai? Trạng thái "mất kết nối" hiển thị thế nào?
- **CH-14 · Vừa** · Thông báo: danh sách đầy đủ trong chuông; Zalo gửi qua kênh nào (Zalo OA?); "Nhắc live" gửi gì, qua đâu; có báo streamer khi phiên được duyệt / từ chối không?
- **CH-15 · Vừa** · Báo cáo: .xlsx hay CSV (mẫu tải CSV cho mọi nút); cột của từng loại báo cáo; chọn kỳ / streamer / team ở đâu; Xuất Excel ở Bảng xếp hạng xuất theo tab đang chọn hay luôn theo tuần?
- **CH-16 · Thấp** · Báo cáo tuần 07:00 thứ 2: chỉ sẵn sàng để tải, hay gửi tới ai (email / Zalo)?
- **CH-30 · Thấp** · Trang tự làm mới thế nào (máy chủ đẩy hay hỏi lại định kỳ)?

## F. Hiển thị
- **CH-26 · Vừa** · Bảng xếp hạng ghi "Picity Central Park" ở dòng mô tả nhưng bảng có cả 3 dự án: (A) bảng chung, bỏ tên dự án; (B) cần ô chọn dự án.
- **CH-27 · Thấp** · Phân trang: (A) chỉ hiện top 10; (B) phân trang đủ 17 người.
- **CH-28 · Thấp** · Chữ "Bấm vào tên để xem chi tiết" nhưng bấm mở hộp xem live: mở Chi tiết streamer hay hộp xem live? Danh sách chọn ở Chi tiết streamer gồm mọi streamer?
- **CH-29 · Thấp** · Hộp xem live: nhúng video hay chỉ link? Link tới phòng live của streamer? Tiêu đề phiên lấy tự động từ nền tảng?
- **CH-31 · Thấp** · Câu cho trạng thái rỗng, đang tải, lỗi ở các màn (chưa có ai live, chưa có phiên…).
- **CH-32 · Thấp** · Dữ liệu mẫu lệch nhau (xác nhận chỉ là minh họa): Dashboard "kém hạng 1 đúng 19 phút" vs "thêm 36 phút để bắt kịp"; Thanh Anh "3 / 3 phiên hợp lệ" vs 1 phiên đã duyệt; Minh Dự "4 / 4 phiên được duyệt" vs lịch sử có phiên từ chối; phiên 18/11 20:00 vừa "Đã duyệt" vừa "Chưa có snapshot"; Quản lý streamer chỉ Thanh Anh "● Đang live" dù 5 người đang live.
- **CH-33 · Vừa** · Công nghệ, máy chủ, cơ sở dữ liệu, nơi lưu ảnh, số người dùng dự kiến: giao diện không nói.
- **CH-34 · Thấp** · Chế độ tối có bắt buộc không? Chỉ tiếng Việt?
- **CH-37 · Thấp** · Quà / diamond không tính điểm: có cần hiển thị số quà, like, bình luận ở đâu không?
- **CH-39 · Thấp** · Hai admin cùng duyệt một phiên / bấm hai lần: xác nhận chỉ tính một lần, người sau thấy báo gì?
- **CH-40 · Thấp** · "Xem phiên chờ duyệt" ở Chi tiết streamer: lọc theo streamer đó hay mở toàn bộ?
- **CH-44 · Thấp** · Thứ tự thẻ ở Đang Live (theo người xem?) và ở Duyệt phiên live (cũ trước?).
- **CH-45 · Thấp** · Câu thay thế khi: phiên dài nhất hiện tại < 30 phút; tôi đang hạng 1; có phiên bị từ chối.
- **CH-49 · Thấp** · Độ dài thanh "Tổng giờ live theo team" quy đổi theo gì (so với team cao nhất / mục tiêu)?
- **CH-50 · Thấp** · Mục "Cần chú ý tuần này": hệ thống tự sinh theo luật nào (ngưỡng "view thấp"?) hay người viết tay?
- **CH-51 · Thấp** · Chi tiết streamer: "Tổng giờ live", "Tỉ lệ phiên hợp lệ" tính theo tuần hay mùa; phiên chờ duyệt có trong mẫu số không?
- **CH-38 · Thấp** · Nút "Chi tiết" (Quản lý streamer) và "Hồ sơ" (Đang Live) mở đúng streamer của dòng đó — xác nhận.
