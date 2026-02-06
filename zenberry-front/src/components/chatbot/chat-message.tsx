"use client";

import { useState } from "react";
import { Message } from "@/src/types/message";
import { Copy, Check } from "lucide-react";
import { cn } from "@/src/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div
      className={cn(
        "flex mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Message Content */}
      <div className={cn("flex-1 max-w-[80%]", isUser && "flex flex-col items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 shadow-sm",
            isUser
              ? "bg-white text-gray-800"
              : "bg-secondary text-white"
          )}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap break-all">
              {message.content}
            </p>
          ) : (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0 text-sm leading-relaxed">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-2 space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-2 space-y-1">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-sm leading-relaxed">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold">{children}</strong>
                  ),
                  code: ({ children }) => (
                    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto mb-2">
                      {children}
                    </pre>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      rel="noopener noreferrer"
                      className="text-theme-accent-primary hover:underline font-medium transition-colors"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
              {isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 bg-gray-400 animate-pulse" />
              )}
            </div>
          )}
        </div>

        {/* Timestamp and Copy Button */}
        <div
          className={cn(
            "flex items-center gap-2 mt-1 px-2",
            isUser ? "flex-row-reverse" : "flex-row"
          )}
        >
          <span className="text-xs text-gray-500">
            {formatTime(message.timestamp)}
          </span>

          {!isUser && (
            <button
              onClick={handleCopy}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Copiar mensagem"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
