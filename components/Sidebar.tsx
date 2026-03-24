"use client";

import { PanelLeftIcon, SearchIcon, SquarePenIcon } from "lucide-react";
import Link from "next/link";

// ── Mock conversation history ────────────────────────────────────────────────

const MOCK_HISTORY = [
  { id: "1", title: "Why virtualization in React", group: "Today" },
  { id: "2", title: "Tailwind dark mode setup", group: "Today" },
  { id: "3", title: "Next.js App Router patterns", group: "Yesterday" },
  { id: "4", title: "OpenAI streaming API", group: "Yesterday" },
  { id: "5", title: "TypeScript generics explained", group: "Previous 7 days" },
  { id: "6", title: "CSS grid vs flexbox", group: "Previous 7 days" },
  { id: "7", title: "React Server Components", group: "Previous 7 days" },
];

const GROUPS = ["Today", "Yesterday", "Previous 7 days"];

// ── Component ────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const grouped = GROUPS.map((g) => ({
    label: g,
    items: MOCK_HISTORY.filter((h) => h.group === g),
  }));

  return (
    <aside className="flex h-full w-[var(--sidebar-width,260px)] shrink-0 flex-col overflow-hidden bg-gpt-sidebar">
      <div className="flex flex-col h-full w-[260px]">
        {/* Sticky header — home logo only */}
        <div className="sticky top-0 z-30 shrink-0 bg-gpt-sidebar">
          <div className="px-2 pb-1 pt-2">
            <div className="flex h-12 w-full min-w-0 items-center justify-between gap-2">
              <Link
                href="/"
                aria-label="Home"
                className="flex h-9 w-9 shrink-0 items-center justify-center overflow-visible rounded-lg text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 [&_svg]:overflow-visible"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  aria-hidden="true"
                  className="icon-lg"
                >
                  <use
                    href="/sprites-core-lbtco6v1.svg#55180d"
                    fill="currentColor"
                  />
                </svg>
              </Link>
              <button
                type="button"
                aria-label="Toggle panel"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              >
                <PanelLeftIcon className="size-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>

        {/* Primary actions (below header, like ChatGPT) */}
        <div className="flex flex-col gap-0.5 px-2 pb-2">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-white/90 hover:bg-white/10"
          >
            <span className="text-white/80">
              <SquarePenIcon className="size-4" />
            </span>
            <span className="truncate">New chat</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-white/90 hover:bg-white/10"
          >
            <span className="text-white/80">
              <SearchIcon className="size-4" />
            </span>
            <span className="truncate">Search chats</span>
          </button>
        </div>

        {/* History list */}
        <nav
          className="flex-1 overflow-y-auto px-2 pb-3"
          aria-label="Chat history"
        >
          {grouped.map(({ label, items }) =>
            items.length === 0 ? null : (
              <div key={label} className="mb-4">
                <p className="mb-1 px-3 py-1 text-xs font-medium text-white/40">
                  {label}
                </p>
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="w-full truncate rounded-lg px-3 py-2 text-left text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            ),
          )}
        </nav>

        {/* User footer */}
        <div className="shrink-0 border-t border-white/10 px-2 pb-3 pt-3">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/10"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#19c37d] text-sm font-bold text-white">
              A
            </div>
            <span className="truncate text-sm font-medium text-white">
              André
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
