# 06. API v1 (prefix /api)

> **Đã triển khai tải ảnh trực tiếp:** Editor chọn tệp JPEG/PNG/WebP (15 MB), nén WebP và lưu riêng trong PostgreSQL; ảnh nháp 24 giờ, ảnh xuất bản theo thời hạn thiệp. Chi tiết: [Tải ảnh điện thoại](13-direct-image-upload.md). Các mô tả chỉ hỗ trợ URL ảnh trước đây đã được thay thế. Private object storage và xuất ảnh tổng hợp trong tài liệu 11 vẫn là lộ trình.

> **Quy tắc hiện hành — URL tự động:** Khách chỉ sửa Page Title, không nhập hoặc chọn slug/domain. Preview → chỉnh title → chọn ngày → tạo đơn. Server cấp mã link bất định dạng `c-<32 ký tự hex>`; retry cùng phiên và Idempotency-Key giữ nguyên link. POST /api/orders chỉ nhận templateId, days, content; gửi thêm slug bị từ chối 422. GET /api/slugs/check ngừng hỗ trợ (410). Các mô tả chọn/kiểm tra slug phía dưới là lịch sử đã bị thay thế; slug trong dữ liệu vẫn là mã nội bộ để định tuyến QR. Link cũ không đổi.

## Bổ sung hợp đồng Page Title

POST /api/orders nhận thêm `content.pageTitle`, ví dụ `"Một món quà dành riêng cho mẹ"`. Server trim, giới hạn 80 ký tự, không nhận ký tự điều khiển; thiếu/trống dùng mặc định. Không cần endpoint mới. Title được snapshot và tham gia fingerprint; replay cùng Idempotency-Key nhưng title khác trả 409 IDEMPOTENCY_CONFLICT. Domain/slug/URL QR vẫn xử lý như trước. Metadata /c/slug dùng title riêng chỉ khi còn hạn; title là text được framework escape, không phải HTML.

## API media đề xuất, chưa triển khai

[Tài liệu 11, mục 7](11-photobooth-storage-qr.md#7-api-đề-xuất-chưa-tồn-tại-trong-mvp) có hợp đồng tạo phiên, upload multipart, render, trạng thái và stream ảnh. Dự kiến mở rộng POST orders bằng mediaMode/mediaSessionId/revision; GET order thêm publicationStatus/mediaExpiresAt, PAID chưa READY thì url=null. QR nhận ảnh phải kiểm tra READY và hạn. Media trả 410 LINK_EXPIRED, 404 sai asset, 503 storage lỗi; mọi lượt tải/Range kiểm tra thời hạn; không trả public object URL. Upload binary có giới hạn riêng 5 MB/file; JSON giữ 16 KB.


JSON UTF-8. Thành công trả đối tượng; lỗi `{ "error": { "code": "SLUG_TAKEN", "message": "Đường dẫn đã được sử dụng." } }`. Không trả stack. Các API đơn dùng cookie gt_session HttpOnly, SameSite=Lax, Path=/, Secure ở production, sống 90 ngày; không truyền owner trong body. Write từ browser phải có Origin đúng APP_URL. API đọc đơn và công khai no-store.

| Method + path | Request | Success | Lỗi |
|---|---|---|---|
| GET /templates | Không | 200 `{templates:[{id,name,category,palette,icon,description}]}` | 503 DB lỗi |
| GET /slugs/check?slug=gui-me | Query slug | 200 `{available:true}` hoặc false | 422 sai/cấm |
| POST /orders | Header Idempotency-Key UUID; JSON như dưới | 201 `{id,status,amount,days,paymentDeadline}`; replay 200 cùng đơn | 422 validation; 404 template; 409 SLUG_TAKEN/IDEMPOTENCY_CONFLICT; 403 ORIGIN_DENIED; 413 body lớn |
| GET /orders/:id | Cookie | 200 `{id,status,amount,days,paymentDeadline,paidAt,expiresAt,url,paymentPayload}` | 404 không có/không sở hữu |
| POST /payments/mock | `{orderId,outcome:"SUCCESS" hoặc "FAILED"}` + cookie | 200 trạng thái đơn | 404 owner; 403 MOCK_DISABLED; 409 terminal |
| GET /orders/:id/qr | Cookie; query kind=payment hoặc card (default card) | 200 image/png; payment encode mock payload, card encode URL | 404 owner; 409 chưa PAID/link đã hết hạn |
| POST /jobs/cleanup | Authorization Bearer CRON_SECRET | 200 `{expiredOrders,expiredCards,purgedCards,deletedOrders}` | 401 unauthorized |

```json
{
  "templateId": "couple-1",
  "slug": "gui-em-thang-9",
  "days": 3,
  "content": {
    "recipient": "Người thương",
    "sender": "Anh",
    "message": "Cảm ơn em vì đã ở đây.",
    "background": "#fce7e9",
    "icon": "heart",
    "animation": "float",
    "imageUrl": "",
    "musicUrl": ""
  }
}
```

paymentPayload dạng `MOCK|orderId|amount|VND`, không phải mã chuyển tiền ngân hàng. APP_URL là cấu hình tin cậy, không dựng link từ Host request. Deadline và expiresAt là ISO-8601 UTC. Status có PENDING, PAID, FAILED, EXPIRED, REVIEW. url chỉ có khi order PAID.

## Hợp đồng provider
PaymentProvider có createInstruction(order) và normalizeEvent(input). Event chuẩn gồm eventId, orderId, amount, currency, outcome. Mock server tự lấy amount của đơn, không nhận giá client. Provider thật cần bổ sung verify signature raw body, merchant/account match, reference, replay protection, retry/backoff và API tra cứu; chưa công khai endpoint webhook thật vì chưa có hợp đồng cổng thanh toán. Một endpoint chỉ nhận lời báo SUCCESS từ browser tuyệt đối không đủ dùng nhận tiền thật.

## Mã lỗi chung
VALIDATION_ERROR 422; INVALID_JSON 400; BODY_TOO_LARGE 413; ORIGIN_DENIED 403; NOT_FOUND 404; SLUG_TAKEN và IDEMPOTENCY_CONFLICT 409; PAYMENT_TERMINAL 409; QR_UNAVAILABLE 409; MOCK_DISABLED 403; UNAUTHORIZED 401; SERVICE_UNAVAILABLE 503; INTERNAL_ERROR 500. Client giữ bản nháp sau lỗi, không suy ra paid từ redirect.
