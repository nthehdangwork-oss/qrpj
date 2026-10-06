import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { db } from "./db";
import { expiry, isLive, orderSchema, prices, slugSchema } from "./rules";
import { paymentProvider, type PaymentEvent } from "./payment";
export class AppError extends Error {
  constructor(
    public code: string,
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export const hash = (s: string) => createHash("sha256").update(s).digest("hex");
export const appUrl = () =>
  new URL(process.env.APP_URL ?? "http://localhost:3000").origin;
export async function serial<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  for (let n = 0; ; n++) {
    try {
      return await db.$transaction(fn, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2034" &&
        n < 3
      )
        continue;
      throw e;
    }
  }
}
export async function available(slug: string, now = new Date()) {
  slugSchema.parse(slug);
  const claim = await db.slugReservation.findUnique({ where: { slug } });
  return !claim || (!!claim.reservedUntil && claim.reservedUntil <= now);
}
export async function createOrder(
  raw: unknown,
  ownerHash: string,
  key: string,
  now = new Date(),
) {
  const input = orderSchema.parse(raw);
  const fingerprint = hash(JSON.stringify(input));
  try {
    return await serial(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { idempotencyKey: key },
      });
      if (existing) {
        if (
          existing.ownerHash !== ownerHash ||
          existing.requestHash !== fingerprint
        )
          throw new AppError(
            "IDEMPOTENCY_CONFLICT",
            409,
            "Mã yêu cầu đã dùng cho nội dung khác.",
          );
        return { order: existing, replay: true };
      }
      if (!(await tx.template.findUnique({ where: { id: input.templateId } })))
        throw new AppError("NOT_FOUND", 404, "Không tìm thấy mẫu.");
      await tx.slugReservation.deleteMany({
        where: { slug: input.slug, reservedUntil: { lte: now } },
      });
      if (await tx.slugReservation.findUnique({ where: { slug: input.slug } }))
        throw new AppError("SLUG_TAKEN", 409, "Đường dẫn đã được sử dụng.");
      const assetIds = [
        ...new Set(
          [
            input.content.imageUrl,
            ...input.content.sections.map((s) => s.imageUrl),
          ]
            .filter((url) => url.startsWith("/api/media/"))
            .map((url) => url.split("/").pop()!),
        ),
      ];
      const usable = await tx.asset.count({
        where: {
          id: { in: assetIds },
          ownerHash,
          OR: [
            {
              createdAt: { gt: new Date(now.getTime() - 86400000) },
              cards: { none: {} },
            },
            { cards: { some: { status: "ACTIVE", expiresAt: { gt: now } } } },
          ],
        },
      });
      if (usable !== assetIds.length)
        throw new AppError(
          "IMAGE_UNAVAILABLE",
          422,
          "Ảnh nháp đã hết hạn hoặc không thuộc phiên này. Vui lòng tải lại ảnh.",
        );
      const deadline = new Date(now.getTime() + 15 * 60000);
      const card = await tx.card.create({
        data: {
          assets: { connect: assetIds.map((id) => ({ id })) },
          templateId: input.templateId,
          slug: input.slug,
          content: input.content,
          createdAt: now,
        },
      });
      await tx.slugReservation.create({
        data: { slug: input.slug, cardId: card.id, reservedUntil: deadline },
      });
      const order = await tx.order.create({
        data: {
          cardId: card.id,
          ownerHash,
          idempotencyKey: key,
          requestHash: fingerprint,
          days: input.days,
          amount: prices[input.days],
          paymentDeadline: deadline,
          createdAt: now,
        },
      });
      return { order, replay: false };
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      const existing = await db.order.findUnique({
        where: { idempotencyKey: key },
      });
      if (
        existing &&
        existing.ownerHash === ownerHash &&
        existing.requestHash === fingerprint
      )
        return { order: existing, replay: true };
      throw new AppError(
        existing ? "IDEMPOTENCY_CONFLICT" : "SLUG_TAKEN",
        409,
        "Đường dẫn hoặc mã yêu cầu đã được sử dụng.",
      );
    }
    throw e;
  }
}
export async function ownedOrder(
  id: string,
  ownerHash: string,
  now = new Date(),
) {
  return serial(async (tx) => {
    let order = await tx.order.findFirst({
      where: { id, ownerHash },
      include: { card: true },
    });
    if (!order)
      throw new AppError("NOT_FOUND", 404, "Không tìm thấy đơn hàng của bạn.");
    if (order.status === "PENDING" && order.paymentDeadline <= now) {
      await tx.order.update({ where: { id }, data: { status: "EXPIRED" } });
      await tx.slugReservation.deleteMany({
        where: { cardId: order.cardId, reservedUntil: { not: null } },
      });
      order = { ...order, status: "EXPIRED" };
    }
    return order;
  });
}
export async function settle(event: PaymentEvent, now = new Date()) {
  return serial(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: event.orderId },
      include: { card: true },
    });
    if (!order) throw new AppError("NOT_FOUND", 404, "Không tìm thấy đơn.");
    const seen = await tx.payment.findUnique({
      where: { eventId: event.eventId },
    });
    if (seen) {
      if (seen.orderId !== order.id)
        throw new AppError("PAYMENT_TERMINAL", 409, "Mã giao dịch không khớp.");
      return order;
    }
    const valid =
      event.amount === order.amount && event.currency === order.currency;
    const canPay =
      order.status === "PENDING" && order.paymentDeadline > now && valid;
    const outcome =
      !valid || (event.outcome === "SUCCESS" && !canPay)
        ? "REVIEW"
        : event.outcome;
    await tx.payment.create({
      data: {
        ...event,
        provider: paymentProvider().name,
        outcome,
        receivedAt: now,
      },
    });
    if (order.status === "PAID") return order;
    if (event.outcome === "SUCCESS" && canPay) {
      const end = expiry(now, order.days);
      await tx.card.update({
        where: { id: order.cardId },
        data: { status: "ACTIVE", activatedAt: now, expiresAt: end },
      });
      await tx.qrLink.create({
        data: { cardId: order.cardId, slug: order.card.slug, expiresAt: end },
      });
      await tx.slugReservation.update({
        where: { slug: order.card.slug },
        data: { reservedUntil: null },
      });
      return tx.order.update({
        where: { id: order.id },
        data: { status: "PAID", paidAt: now },
      });
    }
    await tx.slugReservation.deleteMany({
      where: { cardId: order.cardId, reservedUntil: { not: null } },
    });
    return tx.order.update({
      where: { id: order.id },
      data: {
        status:
          outcome === "REVIEW"
            ? "REVIEW"
            : order.status === "PENDING"
              ? order.paymentDeadline <= now
                ? "EXPIRED"
                : "FAILED"
              : order.status,
      },
    });
  });
}
export async function publicCard(slug: string, now = new Date()) {
  const link = await db.qrLink.findUnique({
    where: { slug },
    include: { card: true },
  });
  if (!link) return { state: "missing" as const };
  if (!isLive(link.card.status, link.card.expiresAt, now) || !link.card.content)
    return { state: "expired" as const };
  return { state: "active" as const, card: link.card };
}
export function orderView(o: Awaited<ReturnType<typeof ownedOrder>>) {
  return {
    id: o.id,
    status: o.status,
    days: o.days,
    amount: o.amount,
    paymentDeadline: o.paymentDeadline,
    paidAt: o.paidAt,
    expiresAt: o.card.expiresAt,
    url: o.status === "PAID" ? `${appUrl()}/c/${o.card.slug}` : null,
    paymentPayload: paymentProvider().createInstruction(o).payload,
  };
}
export async function cleanup(now = new Date()) {
  return serial(async (tx) => {
    const expiredOrders = await tx.order.updateMany({
      where: { status: "PENDING", paymentDeadline: { lte: now } },
      data: { status: "EXPIRED" },
    });
    await tx.slugReservation.deleteMany({
      where: { reservedUntil: { lte: now } },
    });
    const expiredCards = await tx.card.updateMany({
      where: { status: "ACTIVE", expiresAt: { lte: now } },
      data: { status: "EXPIRED" },
    });
    const deletedAssets = await tx.asset.deleteMany({
      where: {
        AND: [
          { cards: { none: { status: "ACTIVE", expiresAt: { gt: now } } } },
          {
            cards: {
              none: {
                status: "DRAFT",
                order: { status: "PENDING", paymentDeadline: { gt: now } },
              },
            },
          },
          {
            OR: [
              { cards: { some: {} } },
              { createdAt: { lte: new Date(now.getTime() - 86400000) } },
            ],
          },
        ],
      },
    });
    const cutoff = new Date(now.getTime() - 7 * 86400000);
    const purgedCards = await tx.card.updateMany({
      where: {
        purgedAt: null,
        OR: [
          { expiresAt: { lte: cutoff } },
          { status: "DRAFT", order: { paymentDeadline: { lte: cutoff } } },
        ],
      },
      data: { content: Prisma.DbNull, purgedAt: now },
    });
    const deletedOrders = await tx.order.deleteMany({
      where: {
        createdAt: { lte: new Date(now.getTime() - 90 * 86400000) },
        status: { not: "PENDING" },
      },
    });
    return {
      deletedAssets: deletedAssets.count,
      expiredOrders: expiredOrders.count,
      expiredCards: expiredCards.count,
      purgedCards: purgedCards.count,
      deletedOrders: deletedOrders.count,
    };
  });
}
