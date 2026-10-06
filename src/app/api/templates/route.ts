import { db } from "@/lib/db";
import { guarded, json } from "@/lib/http";
export const dynamic = "force-dynamic";
export async function GET() {
  return guarded(async () =>
    json({ templates: await db.template.findMany({ orderBy: { id: "asc" } }) }),
  );
}
