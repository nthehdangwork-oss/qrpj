# 01. Tổng quan sản phẩm

> **Quy tắc hiện hành — URL tự động:** Khách chỉ sửa Page Title, không nhập hoặc chọn slug/domain. Preview → chỉnh title → chọn ngày → tạo đơn. Server cấp mã link bất định dạng `c-<32 ký tự hex>`; retry cùng phiên và Idempotency-Key giữ nguyên link. POST /api/orders chỉ nhận templateId, days, content; gửi thêm slug bị từ chối 422. GET /api/slugs/check ngừng hỗ trợ (410). Các mô tả chọn/kiểm tra slug phía dưới là lịch sử đã bị thay thế; slug trong dữ liệu vẫn là mã nội bộ để định tuyến QR. Link cũ không đổi.

## Bổ sung 01/10/2026

Thiết kế lưu ảnh kiểu photobooth tại [tài liệu 11](11-photobooth-storage-qr.md): một phiên tạo thiệp quản lý tối đa 3 ảnh ×5 MB, xuất PNG tĩnh, phát hành QR để xem/tải trong gói 2–5 ngày. File ở kho riêng tư, hết hạn chặn truy cập ngay và mục tiêu xoá vật lý trong 24 giờ. Đây là mở rộng được đặc tả trước, chưa triển khai; không bao gồm máy chụp/in vật lý. Các câu hỏi PO về storage, ảnh/video, truy cập bằng PIN, retention, chi phí và lỗi phát hành được gom tại mục 10 tài liệu 11.

Đã bổ sung khả năng đặt Page Title: khách chọn chữ hiển thị trên tab của thiệp, không đổi domain hay URL. Phân biệt rõ `pageTitle` (tên tab) và `slug` (đường dẫn thiệp); không dùng title để tự sửa slug. Tiêu đề thiệp được chốt khi tạo đơn như nội dung hiện tại.


## Mục tiêu
Giúp người không có kỹ năng thiết kế tạo thiệp cá nhân hoá trên điện thoại trong khoảng 3 phút, trả tiền theo thời gian tồn tại và chia sẻ bằng QR/link ngay sau xác nhận. Tên làm việc: Gửi thương. KPI thử nghiệm: ≥70% người bắt đầu editor hoàn thành preview, ≥40% tạo đơn thanh toán thành công, tỷ lệ lỗi kích hoạt <0,5%. Đo KPI sau khi có analytics được đồng ý; hiện chưa thu tracking.

## Persona và giá trị
| Persona | Nhu cầu | Trở ngại | Giá trị |
|---|---|---|---|
| Người trẻ 18–30 | Gửi lời yêu, sinh nhật | Không biết thiết kế, thao tác qua webview | Mẫu đẹp, ít bước, link dễ nhớ |
| Thành viên gia đình 25–45 | Chúc bố mẹ, người thân | Chữ nhỏ, giao diện phức tạp | Nút lớn, tiếng Việt, xem trước rõ ràng |
| Khách muốn thiết kế riêng | Thiệp theo câu chuyện cá nhân | Không biết mô tả yêu cầu | Chuyển Zalo/Facebook qua popup có xác nhận |

## Phạm vi
MVP: Home, Shop hai sản phẩm; 3 nhóm × 6 mẫu; editor văn bản/màu/hiệu ứng/icon; URL ảnh/nhạc HTTPS tuỳ chọn; preview; kiểm tra slug; 4 gói ngày; QR thanh toán mock; xác nhận idempotent; QR/link công khai; chặn hết hạn theo server; cleanup; bảo vệ quyền xem đơn bằng cookie khách.

Phase 2: provider thật và hoàn tiền tự động; đăng nhập/khôi phục đơn; upload ảnh/nhạc có kiểm duyệt; dashboard quản trị; gia hạn; analytics; thư viện Lottie; chống lạm dụng nâng cao. Thiết kế riêng trong MVP chỉ là liên hệ, không có thanh toán hay workflow thiết kế riêng.

## Giả định và giới hạn
Không đăng nhập, không sửa sau tạo đơn; muốn đổi nội dung phải tạo đơn mới. Ngày là 24 giờ kể từ paidAt, lưu UTC, hiển thị giờ Việt Nam. Không gia hạn. Không tái sử dụng slug đã phát hành. Nội dung không được lập chỉ mục tìm kiếm. Người biết link đều có thể xem, không coi đây là kho dữ liệu bí mật.

## Câu hỏi cần PO xác nhận
1. Giá 19/25/31/37 nghìn có bao gồm thuế và chính sách hoàn tiền nào?
2. Chọn PayOS hay SePay, tài khoản nhận tiền và người chịu trách nhiệm đối soát?
3. Có cần đăng nhập, khôi phục đơn hoặc chỉnh sửa sau thanh toán?
4. Có gia hạn và tái sử dụng slug không? Đề xuất hiện tại: không.
5. URL ảnh/nhạc có đủ cho thử nghiệm? Phase 2 đề xuất 3 ảnh × 5 MB, 1 nhạc ≤10 MB/3 phút.
6. Tài khoản Zalo/Facebook chính thức, điều khoản, đầu mối xử lý nội dung vi phạm?
7. Duyệt chính sách xoá nội dung sau 7 ngày hết hạn, metadata đơn giữ 90 ngày cho pilot?
8. Có cần kiểm duyệt từ nhạy cảm theo danh sách riêng và giới hạn độ tuổi?
