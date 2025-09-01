"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Plus, Send, Settings } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ResponseType } from "@/services/chatService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatBarProps {
  onSend: (
    msg: string,
    options?: { responseFormat?: ResponseType; systemPrompt?: string }
  ) => void;
  disabled?: boolean;
}

export default function ChatBar({ onSend, disabled = false }: ChatBarProps) {
  const [message, setMessage] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [responseFormat, setResponseFormat] = useState<
    ResponseType | undefined
  >();
  const [systemPrompt, setSystemPrompt] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
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
      const options: { responseFormat?: ResponseType; systemPrompt?: string } =
        {};
      if (responseFormat) options.responseFormat = responseFormat;
      if (systemPrompt) options.systemPrompt = systemPrompt;

      onSend(trimmedMessage, options);
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

  const getResponseFormatLabel = () => {
    if (!responseFormat) return "Auto";
    return responseFormat.charAt(0).toUpperCase() + responseFormat.slice(1);
  };

  const responseFormatOptions: {
    value: ResponseType;
    label: string;
    description: string;
  }[] = [
    { value: "text", label: "Text", description: "Plain text response" },
    { value: "json", label: "JSON", description: "Structured JSON data" },
    {
      value: "code",
      label: "Code",
      description: "Programming code with syntax highlighting",
    },
    {
      value: "markdown",
      label: "Markdown",
      description: "Formatted markdown text",
    },
    { value: "mixed", label: "Mixed", description: "Combination of formats" },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3">
      {/* Advanced Options */}
      {showAdvanced && (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              System Prompt (Optional)
            </label>
            <input
              type="text"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="e.g., You are a helpful coding assistant..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              disabled={disabled}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Response Format
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-32 justify-between"
                  disabled={disabled}
                >
                  {getResponseFormatLabel()}
                  <Settings className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setResponseFormat(undefined)}>
                  <div>
                    <div className="font-medium">Auto</div>
                    <div className="text-xs text-gray-500">
                      AI chooses best format
                    </div>
                  </div>
                </DropdownMenuItem>
                {responseFormatOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setResponseFormat(option.value)}
                  >
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500">
                        {option.description}
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Main Chat Input */}
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

        {/* Advanced toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={cn(
            "h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
            showAdvanced && "bg-gray-200 dark:bg-gray-700"
          )}
          disabled={disabled}
        >
          <Settings className="h-4 w-4" />
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
