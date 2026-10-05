# Gửi thương — thiệp cá nhân hoá

## Cập nhật ngày 01/10/2026

- [11 — Lưu ảnh và QR kiểu photobooth](docs/11-photobooth-storage-qr.md): đặc tả mới về kho ảnh riêng tư, upload/xuất PNG, QR nhận ảnh, chặn truy cập khi hết gói và xoá binary mục tiêu trong 24 giờ. **Chưa triển khai code/storage/migration**; MVP vẫn nhận URL ảnh ngoài.
- Page Title: khách nhập **Tiêu đề tab trình duyệt** ở Editor, tối đa 80 ký tự, được lưu cùng nội dung thiệp. Khi mở thiệp còn hạn, Next.js generateMetadata hiển thị đúng title đã nhập; không đổi domain, slug hay URL QR. Tiêu đề các route và fallback đặt tập trung tại src/lib/page-titles.ts. Để trống dùng tiêu đề mặc định; thiệp cũ không có trường này vẫn mở được.

Kiểm thử bổ sung: `npm run test:title` cần dev server cùng DATABASE_URL đang hoạt động; tạo các thiệp QA riêng để kiểm tra title mặc định của dữ liệu cũ, title hết hạn và trang không tồn tại. Không chỉnh dữ liệu thiệp có sẵn của khách. Cùng với `npm test`, `npm run test:http` và `npm run build`, đây là bộ kiểm tra Page Title của đợt cập nhật.


MVP mobile-first cho khách Việt: chọn một trong 12 mẫu, chỉnh thiệp, xem trước, chọn slug và gói 2–5 ngày, thanh toán QR mock, nhận link và QR chia sẻ. Toàn bộ giá là giả định cần PO xác nhận, không nhận tiền thật.

## Kiến trúc và công nghệ

Next.js 16 App Router, TypeScript, React, Tailwind CSS 4; PostgreSQL 16 và Prisma 6.19. Thư viện qrcode tạo QR. CSS animation nhẹ, hỗ trợ giảm chuyển động. Dữ liệu nghiệp vụ nằm trong PostgreSQL; không dùng bộ nhớ làm nguồn thanh toán. Prisma được cố định major 6 để dùng API transaction đã kiểm chứng.

## Cài đặt và chạy

Yêu cầu Node.js >=22, npm, PostgreSQL đang chạy hoặc Docker Compose.

```sh
npm install
cp .env.example .env
docker compose up -d
npm run db:generate
npm run db:deploy
npm run db:seed
npm run dev
```

PowerShell dùng `Copy-Item .env.example .env` thay cho `cp`. Nếu không dùng Docker, tạo database `guithuong` trong PostgreSQL và sửa DATABASE_URL. Mở http://localhost:3000. Đặt APP_URL thành origin HTTPS thực tế khi triển khai để QR có thể mở từ điện thoại. localhost chỉ hoạt động trên máy chủ, không trên điện thoại khác.

```sh
npm run typecheck
npm test
npm run build
npm start
npm run cleanup
```

`cleanup` chạy một lượt; bộ lập lịch ngoài gọi mỗi phút. Có thể dùng `POST /api/jobs/cleanup` với Bearer CRON_SECRET. Không phụ thuộc job để chặn thiệp hết hạn: mỗi lượt xem đều kiểm tra thời gian tại server và không cache.

### Máy chưa có Docker/PostgreSQL

