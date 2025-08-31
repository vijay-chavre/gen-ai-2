"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Plus, Send } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export default function ChatBar({
  onSend,
  disabled = false,
}: {
  onSend: (msg: string) => void;
  disabled?: boolean;
}) {
  const [message, setMessage] = useState("");
  const [isValid, setIsValid] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const validateMessage = (msg: string): boolean => {
    const trimmed = msg.trim();
    const isValid = trimmed.length > 0 && trimmed.length <= 4000; // Max 4000 characters
    setIsValid(isValid);
    return isValid;
  };

  const handleSend = () => {
    if (!message.trim() || disabled || !isValid) return;

    const trimmedMessage = message.trim();
    if (validateMessage(trimmedMessage)) {
      onSend(trimmedMessage);
      setMessage("");
      setIsValid(true);
      // Focus back to textarea after sending
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    validateMessage(value);

    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  const getPlaceholder = () => {
    if (disabled) return "Please wait...";
    if (!isValid && message.length > 4000)
      return "Message too long (max 4000 characters)";
    return "Ask AI Assistant...";
  };

  const getCharacterCount = () => {
    const count = message.length;
    const max = 4000;
    const isOverLimit = count > max;

    return (
      <div
        className={cn(
          "text-xs text-gray-500 dark:text-gray-400",
          isOverLimit && "text-red-500 dark:text-red-400"
        )}
      >
        {count}/{max}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-end gap-3 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        {/* Left icon */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
        </Button>

        {/* Growing Textarea */}
        <div className="flex-1 min-w-0">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            rows={1}
            className={cn(
              "min-h-[20px] max-h-[120px] leading-6 border-0 resize-none bg-transparent dark:bg-gray-800 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 py-2 text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400",
              !isValid && message.length > 0 && "text-red-600 dark:text-red-400"
            )}
            disabled={disabled}
          />
          {/* Character count */}
          {message.length > 0 && (
            <div className="flex justify-end mt-1">{getCharacterCount()}</div>
          )}
        </div>

        {/* Send button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSend}
          disabled={!message.trim() || disabled || !isValid}
          className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
        </Button>

        {/* Mic button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          disabled={disabled}
        >
          <Mic className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
