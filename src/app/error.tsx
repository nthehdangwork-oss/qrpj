"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="center panel">
      <h1>Chưa tải được trang</h1>
      <p>Vui lòng kiểm tra kết nối hoặc thử lại sau một chút.</p>
      <button className="btn" onClick={reset}>
        Thử lại
      </button>
    </div>
  );
}
