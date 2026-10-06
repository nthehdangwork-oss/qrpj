# 08. Kiểm thử

> **Quy tắc hiện hành — URL tự động:** Khách chỉ sửa Page Title, không nhập hoặc chọn slug/domain. Preview → chỉnh title → chọn ngày → tạo đơn. Server cấp mã link bất định dạng `c-<32 ký tự hex>`; retry cùng phiên và Idempotency-Key giữ nguyên link. POST /api/orders chỉ nhận templateId, days, content; gửi thêm slug bị từ chối 422. GET /api/slugs/check ngừng hỗ trợ (410). Các mô tả chọn/kiểm tra slug phía dưới là lịch sử đã bị thay thế; slug trong dữ liệu vẫn là mã nội bộ để định tuyến QR. Link cũ không đổi.

## Ca bổ sung Page Title

| ID | Mức | Thao tác | Kết quả mong đợi |
|---|---|---|---|
| TC23 | P0 | Nhập title tiếng Việt → preview → tạo đơn → paid → mở thiệp | Tab hiện đúng title đã nhập, không thêm thương hiệu, URL/QR không đổi |
| TC24 | P1 | Để trống/thiệp cũ thiếu title; gửi 81 ký tự hoặc control character | Trống/thiếu fallback; dữ liệu sai 422 |
| TC25 | P0 | Chuyển public card → Home → Shop → Templates → Editor → Preview; mở Payment/Result | Mỗi route đúng title của mình, không giữ title trang trước |
| TC26 | P0 | Title có ký tự < > &; mở thiệp hết hạn/không tồn tại | Escape thành text an toàn; hết hạn/missing không lộ title riêng |

## Ca nghiệm thu media photobooth — chưa thực thi

| ID | Mức | Thao tác | Kết quả mong đợi |
|---|---|---|---|
| PB-T01 | P0 | 3 ảnh hợp lệ, ảnh thứ 4, >5 MB, MIME sai, >20 megapixel | Chỉ nhận đúng giới hạn |
| PB-T02 | P0 | EXIF/GPS, đọc URL bucket trực tiếp, lấy asset của khách khác | Loại metadata; chặn bucket và sai quyền |
| PB-T03 | P0 | Render rồi sửa nội dung và tạo đơn revision cũ | 409, phải render lại |
| PB-T04 | P0 | PAID/READY → QR → xem/tải PNG | Đúng bộ ảnh, QR không chứa object URL |
| PB-T05 | P0 | expiresAt−1ms, đúng hạn, +1ms; worker ngừng; URL tải/Range trực tiếp | Chỉ request trước hạn được phục vụ; sau hạn media 410, không cache lọt ảnh |
| PB-T06 | P0 | Storage lỗi xoá, worker retry/chạy trùng | Không mở lại ảnh; DELETED chỉ khi xoá thật; cảnh báo quá 24h |
| PB-T07 | P1 | Bỏ draft 24h, payment failed/expired, upload chưa confirm | Dọn raw/orphan/derived đúng policy |
| PB-T08 | P0 | Thanh toán xong nhưng phát hành lỗi | PAID không đổi, chưa có QR, retry phát hành, không thu tiền lại |
| PB-T09 | P1 | Versioning/backup/restore; file đã tải về thiết bị | Không phục hồi quyền ảnh quá hạn; không tuyên bố xoá file trên máy khách |

PB-T01–09 chỉ là đặc tả nghiệm thu, không nằm trong báo cáo đạt trước đây.


Tiền điều kiện: migration và seed hoàn tất, app development, mock bật, cookie hợp lệ. Dữ liệu mẫu slug duy nhất cho mỗi ca; dùng clock injection trong service để kiểm thử biên, không chỉnh đồng hồ máy. P0 chặn nghiệm thu, P1 quan trọng.

