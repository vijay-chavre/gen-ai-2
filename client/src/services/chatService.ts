import { apiClient } from "@/config/apiClient";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
}

export interface ChatResponse {
  reply: string;
}

export class ChatError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "ChatError";
  }
}

export class ChatService {
  private static readonly CHAT_ENDPOINT = "/chat";

  /**
   * Validates and sanitizes chat messages
   */
  private static validateMessages(messages: ChatMessage[]): ChatMessage[] {
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new ChatError("At least one message is required");
    }

    return messages.map((msg, index) => {
      if (!msg || typeof msg !== "object") {
        throw new ChatError(`Invalid message format at index ${index}`);
      }

      if (!msg.role || !["system", "user", "assistant"].includes(msg.role)) {
        throw new ChatError(
          `Invalid message role at index ${index}: ${msg.role}`
        );
      }

      if (
        !msg.content ||
        typeof msg.content !== "string" ||
        msg.content.trim().length === 0
      ) {
        throw new ChatError(
          `Message content cannot be empty at index ${index}`
        );
      }

      return {
        role: msg.role,
        content: msg.content.trim(),
      };
    });
  }

  /**
   * Parses and validates the API response
   */
  private static parseResponse(response: unknown): ChatResponse {
    if (!response) {
      throw new ChatError("Empty response from server");
    }

    if (typeof response === "string") {
      // If response is just a string, treat it as the reply
      return { reply: response };
    }
    if (typeof response === "object" && response !== null) {
      const responseObj = response as Record<string, unknown>;
      if (responseObj.reply && typeof responseObj.reply === "string") {
        return { reply: responseObj.reply.trim() };
      }
    }

    throw new ChatError("Invalid response format from server");
  }

  static async sendMessage(messages: ChatMessage[]): Promise<ChatResponse> {
    try {
      // Validate input messages
      const validatedMessages = this.validateMessages(messages);

      const response = await apiClient({
        url: this.CHAT_ENDPOINT,
        method: "POST",
        data: { messages: validatedMessages },
      });

      // Parse and validate response
      return this.parseResponse(response.data);
    } catch (error: unknown) {
      console.error("Error sending chat message:", error);

      // Handle different types of errors
      if (error instanceof ChatError) {
        throw error;
      }

      // Handle axios errors
      if (typeof error === "object" && error !== null) {
        const errorObj = error as Record<string, unknown>;

        if (
          errorObj.response &&
          typeof errorObj.response === "object" &&
          errorObj.response !== null
        ) {
          const response = errorObj.response as Record<string, unknown>;
          if (response.status && typeof response.status === "number") {
            const status = response.status;
            switch (status) {
              case 400:
                throw new ChatError(
                  "Invalid request. Please check your message.",
                  status,
                  error
                );
              case 401:
                throw new ChatError(
                  "Authentication required. Please log in again.",
                  status,
                  error
                );
              case 403:
                throw new ChatError(
                  "Access denied. You don't have permission for this action.",
                  status,
                  error
                );
              case 404:
                throw new ChatError(
                  "Chat service not found. Please try again later.",
                  status,
                  error
                );
              case 429:
                throw new ChatError(
                  "Too many requests. Please wait a moment before trying again.",
                  status,
                  error
                );
              case 500:
                throw new ChatError(
                  "Server error. Please try again later.",
                  status,
                  error
                );
              default:
                throw new ChatError(
                  `Request failed with status ${status}. Please try again.`,
                  status,
                  error
                );
            }
          }
        }

        if (
          errorObj.code === "NETWORK_ERROR" ||
          (errorObj.message &&
            typeof errorObj.message === "string" &&
            errorObj.message.includes("Network Error"))
        ) {
          throw new ChatError(
            "Network error. Please check your internet connection.",
            undefined,
            error
          );
        }

        if (
          errorObj.message &&
          typeof errorObj.message === "string" &&
          errorObj.message.includes("timeout")
        ) {
          throw new ChatError(
            "Request timed out. Please try again.",
            undefined,
            error
          );
        }
      }

      // Generic error fallback
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send message. Please try again.";
      throw new ChatError(errorMessage, undefined, error);
    }
  }

  static async sendUserMessage(
    content: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<string> {
    if (
      !content ||
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      throw new ChatError("Message content cannot be empty");
    }

    const messages: ChatMessage[] = [
      ...conversationHistory,
      { role: "user", content: content.trim() },
    ];

    const response = await this.sendMessage(messages);
    return response.reply;
  }
}
