/**
 * useChat Hook
 * Gerencia estado de mensagens, envio, rate limiting e tratamento de erros
 */

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Message, ChatHistory } from "@/src/types/message";
import { chatService } from "@/src/services/client/chat-api";

interface UseChatOptions {
  maxMessagesPerMinute?: number;
  cooldownSeconds?: number;
  persistHistory?: boolean;
}

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string, category?: string) => Promise<void>;
  clearChat: () => void;
  isRateLimited: boolean;
  remainingCooldown: number;
}

const STORAGE_KEY = "zenberry_chat_history";

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const {
    maxMessagesPerMinute = 10,
    cooldownSeconds = 2,
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

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [remainingCooldown, setRemainingCooldown] = useState(0);

  // Refs para rate limiting
  const messageTimestamps = useRef<number[]>([]);
  const lastMessageTime = useRef<number>(0);
  const cooldownTimer = useRef<NodeJS.Timeout | null>(null);

  // Persiste mensagens no localStorage
  useEffect(() => {
    if (persistHistory && messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages, persistHistory]);

  // Limpa cooldown timer ao desmontar
  useEffect(() => {
    return () => {
      if (cooldownTimer.current) {
        clearInterval(cooldownTimer.current);
      }
    };
  }, []);

  /**
   * Verifica se o usuário está dentro do rate limit
   */
  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Remove timestamps antigos (> 1 minuto)
    messageTimestamps.current = messageTimestamps.current.filter(
      (timestamp) => timestamp > oneMinuteAgo
    );

    // Verifica se excedeu o limite de mensagens por minuto
    if (messageTimestamps.current.length >= maxMessagesPerMinute) {
      setError(
        `Limite de ${maxMessagesPerMinute} mensagens por minuto atingido. Aguarde um momento.`
      );
      setIsRateLimited(true);
      return false;
    }

    // Verifica cooldown entre mensagens
    const timeSinceLastMessage = now - lastMessageTime.current;
    if (
      lastMessageTime.current > 0 &&
      timeSinceLastMessage < cooldownSeconds * 1000
    ) {
      const remaining = Math.ceil(
        (cooldownSeconds * 1000 - timeSinceLastMessage) / 1000
      );
      setRemainingCooldown(remaining);
      setIsRateLimited(true);

      // Inicia timer de contagem regressiva
      if (cooldownTimer.current) {
        clearInterval(cooldownTimer.current);
      }

      cooldownTimer.current = setInterval(() => {
        setRemainingCooldown((prev) => {
          if (prev <= 1) {
            setIsRateLimited(false);
            if (cooldownTimer.current) {
              clearInterval(cooldownTimer.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setError(`Aguarde ${remaining} segundo(s) antes de enviar outra mensagem.`);
      return false;
    }

    setIsRateLimited(false);
    setRemainingCooldown(0);
    return true;
  }, [maxMessagesPerMinute, cooldownSeconds]);

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
   * Envia uma mensagem para o chatbot
   */
  const sendMessage = useCallback(
    async (content: string, category?: string) => {
      // Validações
      if (!content.trim()) {
        setError("Mensagem não pode estar vazia");
        return;
      }

      if (content.length > 2000) {
        setError("Mensagem muito longa (máximo 2000 caracteres)");
        return;
      }

      // Rate limiting
      if (!checkRateLimit()) {
        return;
      }

      setError(null);
      setIsLoading(true);

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Atualiza rate limiting
      const now = Date.now();
      messageTimestamps.current.push(now);
      lastMessageTime.current = now;

      try {
        const response = await chatService.ask({
          question: content.trim(),
          history: getHistory(),
          category,
        });

        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response.answer,
          timestamp: new Date(response.timestamp),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);

        // Remove mensagem do usuário em caso de erro
        setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
      } finally {
        setIsLoading(false);
      }
    },
    [checkRateLimit, getHistory]
  );

  /**
   * Limpa todo o histórico de mensagens
   */
  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    if (persistHistory) {
      localStorage.removeItem(STORAGE_KEY);
    }
    messageTimestamps.current = [];
    lastMessageTime.current = 0;
    setIsRateLimited(false);
    setRemainingCooldown(0);
  }, [persistHistory]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    isRateLimited,
    remainingCooldown,
  };
}
