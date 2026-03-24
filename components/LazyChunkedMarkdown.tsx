"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import Markdown from "react-markdown";
import { useInView } from "react-intersection-observer";
import {
  chatMarkdownComponents,
  chatRehypePlugins,
  chatRemarkPlugins,
} from "./chatMarkdownShared";

const measuredChunkHeights = new Map<string, number>();

const CHUNK_SOFT_MAX = 2600;
const LAZY_MIN_TOTAL = 1600;
const ROOT_MARGIN = "380px 0px 380px 0px";

function estimateChunkHeight(text: string) {
  const lines = text.split("\n").length;
  const fromLines = 72 + lines * 17;
  const fromChars = Math.min(2400, text.length * 0.35);
  return Math.min(3200, Math.max(96, Math.max(fromLines, fromChars)));
}

function splitMarkdownIntoChunks(text: string): string[] {
  const parts = text.split(/\n\n---\n\n/);
  const out: string[] = [];

  for (const part of parts) {
    if (part.length <= CHUNK_SOFT_MAX) {
      out.push(part);
      continue;
    }
    const lines = part.split("\n");
    let buf = "";
    for (const line of lines) {
      const next = buf ? `${buf}\n${line}` : line;
      if (buf.length > 400 && next.length > CHUNK_SOFT_MAX) {
        out.push(buf);
        buf = line;
      } else {
        buf = next;
      }
    }
    if (buf) out.push(buf);
  }

  const merged: string[] = [];
  for (const c of out) {
    const prev = merged[merged.length - 1];
    if (prev !== undefined && c.length < 120 && prev.length + c.length < CHUNK_SOFT_MAX) {
      merged[merged.length - 1] = `${prev}\n\n---\n\n${c}`;
    } else {
      merged.push(c);
    }
  }
  const base = merged.length ? merged : [text];
  const final: string[] = [];
  for (const c of base) {
    if (c.length <= CHUNK_SOFT_MAX) {
      final.push(c);
      continue;
    }
    let start = 0;
    while (start < c.length) {
      let end = Math.min(start + CHUNK_SOFT_MAX, c.length);
      if (end < c.length) {
        const window = c.slice(start, end);
        const nl = window.lastIndexOf("\n");
        if (nl > 240) end = start + nl + 1;
      }
      final.push(c.slice(start, end));
      start = end;
    }
  }
  return final.length ? final : [text];
}

function chunkCacheKey(messageId: string, index: number, content: string) {
  return `${messageId}::${index}::${content.length}::${content.slice(0, 48)}`;
}

function MarkdownChunk({
  messageId,
  chunkIndex,
  content,
  scrollRoot,
}: {
  messageId: string;
  chunkIndex: number;
  content: string;
  scrollRoot: HTMLElement | null;
}) {
  const key = chunkCacheKey(messageId, chunkIndex, content);
  const cached = measuredChunkHeights.get(key) ?? 0;
  const [measured, setMeasured] = useState(cached);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const { ref: inViewRef, inView } = useInView({
    root: scrollRoot,
    rootMargin: ROOT_MARGIN,
    triggerOnce: false,
    threshold: 0,
  });

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node;
      inViewRef(node);
    },
    [inViewRef],
  );

  const placeholderH = measured > 0 ? measured : estimateChunkHeight(content);

  useLayoutEffect(() => {
    if (!inView) return;
    const el = containerRef.current;
    if (!el) return;
    const h = el.getBoundingClientRect().height;
    if (h > 40 && Math.abs(h - measured) > 2) {
      measuredChunkHeights.set(key, h);
      setMeasured(h);
    }
  }, [inView, content, key, measured]);

  return (
    <div ref={setRefs} className="min-w-0">
      {inView ? (
        <Markdown
          remarkPlugins={chatRemarkPlugins}
          rehypePlugins={chatRehypePlugins}
          components={chatMarkdownComponents}
        >
          {content}
        </Markdown>
      ) : (
        <div
          className="rounded-lg border border-white/[0.06] bg-white/[0.02]"
          style={{ minHeight: placeholderH }}
          aria-hidden
        />
      )}
    </div>
  );
}

interface LazyChunkedMarkdownProps {
  content: string;
  messageId: string;
  scrollRoot: HTMLElement | null;
  className?: string;
}

export default function LazyChunkedMarkdown({
  content,
  messageId,
  scrollRoot,
  className,
}: LazyChunkedMarkdownProps) {
  const chunks = useMemo(() => splitMarkdownIntoChunks(content), [content]);

  return (
    <div className={className}>
      {chunks.map((chunk, i) => (
        <MarkdownChunk
          key={`${messageId}-chunk-${i}`}
          messageId={messageId}
          chunkIndex={i}
          content={chunk}
          scrollRoot={scrollRoot}
        />
      ))}
    </div>
  );
}

export { LAZY_MIN_TOTAL };
