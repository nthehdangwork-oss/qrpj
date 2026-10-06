import { notFound } from "next/navigation";
import { publicCard } from "@/lib/service";
import { contentSchema } from "@/lib/rules";
import Greeting from "@/components/Greeting";
import { cache } from "react";
import { cardMetadata, pageMetadata } from "@/lib/page-titles";
export const dynamic = "force-dynamic";
export const revalidate = 0;
// React cache deduplicates database reads within a request, not across visitors.
const readCard = cache((slug: string) => publicCard(slug));
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const result = await readCard((await params).slug);
  if (result.state === "missing") return pageMetadata("notFound", true);
  if (result.state === "expired") return pageMetadata("expired", true);
  return cardMetadata(contentSchema.parse(result.card.content).pageTitle);
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const result = await readCard((await params).slug);
  if (result.state === "missing") notFound();
  if (result.state === "expired")
    return (
      <div className="product-status">
        <span style={{ fontSize: 60 }}>♡</span>
        <h1>
          Thiệp khép lại,
          <br />
          yêu thương còn đây.
        </h1>
        <p className="muted">
          Tấm thiệp này đã hết thời gian lưu giữ. Cảm ơn bạn đã ghé qua một kỷ
          niệm đẹp.
        </p>
      </div>
    );
  return (
    <main className="product-view">
      <Greeting immersive content={contentSchema.parse(result.card.content)} />
    </main>
  );
}
