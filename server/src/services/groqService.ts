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
  
  console.log("=== DETECTING RESPONSE TYPE ===");
  console.log("Full content length:", trimmed.length);
  console.log("Content preview:", trimmed.substring(0, 300) + "...");
  console.log("Content lines:", trimmed.split('\n').length);

  // --- 0. Quick text check (very lenient) ---
  const quickTextCheck = /^[a-zA-Z\s.,!?;:'"()-]+$/;
  if (quickTextCheck.test(trimmed.replace(/\n/g, ' '))) {
    console.log("Detected: Text (quick check - pure text)");
    return "text";
  }

  // --- 1. JSON detection (direct JSON string) ---
  try {
    JSON.parse(trimmed);
    console.log("Detected: JSON (direct)");
    return "json";
  } catch {
    console.log("Not direct JSON");
  }

  // --- 2. JSON inside code blocks ---
  const codeBlockMatches = trimmed.match(/```([\s\S]*?)```/g) || [];
  for (const block of codeBlockMatches) {
    const langMatch = block.match(/```(\w+)?/);
    const inner = block.replace(/```(\w+)?/, "").replace(/```$/, "").trim();
    if (langMatch?.[1] === "json") {
      try {
        JSON.parse(inner);
        console.log("Detected: JSON (in code block)");
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
  if (isTable) {
    console.log("Detected: Table");
    return "table";
  }

  // --- 4. Code block detection ---
  const hasCodeBlocks = codeBlockMatches.length > 0;
  const hasCodeMarkers = /^CODE\s*\n|\n\s*CODE$/m.test(trimmed);
  
  console.log("Code blocks found:", codeBlockMatches.length);
  console.log("Has code markers:", hasCodeMarkers);
  console.log("Code block matches:", codeBlockMatches);

  if (hasCodeBlocks || hasCodeMarkers) {
    let totalCodeBlockLength = codeBlockMatches.reduce((sum, m) => sum + m.length, 0);
    let textContentLength = trimmed.length - totalCodeBlockLength;

    if (hasCodeMarkers && !hasCodeBlocks) {
      const codeMatch = trimmed.match(/^CODE\s*\n([\s\S]*?)\n\s*CODE$/m);
      if (codeMatch?.[1]) {
        textContentLength = trimmed.length - codeMatch[0].length;
      }
    }

    // More lenient ratio-based detection
    const ratio = textContentLength / trimmed.length;
    console.log(`Code block ratio: ${ratio.toFixed(2)}`);
    
    // If there's significant text content, classify as mixed
    if (ratio > 0.5) {
      console.log(`Detected: Mixed (significant text content)`);
      return "mixed";
    }
    
    // Only classify as pure code if it's mostly code blocks
    if (ratio < 0.2) {
      console.log(`Detected: Code (mostly code blocks)`);
      return "code";
    }
    
    // Default to mixed for ambiguous cases
    console.log(`Detected: Mixed (ambiguous ratio)`);
    return "mixed";
  }

  // --- 5. Programming keywords detection (no code fences) ---
  const programmingKeywords = [
    'function', 'const', 'let', 'var', 'if', 'for', 'while', 'switch', 'try', 'catch', 
    'class', 'import', 'export', 'def', 'async', 'await', 'public', 'private', 'protected',
    'return', 'new', 'this', 'super', 'extends', 'implements', 'interface', 'enum'
  ];
  
  const foundKeywords = programmingKeywords.filter(keyword => 
    new RegExp(`\\b${keyword}\\b`, 'i').test(trimmed)
  );
  
  // Require more keywords and check density
  if (foundKeywords.length >= 5) {
    const keywordDensity = foundKeywords.length / (trimmed.split(' ').length);
    if (keywordDensity > 0.1) { // At least 10% of words are programming keywords
      console.log(`Detected: Code (${foundKeywords.length} keywords, density: ${keywordDensity.toFixed(2)})`);
      return "code";
    }
  }
  
  console.log(`Programming keywords found: ${foundKeywords.length} (${foundKeywords.join(', ')})`);

  // --- 6. Text detection (moved earlier, more lenient) ---
  const textPattern = /^[\w\s.,!?;:'"()-]+$/;
  const lines = trimmed.split('\n');
  const textLines = lines.filter(line => textPattern.test(line.trim()));
  const textRatio = textLines.length / lines.length;
  
  console.log("Total lines:", lines.length);
  console.log("Text lines:", textLines.length);
  console.log("Text ratio:", textRatio.toFixed(2));
  console.log("Sample non-text lines:", lines.filter(line => !textPattern.test(line.trim())).slice(0, 3));
  
  if (textRatio >= 0.5) { // Even more lenient threshold
    console.log(`Detected: Text (${textRatio.toFixed(2)} text ratio)`);
    return "text";
  }
  
  // If it's mostly text but has some special characters, still classify as text
  const simpleTextPattern = /^[\w\s.,!?;:'"()-]+$/;
  const simpleTextLines = lines.filter(line => simpleTextPattern.test(line.trim()));
  const simpleTextRatio = simpleTextLines.length / lines.length;
  
  if (simpleTextRatio >= 0.4) {
    console.log(`Detected: Text (simple text ratio: ${simpleTextRatio.toFixed(2)})`);
    return "text";
  }

  // --- 7. Markdown detection ---
  const markdownPatterns = [
    /^#{1,6}\s/m,                    // Headers
    /^\*\s/m,                        // Unordered lists
    /^\d+\.\s/m,                     // Ordered lists
    /\[.*\]\(.*\)/,                  // Links
    /!\[.*\]\(.*\)/,                 // Images
    /\*\*.*\*\*/,                    // Bold text
    /\*.*\*/,                        // Italic text
    /`.*`/,                          // Inline code
    /^\|.*\|$/m,                     // Tables
    /^>\s/m,                         // Blockquotes
    /^```[\s\S]*?```/m,              // Code blocks
  ];
  
  const markdownMatches = markdownPatterns.filter(pattern => pattern.test(trimmed));
  if (markdownMatches.length >= 2) {
    console.log(`Detected: Markdown (${markdownMatches.length} patterns)`);
    return "markdown";
  }

  console.log("Detected: Raw (fallback)");
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


  console.log("responseType", responseType);

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
 * Test function (for debugging)
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

// Uncomment to run test on module load (for debugging)
// testDetection();
