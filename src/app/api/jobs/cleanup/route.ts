import { timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";
import { guarded, json } from "@/lib/http";
import { AppError, cleanup } from "@/lib/service";
export async function POST(req: NextRequest) {
  return guarded(async () => {
    const secret = process.env.CRON_SECRET ?? "";
    const got = Buffer.from(req.headers.get("authorization") ?? "");
    const expected = Buffer.from(`Bearer ${secret}`);
    if (
      secret.length < 32 ||
      got.length !== expected.length ||
      !timingSafeEqual(got, expected)
    )
      throw new AppError("UNAUTHORIZED", 401, "Không có quyền chạy tác vụ.");
    return json(await cleanup());
  });
}
