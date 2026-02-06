/**
 * Chat Service
 * Serviço para comunicação com a API de chat do backend NestJS
 */

import { apiAxios } from "@/src/config/axios";
import {
  AskRequest,
  AskResponse,
} from "@/src/types/message";

/**
 * Sanitiza o input do usuário
 * Remove HTML tags, limita caracteres e remove whitespace
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .trim()
    .substring(0, 2000); // Limite de 2000 caracteres
}

/**
 * Valida se a mensagem está dentro dos limites
 */
export function validateMessage(message: string): {
  valid: boolean;
  error?: string;
} {
  if (!message || message.trim().length === 0) {
    return { valid: false, error: "Mensagem não pode estar vazia" };
  }

  if (message.length > 2000) {
    return {
      valid: false,
      error: "Mensagem muito longa (máximo 2000 caracteres)",
    };
  }

  return { valid: true };
}

/**
 * Serviço de chat - chamadas diretas ao backend usando axios
 */
export const chatService = {
  /**
   * Faz uma pergunta simples ao chatbot (resposta JSON)
   */
  ask: async (request: AskRequest): Promise<AskResponse> => {
    const sanitizedQuestion = sanitizeInput(request.question);

    const validation = validateMessage(sanitizedQuestion);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    try {
      const { data } = await apiAxios.post<AskResponse>(
        "/chat/ask",
        {
          question: sanitizedQuestion,
          history: request.history || [],
          category: request.category,
        },
        {
          timeout: 60000, // 60 segundos para requisições de chat (IA pode demorar)
        }
      );

      return data;
    } catch (error) {
      if (error instanceof Error) {
        // Timeout error
        if (error.message.includes("timeout")) {
          throw new Error("Tempo esgotado. Por favor, tente novamente.");
        }
        throw error;
      }
      throw new Error("Erro de conexão. Por favor, verifique sua internet.");
    }
  },
};

/**
 * Cria conexão de streaming SSE com o chatbot
 * Retorna EventSource para receber chunks de resposta
 */
export function createStreamConnection(
  question: string,
  history: AskRequest["history"] = [],
  onMessage: (chunk: string) => void,
  onError: (error: Error) => void,
  onComplete: () => void
): EventSource {
  const sanitizedQuestion = sanitizeInput(question);

  const validation = validateMessage(sanitizedQuestion);
  if (!validation.valid) {
    setTimeout(
      () => onError(new Error(validation.error || "Erro de validação")),
      0
    );
    // Return a dummy EventSource that does nothing
    return new EventSource("");
  }

  // Encode parameters for GET request
  const params = new URLSearchParams({
    question: sanitizedQuestion,
    history: JSON.stringify(history || []),
  });

  const eventSource = new EventSource(`/api/chat/stream?${params.toString()}`);

  eventSource.onmessage = (event) => {
    try {
      const chunk = event.data;

      if (chunk === "[DONE]") {
        onComplete();
        eventSource.close();
        return;
      }

      // Envia chunk diretamente
      onMessage(chunk);
    } catch (error) {
      console.error("Error processing message:", error);
      onError(
        error instanceof Error ? error : new Error("Erro ao processar mensagem")
      );
    }
  };

  eventSource.onerror = (error) => {
    console.error("EventSource error:", error);
    eventSource.close();

    onError(new Error("Erro na conexão de streaming. Tentando reconectar..."));
  };

  return eventSource;
}
