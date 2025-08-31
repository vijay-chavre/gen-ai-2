"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Bot, User, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Message {
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
  timestamp?: Date;
}

interface ChatContentProps {
  messages: Message[];
  isLoading?: boolean;
  onRetry?: (messageIndex: number) => void;
}

export default function ChatContent({
  messages,
  isLoading = false,
  onRetry,
}: ChatContentProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  //Auto-scroll on new message
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleRetry = (index: number) => {
    if (onRetry) {
      onRetry(index);
    }
  };

  return (
    <div
      ref={containerRef}
      className="h-[calc(100vh-210px)]  overflow-y-auto px-4"
    >
      <div className="max-w-4xl mx-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={cn(
              "flex w-full py-6",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "flex items-start gap-3 max-w-[85%]",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              {/* Avatar - positioned based on role */}
              {msg.role === "assistant" && (
                <div className="flex-shrink-0">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      msg.isError
                        ? "bg-red-600 dark:bg-red-500"
                        : "bg-green-600 dark:bg-green-500"
                    )}
                  >
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                </div>
              )}

              {/* Message Content */}
              <div
                className={cn(
                  "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                  "shadow-sm border",
                  msg.role === "assistant"
                    ? msg.isError
                      ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-foreground"
                    : "bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500"
                )}
              >
                <div className="whitespace-pre-wrap break-words">
                  {msg.content}
                </div>

                {/* Retry button for error messages */}
                {msg.isError && onRetry && (
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRetry(idx)}
                      className="h-7 px-3 text-xs border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Retry
                    </Button>
                  </div>
                )}
              </div>

              {/* Avatar - positioned based on role */}
              {msg.role === "user" && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gray-600 dark:bg-gray-500 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex w-full py-6 justify-start">
            <div className="flex items-start gap-3 max-w-[85%]">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-green-600 dark:bg-green-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-foreground">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-muted-foreground">
                    AI is thinking...
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Welcome message styling for first assistant message */}
        {messages.length === 1 &&
          messages[0]?.role === "assistant" &&
          !isLoading && (
            <div className="flex justify-center py-8">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-full bg-green-600 dark:bg-green-500 flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-semibold text-foreground mb-2">
                  How can I help you today?
                </h1>
                <p className="text-muted-foreground text-sm">
                  I&apos;m here to assist you with any questions or tasks you
                  might have.
                </p>
              </div>
            </div>
          )}

        {/* Bottom padding to ensure last message is visible above chat bar */}
        <div className="h-20" />
      </div>
    </div>
  );
}
