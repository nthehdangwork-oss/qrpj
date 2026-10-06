import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

test("local bypass activates a card and replay preserves its lifetime", async () => {
  const base = "http://localhost:3000";
  const headers = {
    "Content-Type": "application/json",
    Origin: base,
    "Idempotency-Key": randomUUID(),
  };
  const body = JSON.stringify({
    templateId: "occasion-5",
    days: 2,
    content: {
      pageTitle: "Thiệp xem thử",
      recipient: "Bạn",
      sender: "QA",
      message: "Gửi bạn một lời thương",
      background: "#fce7e9",
      icon: "heart",
      animation: "float",
      imageUrl: "",
      musicUrl: "",
    },
  });
  const response = await fetch(`${base}/api/orders`, {
    method: "POST",
    headers,
    body,
  });
  assert.equal(response.status, 201);
  const order = await response.json();
  assert.equal(order.status, "PAID");
  const cookie = response.headers.get("set-cookie").split(";")[0];
  const read = async () =>
    (
      await fetch(`${base}/api/orders/${order.id}`, {
        headers: { Cookie: cookie },
      })
    ).json();
  const initial = await read();
  assert.match(initial.url, /\/c\/c-[a-f0-9]{32}$/);
  const forbidden = await fetch(`${base}/api/orders`,{method:"POST",headers:{...headers,Cookie:cookie,"Idempotency-Key":randomUUID()},body:JSON.stringify({...JSON.parse(body),slug:"my-custom-link"})});
  assert.equal(forbidden.status,422);
  assert.equal((await fetch(`${base}/api/slugs/check?slug=my-custom-link`)).status,410);
  assert.equal(
    new Date(initial.expiresAt) - new Date(initial.paidAt),
    2 * 86400000,
  );
  const replay = await fetch(`${base}/api/orders`, {
    method: "POST",
    headers: { ...headers, Cookie: cookie },
    body,
  });
  assert.equal(replay.status, 200);
  assert.equal((await replay.json()).id, order.id);
  assert.equal((await read()).expiresAt, initial.expiresAt);
  assert.equal(
    (
      await fetch(`${base}/api/orders/${order.id}/qr`, {
        headers: { Cookie: cookie },
      })
    ).status,
    200,
  );
  const card = await fetch(initial.url);
  assert.equal(card.status, 200);
  const html = await card.text();
  assert.match(html, /Gửi bạn một lời thương/);
  assert.match(html, /data-product="greeting"/);
  assert.doesNotMatch(html, /<(header|nav|footer)[ >]/);
  assert.match(html, /<title>Thiệp xem thử<\/title>/);
  const shop = await (await fetch(`${base}/templates`)).text();
  assert.match(shop, /<header[ >]/);
  assert.match(shop, /occasion-6/);
  console.log(`Bypass QA: ${initial.url}`);
});
