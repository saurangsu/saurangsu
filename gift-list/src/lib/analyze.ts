import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function analyzeProductQuality(
  productName: string,
  retailUrl?: string | null
): Promise<string> {
  const urlContext = retailUrl
    ? `\nRetail link: ${retailUrl}`
    : "";

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are a product quality analyst. Analyze the following gift item and provide a concise quality assessment.

Product: ${productName}${urlContext}

Provide your analysis in this format:
1. **Overall Quality Rating**: (Excellent / Good / Average / Below Average / Unknown)
2. **Materials & Ingredients**: Brief assessment of likely materials or ingredients used, their quality, and any concerns (toxic substances, cheap substitutes, etc.)
3. **Value Assessment**: Whether this seems like a good gift based on typical quality for this product category.
4. **Tips**: One quick tip for the buyer (what to look for, what to avoid).

Keep the total response under 200 words. Be helpful and practical.`,
      },
    ],
  });

  const block = message.content[0];
  if (block.type === "text") {
    return block.text;
  }
  return "Analysis could not be completed.";
}
