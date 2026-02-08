import { NextRequest, NextResponse } from "next/server";
import { getListByShareId, getItemsByListId } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await params;
  const list = getListByShareId(shareId);
  if (!list) {
    return NextResponse.json({ error: "List not found" }, { status: 404 });
  }
  const items = getItemsByListId(list.id);
  return NextResponse.json({ list, items });
}
