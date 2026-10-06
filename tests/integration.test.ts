import "dotenv/config";
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db } from "../src/lib/db";
import { catalog } from "../src/lib/catalog";
import {
  available,
  cleanup,
  createOrder,
  hash,
  ownedOrder,
  publicCard,
  settle,
} from "../src/lib/service";
const now = new Date("2026-09-30T00:00:00Z");
const prefix = `test-${randomUUID().slice(0, 8)}`;
const owner = hash(prefix);
const input = (slug: string) => ({
  templateId: "couple-1",
  slug,
  days: 2 as const,
  content: {
    recipient: "Bạn",
    sender: "Mình",
    message: "Một lời thương",
    background: "#ffeedd",
    icon: "heart" as const,
    animation: "none" as const,
    imageUrl: "",
    musicUrl: "",
  },
});
test("PostgreSQL transaction lifecycle, races, expiry and retention", async () => {
  assert.match(
    process.env.DATABASE_URL ?? "",
    /test/i,
    "Use an isolated database whose URL contains test.",
  );
  try {
    for (const item of catalog)
      await db.template.upsert({
        where: { id: item.id },
        update: item,
        create: item,
      });
    const key = randomUUID();
    const { order } = await createOrder(input(`${prefix}-a`), owner, key, now);
    assert.equal(
      (await createOrder(input(`${prefix}-a`), owner, key, now)).order.id,
      order.id,
    );
    await assert.rejects(createOrder(input(`${prefix}-b`), owner, key, now), {
      code: "IDEMPOTENCY_CONFLICT",
    });
    await assert.rejects(ownedOrder(order.id, "another-owner", now), {
      code: "NOT_FOUND",
    });
    const race = await Promise.allSettled([
      createOrder(input(`${prefix}-race`), owner, randomUUID(), now),
      createOrder(input(`${prefix}-race`), owner, randomUUID(), now),
    ]);
    assert.equal(race.filter((r) => r.status === "fulfilled").length, 1);
    const event = {
      eventId: `event-${prefix}`,
      orderId: order.id,
      amount: 19000,
      currency: "VND",
      outcome: "SUCCESS" as const,
    };
    await Promise.all([settle(event, now), settle(event, now)]);
    const paid = await ownedOrder(order.id, owner, now);
    assert.equal(paid.status, "PAID");
    assert.equal(paid.card.expiresAt!.getTime(), now.getTime() + 2 * 86400000);
    assert.equal(await db.payment.count({ where: { orderId: order.id } }), 1);
    assert.equal((await publicCard(`${prefix}-a`, now)).state, "active");
    assert.equal(
      (await publicCard(`${prefix}-a`, paid.card.expiresAt!)).state,
      "expired",
    );
    const late = (
      await createOrder(input(`${prefix}-late`), owner, randomUUID(), now)
    ).order;
    await settle(
      { ...event, eventId: `late-${prefix}`, orderId: late.id },
      late.paymentDeadline,
    );
    assert.equal(
      (await ownedOrder(late.id, owner, late.paymentDeadline)).status,
      "REVIEW",
    );
    assert.equal(await available(`${prefix}-late`, late.paymentDeadline), true);
    const wrong = (
      await createOrder(input(`${prefix}-wrong`), owner, randomUUID(), now)
    ).order;
    await settle(
      { ...event, eventId: `wrong-${prefix}`, orderId: wrong.id, amount: 1 },
      now,
    );
    assert.equal((await ownedOrder(wrong.id, owner, now)).status, "REVIEW");
    const failed = (
      await createOrder(input(`${prefix}-failed`), owner, randomUUID(), now)
    ).order;
    await settle(
      {
        ...event,
        eventId: `fail-${prefix}`,
        orderId: failed.id,
        outcome: "FAILED",
      },
      now,
    );
    await settle(
      { ...event, eventId: `after-fail-${prefix}`, orderId: failed.id },
      now,
    );
    assert.equal((await ownedOrder(failed.id, owner, now)).status, "REVIEW");
    await cleanup(new Date(now.getTime() + 10 * 86400000));
    assert.equal(
      (await db.card.findUniqueOrThrow({ where: { id: order.cardId } }))
        .content,
      null,
    );
    assert.equal(
      await available(`${prefix}-a`, new Date(now.getTime() + 10 * 86400000)),
      false,
    );
    await cleanup(new Date(now.getTime() + 91 * 86400000));
    assert.equal(await db.order.findUnique({ where: { id: order.id } }), null);
    assert.equal(
      (await publicCard(`${prefix}-a`, new Date(now.getTime() + 91 * 86400000)))
        .state,
      "expired",
    );
  } finally {
    const cards = await db.card.findMany({
      where: { slug: { startsWith: prefix } },
      select: { id: true },
    });
    const ids = cards.map((c) => c.id);
    await db.slugReservation.deleteMany({ where: { cardId: { in: ids } } });
    await db.qrLink.deleteMany({ where: { cardId: { in: ids } } });
    await db.order.deleteMany({ where: { cardId: { in: ids } } });
    await db.card.deleteMany({ where: { id: { in: ids } } });
    await db.$disconnect();
  }
});
