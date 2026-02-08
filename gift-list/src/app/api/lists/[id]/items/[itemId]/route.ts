import { NextRequest, NextResponse } from "next/server";
import { deleteItem, claimItem, unclaimItem, getItemById } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { itemId } = await params;
  deleteItem(itemId);
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { itemId } = await params;
  const body = await req.json();

  if (body.is_claimed === true) {
    claimItem(itemId);
  } else if (body.is_claimed === false) {
    unclaimItem(itemId);
  }

  const updated = getItemById(itemId);
  return NextResponse.json(updated);
}
