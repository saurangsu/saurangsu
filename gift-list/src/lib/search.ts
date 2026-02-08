import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export interface ProductSuggestion {
  name: string;
  estimatedPrice: number;
  retailer: string;
  retailUrl: string;
  description: string;
}

export async function searchProducts(
  query: string
): Promise<ProductSuggestion[]> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are a product search assistant. Given a search query, suggest 5 real products that match.

Search query: "${query}"

Respond with ONLY a JSON array (no markdown, no code fences) of 5 objects with these exact fields:
- "name": full product name
- "estimatedPrice": estimated price as a number (no dollar sign)
- "retailer": retailer name (e.g. "Amazon", "Target", "Sephora")
- "retailUrl": a search URL for the product on that retailer (e.g. "https://www.amazon.com/s?k=product+name" or "https://www.target.com/s?searchTerm=product+name")
- "description": one-sentence description of the product

Example format:
[{"name":"Product Name","estimatedPrice":29.99,"retailer":"Amazon","retailUrl":"https://www.amazon.com/s?k=product+name","description":"A great product."}]`,
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
      (item: unknown): item is ProductSuggestion =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as ProductSuggestion).name === "string" &&
        typeof (item as ProductSuggestion).estimatedPrice === "number" &&
        typeof (item as ProductSuggestion).retailer === "string" &&
        typeof (item as ProductSuggestion).retailUrl === "string" &&
        typeof (item as ProductSuggestion).description === "string"
    );
  } catch {
    return [];
  }
}
