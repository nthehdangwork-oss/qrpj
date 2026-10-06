import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { catalog } from "../src/lib/catalog";
import { templateContent } from "../src/lib/landing";
import { designIds } from "../src/lib/designs";
import { contentSchema } from "../src/lib/rules";

test("all 18 designs survive content validation and legacy cards keep their renderer", () => {
  const ids = catalog.map(
    (t) => contentSchema.parse(templateContent(t.id)).design,
  );
  assert.equal(new Set(ids).size, 18);
  assert.deepEqual(new Set(ids), new Set(designIds));
  const { design, ...legacy } = templateContent("couple-1");
  assert.equal(contentSchema.parse(legacy).design, "wax");
  assert.equal(
    contentSchema.safeParse({ ...legacy, design: "unknown" }).success,
    false,
  );
});

test("each design is preserved from order creation to the product-only public URL", async () => {
  const base = "http://localhost:3000";
  for (const t of catalog) {
    const content = templateContent(t.id);
    const response = await fetch(`${base}/api/orders`, {
      method: "POST",
      headers: {
        Origin: base,
        "Content-Type": "application/json",
        "Idempotency-Key": randomUUID(),
      },
      body: JSON.stringify({ templateId: t.id, days: 2, content }),
    });
    assert.equal(response.status, 201, t.id);
    const order = await response.json();
    assert.equal(order.status, "PAID");
    const ownerCookie = response.headers.get("set-cookie")!.split(";")[0];
    const detail = await (await fetch(`${base}/api/orders/${order.id}`,{headers:{Cookie:ownerCookie}})).json();
    const html = await (await fetch(detail.url)).text();
    assert.doesNotMatch(html, /<(header|nav|footer)[ >]/, t.id);
    if (content.design !== "wax")
      assert.ok(html.includes(`data-design="${content.design}"`), t.id);
    assert.ok(html.includes(content.pageTitle), t.id);
    const cookie = response.headers.get("set-cookie")!.split(";")[0];
    const qr = await fetch(`${base}/api/orders/${order.id}/qr`, {
      headers: { Cookie: cookie },
    });
    assert.equal(qr.status, 200, t.id);
    assert.match(qr.headers.get("content-type") ?? "", /image\/png/);
    console.log(`${t.id}: ${detail.url}`);
  }
});
