import { NextResponse } from "next/server";
import { suggestTrendingItems } from "@/lib/suggest";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { occasion, context } = body;

    if (!occasion || typeof occasion !== "string") {
      return NextResponse.json(
        { error: "Occasion is required" },
        { status: 400 }
      );
    }

    const suggestions = await suggestTrendingItems(occasion, context);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Suggest error:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
