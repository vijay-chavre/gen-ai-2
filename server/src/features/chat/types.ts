export type ChatRole = "system" | "user" | "assistant";

export type ResponseType = "text" | "json" | "code" | "markdown" | "mixed";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

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
  };
}

export interface GroqRequestOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: ResponseType;
  systemPrompt?: string;
}


