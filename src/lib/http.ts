import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError, appUrl, hash } from "./service";
export const json = (data: unknown, status = 200) =>
  NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
export async function guarded(fn: () => Promise<Response>) {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof AppError)
      return json({ error: { code: e.code, message: e.message } }, e.status);
    if (e instanceof ZodError)
      return json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message:
              "Dữ liệu chưa hợp lệ. Kiểm tra độ dài, đường dẫn và URL HTTPS.",
          },
        },
        422,
      );
    if (e instanceof Prisma.PrismaClientInitializationError)
      return json(
        {
          error: {
            code: "SERVICE_UNAVAILABLE",
            message: "Chưa kết nối được cơ sở dữ liệu. Vui lòng thử lại.",
          },
        },
        503,
      );
    console.error(e instanceof Error ? e.name : "UnhandledError");
    return json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Có lỗi hệ thống. Vui lòng thử lại.",
        },
      },
      500,
    );
  }
}
export function owner(req: NextRequest) {
  const token = req.cookies.get("gt_session")?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token))
    throw new AppError("NOT_FOUND", 404, "Không tìm thấy phiên của bạn.");
  return hash(token);
}
export function session(req: NextRequest) {
  const old = req.cookies.get("gt_session")?.value;
  const token =
    old && /^[a-f0-9]{64}$/.test(old) ? old : randomBytes(32).toString("hex");
  return { token, ownerHash: hash(token) };
}
export function origin(req: NextRequest) {
  if (req.headers.get("origin") !== appUrl())
    throw new AppError("ORIGIN_DENIED", 403, "Nguồn yêu cầu không hợp lệ.");
}
export async function body(req: NextRequest) {
  if (Number(req.headers.get("content-length") ?? 0) > 16384)
    throw new AppError("BODY_TOO_LARGE", 413, "Nội dung quá lớn.");
  const reader = req.body?.getReader();
  let size = 0;
  const chunks: Uint8Array[] = [];
  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 16384) {
        await reader.cancel();
        throw new AppError("BODY_TOO_LARGE", 413, "Nội dung quá lớn.");
      }
      chunks.push(value);
    }
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new AppError("INVALID_JSON", 400, "JSON không hợp lệ.");
  }
}
