# 04. Đặc tả màn hình

> **Đã triển khai tải ảnh trực tiếp:** Editor chọn tệp JPEG/PNG/WebP (15 MB), nén WebP và lưu riêng trong PostgreSQL; ảnh nháp 24 giờ, ảnh xuất bản theo thời hạn thiệp. Chi tiết: [Tải ảnh điện thoại](13-direct-image-upload.md). Các mô tả chỉ hỗ trợ URL ảnh trước đây đã được thay thế. Private object storage và xuất ảnh tổng hợp trong tài liệu 11 vẫn là lộ trình.

> **Quy tắc hiện hành — URL tự động:** Khách chỉ sửa Page Title, không nhập hoặc chọn slug/domain. Preview → chỉnh title → chọn ngày → tạo đơn. Server cấp mã link bất định dạng `c-<32 ký tự hex>`; retry cùng phiên và Idempotency-Key giữ nguyên link. POST /api/orders chỉ nhận templateId, days, content; gửi thêm slug bị từ chối 422. GET /api/slugs/check ngừng hỗ trợ (410). Các mô tả chọn/kiểm tra slug phía dưới là lịch sử đã bị thay thế; slug trong dữ liệu vẫn là mã nội bộ để định tuyến QR. Link cũ không đổi.

## Bổ sung Page Title

Editor có ô “Tiêu đề tab trình duyệt”, tối đa 80 ký tự; trim khoảng trắng, không nhận ký tự điều khiển; để trống dùng mặc định. Trợ giúp nêu rõ đây là chữ trên tab khi người nhận mở thiệp, không đổi domain/URL. Preview hiển thị title đã chốt; tab Editor/Preview vẫn dùng tên màn hình tương ứng. Public card còn hạn dùng title riêng không thêm hậu tố thương hiệu; hết hạn dùng “Thiệp đã hết hạn”, không tìm thấy dùng title chung. Home/Shop/Templates/Editor/Preview/Payment/Result đều có title theo route, cấu hình tập trung.

## UI media photobooth dự kiến, chưa triển khai

Editor sẽ có chọn tệp, thumbnail và trạng thái UPLOADING/PROCESSING/READY/FAILED; chưa ảnh hiển thị hướng dẫn. Preview chờ render PNG đúng revision, lỗi cho retry và chưa cho tạo đơn. Result phân biệt PAID nhưng đang phát hành với READY; có nút tải PNG QR và PNG thiệp riêng. Public hiển thị hạn giờ Việt Nam và tải ảnh; media 410 chuyển sang thông báo hết hạn. File >5 MB, ảnh thứ tư, MIME/pixel sai bị từ chối. Tab mở qua hạn phải ẩn nút tải; server vẫn kiểm tra độc lập. Xem [tài liệu 11](11-photobooth-storage-qr.md).


## Quy ước chung
Navigation logo/Chọn mẫu/Gian hàng; container responsive, nền kem, điểm nhấn hồng, nút ≥44px. Loading có nội dung tiếng Việt, lỗi có hành động thử lại. Form có label và lỗi aria-live. Dữ liệu editor được giữ trong sessionStorage của tab, chỉ ghi sau khi hydrate để không đè draft. Không lưu token thanh toán trong localStorage.

