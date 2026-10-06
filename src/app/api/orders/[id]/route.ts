import { NextRequest } from "next/server";
import { guarded, json, owner } from "@/lib/http";
import { ownedOrder, orderView } from "@/lib/service";
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return guarded(async () =>
    json(orderView(await ownedOrder((await params).id, owner(req)))),
  );
}
