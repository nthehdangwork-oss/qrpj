# 10. Kết quả kiểm chứng bàn giao

> **Quy tắc hiện hành — URL tự động:** Khách chỉ sửa Page Title, không nhập hoặc chọn slug/domain. Preview → chỉnh title → chọn ngày → tạo đơn. Server cấp mã link bất định dạng `c-<32 ký tự hex>`; retry cùng phiên và Idempotency-Key giữ nguyên link. POST /api/orders chỉ nhận templateId, days, content; gửi thêm slug bị từ chối 422. GET /api/slugs/check ngừng hỗ trợ (410). Các mô tả chọn/kiểm tra slug phía dưới là lịch sử đã bị thay thế; slug trong dữ liệu vẫn là mã nội bộ để định tuyến QR. Link cũ không đổi.

## Phạm vi cập nhật ngày 01/10/2026

### Bổ sung chế độ bỏ qua thanh toán cục bộ

Đã bật BYPASS_PAYMENT trong `.env` cục bộ theo yêu cầu xem thử; `.env.example` mặc định false. TypeScript đạt; unit 7/7 đạt gồm chặn bypass ở production/provider khác; HTTP bypass đạt: tạo đơn trả PAID, có QR/link ngay, request lặp giữ nguyên expiresAt và thời lượng 48h cho gói 2 ngày. Preview chuyển thẳng Result theo trạng thái thực từ server; không giao dịch tiền thật. Tắt cờ để kiểm thử lại màn hình thanh toán bình thường.

Đặc tả media kiểu photobooth tại tài liệu 11 chưa có code/migration và chưa thực thi các ca PB-T01–09; các kết quả ngày 30/09 chỉ áp dụng MVP URL ảnh ngoài. Page Title là thay đổi code riêng, được kiểm chứng trong đợt cập nhật mới, không suy diễn từ kết quả cũ.

### Kết quả Page Title ngày 01/10/2026

- TypeScript và production build hoàn tất thành công sau thay đổi title.
- Unit: 6/6 test đạt, bao gồm title tiếng Việt, trim, fallback thiếu/trống, giới hạn 80 và từ chối ký tự điều khiển.
- HTTP luồng tạo đơn/thanh toán/QR đạt; đã xác minh `<title>` riêng và escape đúng ký tự `&`/`<`; URL QR giữ nguyên theo slug.
- `test:title` đạt: thiệp JSON cũ không có pageTitle dùng fallback; thiệp hết hạn không lộ title/nội dung riêng; trang missing dùng title chung. Next.js not-found dạng streaming có thể trả HTTP 200, đã điều chỉnh mô tả nghiệp vụ cho đúng hành vi framework.
- Trình duyệt: đã chuyển Public → Home → Shop → Templates → Editor → Preview → Payment → Result. Title lần lượt theo route, không sót title cũ. Nhập “Món quà gửi mẹ — Tháng 10”, phát hành thiệp, mở `/c/title-qa-thang-10` cho đúng title nguyên văn, không hậu tố thương hiệu.
- Không đổi domain, URL, giá, thời hạn hay cơ chế thanh toán. Không triển khai media storage trong thay đổi Page Title.


Ngày kiểm tra: 30/09/2026. Môi trường Windows, Node.js 24.14, Next.js 16.3.7, Prisma 6.19.3; PostgreSQL 18.4 cục bộ bằng embedded-postgres. PostgreSQL 16 trong Compose là cấu hình triển khai đề xuất, chưa chạy Docker trên máy này.

