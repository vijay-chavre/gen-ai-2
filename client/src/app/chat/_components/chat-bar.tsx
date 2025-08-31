"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Plus, Send } from "lucide-react";
import { useRef, useState } from "react";

export default function ChatBar({ onSend }: { onSend: (msg: string) => void }) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message);
    setMessage("");
    // Focus back to textarea after sending
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-end gap-3 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        {/* Left icon */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Plus className="h-4 w-4" />
        </Button>

        {/* Growing Textarea */}
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Message ChatGPT..."
          rows={1}
          className="flex-1 min-h-[20px] max-h-[120px] leading-6 border-0 resize-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 py-2 text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400"
        />

        {/* Send button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSend}
          disabled={!message.trim()}
          className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
        </Button>

        {/* Mic button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Mic className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
