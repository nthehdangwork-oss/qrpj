import { json } from "@/lib/http";
export function GET() { return json({error:{code:"CUSTOM_SLUG_DISABLED",message:"Đường dẫn được hệ thống tạo tự động. Bạn có thể chỉnh tiêu đề tab trình duyệt."}},410); }
