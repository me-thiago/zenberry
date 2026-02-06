/**
 * ChatInterface Component
 * Interface completa do chat com lista de mensagens, input e validação
 */

"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Send, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { ChatMessage } from "./chat-message";
import { useChat } from "@/src/hooks/use-chat";
import { useChatStream } from "@/src/hooks/use-chat-stream";
import { useChatbot } from "@/src/contexts/chatbot-context";
import { useTurnstile } from "@/src/hooks/use-turnstile";
import { Button } from "@/src/components/ui/button";
import { ChatbotSuggestions } from "./chatbot-suggestions";
import { TurnstileWidget } from "@/src/components/turnstile/turnstile-widget";

interface ChatInterfaceProps {
  useStreaming?: boolean;
  onNewChat?: (clearFn: () => void) => void;
}

const MAX_CHARS = 2000;

export function ChatInterface({ 
  useStreaming = false,
  onNewChat,
}: ChatInterfaceProps) {
  // State
  const [inputValue, setInputValue] = useState("");
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [pendingCategory, setPendingCategory] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Chatbot context for initial message
  const { initialMessage, initialCategory, clearInitialMessage } = useChatbot();

  // Turnstile verification for bot protection
  const turnstile = useTurnstile();

  // Use o hook apropriado baseado na prop useStreaming
  const chatHook = useChat({ persistHistory: true });
  const streamHook = useChatStream({ persistHistory: true });

  const currentHook = useStreaming ? streamHook : chatHook;
  const messages = currentHook.messages;
  const error = currentHook.error;
  const clearChat = currentHook.clearChat;

  // Expõe clearChat para o componente pai
  useEffect(() => {
    if (onNewChat && clearChat) {
      onNewChat(clearChat);
    }
  }, [onNewChat, clearChat]);

  // Captura mensagem inicial do contexto
  useEffect(() => {
    if (initialMessage) {
      setPendingMessage(initialMessage);
      setPendingCategory(initialCategory);
      clearInitialMessage();
    }
  }, [initialMessage, initialCategory, clearInitialMessage]);

  // Propriedades específicas de cada hook (usando useMemo para evitar re-renders)
  const isLoading = useMemo(
    () =>
      !useStreaming
        ? (chatHook as ReturnType<typeof useChat>).isLoading
        : false,
    [useStreaming, chatHook]
  );

  const sendMessage = useMemo(
    () =>
      !useStreaming
        ? (chatHook as ReturnType<typeof useChat>).sendMessage
        : async () => {},
    [useStreaming, chatHook]
  );

  const isRateLimited = useMemo(
    () =>
      !useStreaming
        ? (chatHook as ReturnType<typeof useChat>).isRateLimited
        : false,
    [useStreaming, chatHook]
  );

  const remainingCooldown = useMemo(
    () =>
      !useStreaming
        ? (chatHook as ReturnType<typeof useChat>).remainingCooldown
        : 0,
    [useStreaming, chatHook]
  );

  // Para o streaming hook, usamos isStreaming ao invés de isLoading
  const loading = useStreaming
    ? (streamHook as ReturnType<typeof useChatStream>).isStreaming
    : isLoading;

  // Processa mensagem pendente quando componente está pronto e não está carregando
  useEffect(() => {
    if (!pendingMessage || loading) return;

    const timer = setTimeout(async () => {
      const messageToSend = pendingMessage;
      const categoryToSend = pendingCategory;
      setPendingMessage(null);
      setPendingCategory(null);

      if (useStreaming) {
        await (streamHook as ReturnType<typeof useChatStream>).streamMessage(
          messageToSend
        );
      } else {
        await (chatHook as ReturnType<typeof useChat>).sendMessage(
          messageToSend,
          categoryToSend || undefined
        );
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [pendingMessage, pendingCategory, loading, useStreaming, streamHook, chatHook]);

  /**
   * Auto-scroll para a última mensagem
   */
  const scrollToBottom = useCallback(() => {
    // Pequeno delay para garantir que o DOM foi atualizado
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  /**
   * Scroll para o topo quando não há mensagens (para mostrar sugestões)
   */
  useEffect(() => {
    if (messages.length === 0) {
      // Scroll para o topo para mostrar as sugestões
      const messagesContainer = messagesEndRef.current?.parentElement;
      if (messagesContainer) {
        messagesContainer.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, [messages.length]);

  /**
   * Foca no input após enviar
   */
  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading]);

  /**
   * Ajusta scroll quando input recebe foco (mobile keyboard)
   */
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const handleFocus = () => {
      // Pequeno delay para o teclado aparecer
      setTimeout(() => {
        if (messages.length === 0) {
          // Se não há mensagens, scroll para o topo para mostrar sugestões
          const messagesContainer = messagesEndRef.current?.parentElement;
          if (messagesContainer) {
            messagesContainer.scrollTo({ top: 0, behavior: "smooth" });
          }
        } else {
          // Se há mensagens, scroll para a última
          scrollToBottom();
        }
      }, 300);
    };

    input.addEventListener("focus", handleFocus);
    return () => input.removeEventListener("focus", handleFocus);
  }, [messages.length, scrollToBottom]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInputValue(suggestion);
  }, []);

  /**
   * Handler para enviar mensagem
   */
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || loading || isRateLimited) return;

    // Check Turnstile verification (skip if still verifying - will auto-complete)
    if (!turnstile.isVerified && !turnstile.isVerifying) {
      // Verification failed, show error
      return;
    }

    const message = inputValue;
    setInputValue("");

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    if (useStreaming) {
      await (streamHook as ReturnType<typeof useChatStream>).streamMessage(
        message
      );
    } else {
      await sendMessage(message);
    }
  }, [
    inputValue,
    loading,
    isRateLimited,
    useStreaming,
    sendMessage,
    streamHook,
    turnstile.isVerified,
    turnstile.isVerifying,
  ]);

  /**
   * Handler para tecla Enter
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  /**
   * Handler para mudança no input
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      if (value.length <= MAX_CHARS) {
        setInputValue(value);

        // Auto-resize textarea
        e.target.style.height = "auto";
        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
      }
    },
    []
  );

  /**
   * Determina se deve mostrar o indicador de "digitando"
   */
  const showTypingIndicator =
    loading && messages[messages.length - 1]?.role === "user";

  const charCount = inputValue.length;

  return (
    <div className="flex flex-col h-full bg-[#e0e0e0] min-h-0 overflow-hidden">
      {/* Invisible Turnstile Widget for bot protection */}
      <TurnstileWidget
        onVerify={turnstile.onVerify}
        onError={turnstile.onError}
        onExpired={turnstile.onExpired}
      />

      {/* Messages Container */}
      <div className={`flex-1 px-4 ${messages.length === 0 ? 'py-0 flex flex-col overflow-hidden' : 'overflow-y-auto py-4 space-y-2'} min-h-0 overscroll-contain chat-messages`}>
        {messages.length === 0 ? (
          <div className="chat-suggestions-container flex flex-col justify-end items-center w-full">
            <ChatbotSuggestions onSelect={handleSuggestionClick} />
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                isStreaming={
                  useStreaming &&
                  loading &&
                  index === messages.length - 1 &&
                  message.role === "assistant"
                }
              />
            ))}
            {showTypingIndicator && (
              <div className="flex gap-3 p-4">
                  <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200 inline-block">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <span
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <span
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      />
                    </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="text-sm">Ocorreu um erro ao enviar a mensagem</p>
          </div>
        </div>
      )}

      {/* Turnstile Verification Error */}
      {turnstile.error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <div className="flex items-center gap-2 text-red-600">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <p className="text-sm">{turnstile.error}</p>
          </div>
        </div>
      )}

      {/* Rate Limit Warning */}
      {isRateLimited && remainingCooldown > 0 && (
        <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-200">
          <div className="flex items-center gap-2 text-yellow-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="text-sm">
              Aguarde {remainingCooldown}s antes de enviar outra mensagem
            </p>
          </div>
        </div>
      )}

      {/* Input Container */}
      <div className="shrink-0 border-t border-gray-300 bg-white p-4 chat-input-container">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 rounded-full  resize-none focus:outline-none focus:ring-2 focus:ring-primary overflow-y-auto"
            rows={1}
            style={{
              height: "40px",
              maxHeight: "80px",
            }}
            disabled={loading || isRateLimited}
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || loading || isRateLimited}
            className="shrink-0 h-10 w-10 rounded-full"
            aria-label="Enviar mensagem"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Character Limit Warning */}
        {charCount === MAX_CHARS && (
          <p className="text-xs text-red-500 mt-3 text-center">
            Limite de caracteres atingido ({charCount}/{MAX_CHARS})
          </p>
        )}
      </div>
    </div>
  );
}
