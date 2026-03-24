"use client";

import Markdown from "react-markdown";
import LazyChunkedMarkdown, { LAZY_MIN_TOTAL } from "./LazyChunkedMarkdown";
import { useChatListMode } from "./ChatListModeContext";
import { useChatScrollRoot } from "./ChatScrollRootContext";
import {
  chatMarkdownComponents,
  chatRehypePlugins,
  chatRemarkPlugins,
} from "./chatMarkdownShared";

interface ChatMarkdownProps {
  content: string;
  className?: string;
  /** Used to cache measured chunk heights between scroll passes */
  messageId?: string;
  /** When false, render full markdown (e.g. while streaming) */
  lazyChunks?: boolean;
}

export default function ChatMarkdown({
  content,
  className,
  messageId = "msg",
  lazyChunks = true,
}: ChatMarkdownProps) {
  const scrollRoot = useChatScrollRoot();
  const listMode = useChatListMode();

  // Inner intersection lazy chunks fight the outer virtualizer (placeholder flash).
  // Other demos usually only virtualize at one level — we match that here.
  const useLazy =
    lazyChunks &&
    listMode === "static" &&
    Boolean(scrollRoot) &&
    content.length >= LAZY_MIN_TOTAL;

  if (useLazy) {
    return (
      <LazyChunkedMarkdown
        content={content}
        messageId={messageId}
        scrollRoot={scrollRoot}
        className={className}
      />
    );
  }

  return (
    <div className={className}>
      <Markdown
        remarkPlugins={chatRemarkPlugins}
        rehypePlugins={chatRehypePlugins}
        components={chatMarkdownComponents}
      >
        {content}
      </Markdown>
    </div>
  );
}
