"use client";
import { designs } from "@/lib/designs";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { contentSchema, money, checkoutSchema, prices } from "@/lib/rules";
import { api } from "@/lib/client";
import { readDraft, saveDraft, type Draft } from "@/lib/drafts";
import Greeting from "./Greeting";
import { pageTitleMaxLength } from "@/lib/page-titles";
export default function Preview({
  bypassPayment = false,
}: {
  bypassPayment?: boolean;
}) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [ready, setReady] = useState(false);
  const [days, setDays] = useState(2);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const request = useRef<{ fingerprint: string; key: string } | null>(null);
  const router = useRouter();
  useEffect(() => {
    try {
      const raw = readDraft([sessionStorage,localStorage]);
      if (raw) {
        const d = JSON.parse(raw);
        const parsed = contentSchema.safeParse({
          ...d.content,
          design: d.content.design ?? designs[d.templateId]?.id,
        });
        if (parsed.success) {
          setDraft({ ...d, content: parsed.data });
        } else {
          console.error("Draft schema error:", parsed.error);
        }
      }
    } catch (e) {
      console.error("Error reading draft:", e);
    }
    setReady(true);
  }, []);
  if (!ready) return <p className="center">Đang tải bản nháp…</p>;
  if (!draft)
    return (
      <div className="center">
        <h1>Bắt đầu với một mẫu thiệp</h1>
        <p>Chưa có bản nháp trong tab này.</p>
        <Link className="btn" href="/templates">
          Chọn mẫu
        </Link>
      </div>
    );
  async function submit() {
    setError("");
    setBusy(true);
    try {
      const data = checkoutSchema.parse({
        templateId: draft!.templateId,
        content: draft!.content,
        days,
      });
      const fingerprint = JSON.stringify(data);
      if (request.current?.fingerprint !== fingerprint)
        request.current = { fingerprint, key: crypto.randomUUID() };
      const order = await api<{ id: string; status: string }>("/api/orders", {
        method: "POST",
        headers: { "Idempotency-Key": request.current!.key },
        body: JSON.stringify(data),
      });
      router.push(
        `/${order.status === "PAID" ? "result" : "payment"}/${order.id}`,
      );
    } catch (e) {
      setError(
        e instanceof Error && e.name !== "ZodError"
          ? e.message
          : "Kiểm tra lại tiêu đề và nội dung thiệp.",
      );
      setBusy(false);
    }
  }
  return (
    <>
      <div className="pagehead">
        <span className="eyebrow">02 / Xem trước & chọn thời gian</span>
        <h1>Sẵn sàng gửi thương?</h1>
        {bypassPayment && (
          <p className="success" role="status">
            Chế độ xem thử: bỏ qua thanh toán, nhận ngay QR và đường link. Không
            thu tiền.
          </p>
        )}
      </div>
      <div className="editor">
        <div>
          <p className="muted small">
            Tiêu đề tab khi mở thiệp: <strong>{draft.content.pageTitle}</strong>
          </p>
          <Greeting content={draft.content} />
          <Link
            className="btn secondary"
            style={{ marginTop: 20 }}
            href={`/editor?template=${draft.templateId}`}
          >
            ← Chỉnh sửa thiệp
          </Link>
        </div>
        <form
          className="panel form"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <h2>Tiêu đề & thời gian lưu giữ</h2>
          <label>
            Tiêu đề tab trình duyệt
            <input
              maxLength={pageTitleMaxLength}
              value={draft.content.pageTitle}
              onChange={(e) => {
                const next = {
                  ...draft,
                  content: { ...draft.content, pageTitle: e.target.value },
                };
                setDraft(next);
                if(!saveDraft(next,[sessionStorage,localStorage]))setError("Không lưu được bản nháp trên trình duyệt này.");
              }}
            />
          </label>
          <p className="muted small">
            Đây là chữ hiển thị trên tab trình duyệt khi mở thiệp. Đường link và
            mã QR được hệ thống tạo tự động.
          </p>
          <label>
            Thời gian lưu giữ
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              {Object.entries(prices).map(([d, p]) => (
                <option key={d} value={d}>
                  {d} ngày — {money(p)}
                </option>
              ))}
            </select>
          </label>
          <p className="muted small">
            {bypassPayment
              ? "Bắt đầu tính từ lúc tạo thiệp xem thử."
              : "Bắt đầu tính từ lúc xác nhận thanh toán."}{" "}
            Hết hạn, thiệp sẽ không còn truy cập được. Không gia hạn trong bản
            trải nghiệm.
          </p>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span>
              {bypassPayment
                ? "Giá tham khảo · không thu tiền"
                : "Tổng thanh toán"}
            </span>
            <strong className="price">{money(prices[days])}</strong>
          </div>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <button className="btn" disabled={busy}>
            {busy
              ? "Đang xử lý…"
              : bypassPayment
                ? "Tạo thiệp xem thử & nhận QR ↗"
                : "Tạo đơn & thanh toán ↗"}
          </button>
          <p className="small muted">
            Chỉ mô phỏng, không chuyển tiền thật. Nội dung được chốt khi tạo
            đơn.
          </p>
        </form>
      </div>
    </>
  );
}
