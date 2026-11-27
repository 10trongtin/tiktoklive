# Luật làm việc cho AI — PICITY LÊN LIVE

1. **Spec không ghi thì không làm.** Gặp chỗ spec không nói, dừng lại và hỏi người ra đề. Không tự đặt quy tắc, không tự thêm nút, ô, câu chữ.
2. **Làm từng tệp chức năng một** trong `docs/chuc-nang/`. Xong một tệp thì đổi cột Trạng thái của tệp đó trong `docs/tien-do.md` (Chưa làm → Đang làm → Xong).
3. **Tên chuẩn lấy từ `docs/00-thuat-ngu.md`.** Vai trò, trạng thái, tên màn, tên ô, tên nút chép đúng từng chữ. Không viết tắt, không đổi chữ cho "dễ hiểu hơn".
4. **Câu chữ hiển thị** (mục 8 mỗi tệp) chép nguyên văn. Không tự viết câu khác.
5. **Lệch giữa các tệp** (tên, số, quy tắc không khớp nhau): ghi lại vào `DECISIONS-LOG.md` và hỏi. Không tự chọn bên.
6. **Chỗ có trong `docs/cau-hoi-mo.md`**: dừng và hỏi. Chỉ làm tiếp khi câu hỏi đã có câu trả lời ghi trong `DECISIONS-LOG.md`.
7. **Tiêu chí có ghi "(cần xác nhận)"** chưa phải yêu cầu chốt. Không làm theo khi chưa được xác nhận.
8. **Công nghệ / nền tảng** chưa được chọn (xem `docs/02-quy-uoc-ky-thuat.md`). Không tự chọn.
9. Dữ liệu mẫu trong spec (tên streamer, số giờ, số điểm) chỉ để minh họa. Không cài cứng vào sản phẩm.
10. Mỗi quyết định mới của người ra đề: thêm một dòng vào `DECISIONS-LOG.md` (ngày · nội dung · tệp bị ảnh hưởng), rồi sửa các tệp đó.

Thứ tự đọc: `docs/01-tong-quan.md` → `00-thuat-ngu.md` → `03-du-lieu.md` → `05-phan-quyen.md` → `04-giao-dien.md` → `02-quy-uoc-ky-thuat.md` → tệp chức năng đang làm → `cau-hoi-mo.md`.
