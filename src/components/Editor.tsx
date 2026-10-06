"use client";
import { designs } from "@/lib/designs";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { catalog } from "@/lib/catalog";
import { contentSchema, type CardContent } from "@/lib/rules";
import Greeting from "./Greeting";
import ImageUpload from "./ImageUpload";
import { pageTitles, pageTitleMaxLength } from "@/lib/page-titles";
import { layoutNames, templateContent } from "@/lib/landing";
import { saveDraft, readDraft } from "@/lib/drafts";
export {draftKey} from "@/lib/drafts";
export type {Draft} from "@/lib/drafts";
export default function Editor({ templateId }: { templateId: string }) {
  const template = catalog.find((t) => t.id === templateId)!;
  const router = useRouter();
  const [content, setContent] = useState<CardContent>(() =>
    templateContent(templateId),
  );
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [ready, setReady] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [error, setError] = useState("");

  const persistDraft = (draftContent:CardContent) => saveDraft({templateId,content:draftContent},[sessionStorage,localStorage]);

  useEffect(() => {
    try {
      // Đọc từ sessionStorage, nếu không có fallback sang localStorage
      const raw = readDraft([sessionStorage,localStorage],templateId);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.templateId === templateId) {
          const parsed = contentSchema.safeParse({
            ...d.content,
            design: designs[templateId].id,
          });
          if (parsed.success) setContent(parsed.data);
        }
      }
    } catch {
      setError("Không thể khôi phục bản nháp. Bạn vẫn có thể tạo thiệp mới.");
    }
    setReady(true);
  }, [templateId]);

  useEffect(() => {
    if (ready) {
      persistDraft(content);
    }
  }, [content, ready, templateId]);

  const change = <K extends keyof CardContent>(key: K, value: CardContent[K]) =>
    setContent((c) => ({ ...c, [key]: value }));

  function next() {
    if (imageBusy) return;
    setError("");
    const parsed = contentSchema.safeParse(content);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const issueMsg = firstIssue
        ? `${firstIssue.path.join(".")}: ${firstIssue.message}`
        : "Vui lòng kiểm tra lại nội dung bắt buộc.";
      setError(`Lỗi nội dung: ${issueMsg}`);
      return;
    }
    try {
      if(!persistDraft(parsed.data))throw new Error("Draft storage unavailable");
      router.push("/preview");
    } catch {
      setError("Không lưu được bản nháp. Hãy mở bằng trình duyệt ngoài.");
    }
  }
  return (
    <>
      <div className="pagehead">
        <span className="eyebrow">01 / Viết câu chuyện của bạn</span>
        <h1>Thêm một chút riêng.</h1>
        <p className="muted">
          Mẫu {template.name} · Xem thay đổi ngay bên cạnh.
        </p>
      </div>
      <div
        className="mobile-editor-tabs"
        role="group"
        aria-label="Chế độ chỉnh sửa"
      >
        <button
          type="button"
          aria-pressed={!showMobilePreview}
          onClick={() => setShowMobilePreview(false)}
        >
          ✎ 1. Chỉnh nội dung
        </button>
        <button
          type="button"
          aria-pressed={showMobilePreview}
          onClick={() => setShowMobilePreview(true)}
        >
          👁️ 2. Xem thiệp trực tiếp
        </button>
      </div>
      <div
        className={`editor landing-editor ${
          showMobilePreview ? "show-mobile-preview" : ""
        }`}
      >
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            next();
          }}
        >
          <fieldset className="layout-picker">
            <legend>Chọn cách trải nghiệm</legend>
            {Object.entries(layoutNames).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={content.layout === value}
                onClick={() => change("layout", value as CardContent["layout"])}
              >
                <span>
                  {value === "fullscreen"
                    ? "▣"
                    : value === "scroll"
                      ? "↕"
                      : "▥"}
                </span>
                {label}
              </button>
            ))}
          </fieldset>
          <p className="small muted">
            Thiết kế: <strong>{designs[templateId].label}</strong> ·{" "}
            {designs[templateId].interaction}
          </p>
          <label>
            Tiêu đề trang mở đầu
            <textarea
              rows={2}
              maxLength={120}
              value={content.headline}
              onChange={(e) => change("headline", e.target.value)}
            />
          </label>
          <label>
            Tiêu đề tab trình duyệt
            <input
              maxLength={pageTitleMaxLength}
              value={content.pageTitle}
              onChange={(e) => change("pageTitle", e.target.value)}
              placeholder={pageTitles.card}
              aria-describedby="page-title-help"
            />
          </label>
          <p id="page-title-help" className="muted small">
            Tối đa {pageTitleMaxLength} ký tự. Hiển thị trên tab khi người nhận
            mở thiệp. Không thay đổi domain hoặc đường link; để trống sẽ dùng
            tiêu đề mặc định.
          </p>
          <label>
            Gửi đến
            <input
              required
              maxLength={60}
              value={content.recipient}
              onChange={(e) => change("recipient", e.target.value)}
            />
          </label>
          <label>
            Lời chúc của bạn{" "}
            <span className="muted small">
              {content.message.length}/600 ký tự
            </span>
            <textarea
              required
              maxLength={600}
              value={content.message}
              onChange={(e) => change("message", e.target.value)}
            />
          </label>
          <label>
            Người gửi
            <input
              required
              maxLength={60}
              value={content.sender}
              onChange={(e) => change("sender", e.target.value)}
            />
          </label>
          <div className="grid">
            <label>
              Màu nền
              <input
                type="color"
                value={content.background}
                onChange={(e) => change("background", e.target.value)}
              />
            </label>
            <label>
              Biểu tượng
              <select
                value={content.icon}
                onChange={(e) =>
                  change("icon", e.target.value as CardContent["icon"])
                }
              >
                <option value="heart">♡ Trái tim</option>
                <option value="flower">✿ Hoa</option>
                <option value="star">✦ Sao</option>
              </select>
            </label>
            <label>
              Chuyển động
              <select
                value={content.animation}
                onChange={(e) =>
                  change(
                    "animation",
                    e.target.value as CardContent["animation"],
                  )
                }
              >
                <option value="float">Bồng bềnh</option>
                <option value="sparkle">Lấp lánh</option>
                <option value="none">Tĩnh</option>
              </select>
            </label>
          </div>
          <ImageUpload
            label="Ảnh chính của thiệp"
            value={content.imageUrl}
            onChange={(url) => change("imageUrl", url)}
            onBusy={setImageBusy}
            disabled={imageBusy}
          />
          <fieldset
            className="interactive-settings"
            style={{
              border: "1px solid #ffd9df",
              borderRadius: "16px",
              padding: "16px",
              background: "#fff8f7",
              margin: "16px 0",
            }}
          >
            <legend
              style={{
                fontWeight: "bold",
                color: "var(--rose)",
                fontSize: "14px",
                padding: "0 8px",
              }}
            >
              ✨ Tương tác của thiệp
            </legend>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {content.design === "wax" && (
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={content.envelope}
                    onChange={(e) => change("envelope", e.target.checked)}
                    style={{
                      width: "18px",
                      height: "18px",
                      accentColor: "var(--rose)",
                    }}
                  />
                  Mở đầu bằng Phong bì niêm phong sáp 3D
                </label>
              )}

              {content.design === "wax" && content.envelope && (
                <label>
                  Chữ trên tem niêm phong
                  <input
                    maxLength={20}
                    value={content.sealText}
                    onChange={(e) => change("sealText", e.target.value)}
                    placeholder="FOREVER, GIA ĐÌNH, LỘC XUÂN..."
                  />
                </label>
              )}

              <div className="grid">
                <label>
                  Tên bài hát
                  <input
                    maxLength={60}
                    value={content.musicTitle}
                    onChange={(e) => change("musicTitle", e.target.value)}
                    placeholder="Until I Found You"
                  />
                </label>

                <label>
                  Số ngày bên nhau (Love Counter)
                  <input
                    type="number"
                    min={0}
                    max={99999}
                    value={content.anniversaryDays || ""}
                    onChange={(e) =>
                      change("anniversaryDays", Number(e.target.value) || 0)
                    }
                    placeholder="Ví dụ: 520 (để trống nếu không đếm)"
                  />
                </label>
              </div>

              <label>
                Lời chúc bí mật
                <input
                  maxLength={200}
                  value={content.giftRevealed}
                  onChange={(e) => change("giftRevealed", e.target.value)}
                  placeholder="Ví dụ: 100 Cái ôm & chuyến du lịch cùng nhau ♡"
                />
              </label>
            </div>
          </fieldset>
          <label>
            Thời gian buổi hẹn (tuỳ chọn)
            <input
              maxLength={100}
              value={content.eventDate}
              onChange={(e) => change("eventDate", e.target.value)}
              placeholder="19:00 · Thứ Bảy, 10/10/2026"
            />
          </label>
          <label>
            Địa điểm (tuỳ chọn)
            <input
              maxLength={180}
              value={content.eventLocation}
              onChange={(e) => change("eventLocation", e.target.value)}
              placeholder="Tên địa điểm, địa chỉ"
            />
          </label>
          <section
            className="section-editor"
            aria-label="Các phần của landing page"
          >
            <h2>Những trang chuyện của bạn</h2>
            <p className="muted small">
              Thêm tối đa 6 phần. Chạm lời nhắn để mở; chạm ảnh để xem lớn.
            </p>
            {content.sections.map((section, index) => (
              <fieldset key={section.id} className="section-fields">
                <legend>
                  Phần {index + 1} ·{" "}
                  {section.kind === "photo"
                    ? "Ảnh"
                    : section.kind === "message"
                      ? "Lời nhắn"
                      : "Văn bản"}
                </legend>
                <label>
                  Tiêu đề phần {index + 1}
                  <input
                    maxLength={100}
                    value={section.title}
                    onChange={(e) =>
                      change(
                        "sections",
                        content.sections.map((s) =>
                          s.id === section.id
                            ? { ...s, title: e.target.value }
                            : s,
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  Nội dung phần {index + 1}
                  <textarea
                    maxLength={600}
                    value={section.text}
                    onChange={(e) =>
                      change(
                        "sections",
                        content.sections.map((s) =>
                          s.id === section.id
                            ? { ...s, text: e.target.value }
                            : s,
                        ),
                      )
                    }
                  />
                </label>
                {section.kind === "photo" && (
                  <ImageUpload
                    label={`Ảnh phần ${index + 1}`}
                    value={section.imageUrl}
                    onBusy={setImageBusy}
                    disabled={imageBusy}
                    onChange={(url) =>
                      setContent((current) => ({
                        ...current,
                        sections: current.sections.map((s) =>
                          s.id === section.id ? { ...s, imageUrl: url } : s,
                        ),
                      }))
                    }
                  />
                )}
                <div className="row">
                  <button
                    className="pill"
                    type="button"
                    disabled={index === 0}
                    aria-label={`Đưa phần ${index + 1} lên`}
                    onClick={() => {
                      const list = [...content.sections];
                      [list[index - 1], list[index]] = [
                        list[index],
                        list[index - 1],
                      ];
                      change("sections", list);
                    }}
                  >
                    ↑
                  </button>
                  <button
                    className="pill"
                    type="button"
                    disabled={index === content.sections.length - 1}
                    aria-label={`Đưa phần ${index + 1} xuống`}
                    onClick={() => {
                      const list = [...content.sections];
                      [list[index], list[index + 1]] = [
                        list[index + 1],
                        list[index],
                      ];
                      change("sections", list);
                    }}
                  >
                    ↓
                  </button>
                  <button
                    className="pill"
                    type="button"
                    onClick={() =>
                      change(
                        "sections",
                        content.sections.filter((s) => s.id !== section.id),
                      )
                    }
                  >
                    Xoá phần {index + 1}
                  </button>
                </div>
              </fieldset>
            ))}
            <div className="row">
              {(["text", "photo", "message"] as const).map((kind) => (
                <button
                  className="btn secondary"
                  key={kind}
                  type="button"
                  disabled={content.sections.length >= 6}
                  onClick={() =>
                    change("sections", [
                      ...content.sections,
                      {
                        id: crypto.randomUUID(),
                        kind,
                        title:
                          kind === "photo"
                            ? "Một bức ảnh"
                            : kind === "message"
                              ? "Lời nhắn riêng"
                              : "Một câu chuyện",
                        text: "",
                        imageUrl: "",
                      },
                    ])
                  }
                >
                  +{" "}
                  {kind === "photo"
                    ? "Ảnh"
                    : kind === "message"
                      ? "Lời nhắn"
                      : "Văn bản"}
                </button>
              ))}
            </div>
          </section>
          <label>
            URL nhạc HTTPS (tuỳ chọn)
            <input
              type="url"
              maxLength={2048}
              value={content.musicUrl}
              onChange={(e) => change("musicUrl", e.target.value)}
              placeholder="https://…"
            />
          </label>
          <p className="muted small">
            Nhạc dùng liên kết âm thanh trực tiếp bạn có quyền chia sẻ. Chưa hỗ
            trợ tải tệp nhạc. Nhạc phát khi người nhận bấm nghe.
          </p>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <div className="row" style={{ marginTop: "10px", gap: "10px" }}>
            <button
              type="button"
              className="btn secondary"
              onClick={() => {
                setShowMobilePreview(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              👁️ Xem thử thiệp ngay
            </button>
            <button
              className="btn"
              type="submit"
              disabled={!ready || imageBusy}
            >
              Tiếp tục tạo đơn ↗
            </button>
          </div>
        </form>
        <div className="editor-device">
          <div className="device-label">
            <span>LIVE PREVIEW</span>
            <span>{layoutNames[content.layout]}</span>
          </div>
          <div
            className="row"
            style={{ justifyContent: "space-between", marginBottom: "8px" }}
          >
            <button
              type="button"
              className="btn secondary"
              style={{
                fontSize: "13px",
                padding: "8px 16px",
                minHeight: "38px",
              }}
              onClick={() => setShowMobilePreview(false)}
            >
              ← Sửa nội dung
            </button>
            <button
              type="button"
              className="btn"
              style={{
                fontSize: "13px",
                padding: "8px 16px",
                minHeight: "38px",
              }}
              onClick={next}
              disabled={!ready || imageBusy}
            >
              Tiếp tục tạo đơn ↗
            </button>
          </div>
          <Greeting
            key={content.layout}
            content={content}
            defaultOpen={false}
          />
          <p
            className="muted small"
            style={{ textAlign: "center", marginTop: "12px" }}
          >
            Chạm vào thiệp để trải nghiệm các tương tác của mẫu.
          </p>
          <button
            className="btn"
            type="button"
            style={{ width: "100%", marginTop: "10px" }}
            onClick={next}
            disabled={!ready || imageBusy}
          >
            Chốt nội dung & Chỉnh tiêu đề ↗
          </button>
        </div>
      </div>
    </>
  );
}
