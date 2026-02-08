import { NextRequest, NextResponse } from "next/server";
import { addItem, getItemsByListId, getListById } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const list = getListById(id);
  if (!list) {
    return NextResponse.json({ error: "List not found" }, { status: 404 });
  }
  const items = getItemsByListId(id);
  return NextResponse.json(items);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const list = getListById(id);
  if (!list) {
    return NextResponse.json({ error: "List not found" }, { status: 404 });
  }

  const body = await req.json();
  const { name, retailUrl, price, notes } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json(
      { error: "Item name is required" },
      { status: 400 }
    );
  }

  const item = addItem(id, name, retailUrl, price, notes);
  return NextResponse.json(item, { status: 201 });
}
