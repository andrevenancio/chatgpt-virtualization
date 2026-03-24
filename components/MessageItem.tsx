"use client";

import { Message } from "@/lib/types";
import ChatMarkdown from "./ChatMarkdown";
import { LAZY_MIN_TOTAL } from "./LazyChunkedMarkdown";

interface MessageItemProps {
  message: Message;
  isStreaming?: boolean;
}

// ── Icons ────────────────────────────────────────────────────────────────────

function IconCopy() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconThumbUp() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

function IconThumbDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
      <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-6.5" />
    </svg>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export default function MessageItem({ message, isStreaming }: MessageItemProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="py-2 px-4">
        <div className="max-w-chat mx-auto flex justify-end">
          <div className="max-w-[85%] bg-gpt-surface rounded-3xl px-5 py-3 text-sm leading-relaxed text-white">
            <ChatMarkdown
              content={message.content}
              messageId={message.id}
              lazyChunks={message.content.length >= LAZY_MIN_TOTAL}
            />
          </div>
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="py-3 px-4 group">
      <div className="max-w-chat mx-auto">
        {/* Content (no assistant avatar / “ChatGPT” label row) */}
        <div
          className={`text-sm leading-relaxed text-white/90 ${
            isStreaming ? "cursor-blink" : ""
          }`}
        >
          <ChatMarkdown
            content={message.content}
            messageId={message.id}
            lazyChunks={!isStreaming}
          />
        </div>

        {/* Action buttons — appear on hover */}
        {!isStreaming && (
          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              title="Copy"
              onClick={() => navigator.clipboard.writeText(message.content)}
            >
              <IconCopy />
            </button>
            <button
              className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              title="Good response"
            >
              <IconThumbUp />
            </button>
            <button
              className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              title="Bad response"
            >
              <IconThumbDown />
            </button>
            <button
              className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              title="Regenerate"
            >
              <IconRefresh />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
