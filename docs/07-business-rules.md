# 07. Quy tắc nghiệp vụ

> **Đã triển khai tải ảnh trực tiếp:** Editor chọn tệp JPEG/PNG/WebP (15 MB), nén WebP và lưu riêng trong PostgreSQL; ảnh nháp 24 giờ, ảnh xuất bản theo thời hạn thiệp. Chi tiết: [Tải ảnh điện thoại](13-direct-image-upload.md). Các mô tả chỉ hỗ trợ URL ảnh trước đây đã được thay thế. Private object storage và xuất ảnh tổng hợp trong tài liệu 11 vẫn là lộ trình.

> **Quy tắc hiện hành — URL tự động:** Khách chỉ sửa Page Title, không nhập hoặc chọn slug/domain. Preview → chỉnh title → chọn ngày → tạo đơn. Server cấp mã link bất định dạng `c-<32 ký tự hex>`; retry cùng phiên và Idempotency-Key giữ nguyên link. POST /api/orders chỉ nhận templateId, days, content; gửi thêm slug bị từ chối 422. GET /api/slugs/check ngừng hỗ trợ (410). Các mô tả chọn/kiểm tra slug phía dưới là lịch sử đã bị thay thế; slug trong dữ liệu vẫn là mã nội bộ để định tuyến QR. Link cũ không đổi.

## BR06 — Page Title

Khách được đổi tên tab của thiệp, không đổi domain. Title khác slug; không chỉnh URL hoặc QR khi thay title trong bản nháp. Tối đa 80 ký tự, trim, không ký tự điều khiển, trống/thiếu dùng mặc định. Chốt khi tạo đơn; sau mua không sửa theo quy tắc hiện tại. Khi thiệp hết hạn, metadata chuyển sang tên trạng thái chung và không lộ title khách đã đặt.

## BR07 — media kiểu photobooth, mới ở mức đặc tả

Áp dụng dự kiến cho mode MANAGED, thay phần ảnh URL ngoài của BR05. File raw, ảnh sạch, thumbnail, PNG xuất lưu kho riêng tư; QR chỉ encode URL trang thiệp. Hạn truy cập ảnh/link bằng paidAt + days×24h, không bắt đầu từ lượt quét đầu, không tự gia hạn khi tải lại. Server chặn mọi request mới đúng expiresAt kể cả job xoá lỗi. File binary được đưa vào xoá, mục tiêu ≤24 giờ sau hạn; JSON metadata vẫn theo 7 ngày, không làm thời gian xem thêm. Draft tối đa 24h, mỗi phiên một đơn; FAILED/EXPIRED/REVIEW đóng phiên, muốn tạo lại phải upload vào phiên mới. Raw được xoá sau xử lý, mục tiêu ≤24h từ upload. PAID nhưng phát hành lỗi không được đổi thành thất bại thanh toán. Không thu hồi được bản ảnh đã tải/in/chụp màn hình. Không tái dùng slug đã phát hành.

Chi tiết policy, ví dụ gói 3 ngày, backup/versioning và câu hỏi PO tại [tài liệu 11](11-photobooth-storage-qr.md). MVP hiện chưa có kho media riêng nên không thể cam kết xoá ảnh nguồn URL ngoài.


## Giá giả định BR01
| Ngày | Giá VND | Thời lượng |
|---|---:|---:|
| 2 | 19.000 | 48 giờ |
| 3 | 25.000 | 72 giờ |
| 4 | 31.000 | 96 giờ |
| 5 | 37.000 | 120 giờ |

Không khuyến mại, phí bổ sung hay gia hạn trong MVP. Giá do server tính. Chưa mở bán thật khi chưa chốt thuế/hoá đơn/điều khoản. Thời gian chạy từ timestamp server xác nhận thành công; expiresAt=paidAt+days×24h, không làm tròn cuối ngày.

## Slug BR02
Regex `^[a-z0-9]+(?:-[a-z0-9]+)*$`, 3–40 ký tự. Không khoảng trắng, dấu tiếng Việt, gạch đầu/cuối hay hai gạch liên tiếp. Không tự sửa slug server; UI hướng dẫn người dùng. Chặn chính xác admin/api/login/payment/result/templates/shop/editor/preview/support và token scam/sex/porn/lua-dao; danh sách khởi đầu không thay thế kiểm duyệt. Tách slug bằng '-' để kiểm tra token; lua-dao kiểm tra cụm. Unique không phân biệt hoa vì chỉ chấp nhận chữ thường.

Kiểm tra khả dụng chỉ tham khảo. Tạo đơn mới là điểm giữ chỗ nguyên tử 15 phút. Thất bại/hết hạn giải phóng giữ chỗ. Sau PAID giữ slug vĩnh viễn, kể cả thiệp hết hạn/purge.

## Thanh toán BR03
Đơn PENDING sống đúng 15 phút; now >= deadline là quá hạn. QR mock không chuyển tiền. Server không tin amount/days/status client. Payment SUCCESS phải đúng order, đúng amount, VND, còn hạn và PENDING. Xử lý lặp event hoặc SUCCESS sau PAID không tạo QR mới hay đổi paidAt. FAILED không kích hoạt; terminal không thể được hồi sinh tự động.

Event sai tiền/ngoại tệ hoặc tiền đến sau hạn ghi REVIEW, không mở thiệp và không chiếm lại slug. Đơn PAID giữ nguyên khi gặp event đến sau; event bất thường được lưu REVIEW cho đối soát. Sản phẩm thật cần staff đối soát hằng ngày theo provider eventId/reference/amount/time và thực hiện hoàn tiền ngoài hệ thống khi chưa tự động. VietQR chỉ là chuẩn/nội dung QR; cần nguồn xác nhận giao dịch từ provider/ngân hàng, không coi việc người dùng quét mã là đã trả tiền.

## Truy cập và dữ liệu BR04
Chỉ ACTIVE với expiresAt > now được render. Job là housekeeping, không phải lớp bảo vệ truy cập. Trang/API không cache, public noindex/nofollow; slug chưa tồn tại hiển thị not-found (HTTP 404 nếu chưa stream, có thể HTTP 200 nếu Next.js đã bắt đầu stream). Trang hết hạn thân thiện trả HTTP 200 với noindex, không cam kết HTTP 410 cho trang HTML trong MVP. API media 410 chỉ là thiết kế mở rộng.

Nội dung xoá sau 7 ngày hết hạn; đơn chưa paid xoá content sau deadline+7 ngày. Metadata order/payment giữ 90 ngày trong pilot rồi xoá; QR tombstone giữ tối thiểu lâu dài. Không có khôi phục sau purge. Sao lưu cần chính sách xoá tương ứng khi vận hành, mặc định cửa sổ backup đề xuất 30 ngày.

## Media và liên hệ BR05
MVP cho 1 URL ảnh và 1 URL nhạc HTTPS, không upload, không proxy/fetch media tại server để tránh SSRF. Không giới hạn thực tế kích thước file ngoài quyền kiểm soát; đây là rủi ro hiệu năng được công khai. Phase 2 chuyển asset storage, kiểm MIME/size/quét nội dung. Nút liên hệ chỉ bật với HTTPS URL đã cấu hình; không tự gửi tin nhắn.

## Câu hỏi cần PO xác nhận
Giá/thuế, nhà cung cấp thanh toán, dữ liệu lưu bao lâu, tài khoản liên hệ, nội dung cấm và SLA xử lý khiếu nại; danh sách tổng hợp ở 01-product-overview. Cho đến khi chốt, chỉ chạy pilot mock, không mở thu tiền.
