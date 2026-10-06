import "dotenv/config";
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db } from "../src/lib/db";
import { createOrder, hash, settle } from "../src/lib/service";
import { pageTitles, siteName } from "../src/lib/page-titles";

const base = process.env.TEST_BASE_URL ?? "http://localhost:3000";

test("HTTP metadata hides expired titles and supports legacy card JSON", async () => {
  const suffix = randomUUID().slice(0, 8);
  const content = {
    recipient: "Khách kiểm thử",
    sender: "QA",
    message: "Nội dung kiểm thử metadata",
    background: "#fce7e9",
    icon: "heart",
    animation: "none",
    imageUrl: "",
    musicUrl: "",
  };
  try {
    for (const expired of [false, true]) {
      const slug = `title-test-${expired ? "expired" : "legacy"}-${suffix}`;
      const timestamp = new Date(Date.now() - (expired ? 6 * 86400000 : 0));
      const { order } = await createOrder(
        { templateId: "couple-1", slug, days: 2, content },
        hash(suffix),
        randomUUID(),
        timestamp,
      );
      // Only mutate this test's newly created card, never an existing customer's data.
      await db.card.update({
        where: { id: order.cardId },
        data: {
          content: expired
            ? { ...content, pageTitle: "Private expired title" }
            : content,
        },
      });
      await settle(
        {
          eventId: `title-${order.id}`,
          orderId: order.id,
          amount: 19000,
          currency: "VND",
          outcome: "SUCCESS",
        },
        timestamp,
      );
      const response = await fetch(`${base}/c/${slug}`);
      const html = await response.text();
      assert.equal(response.status, 200);
      const expected = expired
        ? `${pageTitles.expired} | ${siteName}`
        : pageTitles.card;
      assert.ok(html.includes(`<title>${expected}</title>`));
      if (expired) {
        assert.ok(!html.includes("Private expired title"));
        assert.ok(!html.includes(content.message));
      }
    }
    const missing = await fetch(`${base}/c/title-missing-${suffix}`);
    // Next.js may have started a streamed response before notFound resolves.
    assert.ok([200, 404].includes(missing.status));
    assert.ok(
      (await missing.text()).includes(
        `<title>${pageTitles.notFound} | ${siteName}</title>`,
      ),
    );
  } finally {
    await db.$disconnect();
  }
});
