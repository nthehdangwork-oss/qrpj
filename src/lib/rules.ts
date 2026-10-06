import { designIds } from "./designs";
import { z } from "zod";
import { pageTitleMaxLength, pageTitles } from "./page-titles";
export const prices: Record<number, number> = {
  2: 19000,
  3: 25000,
  4: 31000,
  5: 37000,
};
export const money = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    n,
  );
export const dateText = (value: string | Date) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value));
const reserved = new Set([
  "admin",
  "api",
  "login",
  "payment",
  "result",
  "templates",
  "shop",
  "editor",
  "preview",
  "support",
]);
export const slugSchema = z
  .string()
  .min(3)
  .max(40)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .refine(
    (s) =>
      !reserved.has(s) &&
      !s.split("-").some((t) => ["scam", "sex", "porn"].includes(t)) &&
      !s.includes("lua-dao"),
    "Đường dẫn chứa từ không được phép.",
  );
const media = z
  .string()
  .max(2048)
  .refine((s) => {
    if (!s) return true;
    try {
      const u = new URL(s);
      return u.protocol === "https:" && !u.username && !u.password;
    } catch {
      return false;
    }
  }, "Dùng URL HTTPS hợp lệ.");
const imageMedia = z.union([
  z.string().regex(/^\/api\/media\/[a-f0-9]{48}$/),
  media,
]);
export const contentSchema = z.object({
  design: z.enum(designIds).default("wax"),
  layout: z.enum(["fullscreen", "scroll", "slides"]).default("fullscreen"),
  theme: z.enum(["editorial", "romantic", "botanical"]).default("romantic"),
  headline: z
    .string()
    .trim()
    .max(120)
    .default("Một chút thương, gửi riêng bạn"),
  eventDate: z.string().trim().max(100).default(""),
  eventLocation: z.string().trim().max(180).default(""),
  sections: z
    .array(
      z.object({
        id: z.string().min(1).max(80),
        kind: z.enum(["text", "photo", "message"]),
        title: z.string().trim().max(100),
        text: z.string().trim().max(600),
        imageUrl: imageMedia.default(""),
      }),
    )
    .max(6)
    .refine(
      (items) => new Set(items.map((item) => item.id)).size === items.length,
      "Mỗi khối cần mã riêng.",
    )
    .default([]),
  pageTitle: z
    .string()
    .trim()
    .max(pageTitleMaxLength)
    .refine(
      (value) => !/[\u0000-\u001f\u007f]/.test(value),
      "Tiêu đề không chứa ký tự điều khiển.",
    )
    .transform((value) => value || pageTitles.card)
    .default(pageTitles.card),
  recipient: z.string().trim().min(1).max(60),
  sender: z.string().trim().min(1).max(60),
  message: z.string().trim().min(1).max(600),
  background: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  icon: z.enum(["heart", "star", "flower"]),
  animation: z.enum(["none", "float", "sparkle"]),
  imageUrl: imageMedia.default(""),
  musicUrl: media.default(""),
  envelope: z.boolean().default(true),
  sealText: z.string().trim().max(40).default("FOREVER"),
  musicTitle: z.string().trim().max(100).default("Until I Found You"),
  anniversaryDays: z.number().int().min(0).max(99999).default(0),
  giftRevealed: z.string().trim().max(300).default(""),
});
export const orderSchema = z.object({
  templateId: z.string().min(1).max(80),
  slug: slugSchema,
  days: z.union([z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  content: contentSchema,
});
// Public checkout never accepts a customer-selected URL.
export const checkoutSchema = orderSchema.omit({ slug: true }).strict();
export type CardContent = z.infer<typeof contentSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export const isLive = (
  status: string,
  expiresAt: Date | null,
  now = new Date(),
) => status === "ACTIVE" && !!expiresAt && expiresAt.getTime() > now.getTime();
export const expiry = (now: Date, days: number) =>
  new Date(now.getTime() + days * 86400000);
