"use client";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-3">
        Welcome to GiftList
      </h1>
      <p className="text-lg text-gray-500 mb-12">
        Your personal gift concierge
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl">
        {/* Wisher card */}
        <a
          href="/wisher"
          className="group bg-white rounded-2xl shadow-md hover:shadow-lg border border-gray-100 p-8 transition flex flex-col items-center gap-4 cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-3xl group-hover:bg-indigo-200 transition">
            <span role="img" aria-label="star">
              &#10024;
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              I&apos;m wishing
            </h2>
            <p className="text-sm text-gray-500">
              Build your perfect wish list with AI-powered suggestions
            </p>
          </div>
        </a>

        {/* Gifter card — coming soon */}
        <div className="relative bg-white rounded-2xl shadow-md border border-gray-100 p-8 flex flex-col items-center gap-4 opacity-60 cursor-not-allowed">
          <span className="absolute top-3 right-3 bg-gray-200 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full">
            Coming soon
          </span>
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl">
            <span role="img" aria-label="gift">
              &#127873;
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              I&apos;m gifting
            </h2>
            <p className="text-sm text-gray-500">
              Find the perfect gift for someone special
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
