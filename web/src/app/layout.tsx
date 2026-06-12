import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mystery Game Night",
  description: "AI-powered interactive mystery experiences for groups gathering in person.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <header className="border-b border-line">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-display text-xl text-brass-bright tracking-wide">
              🕯 Mystery Game Night
            </Link>
            <nav className="flex gap-4 text-sm text-faded">
              <Link href="/host/new" className="hover:text-brass-bright">Host a mystery</Link>
              <Link href="/" className="hover:text-brass-bright">My events</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 py-8 text-xs text-faded/70">
          Prototype build — the full platform architecture lives in <code>docs/</code>.
        </footer>
      </body>
    </html>
  );
}
