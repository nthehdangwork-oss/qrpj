"use client";
import { useState } from "react";
import Link from "next/link";
import { categories, catalog } from "@/lib/catalog";
import { DesignCover } from "./DesignedGreeting";
import { templateContent } from "@/lib/landing";
import { designs } from "@/lib/designs";
export default function Templates() {
  const [category, setCategory] = useState("ALL");
  const items = catalog.filter(
    (t) => category === "ALL" || t.category === category,
  );
  return (
    <>
      <div className="pagehead">
        <span className="eyebrow">Bộ sưu tập thiệp</span>
        <h1>Dành cho người bạn thương.</h1>
        <p className="muted">
          Chọn một mẫu. Phần còn lại, hãy để cảm xúc của bạn kể.
        </p>
      </div>
      <div className="row" style={{ marginBottom: 30 }}>
        {Object.entries({ ALL: "Tất cả", ...categories }).map(([id, label]) => (
          <button
            key={id}
            className={`pill ${id === category ? "active" : ""}`}
            onClick={() => setCategory(id)}
            aria-pressed={id === category}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid">
        {items.map((t) => (
          <Link
            key={t.id}
            href={`/editor?template=${t.id}`}
            className="template"
          >
            <div className="template-preview" aria-hidden="true">
              <div className={`designed-card design-${designs[t.id].id}`}>
                <div className="design-cover">
                  <DesignCover c={templateContent(t.id)} />
                </div>
              </div>
            </div>
            <span className="template-style">{designs[t.id].label}</span>
            <h3>{t.name} ↗</h3>
            <p className="template-description">{designs[t.id].interaction}</p>
            <span className="small muted">
              {categories[t.category]} · Từ 19.000đ
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
