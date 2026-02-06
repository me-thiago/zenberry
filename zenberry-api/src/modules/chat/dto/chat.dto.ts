import { IsString, IsNotEmpty, IsArray, ValidateNested, IsOptional, MaxLength, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para mensagem individual no histórico
 */
export class ChatMessageDto {
  @ApiProperty({
    description: 'Role da mensagem',
    enum: ['user', 'assistant'],
    example: 'user',
  })
  @IsString()
  @IsNotEmpty()
  role: 'user' | 'assistant';

  @ApiProperty({
    description: 'Conteúdo da mensagem',
    example: 'Qual o melhor óleo de CBD para iniciantes?',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}

/**
 * DTO para requisição de chat
 */
export class AskQuestionDto {
  @ApiProperty({
    description: 'Pergunta do usuário',
    example: 'Quais produtos vocês têm para ansiedade?',
    minLength: 2,
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Pergunta muito curta. Mínimo 2 caracteres.' })
  @MaxLength(2000, { message: 'Pergunta muito longa. Máximo 2000 caracteres.' })
  question: string;

  @ApiPropertyOptional({
    description: 'Histórico de mensagens anteriores (opcional)',
    type: [ChatMessageDto],
    example: [
      { role: 'user', content: 'Olá!' },
      { role: 'assistant', content: 'Olá! Como posso ajudar?' },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  history?: ChatMessageDto[];

  @ApiPropertyOptional({
    description: 'Categoria de produtos para filtrar recomendações (opcional)',
    example: 'sleep',
  })
  @IsOptional()
  @IsString()
  category?: string;
}

/**
 * DTO para resposta de chat
 */
export class ChatResponseDto {
  @ApiProperty({
    description: 'Resposta do assistente',
    example: 'Temos vários produtos que podem auxiliar no relaxamento...',
  })
  answer: string;

  @ApiProperty({
    description: 'Timestamp da resposta',
    example: '2025-12-08T10:30:00.000Z',
  })
  timestamp: string;
}
