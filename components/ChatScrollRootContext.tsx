"use client";

import { createContext, useContext } from "react";

/** Scroll container for chat (IntersectionObserver root). */
export const ChatScrollRootContext = createContext<HTMLElement | null>(null);

export function useChatScrollRoot() {
  return useContext(ChatScrollRootContext);
}
