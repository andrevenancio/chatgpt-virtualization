"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { Message } from "@/lib/types";
import MessageItem from "./MessageItem";
import { ChatListModeContext } from "./ChatListModeContext";
import { ChatScrollRootContext } from "./ChatScrollRootContext";

interface NonVirtualizedMessageListProps {
  messages: Message[];
  isStreaming: boolean;
}

function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-6">
        <svg width="28" height="28" viewBox="0 0 41 41" fill="#000">
          <path d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835 9.964 9.964 0 0 0-6.212-2.71 10.079 10.079 0 0 0-9.49 6.972 9.967 9.967 0 0 0-6.188 4.819 10.079 10.079 0 0 0 1.24 11.817 9.965 9.965 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 6.204 2.71 10.079 10.079 0 0 0 9.49-6.972 9.967 9.967 0 0 0 6.188-4.819 10.079 10.079 0 0 0-1.232-11.818zM22.498 37.886a7.474 7.474 0 0 1-4.799-1.735c.061-.033.168-.091.237-.134l7.964-4.6a1.294 1.294 0 0 0 .655-1.134V19.054l3.366 1.944a.12.12 0 0 1 .066.092v9.299a7.505 7.505 0 0 1-7.49 7.496zM6.392 31.006a7.471 7.471 0 0 1-.894-5.023c.06.036.162.099.237.141l7.964 4.6a1.297 1.297 0 0 0 1.308 0l9.724-5.614v3.888a.12.12 0 0 1-.048.103l-8.051 4.649a7.504 7.504 0 0 1-10.24-2.744zM4.297 13.62A7.469 7.469 0 0 1 8.2 10.333c0 .068-.004.19-.004.274v9.201a1.294 1.294 0 0 0 .654 1.132l9.723 5.614-3.366 1.944a.12.12 0 0 1-.114.012L7.044 23.86a7.504 7.504 0 0 1-2.747-10.24zm27.658 6.437l-9.724-5.615 3.367-1.943a.121.121 0 0 1 .114-.012l8.048 4.648a7.498 7.498 0 0 1-1.158 13.528v-9.476a1.293 1.293 0 0 0-.647-1.13zm3.35-5.043c-.059-.037-.162-.099-.236-.141l-7.965-4.6a1.298 1.298 0 0 0-1.308 0l-9.723 5.614v-3.888a.12.12 0 0 1 .048-.103l8.05-4.645a7.497 7.497 0 0 1 11.135 7.763zm-21.063 6.929l-3.367-1.944a.12.12 0 0 1-.065-.092v-9.299a7.497 7.497 0 0 1 12.293-5.756 6.94 6.94 0 0 0-.236.134l-7.965 4.6a1.294 1.294 0 0 0-.654 1.132l-.006 11.225zm1.829-3.943l4.33-2.501 4.332 2.5v4.999l-4.331 2.5-4.331-2.5V18z" />
        </svg>
      </div>
      <h1 className="text-2xl font-semibold text-white mb-8">
        What can I help with?
      </h1>
    </div>
  );
}

export default function NonVirtualizedMessageList({
  messages,
  isStreaming,
}: NonVirtualizedMessageListProps) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null);
  const isAtBottomRef = useRef(true);

  const setScrollContainer = useCallback((node: HTMLDivElement | null) => {
    parentRef.current = node;
    setScrollRoot(node);
  }, []);

  const scrollToBottom = useCallback((smooth = false) => {
    const el = parentRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  useEffect(() => {
    const el = parentRef.current;
    if (!el) return;
    const handleScroll = () => {
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      isAtBottomRef.current = distFromBottom < 80;
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    scrollToBottom();
    isAtBottomRef.current = true;
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    if (isStreaming && isAtBottomRef.current) {
      scrollToBottom();
    }
  });

  if (messages.length === 0) {
    return <WelcomeScreen />;
  }

  return (
    <div
      ref={setScrollContainer}
      className="flex-1 overflow-y-auto"
      style={{ paddingBottom: "8px" }}
    >
      <ChatListModeContext.Provider value="static">
        <ChatScrollRootContext.Provider value={scrollRoot}>
          {messages.map((message, index) => (
            <MessageItem
              key={message.id}
              message={message}
              isStreaming={isStreaming && index === messages.length - 1}
            />
          ))}
        </ChatScrollRootContext.Provider>
      </ChatListModeContext.Provider>
    </div>
  );
}
