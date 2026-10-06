import type { Metadata } from "next";

export const siteName = "Gửi thương";
export const pageTitles = {
  home: `${siteName} — Một tấm thiệp, vạn lời yêu`,
  shop: "Gian hàng",
  templates: "Chọn mẫu thiệp",
  editor: "Viết lời thương",
  preview: "Xem trước",
  payment: "Thanh toán",
  result: "Thiệp của bạn",
  card: "Một lời thương dành cho bạn",
  expired: "Thiệp đã hết hạn",
  notFound: "Không tìm thấy thiệp",
} as const;

export const pageTitleMaxLength = 80;
export const rootMetadata: Metadata = {
  title: { default: pageTitles.home, template: `%s | ${siteName}` },
  description:
    "Tự tạo thiệp cá nhân hoá, gửi lời thương qua đường link và mã QR. 18 mẫu cho những người và dịp đặc biệt.",
};

export function pageMetadata(
  page: keyof typeof pageTitles,
  privatePage = false,
): Metadata {
  return {
    title: pageTitles[page],
    ...(privatePage ? { robots: { index: false, follow: false } } : {}),
  };
}

export function cardMetadata(title: string): Metadata {
  // Preserve the customer's exact title without the site's title template.
  return {
    title: { absolute: title },
    robots: { index: false, follow: false },
  };
}
