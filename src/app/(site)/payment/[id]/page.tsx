import OrderScreen from "@/components/OrderScreen";
import { mockEnabled } from "@/lib/payment";
export const dynamic = "force-dynamic";
import { pageMetadata } from "@/lib/page-titles";
export const metadata = pageMetadata("payment", true);
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <OrderScreen id={(await params).id} mock={mockEnabled()} />;
}
