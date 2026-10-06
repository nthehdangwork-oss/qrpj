import Link from "next/link";
import Greeting from "@/components/Greeting";
import { pageTitles } from "@/lib/page-titles";
import { contentSchema } from "@/lib/rules";
export default function Home() {
  return (
    <>
      <section className="hero">
        <div>
          <span className="eyebrow">
            Những điều nhỏ bé · Những tình cảm lớn lao
          </span>
          <h1>
            Có lời thương,
            <br />
            hãy <em style={{ color: "var(--rose)" }}>gửi đi.</em>
          </h1>
          <p className="muted">
            Biến lời chúc thành một tấm thiệp mang dấu ấn của riêng bạn. Một
            đường link nhỏ, một niềm vui thật lớn.
          </p>
          <div className="row" style={{ marginTop: 28 }}>
            <Link className="btn" href="/templates">
              Tạo thiệp của bạn ↗
            </Link>
            <Link className="btn secondary" href="/shop">
              Khám phá thêm
            </Link>
          </div>
          <p className="small muted">
            18 mẫu chọn sẵn · Từ 19.000đ · Không cần tài khoản
          </p>
        </div>
        <div className="hero-art">
          <Greeting
            defaultOpen={true}
            content={contentSchema.parse({
              pageTitle: pageTitles.card,
              recipient: "Gửi người thương,",
              sender: "Một người luôn nhớ bạn",
              message:
                "Cảm ơn vì đã làm những ngày bình thường\ntrở nên thật đặc biệt.",
              background: "#fff8f7",
              icon: "heart",
              animation: "float",
              imageUrl: "",
              musicUrl: "",
              envelope: true,
              sealText: "FOREVER",
              musicTitle: "Until I Found You",
              anniversaryDays: 520,
              giftRevealed: "100 Cái ôm ấm áp & tình yêu thương bất tận! ♡",
            })}
          />
        </div>
      </section>
      <section className="section">
        <span className="eyebrow">Dễ như gửi một lời chúc</span>
        <h2>Ba bước, một niềm vui.</h2>
        <div className="grid steps">
          <article className="panel">
            <h3>Chọn điều bạn thích</h3>
            <p className="muted">Một mẫu thiệp hợp với người bạn muốn gửi.</p>
          </article>
          <article className="panel">
            <h3>Thêm nét riêng của bạn</h3>
            <p className="muted">
              Lời chúc, màu sắc, kỷ niệm và chút chuyển động.
            </p>
          </article>
          <article className="panel">
            <h3>Gửi thương đi thôi</h3>
            <p className="muted">
              Chọn 2–5 ngày, thanh toán và nhận QR cùng link.
            </p>
          </article>
        </div>
      </section>
      <section className="section" id="contact">
        <div className="panel">
          <span className="eyebrow">Muốn một điều thật riêng?</span>
          <h2>Kể chúng mình nghe.</h2>
          <p className="muted">
            Khám phá thiệp thiết kế riêng và liên hệ qua Zalo hoặc Facebook.
          </p>
          <Link href="/shop" className="btn secondary">
            Xem dịch vụ thiết kế riêng ↗
          </Link>
        </div>
      </section>
    </>
  );
}
