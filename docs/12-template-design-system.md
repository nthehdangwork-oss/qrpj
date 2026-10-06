# Bộ thiết kế landing page — 18 hướng riêng

> **Quy tắc hiện hành — URL tự động:** Khách chỉ sửa Page Title, không nhập hoặc chọn slug/domain. Preview → chỉnh title → chọn ngày → tạo đơn. Server cấp mã link bất định dạng `c-<32 ký tự hex>`; retry cùng phiên và Idempotency-Key giữ nguyên link. POST /api/orders chỉ nhận templateId, days, content; gửi thêm slug bị từ chối 422. GET /api/slugs/check ngừng hỗ trợ (410). Các mô tả chọn/kiểm tra slug phía dưới là lịch sử đã bị thay thế; slug trong dữ liệu vẫn là mã nội bộ để định tuyến QR. Link cũ không đổi.

## Tham khảo và quyết định thiết kế

Tham khảo ngày 06/10/2026:

- [Amorette trên Framer](https://www.framer.com/marketplace/templates/amorette/): tham khảo phân cấp chữ kiểu tạp chí, chất liệu thiệp giấy và cách chia câu chuyện thành nhiều phần.
- [Snap Post Minimal Wedding](https://www.snappost.co/en/templates/minimal-wedding-invite): tham khảo khoảng trắng, sự ưu tiên tên người nhận và thông tin sự kiện.
- [Partiful Birthday](https://partiful.com/invitations/free-online-birthday-invitation-templates): tham khảo sự đa dạng của poster tiệc, chữ lớn và cách tổ chức một lời mời thành trang tương tác.

Các tham khảo là định hướng về bố cục và trải nghiệm. Không sao chép mã, hình ảnh, tên thương hiệu hoặc bố cục nguyên bản. Hình trang trí mới dựng bằng CSS; khách có thể thay bằng ảnh HTTPS của mình. Không cam kết một phong cách phổ biến chưa từng xuất hiện trên Internet.

## Ma trận khác biệt

| Mã | Thiết kế | Cấu trúc thị giác | Trải nghiệm mặc định |
|---|---|---|---|
| couple-1 | Thư niêm sáp | Phong bì gấp, con dấu, ảnh kỷ niệm | Chạm mở phong bì |
| couple-2 | Đường tình yêu | Đường mốc dọc, số ngày lớn, câu chuyện theo mốc | Cuộn |
| couple-3 | Trang thơ | Dấu trích lớn, chữ nghiêng lệch trục, khoảng trắng | Lật trang lời nhắn |
| couple-4 | Thước phim đôi mình | Nền tối, viền phim, khung ảnh điện ảnh | Vuốt ngang hoặc nút trước/sau |
| couple-5 | Bản đồ sao | Vòng quỹ đạo, ngôi sao, nền đêm | Chạm mở lời hẹn |
| couple-6 | Tạp chí ngày cưới | Masthead, chữ WE DO lớn, ảnh vòm lệch cột | Cuộn |
| family-1 | Vườn của mẹ | Khung vòm, hoa lớn, thẻ lá cong | Chạm hoa nở |
| family-2 | Tờ báo của bố | Tên báo, dòng số đặc biệt, hai cột tin | Mở từng chuyên mục |
| family-3 | Album tổ ấm | Giấy kẻ, ảnh dán nghiêng, giấy ghi chú | Lật sổ |
| family-4 | Bưu thiếp xa nhà | Viền thư hàng không, tem, địa chỉ | Lật sang mặt địa chỉ và thư |
| family-5 | Nếp nhà | Khung chỉ đôi, chữ Thọ, dấu đỏ | Mở cuộn lời chúc |
| family-6 | Bữa cơm nhà | Đĩa tròn, viền xanh, chữ thực đơn | Mở từng mục chuyện nhà |
| occasion-1 | Xuân đỏ | Sơn đỏ, chữ Xuân lớn, đèn lồng, huy hiệu | Mở lộc xuân |
| occasion-2 | Quả cầu tuyết | Cầu kính, cây thông, nền băng | Chạm kích hoạt tuyết |
| occasion-3 | Sân khấu sinh nhật | Poster vàng/tím, chữ lớn xoay, bánh nến | Chạm tắt nến và mở lời chúc |
| occasion-4 | Lưu bút thanh xuân | Giấy ô ly, ô ảnh, nét chữ lưu bút | Lật từng trang |
| occasion-5 | Chương mới | Chữ ONWARD lớn, mũ tốt nghiệp trừu tượng, xanh/vàng | Mở lời chúc |
| occasion-6 | Vé đến niềm vui | Vé có cuống, đường xé, mã vạch trang trí | Xé cuống để mở lời mời |

## Hợp đồng dữ liệu và hành vi

- `content.design` là enum 18 giá trị được lưu trong JSON của card. Không cần đổi schema bảng. API xác thực enum, giữ thiết kế từ tạo đơn tới URL QR.
- Thiệp đã xuất bản trước đây không có `design` tiếp tục dùng `wax`, tránh đổi giao diện sản phẩm cũ ngoài ý muốn. Bản nháp cũ khi mở editor/preview được gán thiết kế tương ứng với mẫu đang chọn.
- Gian mẫu sử dụng chung `DesignCover` với sản phẩm mới. Không dùng một ảnh biểu tượng giống nhau để đại diện cho các bố cục khác nhau. Thư niêm sáp giữ bộ dựng cũ và dùng hình phong bì thu nhỏ.
- Khách chỉnh nội dung, ảnh, lời nhắn, ngày/địa điểm, màu nền, Page Title. Bố cục đặc trưng do mẫu quyết định; chọn chế độ slides sẽ có nút trước/sau và vuốt ngang, scroll hiển thị các phần nối tiếp. Fullscreen mở đầu bằng một màn hình, nội dung dài vẫn cuộn để không mất chữ.
- Nút tương tác chỉ thay trạng thái trong lần xem; không gửi RSVP hay lời nhắn ngược về server. Mã vạch trên mẫu vé chỉ trang trí, không phải mã check-in. Phần quà/lì xì là lời chúc, không chuyển tiền.
- Ảnh phóng to có nút đóng và Escape. Nhạc chỉ hiện khi có URL, dùng điều khiển phát của trình duyệt. Hiệu ứng tôn trọng reduced motion.
- Trang QR vẫn không có header/nav/footer của website. Page Title vẫn dùng nội dung khách đặt; thời hạn và chặn link không thay đổi.

## Kiểm thử

`tests/designs-http.test.ts` kiểm tra 18 thiết kế duy nhất, dữ liệu cũ, enum không hợp lệ, tạo đơn bypass cho từng mẫu, HTML công khai đúng thiết kế và QR PNG. Các bài kiểm thử này cần dev server với APP_URL localhost, mock và bypass bật, cùng PostgreSQL local.

Kiểm tra trình duyệt: lọc bộ mẫu; lật mặt sau bưu thiếp; chuyển trang thước phim; xác nhận không tràn ngang ở 390px và không có khung website trên trang sản phẩm.
