<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


## Nghiệm thu như khách hàng sau khi sửa giao diện

- Sau mỗi thay đổi ảnh hưởng luồng khách hàng, dùng MCP trình duyệt có sẵn để thao tác UI thật ở viewport điện thoại (ưu tiên 390×844), từ điểm vào liên quan tới kết quả. Không chỉ đọc code hoặc gọi API rồi coi UI đã đạt.
- Dùng dữ liệu giả và ảnh fixture; bảo toàn bản nháp của người dùng. Không thanh toán thật, gửi tin nhắn hay xuất bản ra dịch vụ ngoài phạm vi được cho phép.
- Đóng vai người lần đầu sử dụng: kiểm tra nhãn nút dễ hiểu, số thao tác, trạng thái tải/lỗi, quay lại và khôi phục bản nháp, ảnh, title, QR và sản phẩm không có header/footer.
- Ghi nhận xét cụ thể gồm bước tái hiện, mong đợi, thực tế và ảnh bằng chứng vào docs/customer-qa/. Ghi rõ đây là đánh giá mô phỏng của AI.
- Tự sửa các lỗi tái hiện được trong phạm vi công việc, rồi lặp lại bước thất bại và luồng chính. Không tự thay giá, thời hạn, thanh toán thật hay yêu cầu nghiệp vụ đã chốt.
- Báo kết quả đã kiểm tra và phần chưa kiểm tra; không tuyên bố đã test iPhone/Android/webview thật chỉ dựa trên viewport mô phỏng. Nếu MCP không hoạt động, dùng kiểm thử khác cho phần có thể làm và ghi rõ giới hạn.
- Dùng MCP hiện có trước khi thêm dependency hoặc server mới. Đây là quy trình trong mỗi phiên làm việc, không phải tác vụ chạy nền định kỳ.
