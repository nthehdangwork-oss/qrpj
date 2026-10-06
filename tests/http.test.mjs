import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
const base = process.env.TEST_BASE_URL ?? "http://localhost:3000";
test("HTTP creation, ownership, payment, QR, replay and input protections", async () => {
  const headers = {
    "Content-Type": "application/json",
    Origin: base,
    "Idempotency-Key": randomUUID(),
  };
  const slug = `http-test-${randomUUID().slice(0, 8)}`;
  const body = JSON.stringify({
    templateId: "couple-1",
    slug,
    days: 3,
    amount: 1,
    content: {
      pageTitle: "Gửi mẹ & bố <3",
      recipient: "Bạn kiểm thử",
      sender: "QA",
      message: "Lời chúc kiểm thử",
      background: "#fce7e9",
      icon: "heart",
      animation: "float",
      imageUrl: "",
      musicUrl: "",
    },
  });
  const rejected = await fetch(`${base}/api/orders`, {
    method: "POST",
    headers: { ...headers, Origin: "https://other.invalid" },
    body,
  });
  assert.equal(rejected.status, 403);
  const invalid = await fetch(`${base}/api/orders`, {
    method: "POST",
    headers,
    body: "{",
  });
  assert.equal(invalid.status, 400);
  const oversized = await fetch(`${base}/api/orders`, {
    method: "POST",
    headers,
    body: "a".repeat(17000),
  });
  assert.equal(oversized.status, 413);
  const created = await fetch(`${base}/api/orders`, {
    method: "POST",
    headers,
    body,
  });
  assert.equal(created.status, 201);
  const cookie = created.headers.get("set-cookie").split(";")[0];
  const order = await created.json();
  assert.equal(order.amount, 25000);
  const replay = await fetch(`${base}/api/orders`, {
    method: "POST",
    headers: { ...headers, Cookie: cookie },
    body,
  });
  assert.equal(replay.status, 200);
  assert.equal((await replay.json()).id, order.id);
  assert.equal((await fetch(`${base}/api/orders/${order.id}`)).status, 404);
  assert.equal((await fetch(`${base}/api/orders/${order.id}/qr`)).status, 404);
  const pendingQr = await fetch(`${base}/api/orders/${order.id}/qr`, {
    headers: { Cookie: cookie },
  });
  assert.equal(pendingQr.status, 409);
  const paymentQr = await fetch(
    `${base}/api/orders/${order.id}/qr?kind=payment`,
    { headers: { Cookie: cookie } },
  );
  assert.equal(paymentQr.status, 200);
  assert.equal(paymentQr.headers.get("content-type"), "image/png");
  const paid = await fetch(`${base}/api/payments/mock`, {
    method: "POST",
    headers: { ...headers, Cookie: cookie },
    body: JSON.stringify({ orderId: order.id, outcome: "SUCCESS" }),
  });
  assert.equal(paid.status, 200);
  assert.equal((await paid.json()).status, "PAID");
  const state = await fetch(`${base}/api/orders/${order.id}`, {
    headers: { Cookie: cookie },
  });
  const data = await state.json();
  assert.equal(data.url, `${base}/c/${slug}`);
  const qr = await fetch(`${base}/api/orders/${order.id}/qr`, {
    headers: { Cookie: cookie },
  });
  assert.equal(qr.status, 200);
  const buffer = Buffer.from(await qr.arrayBuffer());
  assert.equal(buffer.subarray(1, 4).toString(), "PNG");
  const card = await fetch(data.url);
  assert.equal(card.status, 200);
  assert.match(
    card.headers.get("cache-control"),
    /no-store|no-cache, must-revalidate/,
  );
  const html = await card.text();
  assert.match(html, /Lời chúc kiểm thử/);
  assert.match(html, /<title>Gửi mẹ &amp; bố &lt;3<\/title>/);
  const unavailable = await fetch(`${base}/api/slugs/check?slug=${slug}`);
  assert.equal((await unavailable.json()).available, false);
  assert.equal(
    (await fetch(`${base}/api/jobs/cleanup`, { method: "POST" })).status,
    401,
  );
  console.log(`Created disposable local QA card: ${data.url}`);
});
