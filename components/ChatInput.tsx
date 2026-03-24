"use client";

import {
  ArrowUpIcon as ArrowIcon,
  MicIcon,
  PlusIcon,
  SquareStopIcon as StopIcon,
} from "lucide-react";
import { useRef, useEffect, KeyboardEvent } from "react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ChatInput({
  value,
  onChange,
  onSend,
  onStop,
  isStreaming,
  disabled,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [value]);

  useEffect(() => {
    if (!isStreaming) {
      textareaRef.current?.focus();
    }
  }, [isStreaming]);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && value.trim()) {
        onSend();
      }
    }
  }

  const canSend = value.trim().length > 0 && !isStreaming;
  const hasInput = value.trim().length > 0;

  const circleBtnClass =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-black transition-colors hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="px-4 pb-3 pt-1.5">
      <div className="max-w-chat mx-auto">
        <form
          className="group/composer w-full"
          data-type="unified-composer"
          aria-label="Chat with ChatGPT"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSend) onSend();
          }}
        >
          <div className="hidden">
            <input
              ref={fileInputRef}
              multiple
              tabIndex={-1}
              id="upload-files"
              type="file"
              className="sr-only"
              aria-hidden
            />
          </div>

          <div
            className="
              bg-[#303030] cursor-text overflow-clip rounded-3xl px-2.5 py-1.5
              shadow-composer
              grid grid-cols-[auto_1fr_auto] items-center gap-x-2 gap-y-0
              motion-safe:transition-colors motion-safe:duration-200 motion-safe:ease-in-out
              contain-inline-size
            "
            data-composer-surface="true"
          >
            {/* Leading: add / attach */}
            <div className="col-start-1 row-start-1 flex items-center pl-0.5">
              <span className="flex">
                <button
                  type="button"
                  className="composer-btn !h-8 !min-h-8 !w-8 !min-w-8 text-[#ececec] hover:bg-white/10"
                  aria-label="Add files and more"
                  id="composer-plus-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <PlusIcon className="size-[15px]" />
                </button>
              </span>
            </div>

            {/* Primary: prompt */}
            <div className="col-start-2 row-start-1 min-h-10 flex items-center overflow-x-hidden px-1.5">
              <div className="text-[#ececec] flex-1 max-h-[min(30svh,13rem)] min-h-0 overflow-auto [scrollbar-width:thin]">
                <textarea
                  ref={textareaRef}
                  name="prompt-textarea"
                  id="prompt-textarea"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything"
                  aria-label="Chat with ChatGPT"
                  disabled={disabled}
                  rows={1}
                  data-virtualkeyboard="true"
                  className="
                    w-full min-h-[1.25rem] bg-transparent text-[15px] leading-normal text-inherit
                    placeholder:text-[#8e8e8e] resize-none outline-none
                    max-h-[200px] overflow-y-auto py-1.5
                  "
                />
              </div>
            </div>

            {/* Trailing: dictate, voice (decorative), send/stop */}
            <div className="col-start-3 row-start-1 flex items-center justify-end gap-1.5 pr-0.5">
              <span className="flex">
                <button
                  type="button"
                  className="composer-btn !h-8 !min-h-8 !w-8 !min-w-8 text-[#ececec] opacity-50 cursor-not-allowed"
                  aria-label="Dictate button"
                  title="Dictate (not available in this demo)"
                >
                  <MicIcon className="size-[15px]" />
                </button>
              </span>
              <span className="flex">
                {isStreaming ? (
                  <button
                    type="button"
                    onClick={onStop}
                    className={circleBtnClass}
                    aria-label="Stop generating"
                    title="Stop generating"
                  >
                    <StopIcon className="size-[15px]" strokeWidth={2.5} />
                  </button>
                ) : hasInput ? (
                  <button
                    type="submit"
                    disabled={!canSend}
                    className={circleBtnClass}
                    aria-label="Send message"
                    title="Send message"
                  >
                    <ArrowIcon className="size-[15px]" strokeWidth={2.5} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className={circleBtnClass}
                    aria-label="Start voice"
                    title="Voice (not available in this demo)"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      aria-hidden="true"
                      className="h-4 w-4"
                    >
                      <use
                        href="/sprites-core-lbtco6v1.svg#f8aa74"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                )}
              </span>
            </div>
          </div>
        </form>

        <p className="text-center text-xs text-white mt-2">
          ChatGPT can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
}
