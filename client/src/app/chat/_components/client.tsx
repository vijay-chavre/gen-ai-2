"use client";
import { useState, useEffect } from "react";
import ChatBar from "./chat-bar";
import ChatContent, { Message } from "./chat-content";
import { ErrorMessage } from "@/components/ui/error-message";
import { ToastContainer } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import {
  ChatService,
  ChatMessage as ServiceMessage,
  ChatError,
  ResponseType,
} from "@/services/chatService";

export default function Chat() {
  const [messages, setMessages] = useState<Message[] | []>([
    {
      role: "assistant",
      content: "Hi 👋 How can I help you today?",
      responseType: "text",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  // Debug: Log messages whenever they change
  useEffect(() => {
    console.log("Messages state updated:", messages);
  }, [messages]);

  const sendMessage = async (
    userMessage: string,
    messageIndex?: number,
    options: { responseFormat?: ResponseType; systemPrompt?: string } = {}
  ) => {
    if (isLoading) return;

    // Clear any previous errors
    setError(null);

    // If this is a retry, remove the error message and add user message
    if (messageIndex !== undefined) {
      setMessages((msges: Message[]) => {
        const newMessages = [...msges];
        // Remove the error message
        newMessages.splice(messageIndex, 1);
        // Add the user message if it's not already there
        if (newMessages[newMessages.length - 1]?.role !== "user") {
          newMessages.push({ role: "user", content: userMessage });
        }
        return newMessages;
      });

      // Show retry toast
      toast.info(
        "Retrying message...",
        "Please wait while we process your request."
      );
    } else {
      // Add user message immediately for new messages
      setMessages((msges: Message[]) => [
        ...msges,
        { role: "user", content: userMessage },
      ]);
    }

    setIsLoading(true);

    try {
      // Convert messages to service format (excluding the error message)
      const serviceMessages: ServiceMessage[] = messages
        .filter((msg) => !msg.isError) // Exclude error messages
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      // Add the new user message
      serviceMessages.push({ role: "user", content: userMessage });

      // Get AI response from server with options
      const response = await ChatService.sendMessage(serviceMessages, options);

      console.log("AI Response:", response); // Debug log

      // Add AI response with metadata
      const newMessage: Message = {
        role: "assistant",
        content: response.reply,
        responseType: response.responseType,
        metadata: response.metadata,
        usage: response.usage,
        model: response.model,
      };

      console.log("New message being added:", newMessage); // Debug log

      setMessages((msges: Message[]) => [
        ...msges.filter((msg) => !msg.isError), // Remove any error messages
        newMessage,
      ]);

      // Show success toast for retries
      if (messageIndex !== undefined) {
        toast.success(
          "Message sent successfully!",
          "Your request has been processed."
        );
      }

      // Show response type toast for non-text responses
      if (response.responseType && response.responseType !== "text") {
        toast.info(
          `${response.responseType.toUpperCase()} Response`,
          `AI responded with ${response.responseType} format`
        );
      }
    } catch (error) {
      console.error("Error getting AI response:", error);

      let errorMessage = "Sorry, I encountered an error. Please try again.";

      if (error instanceof ChatError) {
        errorMessage = error.message;

        // Handle specific error types
        if (error.statusCode === 401) {
          // Authentication error - could redirect to login
          errorMessage = "Please log in to continue chatting.";
          toast.error(
            "Authentication Required",
            "Please log in to continue chatting."
          );
        } else if (error.statusCode === 429) {
          // Rate limit error
          errorMessage =
            "Too many requests. Please wait a moment before trying again.";
          toast.warning(
            "Rate Limited",
            "Too many requests. Please wait a moment."
          );
        } else if (error.statusCode === 500) {
          // Server error
          errorMessage =
            "Server is temporarily unavailable. Please try again later.";
          toast.error("Server Error", "Server is temporarily unavailable.");
        } else {
          toast.error("Error", errorMessage);
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
        toast.error("Error", errorMessage);
      } else {
        toast.error("Unknown Error", "An unexpected error occurred.");
      }

      // Add error message to chat
      setMessages((msges: Message[]) => [
        ...msges.filter((msg) => !msg.isError), // Remove any existing error messages
        {
          role: "assistant",
          content: errorMessage,
          isError: true,
        },
      ]);

      // Also show error banner
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = (
    msg: string,
    options?: { responseFormat?: ResponseType; systemPrompt?: string }
  ) => {
    sendMessage(msg, undefined, options);
  };

  const handleRetry = (messageIndex: number) => {
    // Find the user message that corresponds to this error
    const userMessage = messages[messageIndex - 1]?.content;
    if (userMessage) {
      sendMessage(userMessage, messageIndex);
    }
  };

  const dismissError = () => {
    setError(null);
  };

  return (
    <>
      {/* Toast Container */}
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />

      {/* Debug link - remove in production */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute top-4 right-4 z-10">
          <a
            href="/test"
            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
            target="_blank"
            rel="noopener noreferrer"
          >
            Test Page
          </a>
        </div>
      )}

      <div className="h-full flex flex-col">
        {/* Error Banner */}
        {error && (
          <div className="flex-shrink-0 p-4">
            <ErrorMessage
              error={error}
              onDismiss={dismissError}
              className="max-w-4xl mx-auto"
            />
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-hidden">
          <ChatContent
            messages={messages}
            isLoading={isLoading}
            onRetry={handleRetry}
          />
        </div>

        <div className="flex-shrink-0 w-full p-4 border-t border-gray-200 dark:border-gray-800 bg-background">
          <ChatBar onSend={handleSend} disabled={isLoading} />
        </div>
      </div>
    </>
  );
}
