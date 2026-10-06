import test from "node:test";
import assert from "node:assert/strict";
import {
  contentSchema,
  expiry,
  isLive,
  prices,
  slugSchema,
} from "../src/lib/rules";
import { catalog } from "../src/lib/catalog";
import { pageTitles } from "../src/lib/page-titles";
import { paymentBypassEnabled } from "../src/lib/payment";
test("payment bypass is opt-in and never available in production", () => {
  const names = [
    "NODE_ENV",
    "PAYMENT_PROVIDER",
    "ALLOW_MOCK_PAYMENTS",
    "BYPASS_PAYMENT",
  ];
  const saved = names.map((name) => process.env[name]);
  try {
    Object.assign(process.env, {
      NODE_ENV: "development",
      PAYMENT_PROVIDER: "mock",
      ALLOW_MOCK_PAYMENTS: "true",
      BYPASS_PAYMENT: "true",
    });
    assert.equal(paymentBypassEnabled(), true);
    Object.assign(process.env, { NODE_ENV: "production" });
    assert.equal(paymentBypassEnabled(), false);
    Object.assign(process.env, {
      NODE_ENV: "development",
      BYPASS_PAYMENT: "false",
    });
    assert.equal(paymentBypassEnabled(), false);
    Object.assign(process.env, {
      BYPASS_PAYMENT: "true",
      PAYMENT_PROVIDER: "payos",
    });
    assert.equal(paymentBypassEnabled(), false);
  } finally {
    names.forEach((name, index) => {
      if (saved[index] === undefined) delete process.env[name];
      else process.env[name] = saved[index];
    });
  }
});
test("page title validates customer text and preserves legacy cards", () => {
  const field = contentSchema.shape.pageTitle;
  assert.equal(field.parse(undefined), pageTitles.card);
  assert.equal(field.parse("   "), pageTitles.card);
  assert.equal(field.parse("  Gửi mẹ & bố ♡  "), "Gửi mẹ & bố ♡");
  assert.equal(field.safeParse("a".repeat(80)).success, true);
  assert.equal(field.safeParse("a".repeat(81)).success, false);
  assert.equal(field.safeParse("Một\nthiệp").success, false);
});
test("18 templates across three equal categories", () => {
  assert.equal(catalog.length, 18);
  for (const c of ["COUPLE", "FAMILY", "OCCASION"])
    assert.equal(catalog.filter((t) => t.category === c).length, 6);
});
test("slug rejects unsafe, reserved and malformed inputs", () => {
  for (const s of [
    "ab",
    "Gui-em",
    "gửi-em",
    "-abc",
    "abc-",
    "a--b",
    "admin",
    "gui-sex",
    "lua-dao",
    "x".repeat(41),
  ])
    assert.equal(slugSchema.safeParse(s).success, false, s);
  assert.equal(slugSchema.safeParse("gui-em-2026").success, true);
});
test("expiry boundary does not depend on cleanup", () => {
  const start = new Date("2026-09-30T00:00:00Z");
  const end = expiry(start, 2);
  assert.equal(end.toISOString(), "2026-10-02T00:00:00.000Z");
  assert.equal(isLive("ACTIVE", end, new Date(end.getTime() - 1)), true);
  assert.equal(isLive("ACTIVE", end, end), false);
  assert.equal(isLive("DRAFT", end, start), false);
});
test("price tiers have no unsupported duration", () => {
  assert.deepEqual(Object.values(prices), [19000, 25000, 31000, 37000]);
  assert.equal(prices[6], undefined);
});
test("media refuses active schemes and insecure URL", () => {
  const c = {
    recipient: "Bạn",
    sender: "Mình",
    message: "Thương",
    background: "#ffeeaa",
    icon: "heart",
    animation: "float",
    imageUrl: "",
    musicUrl: "",
  };
  assert.equal(contentSchema.safeParse(c).success, true);
  for (const url of [
    "javascript:alert(1)",
    "http://example.com/a.png",
    "https://user:pass@example.com",
  ])
    assert.equal(
      contentSchema.safeParse({ ...c, imageUrl: url }).success,
      false,
    );
  assert.equal(contentSchema.safeParse({ ...c, message: "" }).success, false);
});
test("interactive fields have safe defaults and support customization", () => {
  const parsed = contentSchema.parse({
    recipient: "Người thương",
    sender: "Mình",
    message: "Thương mến",
    background: "#fff8f7",
    icon: "heart",
    animation: "float",
  });
  assert.equal(parsed.envelope, true);
  assert.equal(parsed.sealText, "FOREVER");
  assert.equal(parsed.musicTitle, "Until I Found You");
  assert.equal(parsed.anniversaryDays, 0);
  assert.equal(parsed.giftRevealed, "");

  const custom = contentSchema.parse({
    recipient: "Hoàng Yến",
    sender: "Anh",
    message: "Yêu em",
    background: "#ffe8eb",
    icon: "heart",
    animation: "sparkle",
    envelope: false,
    sealText: "TRĂM NĂM",
    musicTitle: "Acoustic Tình Ca",
    anniversaryDays: 520,
    giftRevealed: "Chuyến đi Đà Lạt!",
  });
  assert.equal(custom.envelope, false);
  assert.equal(custom.sealText, "TRĂM NĂM");
  assert.equal(custom.musicTitle, "Acoustic Tình Ca");
  assert.equal(custom.anniversaryDays, 520);
  assert.equal(custom.giftRevealed, "Chuyến đi Đà Lạt!");
});


 test("every catalog preset can be published", async () => { const {templateContent}=await import("../src/lib/landing"); for(const t of catalog) { const content=templateContent(t.id); assert.equal(content.pageTitle,t.name); assert.ok(content.recipient); assert.ok(content.message); } });
