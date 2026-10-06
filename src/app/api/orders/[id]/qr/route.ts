import { NextRequest } from "next/server";
import QRCode from "qrcode";
import { guarded, owner } from "@/lib/http";
import { AppError, ownedOrder, orderView } from "@/lib/service";
import { isLive } from "@/lib/rules";
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return guarded(async () => {
    const o = await ownedOrder((await params).id, owner(req));
    const v = orderView(o);
    const payment = req.nextUrl.searchParams.get("kind") === "payment";
    if (
      payment
        ? o.status !== "PENDING"
        : o.status !== "PAID" || !isLive(o.card.status, o.card.expiresAt)
    )
      throw new AppError(
        "QR_UNAVAILABLE",
        409,
        "Mã QR chưa sẵn sàng hoặc đã hết hạn.",
      );
    const png = await QRCode.toBuffer(payment ? v.paymentPayload : v.url!, {
      width: 384,
      margin: 3,
      errorCorrectionLevel: "M",
    });
    return new Response(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, no-store",
        "Content-Disposition": `inline; filename="gui-thuong-${o.id}.png"`,
      },
    });
  });
}
