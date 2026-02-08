import { NextRequest, NextResponse } from "next/server";
import { createList, getAllLists } from "@/lib/db";

export async function GET() {
  const lists = getAllLists();
  return NextResponse.json(lists);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, eventDate } = body;

  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const list = createList(title, description, eventDate);
  return NextResponse.json(list, { status: 201 });
}
