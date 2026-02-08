import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GiftList - Smart Wish Lists",
  description:
    "Create and share gift wish lists with AI-powered product quality insights",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen font-sans">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-indigo-600">
              GiftList
            </a>
            <span className="text-sm text-gray-500">
              Smart wish lists with AI quality insights
            </span>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
