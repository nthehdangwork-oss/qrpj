import { z } from "zod";
export const eventSchema = z.object({
  eventId: z.string().min(1).max(150),
  orderId: z.string().min(1),
  amount: z.number().int().nonnegative(),
  currency: z.string().min(1),
  outcome: z.enum(["SUCCESS", "FAILED"]),
});
export type PaymentEvent = z.infer<typeof eventSchema>;
export interface PaymentProvider {
  name: string;
  createInstruction(order: { id: string; amount: number }): {
    payload: string;
    label: string;
  };
  normalizeEvent(input: unknown): PaymentEvent;
}
export class MockPaymentProvider implements PaymentProvider {
  name = "mock";
  createInstruction(order: { id: string; amount: number }) {
    return {
      payload: `MOCK|${order.id}|${order.amount}|VND`,
      label: "Mô phỏng — không chuyển tiền thật",
    };
  }
  normalizeEvent(input: unknown) {
    return eventSchema.parse(input);
  }
}
export function paymentProvider(): PaymentProvider {
  if ((process.env.PAYMENT_PROVIDER ?? "mock") !== "mock")
    throw new Error("Payment provider is not implemented");
  return new MockPaymentProvider();
}
export const mockEnabled = () =>
  process.env.NODE_ENV !== "production" &&
  process.env.ALLOW_MOCK_PAYMENTS === "true";

export const paymentBypassEnabled = () =>
  mockEnabled() &&
  (process.env.PAYMENT_PROVIDER ?? "mock") === "mock" &&
  process.env.BYPASS_PAYMENT === "true";
