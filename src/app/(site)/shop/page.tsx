import Shop from "@/components/Shop";
import { pageMetadata } from "@/lib/page-titles";
export const metadata = pageMetadata("shop");
export const dynamic = "force-dynamic";
const safe = (s: string | undefined) => {
  try {
    return s && new URL(s).protocol === "https:" ? s : null;
  } catch {
    return null;
  }
};
export default function Page() {
  return (
    <Shop
      zalo={safe(process.env.ZALO_URL)}
      facebook={safe(process.env.FACEBOOK_URL)}
    />
  );
}
