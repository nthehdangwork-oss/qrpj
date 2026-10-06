import { checkoutSchema } from "@/lib/rules";
import { NextRequest } from "next/server";
import { z } from "zod";
import { body, guarded, json, origin, session } from "@/lib/http";
import { createOrder, settle, hash } from "@/lib/service";
import { paymentBypassEnabled } from "@/lib/payment";
export async function POST(req: NextRequest) {
  return guarded(async () => {
    origin(req);
    const key = z.uuid().parse(req.headers.get("idempotency-key"));
    const s = session(req);
    const checkout = checkoutSchema.parse(await body(req));
    // Derive an opaque stable identifier so retries preserve the same link.
    const slug = `c-${hash(`${s.ownerHash}:${key}`).slice(0,32)}`;
    const { order, replay } = await createOrder(
      { ...checkout, slug },
      s.ownerHash,
      key,
    );
    // Use the normal activation flow with a stable mock event for safe retries.
    const result =
      paymentBypassEnabled() && order.status === "PENDING"
        ? await settle({
            eventId: `bypass:${order.id}`,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            outcome: "SUCCESS",
          })
        : order;
    const res = json(
      {
        id: order.id,
        status: result.status,
        amount: order.amount,
        days: order.days,
        paymentDeadline: order.paymentDeadline,
      },
      replay ? 200 : 201,
    );
    res.cookies.set("gt_session", s.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 90 * 86400,
    });
    return res;
  });
}
