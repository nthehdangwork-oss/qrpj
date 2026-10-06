"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import type { CardContent } from "@/lib/rules";

export const symbols = { heart: "♡", star: "✦", flower: "✿" };

type Particle = {
  id: number;
  symbol: string;
  randX: number;
};

type Confetti = {
  id: number;
  x: number;
  y: number;
  color: string;
};

const defaultCouplePhoto =
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=800&auto=format&fit=crop";

export default function Greeting({
  content: c,
  defaultOpen = false,
  immersive = false,
}: {
  content: CardContent;
  defaultOpen?: boolean;
  immersive?: boolean;
}) {
  // Trạng thái mở phong bì sáp (nếu thiệp tắt envelope thì mặc định mở luôn)
  const [isOpened, setIsOpened] = useState(() => !c.envelope || defaultOpen);
  const [isUnsealing, setIsUnsealing] = useState(false);

  // Trạng thái âm thanh đĩa than
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Trạng thái khui quà / bốc lì xì
  const [isGiftOpen, setIsGiftOpen] = useState(false);
  const [confetti, setConfetti] = useState<Confetti[]>([]);

  // Trạng thái thả hạt cảm xúc bay
  const [particles, setParticles] = useState<Particle[]>([]);

  // Trạng thái lỗi ảnh/nhạc
  const [badImage, setBadImage] = useState("");
  const [badMusic, setBadMusic] = useState("");

  // Phóng to ảnh modal
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);

  // Đồng bộ khi prop envelope thay đổi
  useEffect(() => {
    if (!c.envelope) {
      setIsOpened(true);
    }
  }, [c.envelope]);

  // Xử lý bật/tắt đĩa than vinyl
  const togglePlay = () => {
    if (!audioRef.current) {
      setIsPlaying(!isPlaying);
      return;
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(
        () => setIsPlaying(true),
        () => setIsPlaying(!isPlaying),
      );
    }
  };

  // Mở phong bì sáp với hoạt ảnh mượt mà
  const handleOpenEnvelope = () => {
    setIsUnsealing(true);
    setTimeout(() => {
      setIsOpened(true);
      setIsUnsealing(false);
      // Tự động phát nhạc nhẹ nếu có URL nhạc
      if (audioRef.current && c.musicUrl) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }, 700);
  };

  // Khui hộp quà hoặc rút bao lì xì
  const handleUnwrapGift = () => {
    if (isGiftOpen) return;
    setIsGiftOpen(true);

    // Tạo các mảnh pháo hoa giấy confetti
    const colors = ["#b60e3d", "#ff8fa3", "#ffd166", "#06d6a0", "#118ab2", "#ffffff"];
    const pieces: Confetti[] = [];
    for (let i = 0; i < 28; i++) {
      pieces.push({
        id: Date.now() + i,
        x: (Math.random() - 0.5) * 260,
        y: Math.random() * 220 + 40,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 2000);
  };

  // Thả sticker cảm xúc bay lên
  const spawnReaction = useCallback((iconSymbol: string) => {
    const id = Date.now() + Math.random();
    const randX = (Math.random() - 0.5) * 160;
    setParticles((prev) => [...prev, { id, symbol: iconSymbol, randX }]);

    // Tự xoá hạt sau 3s
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, 3000);
  }, []);

  const photoSrc = c.imageUrl || defaultCouplePhoto;
  const isTet = c.headline.includes("Tết") || c.headline.includes("Xuân") || c.sealText.includes("LỘC");
  const isBirthday = c.headline.includes("Birthday") || c.headline.includes("Sinh nhật");

  return (
    <div
      data-product="greeting"
      className={`relative w-full mx-auto overflow-hidden font-sans-viet select-none transition-all duration-700 ${immersive ? "product-canvas" : "max-w-[480px] rounded-3xl shadow-2xl"}`}
      style={{
        background: `radial-gradient(circle at 80% 10%, #ffffff 0%, ${c.background || "#fff8f7"} 100%)`,
        minHeight: immersive ? "100dvh" : "680px",
      }}
    >
      {/* Audio Element ngầm */}
      {c.musicUrl && badMusic !== c.musicUrl && (
        <audio
          ref={audioRef}
          src={c.musicUrl}
          preload="auto"
          loop
          onError={() => setBadMusic(c.musicUrl)}
        />
      )}

      {/* CÁC HẠT NỔI CẢM XÚC BAY (FLOATING STAMPS) */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="floating-stamp-particle text-3xl select-none"
          style={
            {
              "--rand-x": `${p.randX}px`,
              left: `calc(50% + ${p.randX * 0.4}px)`,
            } as React.CSSProperties
          }
        >
          {p.symbol}
        </div>
      ))}

      {/* MODAL PHÓNG TO ẢNH POLAROID */}
      {isPhotoZoomed && (
        <div
          className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsPhotoZoomed(false)}
        >
          <div className="relative max-w-sm w-full bg-white p-3 pb-6 rounded-lg shadow-2xl animate-fade-in">
            <img
              src={photoSrc}
              alt="Ảnh phóng to"
              className="w-full aspect-square object-cover rounded"
            />
            <p className="font-serif-title text-center text-primary mt-3 text-lg italic">
              {c.headline || "Khoảnh khắc ngọt ngào"}
            </p>
            <p className="text-center text-xs text-muted mt-1">Chạm bất kỳ đâu để đóng</p>
          </div>
        </div>
      )}

      {/* ========================================================
          GIAI ĐOẠN 1: PHONG BÌ SÁP NIÊM PHONG (WAX SEAL ENVELOPE)
          ======================================================== */}
      {!isOpened && c.envelope && (
        <section
          className={`flex flex-col items-center justify-center min-h-[640px] px-6 py-10 transition-all duration-700 ${
            isUnsealing ? "scale-95 opacity-0 -translate-y-8" : "scale-100 opacity-100"
          }`}
        >
          {/* Header thiệp phong bì */}
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md text-xs font-semibold text-rose uppercase tracking-widest shadow-sm">
              <span className="w-2 h-2 rounded-full bg-rose animate-ping" />
              Thư Riêng Trao Tay
            </div>
            <h1 className="font-serif-title text-3xl font-bold text-ink tracking-tight mt-1">
              Gửi {c.recipient}
            </h1>
            <p className="text-sm text-muted max-w-[280px] mx-auto">
              Một bức thư tình cảm và những kỷ niệm ngọt ngào đang chờ bạn mở ra...
            </p>
          </div>

          {/* Canvas Thân Phong Bì 3D */}
          <div className="relative w-full max-w-[340px] aspect-[4/3] rounded-2xl bg-white shadow-2xl overflow-hidden flex items-center justify-center border border-rose-100 group">
            {/* Lớp bóng & nếp gập phong bì */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#fff0f1] via-white to-[#ffe8eb] opacity-90" />

            {/* SVG nếp gập phong bì */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 340 255"
            >
              {/* Nắp trên phong bì */}
              <path d="M0 0 L170 135 L340 0 Z" fill="#ffd9df" fillOpacity="0.45" />
              <path d="M0 0 L170 135 L340 0" stroke="#ffb2bd" strokeOpacity="0.6" strokeWidth="1.5" />
              {/* Hai cạnh bên */}
              <path d="M0 255 L135 120" stroke="#ffb2bd" strokeOpacity="0.35" strokeWidth="1" />
              <path d="M340 255 L205 120" stroke="#ffb2bd" strokeOpacity="0.35" strokeWidth="1" />
              {/* Nếp gập đáy */}
              <path d="M0 255 L170 135 L340 255 Z" fill="#fff5f6" fillOpacity="0.8" />
            </svg>

            {/* Ảnh Polaroid hé lộ khe phong bì */}
            <div className="absolute -top-3 w-40 h-28 rounded-lg bg-white shadow-md -rotate-3 flex flex-col items-center p-1.5 opacity-90 transition-transform group-hover:-translate-y-2">
              <div className="w-full h-18 rounded overflow-hidden bg-rose-50">
                <img
                  src={photoSrc}
                  alt="Ảnh hé lộ"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-serif-title text-[10px] text-rose font-medium mt-1 italic">
                Our Memories ✨
              </span>
            </div>

            {/* Tem thư Vintage (Postage Stamp) */}
            <div className="absolute top-3 right-3 w-11 h-13 bg-[#ffd9df] rounded-sm shadow-inner flex flex-col items-center justify-center p-1 rotate-3 border border-dashed border-[#e2bec0]">
              <span className="text-rose text-sm">♡</span>
              <span className="text-[8px] font-bold text-muted tracking-tighter uppercase">
                {c.sealText || "FOREVER"}
              </span>
            </div>

            {/* Con dấu sáp đỏ tim vàng (Wax Seal Button) */}
            <div className="absolute z-20 flex flex-col items-center justify-center" style={{ top: "52%", transform: "translateY(-50%)" }}>
              <button
                type="button"
                onClick={handleOpenEnvelope}
                aria-label="Chạm để mở phong bì sáp"
                className="relative group cursor-pointer focus:outline-none flex items-center justify-center transition-transform active:scale-90"
              >
                {/* Vòng aura sáng nhấp nháy */}
                <div className="absolute -inset-3 rounded-full bg-rose/20 blur-md animate-ping" />
                <div className="absolute -inset-1 rounded-full bg-rose/30 blur-sm animate-pulse" />

                {/* Khối con dấu sáp 3D */}
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#ba1340] via-[#da3054] to-[#792539] shadow-2xl flex items-center justify-center animate-wax-pulse border-2 border-white/40">
                  <span className="text-[#ffdf9b] text-2xl drop-shadow filter transition-transform group-hover:scale-110">
                    {c.icon === "flower" ? "✿" : c.icon === "star" ? "✦" : "♡"}
                  </span>
                </div>
              </button>
              <span className="text-[11px] font-semibold text-rose mt-2 tracking-wide uppercase drop-shadow-sm bg-white/70 px-2 py-0.5 rounded-full">
                Chạm mở niêm phong
              </span>
            </div>
          </div>

          <p className="text-xs text-muted mt-8 italic flex items-center gap-1.5">
            <span>✨</span> Chạm nhẹ vào con dấu để bắt đầu hành trình yêu thương
          </p>
        </section>
      )}

      {/* ========================================================
          GIAI ĐOẠN 2: NỘI DUNG THIỆP ĐÃ MỞ (UNFOLDED CARD CANVAS)
          ======================================================== */}
      {isOpened && (
        <article className="flex flex-col w-full pb-24 animate-fade-in relative z-10">
          {/* Top Bar: Đĩa than Vinyl xoay & Nút xem lại phong bì */}
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            {/* Đĩa than Vinyl Mini Player */}
            <button
              type="button"
              onClick={togglePlay}
              aria-label="Bật tắt nhạc đĩa than"
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-rose-100 hover:bg-white active:scale-95 transition-all text-left"
            >
              <div className="relative flex items-center justify-center">
                {/* Đĩa than quay tròn */}
                <div
                  className={`w-8 h-8 rounded-full bg-[#1c1c1e] flex items-center justify-center shadow-md ${
                    isPlaying ? "animate-spin-vinyl" : ""
                  }`}
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-[#da3054] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ffdf9b]" />
                  </div>
                </div>
                {isPlaying && (
                  <span className="absolute -top-1 -right-1 text-rose text-xs animate-bounce-soft">
                    ♫
                  </span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-ink truncate max-w-[120px]">
                  {c.musicTitle || "Until I Found You"}
                </span>
                <span className="text-[9px] text-rose font-semibold tracking-tight">
                  {isPlaying ? "Đang phát du dương" : "Chạm để bật nhạc"}
                </span>
              </div>
            </button>

            {/* Nút xem lại phong bì sáp */}
            {c.envelope && (
              <button
                type="button"
                onClick={() => setIsOpened(false)}
                className="text-[11px] font-medium text-muted hover:text-rose px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-rose-100 active:scale-95 transition-all"
              >
                ✉ Đóng phong bì
              </button>
            )}
          </div>

          <div className="px-5 flex flex-col gap-6 mt-2">
            {/* 1. KHUNG ẢNH POLAROID NGHỆ THUẬT VỚI WASHI TAPE */}
            <div className="relative flex justify-center pt-3">
              {/* Băng dính Washi Tape màu champagne mờ */}
              <div className="absolute top-1 z-20 w-32 h-6 washi-tape-decor -rotate-2 rounded-xs flex items-center justify-center opacity-90 pointer-events-none">
                <span className="text-[9px] font-bold text-amber-900/60 uppercase tracking-widest">
                  SWEET MEMORY
                </span>
              </div>

              {/* Khung ảnh Polaroid */}
              <div
                className="w-full max-w-[310px] bg-white p-3 pb-5 rounded-sm shadow-xl -rotate-1 hover:rotate-0 transition-transform duration-300 cursor-pointer group border border-slate-100"
                onClick={() => setIsPhotoZoomed(true)}
              >
                <div className="relative w-full aspect-square overflow-hidden rounded-xs bg-rose-50 shadow-inner">
                  {badImage === photoSrc ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-muted text-xs">
                      <span>♡</span>
                      <span>Ảnh đang lưu giữ trong trái tim</span>
                    </div>
                  ) : (
                    <img
                      src={photoSrc}
                      alt="Ảnh kỷ niệm"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={() => setBadImage(photoSrc)}
                    />
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>🔍</span> Phóng to
                  </div>
                </div>

                <div className="pt-3 text-center">
                  <p className="font-serif-title text-base text-rose font-medium tracking-wide">
                    {c.headline || "Khoảnh khắc ngọt ngào nhất"}
                  </p>
                  <span className="text-[11px] text-muted italic mt-0.5 block">
                    {c.eventDate || "Hà Nội • Mùa yêu thương"}
                  </span>
                </div>
              </div>
            </div>

            {c.eventLocation && <p className="text-center text-sm px-4">{c.eventLocation}</p>}

            {/* 2. LOVE COUNTER: BỘ ĐẾM NGÀY YÊU / KỶ NIỆM (Nếu có) */}
            {c.anniversaryDays > 0 && (
              <div className="flex justify-center">
                <div className="glass-panel px-6 py-2.5 rounded-full shadow-md flex items-center gap-3 border border-rose-200">
                  <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose text-lg animate-heartbeat">
                    ♡
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-serif-title text-2xl font-bold text-rose">
                        {c.anniversaryDays}
                      </span>
                      <span className="text-xs font-bold text-ink uppercase">Ngày</span>
                    </div>
                    <span className="text-[11px] text-muted">
                      Chúng mình đồng hành bên nhau trọn vẹn
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. LÁ THƯ VIẾT TAY CHÂN THÀNH (HANDCRAFTED LETTER) */}
            <div className="relative glass-panel rounded-3xl p-6 shadow-lg border border-rose-100">
              {/* Con dấu hoa/sao ở góc */}
              <div className="absolute -top-3 right-6 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-rose text-sm border border-rose-100">
                {symbols[c.icon]}
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b border-rose-100/60 pb-2">
                  <span className="text-rose text-lg">✎</span>
                  <span className="font-serif-title text-lg text-rose font-medium italic">
                    Gửi {c.recipient},
                  </span>
                </div>

                <div className="text-[15px] text-ink leading-relaxed whitespace-pre-line font-normal">
                  {c.message}
                </div>

                <div className="pt-2 flex flex-col items-end border-t border-rose-100/60">
                  <span className="font-serif-title text-base text-rose font-semibold italic">
                    Thương mến trao bạn,
                  </span>
                  <span className="text-xs text-muted font-medium mt-0.5">
                    {c.sender}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. TƯƠNG TÁC ĐẶC BIỆT: HỘP QUÀ SINH NHẬT 3D HOẶC BAO LÌ XÌ MAY MẮN */}
            {(isBirthday || isTet || c.giftRevealed) && (
              <div className="glass-panel-warm rounded-3xl p-5 shadow-md flex flex-col items-center text-center relative overflow-hidden">
                {/* Mảnh Confetti nổ khi khui quà */}
                {confetti.map((piece) => (
                  <div
                    key={piece.id}
                    className="confetti-piece"
                    style={
                      {
                        background: piece.color,
                        "--x": `${piece.x}px`,
                        "--y": `${piece.y}px`,
                        top: "40%",
                        left: "50%",
                      } as React.CSSProperties
                    }
                  />
                ))}

                <span className="text-[11px] font-bold text-rose uppercase tracking-wider mb-2">
                  {isTet ? "🧧 Lộc Xuân May Mắn" : "🎁 Bất Ngờ Dành Riêng Bạn"}
                </span>

                {!isGiftOpen ? (
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={handleUnwrapGift}
                      className="group cursor-pointer active:scale-95 transition-transform flex flex-col items-center my-2"
                    >
                      <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center text-4xl group-hover:scale-110 transition-transform animate-bounce-soft border border-rose-100">
                        {isTet ? "🧧" : "🎁"}
                      </div>
                      <span className="mt-3 px-4 py-2 rounded-full bg-rose text-white text-xs font-semibold shadow-md group-hover:bg-[#da3054] transition-colors flex items-center gap-1.5">
                        <span>✨</span>
                        {isTet ? "Chạm rút bao lì xì may mắn" : "Chạm nhẹ để khui quà bí mật"}
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="w-full bg-white/95 rounded-2xl p-4 shadow-inner flex flex-col items-center animate-fade-in border border-rose-200 mt-1">
                    <span className="text-3xl mb-1">{isTet ? "🧧 🌸 💰" : "🎉 🥳 🍰"}</span>
                    <p className="font-serif-title text-base font-bold text-rose">
                      {isTet ? "Tada! Lộc Xuân Đại Cát" : "Tada! Món quà từ trái tim"}
                    </p>
                    <p className="text-sm font-semibold text-ink mt-1.5 px-2 leading-relaxed">
                      {c.giftRevealed ||
                        (isTet
                          ? "Kính chúc một năm tràn đầy may mắn, an khang thịnh vượng & vạn sự cát tường!"
                          : "1 Năm hạnh phúc vô điều kiện & 365 ngày rạng rỡ tiếng cười! ♡")}
                    </p>
                    <span className="text-[10px] text-muted mt-2 italic">
                      Đã bật pháo hoa chúc mừng rực rỡ ✨
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 5. CÁC KHỐI SECTIONS KỶ NIỆM BỔ SUNG (NẾU CÓ) */}
            {c.sections && c.sections.length > 0 && (
              <div className="flex flex-col gap-3">
                {c.sections.map((sec) => (
                  <div
                    key={sec.id}
                    className="glass-panel p-4 rounded-2xl border border-rose-50 shadow-sm"
                  >
                    <p className="font-serif-title text-sm font-semibold text-rose">
                      {sec.title}
                    </p>
                    <p className="text-xs text-ink/80 mt-1 leading-relaxed">
                      {sec.text}
                    </p>
                    {sec.imageUrl && (
                      <img
                        src={sec.imageUrl}
                        alt={sec.title}
                        className="w-full h-32 object-cover rounded-lg mt-2"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ========================================================
              THANH CẢM XÚC THẢ NỔI CỐ ĐỊNH (FLOATING REACTION DOCK)
              ======================================================== */}
          <div className="reaction-dock-bar">
            <span className="text-[10px] font-semibold text-rose uppercase tracking-wider pl-1 hidden sm:inline">
              Thả tim:
            </span>
            <button
              type="button"
              onClick={() => spawnReaction("💖")}
              aria-label="Thả tim yêu thương"
              className="reaction-btn"
            >
              💖
            </button>
            <button
              type="button"
              onClick={() => spawnReaction("✨")}
              aria-label="Thả lấp lánh"
              className="reaction-btn"
            >
              ✨
            </button>
            <button
              type="button"
              onClick={() => spawnReaction("🌸")}
              aria-label="Thả hoa đào dịu dàng"
              className="reaction-btn"
            >
              🌸
            </button>
            <button
              type="button"
              onClick={() => spawnReaction("🎉")}
              aria-label="Chúc mừng rực rỡ"
              className="reaction-btn"
            >
              🎉
            </button>
          </div>
        </article>
      )}
    </div>
  );
}
