import Link from "next/link";
export default function SiteLayout({children}:{children:React.ReactNode}) { return <>
        <header className="wrap">
          <nav className="nav">
            <Link className="brand" href="/">
              gửi thương<span> ✳</span>
            </Link>
            <div className="navlinks">
              <Link href="/shop">Gian hàng</Link>
              <Link href="/templates">Chọn mẫu</Link>
              <Link className="optional" href="/#contact">
                Liên hệ
              </Link>
            </div>
          </nav>
        </header>
        <main className="wrap">{children}</main>
        <footer className="wrap">
          <div className="footer row">
            <span>© Gửi thương · Làm bằng một chút yêu thương.</span>
            <span>Bản trải nghiệm · Thanh toán mô phỏng</span>
          </div>
        </footer>
</>; }
