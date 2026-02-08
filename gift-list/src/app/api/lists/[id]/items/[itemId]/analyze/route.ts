import { NextRequest, NextResponse } from "next/server";
import { getItemById, updateItemAnalysis } from "@/lib/db";
import { analyzeProductQuality } from "@/lib/analyze";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { itemId } = await params;
  const item = getItemById(itemId);
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  try {
    const analysis = await analyzeProductQuality(item.name, item.retail_url);
    updateItemAnalysis(itemId, analysis);
    return NextResponse.json({ analysis });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
