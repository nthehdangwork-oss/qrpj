import { randomBytes } from "node:crypto";
import sharp from "sharp";
import { NextRequest } from "next/server";
import { guarded, json, origin, session } from "@/lib/http";
import { AppError, serial } from "@/lib/service";
export const runtime = "nodejs";
const LIMIT = 15 * 1024 * 1024;
export async function POST(req: NextRequest) {
  return guarded(async () => {
    origin(req);
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(
        req.headers.get("content-type") ?? "",
      )
    )
      throw new AppError(
        "IMAGE_TYPE",
        415,
        "Chọn ảnh JPEG, PNG hoặc WebP. Với ảnh HEIC, hãy xuất thành JPEG trước.",
      );
    if (Number(req.headers.get("content-length") ?? 0) > LIMIT)
      throw new AppError("IMAGE_TOO_LARGE", 413, "Ảnh tối đa 15 MB.");
    const reader = req.body?.getReader();
    if (!reader) throw new AppError("IMAGE_INVALID", 422, "Chưa có ảnh.");
    let size = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > LIMIT) {
        await reader.cancel();
        throw new AppError("IMAGE_TOO_LARGE", 413, "Ảnh tối đa 15 MB.");
      }
      chunks.push(value);
    }
    let data: Buffer;
    try {
      const image = sharp(Buffer.concat(chunks), {
        limitInputPixels: 40_000_000,
      });
      const meta = await image.metadata();
      if (
        !["jpeg", "png", "webp"].includes(meta.format ?? "") ||
        (meta.pages ?? 1) > 1
      )
        throw Error("Unsupported");
      data = await image
        .rotate()
        .resize({
          width: 2000,
          height: 2000,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 82 })
        .toBuffer();
    } catch {
      throw new AppError(
        "IMAGE_INVALID",
        422,
        "Không đọc được ảnh. Chọn ảnh JPEG, PNG hoặc WebP tĩnh, tối đa 40 megapixel.",
      );
    }
    const s = session(req);
    const id = randomBytes(24).toString("hex");
    await serial(async (tx) => {
      const count = await tx.asset.count({
        where: {
          ownerHash: s.ownerHash,
          createdAt: { gt: new Date(Date.now() - 86400000) },
        },
      });
      if (count >= 30)
        throw new AppError(
          "UPLOAD_LIMIT",
          429,
          "Bạn đã tải 30 ảnh trong 24 giờ. Vui lòng thử lại sau.",
        );
      await tx.asset.create({
        data: { id, ownerHash: s.ownerHash, data: new Uint8Array(data) },
      });
    });
    const res = json({ url: `/api/media/${id}` }, 201);
    res.cookies.set("gt_session", s.token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 90 * 86400,
    });
    return res;
  });
}
