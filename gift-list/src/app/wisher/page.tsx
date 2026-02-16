"use client";

import { useState } from "react";

interface TrendingSuggestion {
  name: string;
  estimatedPrice: number;
  retailer: string;
  retailUrl: string;
  description: string;
  whyTrending: string;
  emoji: string;
}

interface WishItem {
  id: string;
  name: string;
  price: number | null;
  retailUrl: string | null;
  notes: string | null;
  source: "ai" | "personal";
}

export default function WisherPage() {
  // Phase 1 — Concierge intake
  const [occasion, setOccasion] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Phase 2 — List builder
  const [suggestions, setSuggestions] = useState<TrendingSuggestion[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [wishItems, setWishItems] = useState<WishItem[]>([]);
  const [phase, setPhase] = useState<1 | 2>(1);

  // Manual entry form
  const [manualName, setManualName] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [manualNotes, setManualNotes] = useState("");

  // List creation
  const [listTitle, setListTitle] = useState("");
  const [creating, setCreating] = useState(false);

  async function handleGetSuggestions(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occasion, context: context || undefined }),
      });

      if (!res.ok) throw new Error("Failed to get suggestions");

      const data = await res.json();
      setSuggestions(data.suggestions || []);
      setListTitle(`${occasion} Wish List`);
      setPhase(2);
    } catch {
      setError("Something went wrong getting suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function toggleSuggestion(index: number) {
    const next = new Set(selectedIds);
    if (next.has(index)) {
      next.delete(index);
      setWishItems((prev) =>
        prev.filter(
          (item) =>
            !(item.source === "ai" && item.name === suggestions[index].name)
        )
      );
    } else {
      next.add(index);
      const s = suggestions[index];
      setWishItems((prev) => [
        ...prev,
        {
          id: `ai-${index}`,
          name: s.name,
          price: s.estimatedPrice,
          retailUrl: s.retailUrl,
          notes: s.description,
          source: "ai",
        },
      ]);
    }
    setSelectedIds(next);
  }

  function handleAddManual(e: React.FormEvent) {
    e.preventDefault();
    if (!manualName.trim()) return;

    setWishItems((prev) => [
      ...prev,
      {
        id: `manual-${Date.now()}`,
        name: manualName.trim(),
        price: manualPrice ? parseFloat(manualPrice) : null,
        retailUrl: manualUrl || null,
        notes: manualNotes || null,
        source: "personal",
      },
    ]);

    setManualName("");
    setManualUrl("");
    setManualPrice("");
    setManualNotes("");
  }

  function removeItem(id: string) {
    setWishItems((prev) => prev.filter((item) => item.id !== id));
    if (id.startsWith("ai-")) {
      const index = parseInt(id.replace("ai-", ""));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  }

  async function handleCreateList() {
    if (wishItems.length === 0 || !listTitle.trim()) return;
    setCreating(true);

    try {
      // Create the list
      const listRes = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: listTitle,
          description: `Occasion: ${occasion}${context ? ` — ${context}` : ""}`,
        }),
      });

      if (!listRes.ok) throw new Error("Failed to create list");
      const list = await listRes.json();

      // Add all items
      for (const item of wishItems) {
        await fetch(`/api/lists/${list.id}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: item.name,
            retailUrl: item.retailUrl,
            price: item.price,
            notes: item.notes,
          }),
        });
      }

      // Redirect to the list
      window.location.href = `/list/${list.id}`;
    } catch {
      setError("Failed to create your wish list. Please try again.");
      setCreating(false);
    }
  }

  // Phase 1: Concierge intake
  if (phase === 1) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Let&apos;s find the perfect gifts
          </h1>
          <p className="text-gray-500">
            Tell us about your occasion and we&apos;ll suggest trending items
            you&apos;ll love
          </p>
        </div>

        <form
          onSubmit={handleGetSuggestions}
          className="bg-white rounded-2xl shadow-md p-8 space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What&apos;s the occasion? *
            </label>
            <input
              type="text"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              placeholder='e.g. "30th Birthday", "5th Wedding Anniversary", "Baby Shower"'
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Anything else that helps us personalize?
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Tell us more — age, culture, hobbies, budget, anything that helps us personalize..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !occasion.trim()}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Finding perfect gifts..." : "Get Suggestions"}
          </button>
        </form>
      </div>
    );
  }

  // Phase 2: List builder
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Build your wish list
        </h1>
        <p className="text-gray-500">
          Select from AI suggestions, add your own items, or both
        </p>
      </div>

      {/* Two-column grid: AI Suggestions + Manual Entry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* AI Suggestions Panel */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Trending Suggestions
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Based on &ldquo;{occasion}&rdquo; — tap to add
          </p>

          {suggestions.length === 0 ? (
            <p className="text-gray-400 text-sm">No suggestions found.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 max-h-[600px] overflow-y-auto">
              {suggestions.map((s, i) => {
                const isSelected = selectedIds.has(i);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleSuggestion(i)}
                    className={`relative text-left rounded-xl border-2 transition cursor-pointer overflow-hidden ${
                      isSelected
                        ? "border-indigo-500 ring-2 ring-indigo-200"
                        : "border-gray-100 hover:border-gray-300"
                    }`}
                  >
                    {/* Emoji thumbnail */}
                    <div
                      className={`h-24 flex items-center justify-center text-5xl ${
                        isSelected ? "bg-indigo-50" : "bg-gray-50"
                      }`}
                    >
                      {s.emoji}
                    </div>

                    {/* Card body */}
                    <div className="p-3">
                      <p className="font-medium text-gray-900 text-sm leading-tight line-clamp-2">
                        {s.name}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-semibold text-indigo-600">
                          ${s.estimatedPrice.toFixed(0)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {s.retailer}
                        </span>
                      </div>
                    </div>

                    {/* Selected checkmark */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs shadow">
                        &#10003;
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Manual Entry Panel */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Add Your Own
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Have something specific in mind? Add it here
          </p>

          <form onSubmit={handleAddManual} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item name *
              </label>
              <input
                type="text"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="e.g. Dyson Airwrap"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link (optional)
              </label>
              <input
                type="url"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="https://..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (optional)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={manualPrice}
                onChange={(e) => setManualPrice(e.target.value)}
                placeholder="29.99"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                placeholder="Color preference, size, etc."
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={!manualName.trim()}
              className="w-full bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Add to list
            </button>
          </form>
        </div>
      </div>

      {/* Combined Wish List */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          My Wish List
          {wishItems.length > 0 && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({wishItems.length} item{wishItems.length !== 1 ? "s" : ""})
            </span>
          )}
        </h2>

        {wishItems.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">
            Select suggestions or add your own items above to build your list
          </p>
        ) : (
          <div className="space-y-3">
            {wishItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {item.name}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                        item.source === "ai"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {item.source === "ai" ? "AI pick" : "Personal"}
                    </span>
                  </div>
                  {item.price && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      ${item.price.toFixed(2)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-400 hover:text-red-600 text-sm ml-3 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create List */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              List title
            </label>
            <input
              type="text"
              value={listTitle}
              onChange={(e) => setListTitle(e.target.value)}
              placeholder="My Wish List"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleCreateList}
              disabled={wishItems.length === 0 || !listTitle.trim() || creating}
              className="bg-indigo-600 text-white px-8 py-2 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
            >
              {creating ? "Creating..." : "Create My Wish List"}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm mt-3">{error}</p>
        )}
      </div>
    </div>
  );
}
