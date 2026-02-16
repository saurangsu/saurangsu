import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export interface TrendingSuggestion {
  name: string;
  estimatedPrice: number;
  retailer: string;
  retailUrl: string;
  description: string;
  whyTrending: string;
  emoji: string;
}

export async function suggestTrendingItems(
  occasion: string,
  context?: string
): Promise<TrendingSuggestion[]> {
  const contextLine = context
    ? `\nAdditional context from the wisher: "${context}"`
    : "";

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You are a gift concierge. Given an occasion and optional context, suggest 10 trending and popular gift items that would be perfect.

Occasion: "${occasion}"${contextLine}

Respond with ONLY a JSON array (no markdown, no code fences) of 10 objects with these exact fields:
- "name": full product name (be specific with brand and model)
- "estimatedPrice": estimated price as a number (no dollar sign)
- "retailer": retailer name (e.g. "Amazon", "Target", "Nordstrom", "Sephora")
- "retailUrl": a search URL for the product on that retailer (e.g. "https://www.amazon.com/s?k=product+name")
- "description": one-sentence description of the product
- "whyTrending": one short sentence explaining why this is a great pick for this occasion
- "emoji": a single emoji that best represents this product visually (e.g. "🎧" for headphones, "👜" for a handbag, "☕" for a coffee maker)

Focus on real, popular, well-reviewed products across a range of price points. Mix practical and delightful gifts.

Example format:
[{"name":"Product Name","estimatedPrice":29.99,"retailer":"Amazon","retailUrl":"https://www.amazon.com/s?k=product+name","description":"A great product.","whyTrending":"Perfect for this occasion because...","emoji":"🎁"}]`,
      },
    ],
  });

  const block = message.content[0];
  if (block.type !== "text") {
    return [];
  }

  try {
    const parsed = JSON.parse(block.text);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item: unknown): item is TrendingSuggestion =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as TrendingSuggestion).name === "string" &&
        typeof (item as TrendingSuggestion).estimatedPrice === "number" &&
        typeof (item as TrendingSuggestion).retailer === "string" &&
        typeof (item as TrendingSuggestion).retailUrl === "string" &&
        typeof (item as TrendingSuggestion).description === "string" &&
        typeof (item as TrendingSuggestion).whyTrending === "string" &&
        typeof (item as TrendingSuggestion).emoji === "string"
    );
  } catch {
    return [];
  }
}
