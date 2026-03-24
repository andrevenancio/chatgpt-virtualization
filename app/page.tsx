import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gpt-bg text-white flex items-center justify-center p-6">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/virtualized"
          className="rounded-xl bg-white text-black font-medium px-4 py-3 hover:bg-white/90 transition-colors"
        >
          Virtualized
        </Link>
        <Link
          href="/non-virtualized"
          className="rounded-xl border border-white/20 text-white px-4 py-3 hover:bg-white/10 transition-colors"
        >
          Non-virtualized
        </Link>
      </div>
    </main>
  );
}
