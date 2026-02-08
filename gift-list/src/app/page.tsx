"use client";

import { useEffect, useState } from "react";

interface GiftList {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  share_id: string;
  created_at: string;
}

export default function Home() {
  const [lists, setLists] = useState<GiftList[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLists();
  }, []);

  async function fetchLists() {
    const res = await fetch("/api/lists");
    const data = await res.json();
    setLists(data);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, eventDate }),
    });
    if (res.ok) {
      setTitle("");
      setDescription("");
      setEventDate("");
      setShowForm(false);
      fetchLists();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this list and all its items?")) return;
    await fetch(`/api/lists/${id}`, { method: "DELETE" });
    fetchLists();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Gift Lists</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition cursor-pointer"
        >
          {showForm ? "Cancel" : "+ New List"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-lg shadow p-6 mb-8 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              List Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Anniversary Party Wish List"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's the occasion?"
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Date
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition cursor-pointer"
          >
            Create List
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : lists.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg mb-2">No gift lists yet</p>
          <p className="text-gray-400">
            Create your first wish list to get started!
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {lists.map((list) => (
            <div
              key={list.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <a
                    href={`/list/${list.id}`}
                    className="text-xl font-semibold text-indigo-600 hover:underline"
                  >
                    {list.title}
                  </a>
                  {list.description && (
                    <p className="text-gray-600 mt-1">{list.description}</p>
                  )}
                  {list.event_date && (
                    <p className="text-sm text-gray-400 mt-2">
                      Event: {new Date(list.event_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(list.id)}
                  className="text-red-400 hover:text-red-600 text-sm cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
