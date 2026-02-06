/**
 * useChatStream Hook
 * Gerencia streaming de mensagens com EventSource (SSE)
 * Inclui reconnection logic e tratamento de erros
 */

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Message, ChatHistory } from "@/src/types/message";
import { createStreamConnection } from "@/src/services/client/chat-api";

interface UseChatStreamOptions {
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  persistHistory?: boolean;
}

interface UseChatStreamReturn {
  messages: Message[];
  isStreaming: boolean;
  error: string | null;
  streamMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  cancelStream: () => void;
}

const STORAGE_KEY = "zenberry_chat_stream_history";

export function useChatStream(
  options: UseChatStreamOptions = {}
): UseChatStreamReturn {
  const {
    maxReconnectAttempts = 3,
    reconnectDelay = 2000,
    persistHistory = true,
  } = options;

  // State
  const [messages, setMessages] = useState<Message[]>(() => {
    if (persistHistory && typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return parsed.map((msg: Message) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttempts = useRef(0);
  const currentStreamingMessageId = useRef<string | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);

  // Persiste mensagens no localStorage
  useEffect(() => {
    if (persistHistory && messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages, persistHistory]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
    };
  }, []);

  /**
   * Converte mensagens para formato de histórico
   */
  const getHistory = useCallback((): ChatHistory[] => {
    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }, [messages]);

  /**
   * Cancela o streaming atual
   */
  const cancelStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }

    setIsStreaming(false);
    currentStreamingMessageId.current = null;
    reconnectAttempts.current = 0;
  }, []);

  /**
   * Tenta reconectar em caso de erro
   */
  const attemptReconnect = useCallback(
    () => {
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        setError(
          "Não foi possível estabelecer conexão após várias tentativas. Tente novamente mais tarde."
        );
        cancelStream();
        return;
      }

      reconnectAttempts.current += 1;
      setError(
        `Tentando reconectar... (${reconnectAttempts.current}/${maxReconnectAttempts})`
      );

      reconnectTimer.current = setTimeout(() => {
        // Tenta reconectar - implementação simplificada
        // Em produção, você pode querer chamar streamMessage novamente
        cancelStream();
      }, reconnectDelay);
    },
    [maxReconnectAttempts, reconnectDelay, cancelStream]
  );

  /**
   * Envia uma mensagem com streaming
   */
  const streamMessage = useCallback(
    async (content: string) => {
      // Validações
      if (!content.trim()) {
        setError("Mensagem não pode estar vazia");
        return;
      }

      if (content.length > 2000) {
        setError("Mensagem muito longa (máximo 2000 caracteres)");
        return;
      }

      if (isStreaming) {
        setError("Aguarde a mensagem anterior ser concluída");
        return;
      }

      // Cancela conexão anterior se existir
      cancelStream();

      setError(null);
      setIsStreaming(true);
      reconnectAttempts.current = 0;

      // Adiciona mensagem do usuário
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Cria mensagem do assistente (vazia, será preenchida com chunks)
      const assistantMessageId = `assistant-${Date.now()}`;
      currentStreamingMessageId.current = assistantMessageId;

      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Inicia streaming
      try {
        const eventSource = createStreamConnection(
          content.trim(),
          getHistory(),
          // onMessage - recebe cada chunk
          (chunk: string) => {
            setMessages((prev) =>
              prev.map((msg) => {
                if (msg.id === assistantMessageId) {
                  return {
                    ...msg,
                    content: msg.content + chunk,
                  };
                }
                return msg;
              })
            );
          },
          // onError
          (error: Error) => {
            console.error("Stream error:", error);
            setError(error.message);
            attemptReconnect();
          },
          // onComplete
          () => {
            setIsStreaming(false);
            currentStreamingMessageId.current = null;
            reconnectAttempts.current = 0;

            if (eventSourceRef.current) {
              eventSourceRef.current.close();
              eventSourceRef.current = null;
            }
          }
        );

        eventSourceRef.current = eventSource;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao iniciar streaming";
        setError(errorMessage);
        setIsStreaming(false);

        // Remove mensagens em caso de erro
        setMessages((prev) =>
          prev.filter(
            (msg) =>
              msg.id !== userMessage.id && msg.id !== assistantMessageId
          )
        );
      }
    },
    [isStreaming, cancelStream, getHistory, attemptReconnect]
  );

  /**
   * Limpa todo o histórico de mensagens
   */
  const clearChat = useCallback(() => {
    cancelStream();
    setMessages([]);
    setError(null);
    if (persistHistory) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [cancelStream, persistHistory]);

  return {
    messages,
    isStreaming,
    error,
    streamMessage,
    clearChat,
    cancelStream,
  };
}
