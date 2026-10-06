# Tải ảnh trực tiếp từ điện thoại

## Hành vi hiện hành

Editor thay ô URL ảnh bằng bộ chọn tệp cho ảnh chính và mỗi khối ảnh. Khách chọn từ thư viện hoặc lựa chọn chụp ảnh do trình duyệt/điện thoại cung cấp, xem trước, chọn tệp khác để thay và xóa ảnh khỏi bản nháp. Trong lúc tải, không thể tiếp tục xuất bản hoặc bắt đầu tải ảnh khác. Lỗi mạng giữ nguyên ảnh cũ và có thể chọn lại tệp để thử lại.

JPEG, PNG, WebP tĩnh; tối đa 15 MB đầu vào, 40 megapixel. HEIC chưa hỗ trợ: xuất JPEG trước khi chọn. Server kiểm tra cả định dạng được giải mã, tự xoay theo hướng ảnh, thu nhỏ tối đa 2000×2000 và xuất WebP chất lượng 82; không giữ EXIF/GPS. URL ảnh HTTPS của thiệp/bản nháp cũ vẫn đọc được để tương thích, nhưng giao diện mới không yêu cầu nhập URL.

## Lưu trữ MVP

Ảnh lưu dạng BYTEA trong PostgreSQL, bảng `asset`, không nằm trong thư mục public. Quan hệ nhiều-nhiều `Asset.cards` cho phép cùng một ảnh được sử dụng trong nhiều thiệp của cùng chủ phiên. JSON nội dung chỉ lưu địa chỉ `/api/media/<48 ký tự hex>`, không lưu base64. Cách này phù hợp bản MVP một ứng dụng; khi tăng lưu lượng cần chuyển dữ liệu ảnh sang private object storage theo thiết kế trong tài liệu 11.

- Nháp chưa gắn thiệp: chỉ cookie phiên tải lên được xem trong 24 giờ.
- Đơn chờ: chỉ chủ phiên xem tới hạn thanh toán.
- Thiệp hoạt động: người có URL ảnh được xem trong thời hạn của ít nhất một thiệp đang sử dụng ảnh.
- Thiệp hết hạn: đường ảnh bị chặn ngay khi request, kể cả chủ phiên; không chờ job. Bản đã tải xuống thiết bị của người nhận không thể thu hồi.
- Cleanup hiện có xóa ảnh không còn thiệp hoạt động/đơn chờ hợp lệ; ảnh nháp bỏ dở xóa sau 24 giờ. Cần gọi cron endpoint hoặc chạy lệnh cleanup theo lịch của môi trường triển khai; không tự tạo scheduler mới trong thay đổi này.
- Xóa ảnh trong editor chỉ bỏ tham chiếu bản nháp. Không xóa ảnh của thiệp đã xuất; ảnh bỏ dở sẽ được cleanup xử lý.

## API

| Endpoint | Đầu vào | Kết quả | Lỗi |
|---|---|---|---|
| POST /api/media | Body nhị phân ảnh; Content-Type image/jpeg, image/png hoặc image/webp; Origin đúng APP_URL | 201 `{url}`; đặt cookie phiên nếu chưa có | 403 Origin; 413 quá dung lượng; 415 loại không hỗ trợ; 422 giải mã lỗi/nhiều khung/quá số pixel; 429 quá 30 ảnh trong 24 giờ mỗi phiên |
| GET /api/media/:id | Cookie cho ảnh nháp; không cần cookie khi gắn thiệp active | 200 image/webp; private, no-store | 404 khi sai ID, không có quyền, đã hết hạn hoặc đã dọn |
| POST /api/orders | Nội dung có địa chỉ ảnh đã tải lên | Kiểm tra quyền sở hữu và thời gian sử dụng, liên kết ảnh và thiệp trong cùng transaction | 422 IMAGE_UNAVAILABLE nếu ảnh hết hạn hoặc của phiên khác |

Giới hạn theo phiên là bảo vệ cơ bản của MVP; không phải hạn mức người dùng đã xác thực. Triển khai công khai cần rate limit upload tại ingress cùng giới hạn body tương ứng.

## Kiểm tra

`tests/uploads-http.test.ts`: dùng PNG mẫu, kiểm tra đầu ra WebP không EXIF, nháp ẩn với phiên khác, ngăn gắn ảnh của người khác, xuất bản và QR thành công, ảnh chặn sau khi thiệp hết hạn, loại tệp giả/SVG/ảnh quá 15 MB. Build và typecheck phải đạt. Không dùng ảnh cá nhân của khách để kiểm thử.
