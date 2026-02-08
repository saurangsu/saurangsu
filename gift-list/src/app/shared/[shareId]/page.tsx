"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";

interface GiftList {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
}

interface GiftItem {
  id: string;
  name: string;
  retail_url: string | null;
  price: number | null;
  notes: string | null;
  is_claimed: number;
  quality_analysis: string | null;
}

export default function SharedList() {
  const { shareId } = useParams<{ shareId: string }>();
  const [list, setList] = useState<GiftList | null>(null);
  const [items, setItems] = useState<GiftItem[]>([]);
  const [error, setError] = useState(false);
  const [expandedAnalysis, setExpandedAnalysis] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/shared/${shareId}`);
    if (!res.ok) {
      setError(true);
      return;
    }
    const data = await res.json();
    setList(data.list);
    setItems(data.items);
  }, [shareId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleClaim(itemId: string, claim: boolean) {
    await fetch(`/api/lists/${list!.id}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_claimed: claim }),
    });
    fetchData();
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-gray-700">List not found</h1>
        <p className="text-gray-500 mt-2">
          This shared link may be invalid or the list was deleted.
        </p>
      </div>
    );
  }

  if (!list) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <div className="mb-8">
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4 text-sm text-indigo-800">
          You are viewing a shared wish list. You can claim items to let the
          list owner know what you plan to gift.
        </div>
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

      {items.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          No items on this list yet.
        </p>
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
                    {item.is_claimed ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        Claimed
                      </span>
                    ) : null}
                  </div>

                  {item.retail_url && (
                    <a
                      href={item.retail_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-500 hover:underline mt-1 inline-block"
                    >
                      Buy this item &rarr;
                    </a>
                  )}

                  {item.notes && (
                    <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
                  )}
                </div>

                <button
                  onClick={() => handleClaim(item.id, !item.is_claimed)}
                  className={`text-sm px-4 py-1.5 rounded-lg transition cursor-pointer ${
                    item.is_claimed
                      ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {item.is_claimed ? "Unclaim" : "I'll get this!"}
                </button>
              </div>

              {/* Quality analysis (read-only on shared view) */}
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
                      ? "Hide quality info"
                      : "View quality info"}
                  </button>
                  {expandedAnalysis === item.id && (
                    <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: item.quality_analysis
                            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                            .replace(/\n/g, "<br>"),
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
