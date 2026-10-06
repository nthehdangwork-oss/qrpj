# 02. Yêu cầu

> **Quy tắc hiện hành — URL tự động:** Khách chỉ sửa Page Title, không nhập hoặc chọn slug/domain. Preview → chỉnh title → chọn ngày → tạo đơn. Server cấp mã link bất định dạng `c-<32 ký tự hex>`; retry cùng phiên và Idempotency-Key giữ nguyên link. POST /api/orders chỉ nhận templateId, days, content; gửi thêm slug bị từ chối 422. GET /api/slugs/check ngừng hỗ trợ (410). Các mô tả chọn/kiểm tra slug phía dưới là lịch sử đã bị thay thế; slug trong dữ liệu vẫn là mã nội bộ để định tuyến QR. Link cũ không đổi.

## Yêu cầu bổ sung ngày 01/10/2026

| ID | MoSCoW | User Story | Given / When / Then |
|---|---|---|---|
| FR18 | Must | Tôi muốn đặt tên tab cho thiệp | Given Editor, When nhập Page Title 1–80 ký tự hoặc để trống, Then lưu cùng thiệp, trống dùng mặc định; khi mở thiệp còn hạn title đúng nội dung đã chốt, domain/URL không đổi |
| FR19 | Must | Tôi muốn title đúng từng trang | Given đang ở một route, When chuyển Home/Shop/Templates/Editor/Preview/Payment/Result, Then Next.js cập nhật title theo cấu hình tập trung; title riêng của thiệp không sót sang trang khác |
| FR20 | Must | Tôi muốn không lộ title khi thiệp hết hạn | Given thiệp hết hạn hoặc không tồn tại, When truy cập, Then chỉ trả title trạng thái chung, không lộ title riêng |
| PB01 | Must cho mở rộng | Tôi muốn upload ảnh | Given phiên của tôi còn hạn, When gửi tối đa 3 ảnh hợp lệ ≤5 MB, Then lưu kho riêng tư, kiểm định dạng/pixel, loại EXIF và trả trạng thái xử lý |
| PB02 | Must cho mở rộng | Tôi muốn nhận ảnh thiệp và QR | Given ảnh READY đúng revision, When chốt đơn và thanh toán, Then phát hành PNG thiệp và QR chứa URL trang xem/tải; lỗi phát hành phải phân biệt với lỗi thanh toán |
| PB03 | Must cho mở rộng | Tôi muốn ảnh cùng hạn QR | Given paidAt và gói ngày, When xem trang hoặc gọi URL media, Then server chỉ chấp nhận request trước expiresAt, đúng hạn media trả 410 dù job chưa chạy |
| PB04 | Must cho mở rộng | Tôi muốn ảnh được xoá sau hạn | Given đã hết hạn/đóng phiên, When worker chạy, Then xoá mọi bản theo lịch, mục tiêu ≤24 giờ; retry/cảnh báo nếu lỗi, không mở lại truy cập |

FR18–20 áp dụng thay đổi Page Title. PB01–04 là đặc tả chưa triển khai, không thuộc kết quả test cũ. FR05/FR17 vẫn mô tả MVP URL ngoài. Khi triển khai PB02, PAID và phát hành READY là hai trạng thái riêng; chỉ ACTIVE/tạo qr_link khi đủ tài sản. JSON vẫn giới hạn 16 KB; upload có endpoint và giới hạn riêng 5 MB/file. Quy định chi tiết tại [tài liệu 11](11-photobooth-storage-qr.md).


MoSCoW: Must bắt buộc cho MVP; Should nên có; Could có thể bổ sung; Won't ngoài MVP. Given/When/Then dưới đây là điều kiện nghiệm thu, dùng thời gian server.

