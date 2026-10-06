import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { guarded } from "@/lib/http";
import { AppError, hash } from "@/lib/service";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return guarded(async () => {
    const { id } = await params;
    if (!/^[a-f0-9]{48}$/.test(id))
      throw new AppError("NOT_FOUND", 404, "Không tìm thấy ảnh.");
    const asset = await db.asset.findUnique({
      where: { id },
      select: {
        ownerHash: true,
        createdAt: true,
        cards: {
          select: {
            status: true,
            expiresAt: true,
            order: { select: { status: true, paymentDeadline: true } },
          },
        },
      },
    });
    if (!asset) throw new AppError("NOT_FOUND", 404, "Không tìm thấy ảnh.");
    const now = new Date();
    const token = req.cookies.get("gt_session")?.value;
    const own =
      !!token &&
      /^[a-f0-9]{64}$/.test(token) &&
      hash(token) === asset.ownerHash;
    const live = asset.cards.some(
      (c) => c.status === "ACTIVE" && c.expiresAt && c.expiresAt > now,
    );
    const draft =
      own &&
      ((asset.cards.length === 0 &&
        asset.createdAt.getTime() > now.getTime() - 86400000) ||
        asset.cards.some(
          (c) =>
            c.status === "DRAFT" &&
            c.order?.status === "PENDING" &&
            c.order.paymentDeadline > now,
        ));
    if (!live && !draft)
      throw new AppError("NOT_FOUND", 404, "Ảnh không còn khả dụng.");
    const bytes = await db.asset.findUnique({
      where: { id },
      select: { data: true },
    });
    if (!bytes) throw new AppError("NOT_FOUND", 404, "Ảnh không còn khả dụng.");
    return new Response(new Uint8Array(bytes.data), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
        "Cross-Origin-Resource-Policy": "same-origin",
      },
    });
  });
}
