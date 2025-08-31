"use client";
import { useState } from "react";
import ChatBar from "./chat-bar";
import ChatContent, { Message } from "./chat-content";

export default function Chat() {
  const [messages, setMessages] = useState<Message[] | []>([
    { role: "assistant", content: "Hi 👋 How can I help you today?" },
  ]);

  const handleSend = (msg: string) => {
    setMessages((msges: Message[]) => [
      ...msges,
      { role: "user", content: msg },
    ]);

    // Simulate assistant response (you can replace this with actual API call)
    setTimeout(() => {
      setMessages((msges: Message[]) => [
        ...msges,
        {
          role: "assistant",
          content:
            "I received your message: " + msg + ". How can I help you further?",
        },
      ]);
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0 overflow-hidden">
        <ChatContent messages={messages} />
      </div>

      <div className="flex-shrink-0 w-full p-4 border-t border-gray-200 dark:border-gray-800 bg-background">
        <ChatBar onSend={handleSend} />
      </div>
    </div>
  );
}
