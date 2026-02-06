import {
  Controller,
  Post,
  Body,
  Get,
  Sse,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChatService } from './chat.service';
import { AskQuestionDto, ChatResponseDto } from './dto/chat.dto';

/**
 * ChatController
 * 
 * Expõe endpoints REST para o chatbot
 */
@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  /**
   * POST /chat/ask
   * Endpoint principal para fazer perguntas ao chatbot
   * Rate limited: 10 requests per minute to prevent API cost abuse
   */
  @Post('ask')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Fazer pergunta ao assistente Zenberry',
    description: 'Envia uma pergunta e recebe resposta do chatbot inteligente',
  })
  @ApiResponse({
    status: 200,
    description: 'Resposta gerada com sucesso',
    type: ChatResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Requisição inválida (mensagem muito curta/longa, conteúdo inválido)',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno ao processar pergunta',
  })
  async ask(@Body() dto: AskQuestionDto): Promise<ChatResponseDto> {
    try {
      this.logger.log(`Received question: ${dto.question.substring(0, 50)}...`);
      if (dto.category) {
        this.logger.log(`Category filter: ${dto.category}`);
      }

      // Valida histórico se fornecido
      if (dto.history && !this.chatService.validateHistory(dto.history)) {
        throw new BadRequestException('Formato de histórico inválido');
      }

      // Processa pergunta com categoria opcional
      const answer = await this.chatService.ask(dto.question, dto.history || [], dto.category);

      return {
        answer,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error in ask endpoint', error);
      throw error;
    }
  }

  /**
   * POST /chat/stream
   * Endpoint com streaming SSE para respostas em tempo real
   * Rate limited: 10 requests per minute to prevent API cost abuse
   */
  @Post('stream')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Sse()
  @ApiOperation({
    summary: 'Stream de resposta do assistente (SSE)',
    description: 'Recebe resposta em tempo real usando Server-Sent Events',
  })
  @ApiResponse({
    status: 200,
    description: 'Stream de resposta iniciado',
  })
  streamChat(@Body() dto: AskQuestionDto): Observable<MessageEvent> {
    this.logger.log(`Starting stream for question: ${dto.question.substring(0, 50)}...`);

    // Valida histórico
    if (dto.history && !this.chatService.validateHistory(dto.history)) {
      throw new BadRequestException('Formato de histórico inválido');
    }

    // Cria observable a partir do generator
    return from(this.streamGenerator(dto)).pipe(
      map((data) => ({
        data,
      } as MessageEvent)),
    );
  }

  /**
   * Generator helper para streaming
   */
  private async *streamGenerator(dto: AskQuestionDto): AsyncGenerator<string> {
    try {
      const stream = this.chatService.askStream(dto.question, dto.history || []);
      
      for await (const chunk of stream) {
        yield JSON.stringify({ chunk });
      }

      // Sinaliza fim do stream
      yield JSON.stringify({ done: true });
    } catch (error) {
      this.logger.error('Error in stream generator', error);
      yield JSON.stringify({ error: 'Erro ao processar stream' });
    }
  }
}
