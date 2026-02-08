"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";

interface GiftList {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  share_id: string;
}

interface GiftItem {
  id: string;
  list_id: string;
  name: string;
  retail_url: string | null;
  price: number | null;
  notes: string | null;
  is_claimed: number;
  quality_analysis: string | null;
}

interface ProductSuggestion {
  name: string;
  estimatedPrice: number;
  retailer: string;
  retailUrl: string;
  description: string;
}

export default function ListDetail() {
  const { id } = useParams<{ id: string }>();
  const [list, setList] = useState<GiftList | null>(null);
  const [items, setItems] = useState<GiftItem[]>([]);
  const [name, setName] = useState("");
  const [retailUrl, setRetailUrl] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [expandedAnalysis, setExpandedAnalysis] = useState<string | null>(null);

  const [addMode, setAddMode] = useState<"search" | "manual">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [searchError, setSearchError] = useState("");

  const fetchItems = useCallback(async () => {
    const res = await fetch(`/api/lists/${id}/items`);
    const data = await res.json();
    setItems(data);
  }, [id]);

  useEffect(() => {
    async function load() {
      const [listRes] = await Promise.all([
        fetch(`/api/lists/${id}`),
      ]);
      const listData = await listRes.json();
      setList(listData);
      fetchItems();
    }
    load();
  }, [id, fetchItems]);

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/lists/${id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        retailUrl: retailUrl || undefined,
        price: price ? parseFloat(price) : undefined,
        notes: notes || undefined,
      }),
    });
    if (res.ok) {
      setName("");
      setRetailUrl("");
      setPrice("");
      setNotes("");
      fetchItems();
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError("");
    setSuggestions([]);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery.trim() }),
      });
      if (!res.ok) {
        setSearchError("Search failed. Please try again.");
        return;
      }
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch {
      setSearchError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  async function handleSelectSuggestion(suggestion: ProductSuggestion) {
    const res = await fetch(`/api/lists/${id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: suggestion.name,
        retailUrl: suggestion.retailUrl,
        price: suggestion.estimatedPrice,
        notes: `${suggestion.description} (via ${suggestion.retailer})`,
      }),
    });
    if (res.ok) {
      setSuggestions([]);
      setSearchQuery("");
      fetchItems();
    }
  }

  async function handleAnalyze(itemId: string) {
    setAnalyzing(itemId);
    try {
      const res = await fetch(`/api/lists/${id}/items/${itemId}/analyze`, {
        method: "POST",
      });
      if (res.ok) {
        fetchItems();
        setExpandedAnalysis(itemId);
      }
    } finally {
      setAnalyzing(null);
    }
  }

  async function handleDeleteItem(itemId: string) {
    await fetch(`/api/lists/${id}/items/${itemId}`, { method: "DELETE" });
    fetchItems();
  }

  function handleShare() {
    if (!list) return;
    const url = `${window.location.origin}/shared/${list.share_id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!list) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <div className="mb-2">
        <a href="/" className="text-indigo-600 hover:underline text-sm">
          &larr; Back to all lists
        </a>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{list.title}</h1>
          {list.description && (
            <p className="text-gray-600 mt-1">{list.description}</p>
          )}
          {list.event_date && (
            <p className="text-sm text-gray-400 mt-1">
              Event: {new Date(list.event_date).toLocaleDateString()}
            </p>
          )}
        </div>
        <button
          onClick={handleShare}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm cursor-pointer"
        >
          {copied ? "Link Copied!" : "Share List"}
        </button>
      </div>

      {/* Add item section with tabs */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="flex border-b">
          <button
            onClick={() => setAddMode("search")}
            className={`px-6 py-3 text-sm font-medium transition cursor-pointer ${
              addMode === "search"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Search Products
          </button>
          <button
            onClick={() => setAddMode("manual")}
            className={`px-6 py-3 text-sm font-medium transition cursor-pointer ${
              addMode === "manual"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Manual Entry
          </button>
        </div>

        <div className="p-6">
          {addMode === "search" ? (
            <div>
              <form onSubmit={handleSearch} className="flex gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a product (e.g. lip gloss, wireless earbuds)..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={searching || !searchQuery.trim()}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer"
                >
                  {searching ? "Searching..." : "Search"}
                </button>
              </form>

              {searchError && (
                <p className="text-red-500 text-sm mt-3">{searchError}</p>
              )}

              {suggestions.length > 0 && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-gray-500">
                    Click a product to add it to your list:
                  </p>
                  {suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full text-left bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-lg p-4 transition cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {suggestion.name}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {suggestion.description}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {suggestion.retailer}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-indigo-600 ml-4 whitespace-nowrap">
                          ~${suggestion.estimatedPrice.toFixed(2)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleAddItem}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dyson V15 Vacuum"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Retail Link
                  </label>
                  <input
                    type="url"
                    value={retailUrl}
                    onChange={(e) => setRetailUrl(e.target.value)}
                    placeholder="https://amazon.com/..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="49.99"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Color, size, any preferences..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition cursor-pointer"
              >
                Add Item
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Items list */}
      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No items yet. Add your first gift wish above!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-lg shadow p-5 ${
                item.is_claimed ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3
                      className={`text-lg font-semibold ${
                        item.is_claimed ? "line-through text-gray-400" : ""
                      }`}
                    >
                      {item.name}
                    </h3>
                    {item.price && (
                      <span className="text-sm bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                        ${item.price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {item.retail_url && (
                    <a
                      href={item.retail_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-500 hover:underline mt-1 inline-block"
                    >
                      View product &rarr;
                    </a>
                  )}

                  {item.notes && (
                    <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleAnalyze(item.id)}
                    disabled={analyzing === item.id}
                    className="text-sm bg-amber-100 text-amber-800 px-3 py-1 rounded hover:bg-amber-200 transition disabled:opacity-50 cursor-pointer"
                  >
                    {analyzing === item.id
                      ? "Analyzing..."
                      : item.quality_analysis
                      ? "Re-analyze"
                      : "AI Quality Check"}
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-red-400 hover:text-red-600 text-sm cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Quality analysis section */}
              {item.quality_analysis && (
                <div className="mt-3">
                  <button
                    onClick={() =>
                      setExpandedAnalysis(
                        expandedAnalysis === item.id ? null : item.id
                      )
                    }
                    className="text-sm text-amber-700 hover:underline cursor-pointer"
                  >
                    {expandedAnalysis === item.id
                      ? "Hide quality analysis"
                      : "Show quality analysis"}
                  </button>
                  {expandedAnalysis === item.id && (
                    <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm prose prose-sm max-w-none">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: formatAnalysis(item.quality_analysis),
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatAnalysis(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");
}
