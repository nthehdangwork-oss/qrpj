import "dotenv/config";
import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { db } from "../src/lib/db";
import { templateContent } from "../src/lib/landing";
const base = "http://localhost:3000";
test("upload, private draft, ownership, QR publication and expiry", async () => {
  try {
    const bytes = await sharp({
      create: { width: 240, height: 160, channels: 3, background: "#e89277" },
    })
      .png()
      .toBuffer();
    const upload = await fetch(`${base}/api/media`, {
      method: "POST",
      headers: { Origin: base, "Content-Type": "image/png" },
      body: bytes,
    });
    assert.equal(upload.status, 201);
    const { url } = await upload.json();
    const cookie = upload.headers.get("set-cookie")!.split(";")[0];
    assert.equal((await fetch(base + url)).status, 404);
    const image = await fetch(base + url, { headers: { Cookie: cookie } });
    assert.equal(image.status, 200);
    assert.match(image.headers.get("cache-control")!, /no-store/);
    const meta = await sharp(Buffer.from(await image.arrayBuffer())).metadata();
    assert.equal(meta.format, "webp");
    assert.equal(meta.exif, undefined);
    const payload = {
      templateId: "couple-2",
      days: 2,
      content: {
        ...templateContent("couple-2"),
        imageUrl: url,
        sections: [
          {
            id: "photo",
            kind: "photo",
            title: "Ảnh từ điện thoại",
            text: "Kỷ niệm",
            imageUrl: url,
          },
        ],
      },
    };
    const headers = {
      Origin: base,
      "Content-Type": "application/json",
      "Idempotency-Key": crypto.randomUUID(),
    };
    const foreign = await fetch(`${base}/api/orders`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    assert.equal(foreign.status, 422);
    const orderRes = await fetch(`${base}/api/orders`, {
      method: "POST",
      headers: { ...headers, Cookie: cookie },
      body: JSON.stringify(payload),
    });
    assert.equal(orderRes.status, 201);
    const order = await orderRes.json();
    assert.equal(order.status, "PAID");
    assert.equal((await fetch(base + url)).status, 200);
    assert.equal(
      (
        await fetch(`${base}/api/orders/${order.id}/qr`, {
          headers: { Cookie: cookie },
        })
      ).status,
      200,
    );
    const saved = await db.order.findUniqueOrThrow({ where: { id: order.id } });
    await db.card.update({
      where: { id: saved.cardId },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    assert.equal((await fetch(base + url)).status, 404);
    assert.equal(
      (await fetch(base + url, { headers: { Cookie: cookie } })).status,
      404,
    );
    const invalid = await fetch(`${base}/api/media`, {
      method: "POST",
      headers: { Origin: base, "Content-Type": "image/png" },
      body: "not an image",
    });
    assert.equal(invalid.status, 422);
    const svg = await fetch(`${base}/api/media`, {
      method: "POST",
      headers: { Origin: base, "Content-Type": "image/svg+xml" },
      body: "<svg/>",
    });
    assert.equal(svg.status, 415);
    const oversize = await fetch(`${base}/api/media`, {
      method: "POST",
      headers: { Origin: base, "Content-Type": "image/png" },
      body: Buffer.alloc(15 * 1024 * 1024 + 1),
    });
    assert.equal(oversize.status, 413);
  } finally {
    await db.$disconnect();
  }
});
