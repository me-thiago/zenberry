import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ChatAgent } from './chat.agent';
import { BaseMessage } from '@langchain/core/messages';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * ChatService
 * 
 * Orquestra o fluxo de chat, validações, sanitização e lógica de negócio
 */
@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly MAX_MESSAGE_LENGTH = 2000;
  private readonly MIN_MESSAGE_LENGTH = 2;
  private readonly LOW_QUALITY_THRESHOLD = 20;

  constructor(private readonly chatAgent: ChatAgent) {}

  /**
   * Processa uma pergunta do usuário e retorna a resposta
   */
  async ask(question: string, history: ChatMessage[] = [], category?: string): Promise<string> {
    try {
      // Validação e sanitização
      const sanitizedQuestion = this.sanitizeInput(question);
      this.validateInput(sanitizedQuestion);

      // Executa o agente diretamente com o histórico no formato correto
      const response = await this.chatAgent.runAgent(sanitizedQuestion, history, category);

      // Valida qualidade da resposta
      if (this.isLowQuality(response)) {
        this.logger.warn('Low quality response detected, returning fallback');
        return this.getFallbackResponse();
      }

      return response;
    } catch (error) {
      this.logger.error('Error in ask method', error);
      throw new BadRequestException(
        'Não foi possível processar sua pergunta. Por favor, tente novamente.',
      );
    }
  }

  /**
   * Processa pergunta com streaming de resposta
   */
  async *askStream(
    question: string,
    history: ChatMessage[] = [],
  ): AsyncGenerator<string> {
    try {
      // Validação e sanitização
      const sanitizedQuestion = this.sanitizeInput(question);
      this.validateInput(sanitizedQuestion);

      // Stream do agente diretamente
      yield* this.chatAgent.streamAgent(sanitizedQuestion, history);
    } catch (error) {
      this.logger.error('Error in askStream method', error);
      yield 'Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente.';
    }
  }

  /**
   * Sanitiza input do usuário
   */
  private sanitizeInput(input: string): string {
    if (!input) return '';

    return input
      .trim()
      .replace(/[<>]/g, '') // Remove tags HTML básicas
      .substring(0, this.MAX_MESSAGE_LENGTH); // Limita tamanho
  }

  /**
   * Valida input do usuário
   */
  private validateInput(input: string): void {
    if (!input || input.length < this.MIN_MESSAGE_LENGTH) {
      throw new BadRequestException(
        `Mensagem muito curta. Mínimo ${this.MIN_MESSAGE_LENGTH} caracteres.`,
      );
    }

    if (input.length > this.MAX_MESSAGE_LENGTH) {
      throw new BadRequestException(
        `Mensagem muito longa. Máximo ${this.MAX_MESSAGE_LENGTH} caracteres.`,
      );
    }

    // Detecta spam ou conteúdo malicioso básico
    const spamPatterns = [
      /(.)\1{10,}/, // Caractere repetido 10+ vezes
      /https?:\/\/[^\s]+/gi, // URLs (opcional - pode querer permitir)
    ];

    for (const pattern of spamPatterns) {
      if (pattern.test(input)) {
        throw new BadRequestException('Conteúdo inválido detectado.');
      }
    }
  }

  /**
   * Verifica se a resposta é de baixa qualidade
   */
  private isLowQuality(response: string): boolean {
    if (!response || response.length < this.LOW_QUALITY_THRESHOLD) {
      return true;
    }

    // Padrões de respostas ruins
    const badPatterns = [
      /^(sim|não|ok|talvez)$/i,
      /^.{1,5}$/,
      /erro/i,
      /desculpe, não/i,
    ];

    return badPatterns.some(pattern => pattern.test(response));
  }

  /**
   * Retorna resposta fallback quando algo dá errado
   */
  private getFallbackResponse(): string {
    return (
      'Desculpe, não consegui processar sua pergunta adequadamente. ' +
      'Você poderia reformular ou me dar mais detalhes? ' +
      'Estou aqui para ajudar com informações sobre nossos produtos de CBD, ' +
      'preços, ingredientes, e políticas da Zenberry. 😊'
    );
  }

  /**
   * Valida histórico de mensagens
   */
  validateHistory(history: ChatMessage[]): boolean {
    if (!Array.isArray(history)) return false;

    return history.every(
      msg =>
        msg &&
        typeof msg === 'object' &&
        ['user', 'assistant'].includes(msg.role) &&
        typeof msg.content === 'string',
    );
  }
}
