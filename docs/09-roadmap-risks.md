# 09. Lộ trình và rủi ro

> **Quy tắc hiện hành — URL tự động:** Khách chỉ sửa Page Title, không nhập hoặc chọn slug/domain. Preview → chỉnh title → chọn ngày → tạo đơn. Server cấp mã link bất định dạng `c-<32 ký tự hex>`; retry cùng phiên và Idempotency-Key giữ nguyên link. POST /api/orders chỉ nhận templateId, days, content; gửi thêm slug bị từ chối 422. GET /api/slugs/check ngừng hỗ trợ (410). Các mô tả chọn/kiểm tra slug phía dưới là lịch sử đã bị thay thế; slug trong dữ liệu vẫn là mã nội bộ để định tuyến QR. Link cũ không đổi.

## Hạng mục mới ngày 01/10/2026

Page Title: bổ sung cấu hình title tập trung, input của khách, validation và generateMetadata theo route; không thay đổi domain/URL. Kiểm thử TC23–26 gồm chuyển route và title khi hết hạn.

Media kiểu photobooth mới ở mức thiết kế: chốt provider/retention → schema session/asset/outbox → upload và render → gắn đơn và publicationStatus → stream ảnh kiểm hạn → worker xoá và kiểm thử PB-T01–09. Ước lượng thêm 1–2 sprint sau khi chốt nhà cung cấp, chưa tính là hoàn tất MVP. Rủi ro cần nghiệm thu: ảnh public/cache còn truy cập sau hạn; render quá tải; orphan giữa DB/storage; version cũ còn tồn tại; mất ảnh khi không backup; egress cao; đã thu tiền nhưng phát hành lỗi. Biện pháp và câu hỏi PO tại tài liệu 11.


## Lộ trình dự kiến
| Mốc | Công việc | Điều kiện kết thúc |
|---|---|---|
| Tuần 1 | PO duyệt tài liệu, giá và nội dung 18 mẫu; MVP mock | Luồng end-to-end chạy và TC P0 đạt |
| Tuần 2 | Kiểm thử mobile/webview, accessibility, tối ưu assets; staging | Không lỗi P0, đo hiệu năng và khôi phục DB đạt |
| Tuần 3–4 | Provider thật, webhook, đối soát/hoàn tiền, điều khoản | Sandbox provider pass; rà soát bảo mật/vận hành; PO duyệt mở bán |
| Phase 2 | Đăng nhập, media upload, gia hạn, admin, analytics | Prioritize theo conversion/support thực tế |

Đây là ước lượng cho nhóm 1 FE + 1 BE + QA bán thời gian, phụ thuộc provider và pháp lý; không phải cam kết lịch. Bản hiện tại là MVP mock, chưa là hệ thống thu tiền production.

## Rủi ro và xử lý
| Rủi ro | Mức | Giảm thiểu / chủ sở hữu |
|---|---|---|
| Trùng slug, retry làm kích hoạt hai lần | Cao | Unique + serializable + idempotency; BE |
| Tiền muộn/sai nội dung | Cao | REVIEW, đối soát, không tự kích hoạt; vận hành |
| QR localhost không dùng trên điện thoại | Vừa | APP_URL HTTPS staging; DevOps |
| Webview chặn download/audio | Vừa | URL copy, audio controls, mở trình duyệt ngoài; FE |
| Link bị chia sẻ ngoài ý muốn | Cao | Công khai ai có link đều xem; không thu dữ liệu nhạy cảm; PO |
| URL media nặng/hỏng/tracking | Cao | MVP tuỳ chọn, referrer policy; storage phase 2; FE/PO |
| Spam tạo đơn giữ slug | Cao | Edge rate limit, theo dõi, CAPTCHA khi cần trước mở public; DevOps |
| Cleanup không chạy | Vừa | Chặn theo server clock từng request, alert cron, retention monitor; DevOps |
| Mất cookie | Vừa | Hướng dẫn lưu link; đăng nhập/khôi phục phase 2; PO |
| Thiếu chính sách lưu trữ/hoàn tiền | Cao | Duyệt pháp lý và vận hành trước nhận tiền; PO |

## Câu hỏi cần PO xác nhận
Duyệt toàn bộ 8 câu ở tài liệu 01, chọn tên thương hiệu và nội dung liên hệ. Chốt có cho chỉnh sau mua hay không; có cần link bí mật/password; có sản phẩm thiết kế riêng tính phí trên website trong phase 2. Không chặn phát triển mock vì các câu hỏi này đã có giả định; chặn mở bán nếu chưa duyệt thanh toán/điều khoản.

## Definition of Done
Tài liệu đồng nhất API/schema/code; migration+seed lặp an toàn; typecheck/test/build đạt; TC P0 trên DB thực đạt; UX mobile được kiểm; không có secret trong repo; có runbook cleanup/backup/restore; PO biết rõ phần chưa triển khai. Launch bổ sung provider thật, edge limits, quan sát/log che dữ liệu và quy trình hỗ trợ.
