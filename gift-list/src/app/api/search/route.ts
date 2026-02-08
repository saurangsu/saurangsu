import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/search";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { query } = body;

  if (!query || typeof query !== "string") {
    return NextResponse.json(
      { error: "Search query is required" },
      { status: 400 }
    );
  }

  try {
    const suggestions = await searchProducts(query);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search for products" },
      { status: 500 }
    );
  }
}