| ID | Mức | Liên kết | Thao tác/dữ liệu | Kết quả mong đợi |
|---|---|---|---|---|
| TC01 | P0 | FR03 | Seed và mở 3 nhóm | 6 mẫu/nhóm, tổng 18 |
| TC02 | P0 | FR04–06 | Nhập lời chúc rồi preview/quay lại/refresh | Bảo toàn nội dung; không ghi đè draft khi hydrate |
| TC03 | P0 | FR07 | Slug hoa, dấu, --, <3, >40, admin, lua-dao | 422, chưa tạo card/order |
| TC04 | P0 | FR07 | Hai khách tạo cùng slug đồng thời | Một đơn thành công, còn lại 409; không card mồ côi |
| TC05 | P0 | FR08 | Mỗi gói 2–5 ngày; gửi thêm amount=1 | Giá chuẩn server; không nhận giá client |
| TC06 | P0 | FR09–11 | Create → SUCCESS → result → public | PAID/ACTIVE/QR đồng bộ, hết hạn đúng days×24h |
| TC07 | P0 | FR10 | Gửi SUCCESS lặp và đồng thời | Một lần activation, paidAt/expiresAt bất biến |
| TC08 | P0 | FR14 | FAILED rồi SUCCESS | Không kích hoạt; tiền muộn REVIEW |
| TC09 | P0 | FR14 | SUCCESS ở deadline−1ms, deadline, deadline+1ms | Chỉ trường hợp đầu ACTIVE |
| TC10 | P0 | FR12 | Xem expiresAt−1ms / đúng expiresAt, job không chạy | Trước hạn thấy thiệp; đúng hạn chặn nội dung |
| TC11 | P0 | FR15 | Cookie khác đọc order, QR và mock | 404, không lộ dữ liệu |
| TC12 | P0 | NF03 | Origin khác, body quá 16KB, JSON lỗi | 403/413/400 |
| TC13 | P0 | FR10 | Event amount sai/currency sai | REVIEW, không ACTIVE |
| TC14 | P1 | FR11 | Quét PNG QR bằng điện thoại | URL đúng APP_URL và đúng slug |
| TC15 | P1 | FR13 | Cleanup lặp trước/sau 7 ngày, sau 90 ngày | Purge đúng mốc, không xoá thiệp còn hạn, tombstone còn |
| TC16 | P1 | FR07 | Hết giữ chỗ 15 phút rồi tạo đơn mới cùng slug | Thành công; late payment đơn cũ không chiếm lại |
| TC17 | P1 | NF06 | 360px, iOS, Android và 2 webview | Không overflow, keyboard/focus được, nhạc play thủ công |
| TC18 | P1 | FR05 | Media URL lỗi, http, javascript: | HTTPS lỗi có fallback; scheme không hợp lệ bị chặn |
| TC19 | P0 | NF04 | Retry create cùng key/body, rồi đổi body | Replay cùng ID; đổi body 409 |
| TC20 | P1 | FR09 | Mất mạng khi SUCCESS, reload payment | Đọc server; không tạo đơn/thanh toán thứ hai |
| TC21 | P0 | NF03 | Production hoặc mock bị tắt | Endpoint mock 403, UI không cho xác nhận |
| TC22 | P1 | NF03 | Nội dung chứa script/HTML | Hiển thị dạng chữ; không thực thi |

## Tự động và thủ công
`npm test` chạy unit nghiệp vụ. `npm run test:integration` cần PostgreSQL test riêng qua DATABASE_URL: kiểm tra transaction, concurrency, idempotency, expiry, cleanup; không chạy trên DB có dữ liệu khách. Build/typecheck kiểm tra cấu trúc. Kiểm thử trình duyệt, QR bằng camera, tải 4G và provider thật không được thay thế bằng unit test. Kết quả thực thi và giới hạn được ghi ở docs/10-validation.md khi bàn giao.


## Bổ sung: bộ sưu tập và trang sản phẩm độc lập

Bộ sưu tập có 18 mẫu, chia đều 6 mẫu cho Couple, Gia đình và Dịp đặc biệt. Mẫu mới gồm Lời hẹn dưới ánh trăng, Save the date, Mừng thọ, Hẹn cả nhà về ăn cơm, Ngày tốt nghiệp và Tiệc nhỏ. Khách có thể chỉnh người nhận, lời nhắn, ảnh và thông tin sự kiện trước khi xuất bản.

URL QR vẫn mở `/c/[slug]`. Trang này dùng khung toàn màn hình riêng, không có logo, menu, tiêu đề trang bán hàng, chân trang hay nút dẫn về gian hàng. Tiêu đề và lời nhắn bên trong thiệp vẫn là nội dung của sản phẩm; Page Title trên tab vẫn theo khách đặt. Trình duyệt vẫn quản lý thanh địa chỉ của nó. Khi thiệp hết hạn hoặc không tồn tại, chỉ hiển thị thông báo thân thiện.

Nghiệm thu: mở mẫu mới từng nhóm, tạo đơn ở chế độ bypass local, kiểm tra QR PNG và URL; trang công khai không có header/nav/footer của website; chạm mở phong bì, khui quà, thả cảm xúc; mở lại gian hàng vẫn có menu. Kiểm tra cả QR cũ còn hạn và link hết hạn.
