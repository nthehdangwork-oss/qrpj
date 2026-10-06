"use client";
import { useState } from "react";
export default function ImageUpload({
  label,
  value,
  onChange,
  onBusy,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  onBusy: (busy: boolean) => void;
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function upload(file: File) {
    setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Chọn ảnh JPEG, PNG hoặc WebP. Ảnh HEIC cần đổi sang JPEG.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError("Ảnh tối đa 15 MB. Hãy chọn ảnh nhỏ hơn.");
      return;
    }
    setBusy(true);
    onBusy(true);
    try {
      const response = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error?.message ?? "Không tải được ảnh.");
      onChange(data.url);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Không tải được ảnh. Hãy thử lại.",
      );
    } finally {
      setBusy(false);
      onBusy(false);
    }
  }
  return (
    <div className="image-upload">
      <label>
        {label}
        <span className="upload-pick">{value ? "Đổi ảnh" : "Chọn ảnh từ điện thoại"}</span>
        <input
          aria-label={label}
          className="upload-file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={busy || disabled}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void upload(file);
          }}
        />
      </label>
      <p className="small muted">
        Chọn ảnh từ điện thoại · JPEG, PNG, WebP · Tối đa 15 MB
      </p>
      {busy && <p role="status">Đang tải và tối ưu ảnh…</p>}
      {value && (
        <div className="upload-preview">
          <img
            src={value}
            alt={`Xem trước ${label}`}
            style={{
              width: "100%",
              maxHeight: 200,
              objectFit: "contain",
              borderRadius: 12,
            }}
          />
          <button
            className="pill"
            type="button"
            disabled={busy || disabled}
            onClick={() => {
              onChange("");
              setError("");
            }}
          >
            Xóa ảnh
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </div>
  );
}