Đã kèm [embedded-postgres](https://github.com/leinelissen/embedded-postgres) làm tiện ích phát triển, vẫn là PostgreSQL thật (bản 18 đi kèm package); triển khai chuẩn dùng PostgreSQL 16 theo Compose. Chạy `npm run db:local` trong terminal riêng và giữ terminal mở. Tiện ích chỉ lắng nghe `127.0.0.1:54329`, lưu dữ liệu tại `.local-postgres`, tạo `guithuong_utf8` và `guithuong_test_utf8`, bảo đảm UTF-8 cho tiếng Việt. Dùng DATABASE_URL `postgresql://guithuong:localdev@127.0.0.1:54329/guithuong_utf8?schema=public`, rồi chạy generate/deploy/seed/dev như trên. Ctrl+C dừng DB, không xoá dữ liệu. Tài khoản localdev chỉ dùng phát triển.

Nếu npm trong máy được ánh xạ sang pnpm, dùng `pnpm install --frozen-lockfile` để cài đúng lockfile đã giao. pnpm-workspace.yaml khai báo rõ các dependency được phép chạy script cài đặt. Npm chuẩn có thể dùng `npm install`; dự án không yêu cầu pnpm để chạy.

### Kiểm thử có cơ sở dữ liệu

PowerShell, trong terminal riêng:

```powershell
$env:DATABASE_URL='postgresql://guithuong:localdev@127.0.0.1:54329/guithuong_test_utf8?schema=public'
npm run db:deploy
npm run test:integration
```

Integration test có cleanup theo thời gian giả lập, chỉ chạy database test chuyên dụng; không dùng database phát triển có dữ liệu muốn giữ. `npm run test:http` cần dev server đang mở và tạo thiệp QA trên database của server. Các thiệp QA tuân theo cơ chế hết hạn bình thường. Bản production chạy `npm run build` và `npm start` sẽ chủ động khoá nút mock; để trải nghiệm thanh toán giả, dùng `npm run dev`.

## Cấu trúc

docs/ chứa phân tích sản phẩm, yêu cầu, luồng, màn hình, dữ liệu, API, nghiệp vụ, kiểm thử và lộ trình. src/app/ chứa trang và API; src/components/ chứa UI; src/lib/ chứa validation, giá, dữ liệu và lớp payment; prisma/ chứa schema, migration và seed; scripts/ chứa job; tests/ chứa kiểm thử.

| Tài liệu | Nội dung |
|---|---|
| [01 — Tổng quan](docs/01-product-overview.md) | Persona, phạm vi và câu hỏi PO |
| [02 — Yêu cầu](docs/02-requirements.md) | User Story, Given/When/Then, MoSCoW, NFR |
| [03 — Luồng](docs/03-user-flow.md) | Mermaid luồng người dùng và hệ thống |
| [04 — Màn hình](docs/04-screen-specs.md) | UI, hành vi, trạng thái, validation |
| [05 — Dữ liệu](docs/05-data-model.md) | ERD, schema, transaction, retention |
| [06 — API](docs/06-api-spec.md) | Endpoint, request/response, lỗi |
| [07 — Nghiệp vụ](docs/07-business-rules.md) | Giá, slug, thanh toán, hết hạn |
| [08 — Kiểm thử](docs/08-test-cases.md) | 22 ca nghiệm thu chính |
| [09 — Lộ trình](docs/09-roadmap-risks.md) | Rủi ro, mốc phát triển, điều kiện mở bán |
| [10 — Kết quả kiểm chứng](docs/10-validation.md) | Những gì đã chạy và giới hạn kiểm thử |

## Chạy thử

Xem luồng không qua thanh toán: đặt `BYPASS_PAYMENT=true` trong `.env` và chạy dev với `PAYMENT_PROVIDER=mock`, `ALLOW_MOCK_PAYMENTS=true`. Preview sẽ có nút “Tạo thiệp xem thử & nhận QR”, tự xác nhận mock qua cùng logic phát hành và chuyển thẳng Result. Không có giao dịch tiền thật. Đặt lại `BYPASS_PAYMENT=false` để trở về màn hình thanh toán; production luôn vô hiệu hoá bypass. Thiệp thử vẫn có thời hạn theo gói, giữ slug và dữ liệu như thiệp đã kích hoạt.

Khi bật bypass, kiểm tra bằng `node --test tests/bypass-http.test.mjs`. Bộ `npm run test:http` kiểm thử luồng thanh toán đầy đủ nên cần tắt bypass trước khi chạy. Bypass chỉ áp dụng tự động cho đơn mới tạo hoặc request tạo đơn được gửi lại; không tự sửa các đơn cũ đang chờ thanh toán.

Vào gian hàng → chọn mẫu → nhập người nhận/lời chúc, màu nền/icon/hiệu ứng → xem trước → chọn slug và gói → tạo đơn. Trang thanh toán ghi rõ mô phỏng, cung cấp nút thành công/thất bại để kiểm thử. Khi thành công, mở link công khai hoặc tải QR. Cookie khách là chìa khoá quản lý đơn trên cùng trình duyệt; xoá cookie sẽ mất quyền xem đơn, link công khai vẫn hoạt động đến hạn.

Ảnh/nhạc: MVP dùng URL HTTPS tuỳ chọn, không upload; PO cần duyệt nhà cung cấp lưu trữ trước khi triển khai thật. Nhạc có controls, không ép autoplay. Liên hệ riêng lấy từ ZALO_URL/FACEBOOK_URL; chưa cấu hình thì UI thông báo chưa mở kênh thay vì trỏ đến tài khoản giả.

## Triển khai và bảo mật

PAYMENT_PROVIDER=mock là provider duy nhất có thể chạy. Bật ALLOW_MOCK_PAYMENTS=true chỉ cho môi trường thử nghiệm. Production tự chặn thao tác xác nhận mock; tích hợp provider thật, xác thực webhook và quy trình hoàn tiền là điều kiện mở bán, chưa thuộc bản bàn giao này. Cookie HttpOnly/SameSite, origin check, validation server và transaction chống thanh toán lặp. CRON_SECRET phải là chuỗi ngẫu nhiên >=32 ký tự. Cần rate limit tại reverse proxy trước khi đưa public.

## Tài liệu chính thức

- [Next.js — cài đặt](https://nextjs.org/docs/app/getting-started/installation)
- [Prisma 6 — transaction](https://www.prisma.io/docs/orm/v6/prisma-client/queries/transactions)

Các chỉ tiêu hiệu năng và tương thích trong docs là tiêu chí nghiệm thu, không phải kết quả đo sẵn.