| ID | Ưu tiên | User Story | Acceptance Criteria |
|---|---|---|---|
| FR01 | Must | Là khách, tôi muốn hiểu sản phẩm | Given vào /, When tải xong, Then thấy giới thiệu, sản phẩm, liên hệ và CTA chọn mẫu |
| FR02 | Must | Tôi muốn chọn loại thiệp | Given /shop, When chọn thiết kế riêng, Then popup mô tả và nút Zalo/Facebook; kênh chưa cấu hình hiển thị thông báo |
| FR03 | Must | Tôi muốn tìm mẫu phù hợp | Given gian mẫu, When lọc nhóm, Then đúng 6 mẫu mỗi nhóm Couple/Gia đình/Dịp đặc biệt, tổng 18 mẫu |
| FR04 | Must | Tôi muốn cá nhân hoá | Given editor, When sửa chữ/màu/icon/animation, Then preview phản ánh tức thì và dữ liệu hợp lệ được lưu sessionStorage |
| FR05 | Should | Tôi muốn thêm media | Given editor, When nhập URL HTTPS ảnh/nhạc ≤2.048 ký tự, Then preview hiển thị media; URL sai bị chặn, media lỗi có thông báo |
| FR06 | Must | Tôi muốn xem trước | Given bản nháp hợp lệ, When mở preview, Then nội dung trùng editor và có nút quay lại |
| FR07 | Must | Tôi muốn slug riêng | Given slug 3–40 ký tự, When kiểm tra hoặc tạo đơn, Then regex, từ cấm và trùng được kiểm tra server; trùng trả 409 |
| FR08 | Must | Tôi muốn biết giá | Given chọn 2/3/4/5 ngày, When đổi gói, Then hiển thị 19/25/31/37 nghìn; server tự tính lại giá |
| FR09 | Must | Tôi muốn thanh toán QR | Given đơn mới, When mở payment, Then thấy QR mock, giá, nội dung chuyển tiền, hạn 15 phút và trạng thái |
| FR10 | Must | Tôi muốn biết kết quả | Given đơn đang chờ, When xác nhận mock thành công trước hạn, Then card ACTIVE và order PAID cùng transaction; lặp không cộng ngày |
| FR11 | Must | Tôi muốn chia sẻ thiệp | Given đơn PAID do tôi sở hữu, When mở result, Then có URL, QR tải xuống và thời điểm hết hạn |
| FR12 | Must | Người nhận muốn xem thiệp | Given /c/slug, When ACTIVE và now < expiresAt, Then hiển thị nội dung; ngược lại thông báo thân thiện, không lộ nội dung |
| FR13 | Must | Hệ thống cần thu hồi dữ liệu | Given job chạy, When quá hạn, Then đánh EXPIRED; hết hạn thêm 7 ngày xoá nội dung; lặp an toàn |
| FR14 | Must | Tôi muốn xử lý thanh toán lỗi | Given đơn PENDING, When thất bại hoặc đủ 15 phút, Then không kích hoạt, giải phóng slug giữ chỗ và cho tạo đơn khác |
| FR15 | Must | Tôi muốn đơn chỉ mình xem | Given cookie khác hoặc thiếu, When đọc/cập nhật đơn, Then trả 404 không tiết lộ đơn |
| FR16 | Could | Tôi muốn chia sẻ native | Given trình duyệt hỗ trợ, When share, Then mở share sheet; fallback copy link |
| FR17 | Won't | Tôi muốn gia hạn/upload/đăng nhập | Given MVP, When tìm chức năng, Then không cung cấp; đưa phase 2 |

## Non-functional
| ID | Tiêu chí nghiệm thu | Cách đo |
|---|---|---|
| NF01 | LCP ≤2,5s, INP ≤200ms, CLS ≤0,1 ở p75; JS route công khai mục tiêu ≤200 KB gzip | Lighthouse mobile + RUM sau pilot; media ngoài không bảo đảm |
| NF02 | API nội bộ p95 ≤500ms ở 50 phiên đồng thời, chưa tính provider | Load test staging PostgreSQL |
| NF03 | Không render HTML người dùng; server kiểm tra dữ liệu, cookie HttpOnly/SameSite=Lax, HTTPS production, origin check write | Test XSS, CSRF, IDOR; không log nội dung/media |
| NF04 | Giao dịch paid/card/QR nguyên tử; event ID unique; retry serializable | Test webhook lặp, hai đơn cùng slug, crash rollback |
| NF05 | Public card no-store, noindex; trang marketing title/description, robots | Kiểm tra HTTP và metadata |
| NF06 | 360–430px không cuộn ngang; target ≥44px; bàn phím truy cập, label, focus, reduced-motion | Chrome Android, Safari iOS ≥16.4, Zalo/Facebook webview bản hiện hành |
| NF07 | Job trễ vẫn chặn hết hạn ngay; UTC không phụ thuộc client clock | Test boundary = expiresAt và tắt job |
| NF08 | 99,5% availability pilot, backup DB hằng ngày, RPO 24h/RTO 4h | Diễn tập restore; cần hạ tầng trước launch |

Rate limit/WAF, backup, provider thật, kiểm thử thiết bị và đo tải là cổng nghiệm thu triển khai, không được coi đã hoàn tất chỉ nhờ unit test. Đề xuất edge limit 20 tạo đơn/giờ/IP, 60 kiểm tra slug/phút/IP, body ≤16 KB, cấu hình tại ingress trước mở public.
