import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gpt-bg text-white flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-gpt-surface p-6">
        <h1 className="text-2xl font-semibold mb-2">Chat UI Demo Modes</h1>
        <p className="text-white/70 text-sm mb-6">
          Compare behavior with and without virtualization on the same initial
          thread (see <code className="text-white/90">lib/seedConversation.data.json</code>
          ).
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/virtualized"
            className="rounded-xl bg-white text-black font-medium px-4 py-3 hover:bg-white/90 transition-colors"
          >
            Open virtualized chat
          </Link>
          <Link
            href="/non-virtualized"
            className="rounded-xl border border-white/20 text-white px-4 py-3 hover:bg-white/10 transition-colors"
          >
            Open non-virtualized chat
          </Link>
        </div>
      </div>
    </main>
  );
}
