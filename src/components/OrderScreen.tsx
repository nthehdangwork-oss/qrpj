"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/client";
import { dateText, money } from "@/lib/rules";
type OrderView = {
  id: string;
  status: string;
  amount: number;
  days: number;
  paymentDeadline: string;
  expiresAt: string | null;
  url: string | null;
  paymentPayload: string;
};
const statuses: Record<string, string> = {
  PENDING: "Đang chờ thanh toán",
  PAID: "Thiệp đã kích hoạt",
  FAILED: "Thanh toán thất bại",
  EXPIRED: "Đơn đã hết hạn",
  REVIEW: "Cần đối soát thanh toán",
};
export default function OrderScreen({
  id,
  result = false,
  mock = false,
}: {
  id: string;
  result?: boolean;
  mock?: boolean;
}) {
  const [order, setOrder] = useState<OrderView | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState("");
  const [tick, setTick] = useState(Date.now());
  const [retry, setRetry] = useState(0);
  const router = useRouter();
  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      try {
        const o = await api<OrderView>(`/api/orders/${id}`);
        if (stopped) return;
        setOrder(o);
        setError("");
        if (o.status === "PAID" && !result) {
          router.replace(`/result/${id}`);
          return;
        }
        if (o.status === "PENDING") timer = setTimeout(poll, 3000);
      } catch (e) {
        if (!stopped) setError((e as Error).message);
      }
    }
    void poll();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [id, result, router, retry]);
  useEffect(() => {
    const timer = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  async function simulate(outcome: string) {
    setBusy(true);
    setError("");
    try {
      await api("/api/payments/mock", {
        method: "POST",
        body: JSON.stringify({ orderId: id, outcome }),
      });
      setRetry((n) => n + 1);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const expired =
    !!order?.expiresAt && new Date(order.expiresAt).getTime() <= tick;
  const remaining = order
    ? Math.max(
        0,
        Math.ceil((new Date(order.paymentDeadline).getTime() - tick) / 1000),
      )
    : 0;
  return (
    <section className="center panel">
      <span className="eyebrow">
        {result ? "04 / Gửi lời thương" : "03 / Thanh toán"}
      </span>
      <h1 style={{ fontSize: 40 }}>
        {result ? "Lời thương đã sẵn sàng." : "Chỉ còn một bước nhỏ."}
      </h1>
      {error && (
        <div className="error" role="alert">
          <p>{error}</p>
          <button
            className="btn secondary"
            onClick={() => setRetry((n) => n + 1)}
          >
            Tải lại trạng thái
          </button>
        </div>
      )}
      {!order && !error && <p role="status">Đang tải đơn…</p>}
      {order && (
        <>
          <span className="badge" role="status">
            {statuses[order.status]}
          </span>
          {order.status === "PENDING" && (
            <>
              <p className="price">
                {money(order.amount)}{" "}
                <span className="small">/ {order.days} ngày</span>
              </p>
              <p className="error">
                QR mô phỏng — không dùng ứng dụng ngân hàng, không chuyển tiền
                thật.
              </p>
              <img
                className="qr"
                src={`/api/orders/${id}/qr?kind=payment`}
                alt="QR thanh toán mô phỏng"
              />
              <p className="small url">{order.paymentPayload}</p>
              <p>
                Hạn thanh toán: {dateText(order.paymentDeadline)}
                <br />
                <strong>
                  Còn {Math.floor(remaining / 60)}:
                  {String(remaining % 60).padStart(2, "0")}
                </strong>
              </p>
              {mock ? (
                <div className="row" style={{ justifyContent: "center" }}>
                  <button
                    className="btn"
                    disabled={busy || remaining === 0}
                    onClick={() => simulate("SUCCESS")}
                  >
                    Mô phỏng thành công
                  </button>
                  <button
                    className="btn secondary"
                    disabled={busy || remaining === 0}
                    onClick={() => simulate("FAILED")}
                  >
                    Mô phỏng thất bại
                  </button>
                </div>
              ) : (
                <p>Thanh toán mô phỏng đã tắt ở môi trường này.</p>
              )}
            </>
          )}
          {order.status === "PAID" &&
            (expired ? (
              <>
                <h2>Thiệp đã hết thời gian lưu giữ</h2>
                <p>
                  Đường link cũ được giữ để tránh nhầm lẫn. Bạn có thể tạo một
                  thiệp mới.
                </p>
              </>
            ) : (
              <>
                <p>Gửi mã QR hoặc đường link này đến người bạn thương nhé.</p>
                <img
                  className="qr"
                  src={`/api/orders/${id}/qr`}
                  alt="QR mở thiệp"
                />
                <p className="url">
                  <a
                    href={order.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {order.url} ↗
                  </a>
                </p>
                <div className="row" style={{ justifyContent: "center" }}>
                  <button
                    className="btn"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(order.url!);
                        setCopied("Đã sao chép đường link.");
                      } catch {
                        setCopied(
                          "Hãy nhấn giữ đường link ở trên để sao chép.",
                        );
                      }
                    }}
                  >
                    Sao chép link
                  </button>
                  <a
                    className="btn secondary"
                    href={`/api/orders/${id}/qr`}
                    download="gui-thuong.png"
                  >
                    Tải mã QR ↓
                  </a>
                </div>
                <p role="status" className="small success">
                  {copied}
                </p>
                <p className="muted small">
                  Thiệp còn đến {dateText(order.expiresAt!)} (giờ Việt Nam).
                  <br />
                  Ai có đường link đều có thể xem. Hãy lưu link trước khi xoá dữ
                  liệu trình duyệt.
                </p>
              </>
            ))}
          {["FAILED", "EXPIRED", "REVIEW"].includes(order.status) && (
            <p>
              {order.status === "REVIEW"
                ? "Giao dịch chưa đủ điều kiện phát hành. Cần người vận hành kiểm tra đối soát; không thanh toán lại cho đơn này."
                : "Đơn chưa phát hành thiệp. Bạn có thể quay lại bản nháp để tạo đơn mới."}
            </p>
          )}
          {order.status !== "PENDING" && (
            <Link
              className="btn secondary"
              href={order.status === "PAID" ? "/templates" : "/preview"}
            >
              {order.status === "PAID"
                ? "Tạo thêm một lời thương"
                : "Quay lại bản nháp"}
            </Link>
          )}
        </>
      )}
    </section>
  );
}
