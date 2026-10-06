"use client";
import { useState, type CSSProperties } from "react";
import type { CardContent } from "@/lib/rules";
import { designColors } from "@/lib/designs";

function Photo({ c }: { c: CardContent }) {
  const [failed, setFailed] = useState("");
  return c.imageUrl && failed !== c.imageUrl ? (
    <img
      className="design-photo"
      src={c.imageUrl}
      alt={`Kỷ niệm của ${c.recipient}`}
      onError={() => setFailed(c.imageUrl)}
    />
  ) : (
    <div className="design-art" aria-hidden="true">
      <i />
      <i />
      <i />
      <span>✳</span>
    </div>
  );
}
export function DesignCover({ c }: { c: CardContent }) {
  const title = <h2>{c.headline}</h2>;
  const recipient = <p className="design-recipient">{c.recipient}</p>;
  const date = (
    <p className="design-date">{c.eventDate || "Một ngày đáng nhớ"}</p>
  );
  switch (c.design) {
    case "wax":
      return (
        <div className="cover-envelope">
          <small>THƯ RIÊNG TRAO TAY</small>
          <div className="paper-envelope">
            <span>♡</span>
          </div>
          {recipient}
        </div>
      );
    case "timeline":
      return (
        <>
          <small>OUR LITTLE JOURNEY</small>
          <div className="journey-line">
            <b>01</b>
            <span>Lần đầu gặp</span>
            <b>02</b>
            <span>Ngày bên nhau</span>
            <b>∞</b>
          </div>
          {title}
          <div className="day-counter">
            {c.anniversaryDays}
            <small>NGÀY THƯƠNG NHAU</small>
          </div>
        </>
      );
    case "poem":
      return (
        <>
          <small>MỘT TRANG THƠ • GỬI RIÊNG EM</small>
          <div className="poetry-mark">“</div>
          {title}
          <div className="poetry-line" />
          {recipient}
          <span className="poetry-flower" aria-hidden="true">
            ✺
          </span>
        </>
      );
    case "cinema":
      return (
        <>
          <div className="film-label">A FILM BY {c.sender}</div>
          <div className="film-frame">
            <Photo c={c} />
            <span>REC ●</span>
          </div>
          {title}
          <p className="film-caption">OUR STORY / TAKE 01</p>
        </>
      );
    case "celestial":
      return (
        <>
          <small>TO THE MOON & BACK</small>
          <div className="constellation" aria-hidden="true">
            <i />
            <b>✦</b>
            <span>✧</span>
            <em>✦</em>
          </div>
          {title}
          {recipient}
        </>
      );
    case "editorial":
      return (
        <>
          <div className="editorial-masthead">THE WEDDING ISSUE</div>
          <div className="editorial-cover">
            <span>
              WE
              <br />
              DO.
            </span>
            <Photo c={c} />
          </div>
          {title}
          <div className="editorial-bottom">
            <span>SAVE THE DATE</span>
            {date}
          </div>
        </>
      );
    case "botanical":
      return (
        <>
          <small>HER GARDEN, OUR HOME</small>
          <div className="botanical-arch">
            <span aria-hidden="true">❀</span>
            {title}
          </div>
          {recipient}
          <p>Một bó thương, dành tặng mẹ.</p>
        </>
      );
    case "newspaper":
      return (
        <>
          <div className="news-masthead">Tin Nhà</div>
          <div className="news-edition">
            <span>SỐ ĐẶC BIỆT</span>
            <span>CHUYỆN NGƯỜI CHA</span>
          </div>
          {title}
          <div className="news-columns">
            <Photo c={c} />
            <p>{c.message}</p>
          </div>
          <div className="news-rule">MỘT ĐỜI LẶNG LẼ YÊU THƯƠNG</div>
        </>
      );
    case "scrapbook":
      return (
        <>
          <span className="scrap-sticker">HOME ♥</span>
          <div className="scrap-photo">
            <Photo c={c} />
            <small>the good old days</small>
          </div>
          {title}
          <div className="scrap-notes">
            <span>thương</span>
            <span>nhớ</span>
            <span>nhà</span>
          </div>
        </>
      );
    case "postcard":
      return (
        <>
          <div className="postcard-top">
            <small>POSTCARD / PAR AVION</small>
            <span className="postage-stamp">
              ✈<br />
              GỬI NHÀ
            </span>
          </div>
          <div className="postcard-landscape">
            <Photo c={c} />
          </div>
          {title}
          <div className="postcard-address">
            TO: {c.recipient}
            <br />
            FROM: {c.sender}
          </div>
        </>
      );
    case "heritage":
      return (
        <>
          <div className="heritage-border">
            <small>KÍNH MỪNG</small>
            <span className="heritage-word">Thọ</span>
            {title}
            {recipient}
            <div className="heritage-seal">
              AN
              <br />
              KHANG
            </div>
          </div>
        </>
      );
    case "menu":
      return (
        <>
          <div className="menu-top">BẾP NHÀ / OPEN WITH LOVE</div>
          <div className="plate" aria-hidden="true">
            <span>✳</span>
          </div>
          {title}
          <div className="menu-rule" />
          {date}
          <p>Một chỗ ngồi luôn dành cho bạn.</p>
        </>
      );
    case "lunar":
      return (
        <>
          <div className="lunar-lanterns" aria-hidden="true">
            <i />
            <i />
          </div>
          <small>TÂN NIÊN • CÁT TƯỜNG</small>
          <span className="lunar-word">Xuân</span>
          {title}
          <div className="lunar-medallion">福</div>
          {recipient}
        </>
      );
    case "winter":
      return (
        <>
          <small>A LITTLE WINTER MAGIC</small>
          <div className="snow-globe" aria-hidden="true">
            <span>✧</span>
            <i />
            <b>❄</b>
          </div>
          {title}
          {recipient}
          <p>Gói một chút ấm áp trong mùa đông.</p>
        </>
      );
    case "birthday":
      return (
        <>
          <div className="birthday-top">
            <span>YOU'RE INVITED</span>
            <b>★</b>
          </div>
          <div className="birthday-type">
            HAPPY
            <br />
            <em>BIRTH</em>
            <br />
            DAY!
          </div>
          <div className="birthday-cake" aria-hidden="true">
            ▥<br />▰
          </div>
          {recipient}
          <p>{c.headline}</p>
        </>
      );
    case "yearbook":
      return (
        <>
          <small>NHỮNG NĂM THÁNG RỰC RỠ</small>
          <div className="yearbook-title">
            Dear
            <br />
            <em>friends,</em>
          </div>
          <div className="yearbook-grid">
            <Photo c={c} />
            <div>
              ☺<br />
              <small>stay young</small>
            </div>
          </div>
          {title}
          <span className="yearbook-scribble">Đừng quên nhau nhé!</span>
        </>
      );
    case "graduation":
      return (
        <>
          <small>YOU DID IT / THE NEXT CHAPTER</small>
          <div className="grad-symbol" aria-hidden="true">
            ◇<span>✦</span>
          </div>
          <div className="grad-title">
            ON
            <br />
            WARD<span>↗</span>
          </div>
          {title}
          {recipient}
          <div className="grad-rule">CHÚC MỪNG TỐT NGHIỆP</div>
        </>
      );
    case "ticket":
      return (
        <>
          <div className="ticket-head">
            ADMIT ONE <span>★</span>
          </div>
          <div className="ticket-body">
            <small>GOOD PEOPLE / GREAT NIGHT</small>
            <div className="ticket-title">
              LET'S
              <br />
              <em>GET</em>
              <br />
              TOGETHER
            </div>
            <p>{c.headline}</p>
            {recipient}
            {date}
          </div>
          <div className="ticket-stub">
            <span>VÉ MỜI RIÊNG</span>
            <div className="barcode" />
          </div>
        </>
      );
  }
}
export default function DesignedGreeting({
  content: c,
  immersive = false,
}: {
  content: CardContent;
  immersive?: boolean;
  defaultOpen?: boolean;
}) {
  const [opened, setOpened] = useState(false);
  const [page, setPage] = useState(0);
  const [zoom, setZoom] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const sections = [
    {
      id: "personal-letter",
      kind: "text",
      title: `Gửi ${c.recipient}`,
      text: c.message,
      imageUrl: c.imageUrl,
    },
    ...c.sections,
  ];
  const currentPage = Math.min(page, sections.length - 1);
  const rgb = [1,3,5].map(offset => parseInt(c.background.slice(offset,offset+2),16));
  const customInk = rgb[0]*0.299+rgb[1]*0.587+rgb[2]*0.114 > 150 ? "#242529" : "#fff9e9";
  const gated = [
    "celestial",
    "botanical",
    "postcard",
    "heritage",
    "lunar",
    "winter",
    "birthday",
    "graduation",
    "ticket",
  ].includes(c.design);
  const labels: Record<string, string> = {
    celestial: "Chạm ngôi sao · mở lời hẹn",
    botanical: "Chạm cho hoa nở",
    postcard: "Lật mặt sau bưu thiếp",
    heritage: "Mở cuộn thư chúc thọ",
    lunar: "Mở lộc đầu năm",
    winter: "Chạm cho tuyết rơi",
    birthday: "Tắt nến · mở điều ước",
    graduation: "Mở lời chúc chương mới",
    ticket: "Xé vé · mở lời mời",
  };
  const showDetails = !gated || opened;
  const book = c.layout === "slides";
  const section = (s: (typeof sections)[number], i: number) => (
    <section className={`design-section section-${s.kind}`} key={s.id}>
      <small>
        {String(i + 1).padStart(2, "0")} /{" "}
        {c.design === "menu" ? "CHUYỆN BÊN MÂM CƠM" : "DÀNH RIÊNG BẠN"}
      </small>
      <h3>{s.title}</h3>
      <p>{s.text}</p>
      {s.imageUrl && (
        <button
          className="design-image-button"
          onClick={() => setZoom(s.imageUrl)}
          aria-label={`Phóng to ảnh ${s.title}`}
        >
          <img src={s.imageUrl} alt={s.title} loading="lazy" />
        </button>
      )}
    </section>
  );
  return (
    <div
      data-product="greeting"
      data-design={c.design}
      className={`designed-card design-${c.design} layout-${c.layout} ${immersive ? "design-immersive" : ""} ${opened ? "is-open" : ""} ${c.animation === "none" ? "no-motion" : ""}`}
      style={{ "--design-paper": c.background, ...(c.background !== designColors[c.design] ? {"--design-ink": customInk} : {}) } as CSSProperties}
    >
      <div className="design-inner">
        <div className="design-cover">
          <DesignCover c={c} />
          {gated && (
            <button
              className="design-action"
              aria-expanded={opened}
              onClick={() => setOpened(!opened)}
            >
              {opened ? "Xem lại mặt trước" : labels[c.design]}
            </button>
          )}
          {!gated && (
            <span className="design-scroll-hint">
              {book
                ? "Lật trang câu chuyện bên dưới"
                : "Cuộn để đọc câu chuyện"}{" "}
              ↓
            </span>
          )}
          {opened && (
            <div className="design-celebration" aria-hidden="true">
              ✦ · ✧ · ✦
            </div>
          )}
        </div>
        {showDetails && (
          <div className="design-content">
            {(c.eventDate || c.eventLocation) && (
              <div className="design-event">
                <small>HẸN GẶP BẠN</small>
                <p>{c.eventDate}</p>
                <strong>{c.eventLocation}</strong>
              </div>
            )}
            {book ? (
              <div
                className="design-book"
                onTouchStart={(e) =>
                  setStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })
                }
                onTouchEnd={(e) => {
                  if (start) {
                    const dx = e.changedTouches[0].clientX - start.x,
                      dy = e.changedTouches[0].clientY - start.y;
                    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy))
                      setPage((p) =>
                        Math.max(
                          0,
                          Math.min(sections.length - 1, p + (dx < 0 ? 1 : -1)),
                        ),
                      );
                    setStart(null);
                  }
                }}
              >
                <div aria-live="polite">
                  {section(sections[currentPage], currentPage)}
                </div>
                <div className="design-pagination">
                  <button
                    disabled={currentPage === 0}
                    onClick={() => setPage(currentPage - 1)}
                    aria-label="Trang trước"
                  >
                    ←
                  </button>
                  <span>
                    {currentPage + 1} / {sections.length}
                  </span>
                  <button
                    disabled={currentPage === sections.length - 1}
                    onClick={() => setPage(currentPage + 1)}
                    aria-label="Trang sau"
                  >
                    →
                  </button>
                </div>
              </div>
            ) : ["newspaper", "menu"].includes(c.design) ? (
              <div className="design-chapters">
                {sections.map((s, i) => (
                  <details key={s.id} open={i === 0}>
                    <summary>
                      {String(i + 1).padStart(2, "0")} — {s.title}
                    </summary>
                    {section(s, i)}
                  </details>
                ))}
              </div>
            ) : (
              <div className="design-sections">{sections.map(section)}</div>
            )}
            {c.giftRevealed && (
              <details className="design-gift">
                <summary>
                  {c.design === "lunar"
                    ? "Lời chúc trong bao lì xì"
                    : "Một bất ngờ dành riêng bạn"}{" "}
                  ✦
                </summary>
                <p>{c.giftRevealed}</p>
              </details>
            )}
            <div className="design-signature">
              <small>GỬI BẰNG TẤT CẢ YÊU THƯƠNG</small>
              <p>{c.sender}</p>
              <button
                className="design-action"
                aria-pressed={liked}
                onClick={() => setLiked(!liked)}
              >
                {liked ? "♥ Đã thả một lời thương" : "♡ Thả một lời thương"}
              </button>
            </div>
          </div>
        )}
        {c.musicUrl && (
          <div className="design-audio">
            <small>{c.musicTitle || "Giai điệu dành cho bạn"}</small>
            <audio controls src={c.musicUrl} preload="none" />
          </div>
        )}
      </div>
      {zoom && (
        <div
          className="design-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Ảnh kỷ niệm"
          onKeyDown={(e) => {
            if (e.key === "Escape") setZoom(null);
          }}
        >
          <button autoFocus onClick={() => setZoom(null)} aria-label="Đóng ảnh">
            Đóng ×
          </button>
          <img src={zoom} alt="Ảnh kỷ niệm phóng to" />
        </div>
      )}
    </div>
  );
}
