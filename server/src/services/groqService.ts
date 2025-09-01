import Groq from "groq-sdk";
import type { ChatMessage, ResponseType, GroqRequestOptions } from "../features/chat/types.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Supported response types
 */
export type ExtendedResponseType =
  | "json"
  | "code"
  | "markdown"
  | "table"
  | "mixed"
  | "text"
  | "raw";

/**
 * Detects the type of response content
 */
function detectResponseType(content: string): ExtendedResponseType {
  const trimmed = content.trim();

  // --- 1. JSON detection (direct JSON string) ---
  try {
    JSON.parse(trimmed);
    return "json";
  } catch {
    // not raw JSON, continue
  }

  // --- 2. JSON inside code blocks ---
  const codeBlockMatches = trimmed.match(/```([\s\S]*?)```/g) || [];
  for (const block of codeBlockMatches) {
    const langMatch = block.match(/```(\w+)?/);
    const inner = block.replace(/```(\w+)?/, "").replace(/```$/, "").trim();
    if (langMatch?.[1] === "json") {
      try {
        JSON.parse(inner);
        return "json";
      } catch {
        // fall through
      }
    }
  }

  // --- 3. Table detection ---
  const isTable =
    /\|.*\|.*\|/.test(trimmed) &&
    /---/.test(trimmed.split("\n")[1] || ""); // check header separator row
  if (isTable) return "table";

  // --- 4. Code block detection ---
  const hasCodeBlocks = codeBlockMatches.length > 0;
  const hasCodeMarkers = /^CODE\s*\n|\n\s*CODE$/m.test(trimmed);

  if (hasCodeBlocks || hasCodeMarkers) {
    let totalCodeBlockLength = codeBlockMatches.reduce((sum, m) => sum + m.length, 0);
    let textContentLength = trimmed.length - totalCodeBlockLength;

    if (hasCodeMarkers && !hasCodeBlocks) {
      const codeMatch = trimmed.match(/^CODE\s*\n([\s\S]*?)\n\s*CODE$/m);
      if (codeMatch?.[1]) {
        textContentLength = trimmed.length - codeMatch[0].length;
      }
    }

    // Ratio-based detection for mixed vs pure code
    const ratio = textContentLength / trimmed.length;
    return ratio > 0.3 ? "mixed" : "code";
  }

  // --- 5. Programming keywords detection (no code fences) ---
  const programmingRegex =
    /\b(function|const|let|var|if|for|while|switch|try|catch|class|import|export|def|async|await|public|private|protected)\b/;
  if (programmingRegex.test(trimmed)) {
    return "code";
  }

  // --- 6. Markdown detection ---
  const markdownRegex =
    /^#{1,6}\s|^\*\s|^\d+\.\s|\[.*\]\(.*\)|!\[.*\]\(.*\)|\*\*.*\*\*|\*.*\*|`.*`|^\|.*\|$/m;
  if (markdownRegex.test(trimmed)) {
    return "markdown";
  }

  // --- 7. Fallback to text or raw ---
  if (/^[\w\s.,!?-]+$/.test(trimmed)) {
    return "text";
  }

  return "raw";
}

/**
 * Extracts metadata from the response content
 */
function extractMetadata(content: string, responseType: ExtendedResponseType) {
  const metadata: any = {
    isCode: responseType === "code",
    isJson: responseType === "json",
    isMarkdown: responseType === "markdown",
    isTable: responseType === "table",
  };

  // --- Language detection for code ---
  if (responseType === "code") {
    const languagePatterns: Record<string, RegExp> = {
      javascript: /\b(function|const|let|=>|import|export)\b/,
      python: /\b(def |import |class |async |lambda)\b/,
      java: /\b(public class|System\.out\.println)\b/,
      rust: /\b(fn |let |struct |impl)\b/,
      sql: /\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)\b/i,
      bash: /^#!/,
    };

    // Try from code fence first
    const fenceMatch = content.match(/```(\w+)/);
    if (fenceMatch) {
      metadata.language = fenceMatch[1];
    } else {
      for (const [lang, regex] of Object.entries(languagePatterns)) {
        if (regex.test(content)) {
          metadata.language = lang;
          break;
        }
      }
    }
  }

  // --- JSON metadata ---
  if (responseType === "json") {
    try {
      const parsed = JSON.parse(content);
      metadata.jsonKeys = Object.keys(parsed);
      metadata.jsonDepth = getObjectDepth(parsed);
    } catch {
      // ignore
    }
  }

  return metadata;
}

