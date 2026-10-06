import Link from "next/link";
import { pageMetadata } from "@/lib/page-titles";
export const metadata = pageMetadata("notFound", true);
export default function NotFound() {
  return (
    <div className="center panel">
      <h1>Chưa tìm thấy thiệp</h1>
      <p>Đường dẫn có thể chưa được phát hành hoặc chưa chính xác.</p>
      <Link className="btn" href="/templates">
        Tạo một tấm thiệp mới
      </Link>
    </div>
  );
}