| Màn hình/URL | Mục đích và UI | Hành vi, trạng thái | Validation |
|---|---|---|---|
| Home / | Hero, CTA, 3 bước, giới thiệu, liên hệ | CTA mở shop/templates; trang server-render | Không có input |
| Shop /shop | 2 thẻ sản phẩm, giá từ 19.000đ | Mẫu có sẵn mở templates; riêng mở dialog có đóng/Escape/focus, kênh thiếu thông báo | Chỉ URL liên hệ HTTPS |
| Templates /templates | 3 bộ lọc + tất cả, lưới 18 mẫu, badge nhóm | Chọn mở editor?template=id; empty báo không có mẫu; DB lỗi trang retry | Nhóm nằm trong enum |
| Editor /editor | Tên người nhận, lời chúc, người gửi, màu, icon, chuyển động, ảnh/nhạc URL; live card | Draft sessionStorage; mẫu không tồn tại thông báo; preview CTA; media lỗi fallback | Recipient 1–60; sender 1–60; message 1–600; màu hex; icon heart/star/flower; animation float/sparkle/none; URL HTTPS ≤2048 |
| Preview /preview | Thiệp, quay lại, slug, 4 gói, tổng tiền | Không draft: CTA chọn mẫu; check slug báo khả dụng; submit disable khi chờ; conflict giữ dữ liệu và cho sửa | Slug regex 3–40, không dấu, không từ cấm; days chỉ 2,3,4,5; validate lại server |
| Payment /payment/id | QR có nhãn mô phỏng, tổng tiền, nội dung chuyển khoản, hạn đơn, status, 2 nút mock | Poll 3s, ngừng khi terminal/unmount; PAID chuyển result; EXPIRED/FAILED/REVIEW có hướng dẫn; mất mạng thử lại | Owner cookie, mock chỉ development/test, không cho click khi busy |
| Result /result/id | Chúc mừng, QR, URL, copy, tải PNG, ngày hết hạn | Pending hướng dẫn trở lại payment; expired báo hết hạn; không tự kích hoạt bằng URL | Owner, chỉ PAID có QR; lỗi clipboard vẫn cho chọn/copy URL |
| Public /c/slug | Thiệp full screen, chữ/ảnh/nhạc có controls | Sai slug/không có: không tìm thấy; chưa paid: chưa sẵn sàng; hết hạn: thông báo và CTA tạo mới | Kiểm tra now < expiresAt mỗi request; no-store/noindex |
| Not found/error | Thông báo rõ và về trang chủ/thử lại | Không lộ stack/database secret | Không có |

Ảnh dùng object-fit và chiều cao cố định để hạn chế layout shift; nhạc chỉ tải metadata hoặc none, bật bằng thao tác người nhận. Hiệu ứng bị tắt với prefers-reduced-motion. URL media bên ngoài có thể không hỗ trợ hotlink; phải thể hiện lỗi và giữ lời chúc đọc được. Preview là mẫu màn hình, không đảm bảo âm thanh autoplay trong webview.

Triển khai MVP: gian mẫu đọc catalog tĩnh cùng nguồn với seed nên vẫn xem được khi DB tạm ngừng; lỗi DB xuất hiện khi kiểm tra slug/tạo đơn. Không có empty state thực tế ở bộ lọc vì mỗi nhóm cố định 6 mẫu. Khi bổ sung quản trị mẫu ở phase 2, chuyển sang API và dùng các trạng thái loading/empty/error như bảng trên.


## Bổ sung: bộ sưu tập và trang sản phẩm độc lập

Bộ sưu tập có 18 mẫu, chia đều 6 mẫu cho Couple, Gia đình và Dịp đặc biệt. Mẫu mới gồm Lời hẹn dưới ánh trăng, Save the date, Mừng thọ, Hẹn cả nhà về ăn cơm, Ngày tốt nghiệp và Tiệc nhỏ. Khách có thể chỉnh người nhận, lời nhắn, ảnh và thông tin sự kiện trước khi xuất bản.

URL QR vẫn mở `/c/[slug]`. Trang này dùng khung toàn màn hình riêng, không có logo, menu, tiêu đề trang bán hàng, chân trang hay nút dẫn về gian hàng. Tiêu đề và lời nhắn bên trong thiệp vẫn là nội dung của sản phẩm; Page Title trên tab vẫn theo khách đặt. Trình duyệt vẫn quản lý thanh địa chỉ của nó. Khi thiệp hết hạn hoặc không tồn tại, chỉ hiển thị thông báo thân thiện.

Nghiệm thu: mở mẫu mới từng nhóm, tạo đơn ở chế độ bypass local, kiểm tra QR PNG và URL; trang công khai không có header/nav/footer của website; chạm mở phong bì, khui quà, thả cảm xúc; mở lại gian hàng vẫn có menu. Kiểm tra cả QR cũ còn hạn và link hết hạn.


Bản cập nhật thiết kế: tên mẫu và bố cục trong bộ sưu tập được thay thế theo [ma trận 18 thiết kế](12-template-design-system.md). Gian mẫu hiển thị bản thu nhỏ của trang mở đầu; Editor và Preview sử dụng cùng bộ dựng với trang QR.