/**
 * Gets the depth of a nested object
 */
function getObjectDepth(obj: any, depth = 1): number {
  if (typeof obj !== "object" || obj === null) return depth;
  let maxDepth = depth;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      maxDepth = Math.max(maxDepth, getObjectDepth(obj[key], depth + 1));
    }
  }
  return maxDepth;
}

/**
 * Creates a system prompt based on the requested response format
 */
function createSystemPrompt(responseFormat?: ExtendedResponseType, customPrompt?: string): string {
  let basePrompt = "You are a helpful AI assistant. ";

  if (customPrompt) {
    basePrompt += customPrompt + " ";
  }

  switch (responseFormat) {
    case "json":
      basePrompt += "Always respond with valid JSON. No extra text.";
      break;
    case "code":
      basePrompt += "Always respond with clean, well-formatted code.";
      break;
    case "markdown":
      basePrompt += "Always respond using proper Markdown formatting.";
      break;
    case "table":
      basePrompt += "Always respond with a Markdown table.";
      break;
    case "text":
      basePrompt += "Respond in plain text only.";
      break;
    case "mixed":
      basePrompt += "You may combine text, markdown, and code blocks.";
      break;
    case "raw":
      basePrompt += "Respond with raw unformatted data if applicable.";
      break;
    default:
      basePrompt += "Respond in the most appropriate format.";
  }

  return basePrompt;
}

/**
 * Main chat function with Groq
 */
export async function chatWithGroq(
  messages: ChatMessage[],
  options: GroqRequestOptions = {}
) {
  const {
    model = "llama-3.3-70b-versatile",
    temperature = 0.7,
    maxTokens = 4000,
    responseFormat,
    systemPrompt,
  } = options;

  // Prepend system prompt if needed
  let enhancedMessages = [...messages];
  if (systemPrompt || responseFormat) {
    const systemMessage = createSystemPrompt(responseFormat, systemPrompt);
    enhancedMessages.unshift({ role: "system", content: systemMessage });
  }

  const completion = await groq.chat.completions.create({
    messages: enhancedMessages,
    model,
    temperature,
    max_tokens: maxTokens,
  });

  const responseContent = completion.choices[0]?.message?.content || "";

  // Detect type + metadata
  const detectedType = detectResponseType(responseContent);
  const metadata = extractMetadata(responseContent, detectedType);

  // Debug logging
  console.log("=== RESPONSE DEBUG ===");
  console.log("Preview:", responseContent.substring(0, 200) + "...");
  console.log("Detected type:", detectedType);
  console.log("Metadata:", metadata);
  console.log("======================");

  return {
    reply: responseContent,
    responseType: detectedType,
    metadata,
    usage: completion.usage,
    model: completion.model,
  };
}

/**
 * Test function
 */
function testDetection() {
  const testContent = `
Here is a JSON response:

\`\`\`json
{ "name": "Vijay", "role": "developer" }
\`\`\`

| Name  | Role      |
|-------|-----------|
| Vijay | Developer |
`;

  console.log("=== DETECTION TEST ===");
  console.log("Detected type:", detectResponseType(testContent));
  console.log("Metadata:", extractMetadata(testContent, detectResponseType(testContent)));
  console.log("=== END TEST ===");
}

// Run test on module load
testDetection();
