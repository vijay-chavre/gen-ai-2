"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatContent({ messages }: { messages: Message[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={containerRef} className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={cn(
              "flex w-full py-6",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div className="flex items-start gap-3 max-w-[85%]">
              {/* Avatar - positioned based on role */}
              {msg.role === "assistant" && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-green-600 dark:bg-green-500 flex items-center justify-center">
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
                    ? "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-foreground"
                    : "bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500"
                )}
              >
                <div className="whitespace-pre-wrap break-words">
                  {msg.content}
                </div>
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

        {/* Welcome message styling for first assistant message */}
        {messages.length === 1 && messages[0]?.role === "assistant" && (
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
