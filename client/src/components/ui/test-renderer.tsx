import { ResponseType } from "@/services/chatService";

interface TestRendererProps {
  content: string;
  responseType?: ResponseType;
}

export function TestRenderer({ content, responseType }: TestRendererProps) {
  return (
    <div className="border border-gray-300 p-4 rounded">
      <div className="text-xs text-gray-500 mb-2">
        Test Renderer - Type: {responseType || "undefined"}
      </div>
      <div className="whitespace-pre-wrap break-words">{content}</div>
    </div>
  );
}
