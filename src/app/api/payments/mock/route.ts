import { NextRequest } from "next/server";
import { z } from "zod";
import { body, guarded, json, origin, owner } from "@/lib/http";
import { AppError, ownedOrder, settle } from "@/lib/service";
import { mockEnabled, paymentProvider } from "@/lib/payment";
export async function POST(req: NextRequest) {
  return guarded(async () => {
    origin(req);
    if (!mockEnabled())
      throw new AppError(
        "MOCK_DISABLED",
        403,
        "Thanh toán mô phỏng đã bị tắt.",
      );
    const data = z
      .object({ orderId: z.string(), outcome: z.enum(["SUCCESS", "FAILED"]) })
      .parse(await body(req));
    const o = await ownedOrder(data.orderId, owner(req));
    if (o.status !== "PENDING" && o.status !== "PAID")
      throw new AppError(
        "PAYMENT_TERMINAL",
        409,
        "Đơn đã kết thúc. Vui lòng tạo đơn mới.",
      );
    const event = paymentProvider().normalizeEvent({
      eventId: `mock:${o.id}:${data.outcome}`,
      orderId: o.id,
      amount: o.amount,
      currency: "VND",
      outcome: data.outcome,
    });
    const result = await settle(event);
    return json({ id: result.id, status: result.status });
  });
}
