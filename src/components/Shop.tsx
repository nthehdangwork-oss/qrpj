"use client";
import { useRef } from "react";
import Link from "next/link";
export default function Shop({
  zalo,
  facebook,
}: {
  zalo: string | null;
  facebook: string | null;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <div className="pagehead">
        <span className="eyebrow">Chọn cách gửi thương</span>
        <h1>Một món quà, nhiều cách kể.</h1>
        <p className="muted">
          Tự tay tạo nên điều đặc biệt hoặc để chúng mình cùng bạn thiết kế.
        </p>
      </div>
      <div className="editor">
        <article className="panel">
          <div className="sample" style={{ background: "#f9e0e7" }}>
            <span className="symbol">♡</span>
            <h2>Thiệp theo mẫu</h2>
          </div>
          <p>18 mẫu cho tình yêu, gia đình và những ngày đáng nhớ.</p>
          <p className="price">
            Từ 19.000đ <span className="small muted">/ 2 ngày</span>
          </p>
          <Link href="/templates" className="btn">
            Chọn mẫu thiệp ↗
          </Link>
        </article>
        <article className="panel">
          <div className="sample" style={{ background: "#e5e8d9" }}>
            <span className="symbol">✳</span>
            <h2>Thiết kế riêng</h2>
          </div>
          <p>Một câu chuyện của bạn. Một thiết kế không giống ai.</p>
          <p className="price">Báo giá theo yêu cầu</p>
          <button
            className="btn secondary"
            onClick={() => dialog.current?.showModal()}
          >
            Trao đổi cùng chúng mình ↗
          </button>
        </article>
      </div>
      <dialog className="dialog" ref={dialog}>
        <h2>Kể câu chuyện của bạn</h2>
        <p>
          Chọn kênh liên hệ. Bạn sẽ chuyển sang ứng dụng hoặc trang tương ứng;
          chưa phát sinh đơn hay phí.
        </p>
        <div className="row">
          {zalo && (
            <a
              className="btn"
              href={zalo}
              target="_blank"
              rel="noopener noreferrer"
            >
              Mở Zalo ↗
            </a>
          )}
          {facebook && (
            <a
              className="btn secondary"
              href={facebook}
              target="_blank"
              rel="noopener noreferrer"
            >
              Mở Facebook ↗
            </a>
          )}
        </div>
        {!zalo && !facebook && (
          <p className="muted">
            Kênh tư vấn đang được chuẩn bị. Bạn có thể trải nghiệm mẫu có sẵn
            trước nhé.
          </p>
        )}
        <button
          style={{ marginTop: 20 }}
          className="btn secondary"
          onClick={() => dialog.current?.close()}
        >
          Đóng
        </button>
      </dialog>
    </>
  );
}
