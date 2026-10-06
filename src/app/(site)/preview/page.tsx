import Preview from "@/components/Preview";
import { pageMetadata } from "@/lib/page-titles";
import { paymentBypassEnabled } from "@/lib/payment";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata("preview", true);
export default function Page() {
  return <Preview bypassPayment={paymentBypassEnabled()} />;
}
