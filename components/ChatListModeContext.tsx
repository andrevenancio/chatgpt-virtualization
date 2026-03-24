"use client";

import { createContext, useContext } from "react";

/** `virtualized` = outer list already virtualizes rows — skip inner lazy markdown to avoid flashes. */
export type ChatListMode = "virtualized" | "static";

export const ChatListModeContext = createContext<ChatListMode>("static");

export function useChatListMode() {
  return useContext(ChatListModeContext);
}
