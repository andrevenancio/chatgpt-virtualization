"use client";

import { useState, useRef, useCallback } from "react";
import Sidebar from "./Sidebar";
import MessageList from "./MessageList";
import NonVirtualizedMessageList from "./NonVirtualizedMessageList";
import ChatInput from "./ChatInput";
import { Message } from "@/lib/types";
import { seededConversation } from "@/lib/seedConversation";
import { EllipsisIcon, ShareIcon } from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ── Icons ────────────────────────────────────────────────────────────────────

function IconChevronDown() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-white/45"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface ChatInterfaceProps {
  useVirtualization?: boolean;
}

export default function ChatInterface({
  useVirtualization = true,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(seededConversation);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  // AbortController so the user can stop generation mid-stream
  const abortRef = useRef<AbortController | null>(null);

  // ── Send message ────────────────────────────────────────────────────────

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: Message = {
      id: uid(),
      role: "user",
      content: text,
      createdAt: Date.now(),
    };

    // Optimistically add the user message and a blank assistant placeholder
    const assistantId = uid();
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // Build the messages array for the API (exclude the empty placeholder)
      const apiMessages = [...messages, userMsg].map(({ role, content }) => ({
        role,
        content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`);
      }

      // ── Parse the OpenAI SSE stream ──────────────────────────────────
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === "data: [DONE]") continue;
          if (!trimmed.startsWith("data: ")) continue;

          try {
            const json = JSON.parse(trimmed.slice(6));
            const delta = json.choices?.[0]?.delta?.content;
            if (typeof delta === "string") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + delta }
                    : m,
                ),
              );
            }
          } catch {
            // Ignore malformed chunks
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        // Surface error in the assistant message
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content:
                    "Sorry, something went wrong. Please check your API key or try again.",
                }
              : m,
          ),
        );
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [input, isStreaming, messages]);

  // ── Stop generation ──────────────────────────────────────────────────────

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-gpt-bg overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar — layout aligned with chatgpt.com thread header */}
        <header
          id="page-header"
          className="sticky top-0 z-20 flex h-header shrink-0 items-center justify-between gap-2 border-b border-white/[0.06] bg-gpt-bg p-2 shadow-[0_1px_0_rgba(0,0,0,0.12)]"
        >
          {/* Center column hook (lg+), matches production shell */}
          <div
            className="pointer-events-none absolute start-0 top-0 flex h-header flex-col items-center justify-center gap-2 lg:start-1/2 lg:-translate-x-1/2 rtl:translate-x-1/2"
            aria-hidden
          />

          <div className="flex min-w-0 flex-1 items-center gap-0.5">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded="false"
              aria-label={`Model selector, current model is ${useVirtualization ? "Virtualized view" : "Standard view"}`}
              className="group flex min-h-9 cursor-pointer items-center justify-center gap-1 rounded-lg px-2.5 text-lg font-normal text-white transition-colors hover:bg-gpt-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25"
            >
              <span>ChatGPT</span>
              <IconChevronDown />
            </button>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2 overflow-x-hidden">
            <div
              className="flex items-center gap-2"
              id="conversation-header-actions"
            >
              <button
                type="button"
                className="relative inline-flex max-sm:hidden items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-normal text-white transition-colors hover:bg-gpt-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25"
                aria-label="Share"
              >
                <span className="-ms-0.5 flex shrink-0">
                  <ShareIcon className="size-4" />
                </span>
                Share
              </button>
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white transition-colors hover:bg-gpt-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25"
                aria-label="Open conversation options"
              >
                <EllipsisIcon className="size-4" />
              </button>
            </div>
          </div>
        </header>

        {/*
         * ── Message list (virtualized) ──────────────────────────────────
         * flex-1 + min-h-0 ensures the list can shrink and scroll properly
         * inside a flex column parent.
         */}
        <div className="flex flex-col flex-1 min-h-0">
          {useVirtualization ? (
            <MessageList messages={messages} isStreaming={isStreaming} />
          ) : (
            <NonVirtualizedMessageList
              messages={messages}
              isStreaming={isStreaming}
            />
          )}
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={sendMessage}
            onStop={stopGeneration}
            isStreaming={isStreaming}
          />
        </div>
      </main>
    </div>
  );
}