| Hạng mục | Kết quả và bằng chứng |
|---|---|
| Migration + seed | Áp dụng migration SQL trên 2 database UTF-8 độc lập; seed đủ 12 mẫu; GET templates trả 12 |
| TypeScript | `tsc --noEmit` hoàn tất, không lỗi |
| Production build | `next build --webpack` hoàn tất; tạo đủ 17 route trang/API/robots |
| Unit | 5/5 nhóm test đạt: catalog, slug, expiry boundary, giá, URL media |
| Integration PostgreSQL | 1 suite đạt: lifecycle, cùng slug đồng thời, idempotency/fingerprint, owner, event lặp đồng thời, deadline, sai tiền, FAILED rồi SUCCESS, purge và tombstone |
| HTTP end-to-end | 1 suite đạt: Origin 403, JSON 400, body 413, tạo đơn 201, giá server, replay 200, IDOR 404, QR trước paid 409, QR mock và QR link PNG 200, paid, public content, slug unavailable, cron 401 |
| Production runtime | Chạy server production riêng: public card trả no-store và noindex; endpoint mock trả 403 MOCK_DISABLED |
| Trình duyệt | Chọn mẫu Thương mẹ → đổi người nhận/lời chúc/người gửi → preview → tạo đơn → mock thành công → result có QR → thiệp công khai khớp nội dung |
| Responsive | Kiểm tra trực quan Home 360×800 và Result/Public 390×844 trong trình duyệt nhúng; không thấy cuộn ngang hoặc nội dung bị cắt |

Đã sửa lỗi encoding của PostgreSQL embedded trên Windows bằng database UTF-8. Dữ liệu thử được tách khỏi database kiểm thử giao dịch; local helper tạo cả database ứng dụng và test. Bộ HTTP tạo thiệp QA trên database ứng dụng, không xoá ngay để có thể xem lại và để cơ chế hết hạn xử lý.

Trong dev, Next.js trả `no-cache, must-revalidate` cho trang động; production đã xác minh `private, no-cache, no-store, max-age=0, must-revalidate`. Việc kiểm tra hạn vẫn diễn ra tại server mỗi lần tải trang.

## Chưa được chứng minh trong đợt bàn giao

- Chưa kiểm thử máy iPhone/Android thật, Zalo/Facebook webview thật, camera quét QR hoặc tải QR trong từng webview.
- Chưa đo Lighthouse/4G, p75 Core Web Vitals hay tải 50 phiên đồng thời. Chỉ tiêu docs/02 là mục tiêu nghiệm thu.
- Chưa có provider nhận tiền thật, xác minh chữ ký webhook, hoàn tiền hay dashboard đối soát. Mock được khoá trên production.
- Chưa cấu hình kênh Zalo/Facebook của doanh nghiệp; UI có thông báo thay vì URL giả.
- Chưa vận hành scheduler ngoài, backup/restore, rate limit tại ingress, logging/alerting production.
- Chưa kiểm thử truy cập media ngoài theo mọi nguồn; ảnh/nhạc URL có thể hỏng hoặc quá nặng. Upload thuộc phase 2.

## Chạy lại

README có các lệnh khởi động, generate/deploy/seed, test, test:integration, test:http và cleanup. Integration chỉ dùng DB test chuyên dụng vì test giả lập retention 91 ngày. Không chạy integration trên database ứng dụng. Tắt tiến trình dev/DB bằng Ctrl+C khi không dùng; không xoá thư mục `.local-postgres` nếu muốn giữ dữ liệu.


## Kiểm tra bổ sung ngày 06/10/2026

- Seed thành công 18 mẫu (6 mẫu/nhóm); 9 kiểm tra quy tắc và nội dung mẫu đạt.
- Build Next.js và TypeScript đạt sau khi chuyển các trang website vào route group `(site)`, giữ nguyên URL.
- Kiểm tra HTTP bypass đạt: mẫu mới tạo đơn PAID, QR trả 200, replay giữ nguyên thời hạn, public HTML không có header/nav/footer và giữ Page Title.
- Kiểm tra trình duyệt ở 390×844: bộ lọc Gia đình có 6 mẫu; mở phong bì, khui quà và thả tim hoạt động; trang sản phẩm không tràn ngang, không có khung website.
- Phiên dev local chạy với APP_URL=http://localhost:3000; không sửa URL tunnel đã lưu trong .env. QR localhost chỉ dùng trên máy đang chạy ứng dụng.
