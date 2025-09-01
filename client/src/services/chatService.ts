import { apiClient } from "@/config/apiClient";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export type ResponseType =
  | "text"
  | "json"
  | "code"
  | "markdown"
  | "mixed"
  | "table" // Markdown table (pipes)
  | "html-table" // Raw <table>…</table>
  | "raw"; // Fallback for unparsed JSON-like etc.

export interface ChatRequest {
  messages: ChatMessage[];
  responseFormat?: ResponseType;
  systemPrompt?: string;
}

export interface ChatResponse {
  reply: string;
  responseType: ResponseType;
  metadata?: {
    language?: string;
    isCode?: boolean;
    isJson?: boolean;
    isMarkdown?: boolean;
    confidence?: number;
    jsonKeys?: string[];
    jsonDepth?: number;
  };
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model?: string;
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

  // ---- Helpers -------------------------------------------------------------

  private static getObjectDepth(obj: any, depth = 1): number {
    if (typeof obj !== "object" || obj === null) return depth;
    let maxDepth = depth;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        maxDepth = Math.max(maxDepth, this.getObjectDepth(obj[key], depth + 1));
      }
    }
    return maxDepth;
  }

  private static detectResponseType(content: string): ResponseType {
    const text = (content || "").trim();
    if (!text) return "text";

    // HTML table
    if (/<table[\s\S]*?>[\s\S]*?<\/table>/i.test(text)) return "html-table";

    // Fenced code blocks
    const hasFencedCode = /```[\s\S]*?```/.test(text);
    // “CODE … CODE” markers (rare but seen)
    const hasCodeMarkers = /^CODE\s*\n[\s\S]*?\n\s*CODE$/m.test(text);

    // Pure JSON
    if (
      (text.startsWith("{") && text.endsWith("}")) ||
      (text.startsWith("[") && text.endsWith("]"))
    ) {
      try {
        JSON.parse(text);
        return "json";
      } catch {
        // looks like JSON but invalid -> raw
        return "raw";
      }
    }

    // Markdown table (pipes with a separator row)
    const lines = text.split("\n").map((l) => l.trim());
    const hasPipeHeader = /^\|?.*\|.*\|/.test(lines[0] || "");
    const hasPipeSeparator =
      lines[1] && /^(\|?\s*:?-{3,}\s*:?\s*)+\|?$/.test(lines[1]);
    if (hasPipeHeader && hasPipeSeparator) return "table";

    // Code
    if (hasFencedCode || hasCodeMarkers) {
      // If there is substantial text + code, call it mixed
      const codeBlocks = text.match(/```[\s\S]*?```/g) || [];
      const totalCodeLen = codeBlocks.reduce((s, c) => s + c.length, 0);
      const outsideLen = text.length - totalCodeLen;
      if (outsideLen > 30) return "mixed";
      return "code";
    }

    // Programming-ish text even without fences
    if (
      /\b(function|const|let|var|if|for|while|switch|try|catch|class|import|export|def|async|await|public|private|protected)\b/.test(
        text
      )
    ) {
      return "code";
    }

    // Markdown signals
    if (
      /^#{1,6}\s/.test(text) || // headers
      /^\s*[-*+]\s+/.test(text) || // bullets
      /^\d+\.\s+/.test(text) || // ordered list
      /!\[.*\]\(.*\)|\[[^\]]+\]\([^)]+\)/.test(text) || // links/images
      /\*\*[^*]+\*\*|_[^_]+_|`[^`]+`/.test(text) // bold/italic/inline code
    ) {
      return "markdown";
    }

    return "text";
  }

  private static extractMetadata(
    content: string,
    responseType: ResponseType
  ): ChatResponse["metadata"] {
    const meta: ChatResponse["metadata"] = {
      isCode: responseType === "code",
      isJson: responseType === "json",
      isMarkdown: responseType === "markdown" || responseType === "table",
      confidence: 0.9, // heuristic
    };

    if (responseType === "code" || responseType === "mixed") {
      const fenceLang = content.match(/```(\w+)[\s\S]*?```/);
      if (fenceLang?.[1]) {
        meta.language = fenceLang[1].toLowerCase();
      } else {
        // Infer from keywords
        const t = content.toLowerCase();
        if (/\b(import|export|const|let|=>)\b/.test(t))
          meta.language = "javascript";
        else if (/\b(def |import |class )/.test(t)) meta.language = "python";
        else if (/\b(public class|System\.out|static void)\b/.test(t))
          meta.language = "java";
        else if (/\bfn\s|\blet\s|\bstruct\s/.test(t)) meta.language = "rust";
      }
    }

    if (responseType === "json") {
      try {
        const parsed = JSON.parse(content);
        meta.jsonKeys = Array.isArray(parsed) ? [] : Object.keys(parsed);
        meta.jsonDepth = this.getObjectDepth(parsed);
      } catch {
        // ignore parse errors
      }
    }

    return meta;
  }

  private static normalizeReply(reply: string): string {
    // Some models prepend/trail whitespace; keep it simple
    return (reply ?? "").trim();
  }

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
          `Invalid message role at index ${index}: ${String(msg.role)}`
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

      return { role: msg.role, content: msg.content.trim() };
    });
  }

  /**
   * Parses and validates the API response
   * - If backend already sends responseType/metadata, we trust it
   * - Otherwise, we auto-detect and enrich
   */
  private static parseResponse(response: unknown): ChatResponse {
    if (!response) throw new ChatError("Empty response from server");

    // If server returned raw string, detect type here
    if (typeof response === "string") {
      const reply = this.normalizeReply(response);
      const autoType = this.detectResponseType(reply);
      const metadata = this.extractMetadata(reply, autoType);
      return { reply, responseType: autoType, metadata };
    }

    if (typeof response === "object" && response !== null) {
      const obj = response as Record<string, unknown>;
      const rawReply = typeof obj.reply === "string" ? obj.reply : "";

      if (rawReply) {
        const reply = this.normalizeReply(rawReply);
        const givenType = obj.responseType as ResponseType | undefined;

        // Use server-provided type if valid; otherwise detect
        const responseType: ResponseType =
          givenType &&
          [
            "text",
            "json",
            "code",
            "markdown",
            "mixed",
            "table",
            "html-table",
            "raw",
          ].includes(givenType)
            ? givenType
            : this.detectResponseType(reply);

        // Merge metadata: server-provided takes precedence, else we compute
        const serverMeta =
          (obj.metadata as ChatResponse["metadata"]) || undefined;
        const autoMeta = this.extractMetadata(reply, responseType);
        const metadata = { ...autoMeta, ...serverMeta };

        const chatResponse: ChatResponse = {
          reply,
          responseType,
          metadata,
        };

        if (obj.usage && typeof obj.usage === "object") {
          chatResponse.usage = obj.usage as ChatResponse["usage"];
        }
        if (typeof obj.model === "string") {
          chatResponse.model = obj.model;
        }

        return chatResponse;
      }
    }

    throw new ChatError("Invalid response format from server");
  }

  // ---- Public API ----------------------------------------------------------

  static async sendMessage(
    messages: ChatMessage[],
    options: { responseFormat?: ResponseType; systemPrompt?: string } = {}
  ): Promise<ChatResponse> {
    try {
      const validatedMessages = this.validateMessages(messages);

      const requestData = {
        messages: validatedMessages,
        ...options,
      };

      const response = await apiClient({
        url: this.CHAT_ENDPOINT,
        method: "POST",
        data: requestData as Record<string, unknown>,
      });

      // Axios: prefer response.data
      if (response && typeof response === "object" && "data" in response) {
        return this.parseResponse((response as any).data);
      }
      return this.parseResponse(response);
    } catch (error: unknown) {
      // Map to ChatError with friendly messages
      if (error instanceof ChatError) throw error;

      if (typeof error === "object" && error !== null) {
        const err = error as any;

        // Axios error with response.status
        const status: number | undefined = err?.response?.status;
        if (typeof status === "number") {
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

        const msg: string | undefined = err?.message;
        if (
          err?.code === "NETWORK_ERROR" ||
          (typeof msg === "string" && msg.includes("Network Error"))
        ) {
          throw new ChatError(
            "Network error. Please check your internet connection.",
            undefined,
            error
          );
        }
        if (typeof msg === "string" && msg.toLowerCase().includes("timeout")) {
          throw new ChatError(
            "Request timed out. Please try again.",
            undefined,
            error
          );
        }
      }

      const fallback =
        error instanceof Error
          ? error.message
          : "Failed to send message. Please try again.";
      throw new ChatError(fallback, undefined, error);
    }
  }

  static async sendUserMessage(
    content: string,
    conversationHistory: ChatMessage[] = [],
    options: { responseFormat?: ResponseType; systemPrompt?: string } = {}
  ): Promise<ChatResponse> {
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

    return this.sendMessage(messages, options);
  }
}
