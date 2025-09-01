"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkRehype from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";

type ResponseType =
  | "text"
  | "json"
  | "code"
  | "markdown"
  | "table"
  | "html-table"
  | "mixed"
  | "raw";

interface ContentRendererProps {
  content: string;
  responseType: ResponseType;
  metadata?: { language?: string };
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({
  content,
  responseType,
  metadata,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ✅ Markdown renderer with syntax highlighting
  const renderMarkdown = (md: string) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[remarkRehype]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          return match ? (
            <div className="relative group">
              <SyntaxHighlighter
                style={
                  oneDark as unknown as Record<string, React.CSSProperties>
                }
                language={match[1]}
                PreTag="div"
                className="rounded-lg text-sm"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
              <button
                onClick={() => handleCopy(String(children))}
                className="absolute top-2 right-2 p-1 rounded bg-gray-800 text-white opacity-0 group-hover:opacity-100 transition"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          ) : (
            <code className="bg-gray-100 dark:bg-gray-800   px-1 py-0.5 rounded">
              {children}
            </code>
          );
        },
        table({ children }) {
          return (
            <table className="min-w-full  border border-gray-300 dark:border-gray-700 text-sm">
              {children}
            </table>
          );
        },
        td({ children }) {
          return (
            <td className="px-2 py-1 border border-gray-300 dark:border-gray-700">
              {children}
            </td>
          );
        },
        th({ children }) {
          return (
            <th className="px-2 py-1 border border-gray-300 dark:border-gray-700">
              {children}
            </th>
          );
        },
        tr({ children }) {
          return (
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-900">
              {children}
            </tr>
          );
        },
        tbody({ children }) {
          return <tbody>{children}</tbody>;
        },
        thead({ children }) {
          return (
            <thead className="bg-gray-100 dark:bg-gray-800">{children}</thead>
          );
        },
        pre({ children }) {
          return (
            <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg overflow-x-auto text-xs">
              {children}
            </pre>
          );
        },

        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 py-2">
              {children}
            </blockquote>
          );
        },
        hr({ children }) {
          return <hr className="border-gray-300 dark:border-gray-700 my-4" />;
        },
        img({ src, alt }) {
          return <img src={src} alt={alt} className="mx-auto" />;
        },
        a({ href, children }) {
          return (
            <a href={href} className="text-blue-500">
              {children}
            </a>
          );
        },
        strong({ children }) {
          return <strong>{children}</strong>;
        },
        em({ children }) {
          return <em>{children}</em>;
        },
        del({ children }) {
          return <del>{children}</del>;
        },
        sup({ children }) {
          return <sup>{children}</sup>;
        },
      }}
    >
      {md}
    </ReactMarkdown>
  );

  // ✅ JSON viewer
  const renderJson = (jsonString: string) => {
    try {
      const obj = JSON.parse(jsonString);
      return (
        <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg overflow-x-auto text-xs">
          <code>{JSON.stringify(obj, null, 2)}</code>
        </pre>
      );
    } catch {
      return <span className="text-red-500">Invalid JSON</span>;
    }
  };

  // ✅ Code viewer (non-markdown, explicit "code" type)
  const renderCode = (code: string, language = "javascript") => (
    <div className="relative group">
      <SyntaxHighlighter
        style={oneDark as unknown as Record<string, React.CSSProperties>}
        language={language}
        PreTag="div"
        className="rounded-lg text-sm"
      >
        {code}
      </SyntaxHighlighter>
      <button
        onClick={() => handleCopy(code)}
        className="absolute top-2 right-2 p-1 rounded bg-gray-800 text-white opacity-0 group-hover:opacity-100 transition"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  );

  // ✅ Table renderer
  const renderTable = (tableString: string) => {
    const rows = tableString
      .trim()
      .split("\n")
      .map((r) => r.split("|").map((c) => c.trim()));
    const headers = rows[0];
    const body = rows.slice(1);

    return (
      <table className="min-w-full border border-gray-300 dark:border-gray-700 text-sm">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-2 py-1 border border-gray-300 dark:border-gray-700"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-900">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-2 py-1 border border-gray-300 dark:border-gray-700"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // ✅ Raw text
  const renderRaw = (raw: string) => (
    <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg overflow-x-auto text-xs">
      <code>{raw}</code>
    </pre>
  );

  // ✅ Mixed (splits into markdown/code blocks)
  const renderMixed = (text: string) => {
    const parts = text.split(/```/);
    return (
      <div className="space-y-3">
        {parts.map((part, idx) =>
          idx % 2 === 1
            ? renderCode(part, part.split("\n")[0] || "text")
            : renderMarkdown(part)
        )}
      </div>
    );
  };

  return renderMarkdown(content);

  // ✅ Dispatcher
  // switch (responseType) {
  //   case "json":
  //     return renderJson(content);
  //   case "code":
  //     return renderCode(content, metadata?.language);
  //   case "markdown":
  //     return renderMarkdown(content);
  //   case "table":
  //     return renderTable(content);
  //   case "html-table":
  //     return renderRaw(content); // Render HTML tables as raw content
  //   case "raw":
  //     return renderRaw(content);
  //   case "mixed":
  //     return renderMixed(content);
  //   default:
  //     return renderMarkdown(content); // fallback to markdown for "text"
  // }
};
