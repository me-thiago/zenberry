import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { ContextService } from '../context/context.service';
import { ChatTools } from './chat.tools';
import { ChatProductsService } from './services/chat-products.service';

/**
 * ChatAgent
 *
 * Implementa o agente inteligente usando LangChain + Google Gemini Flash 2.5
 */
@Injectable()
export class ChatAgent implements OnModuleInit {
  private readonly logger = new Logger(ChatAgent.name);
  private model: ChatGoogleGenerativeAI;
  private chatTools: ChatTools;

  /**
   * System Prompt forte e seguro para o assistente Zenberry
   */
  private readonly SYSTEM_PROMPT = `
    You are the official assistant for Zenberry, a company specialized in high-quality CBD products.

    # CRITICAL RULES
    ⚠️ NEVER make medical diagnoses or prescribe treatments
    ⚠️ NEVER claim that CBD treats, cures, or prevents diseases
    ⚠️ ALWAYS recommend consulting a qualified healthcare professional
    ⚠️ Use ONLY information from the provided context

    # HOW TO RESPOND
    ✅ Be cordial, professional, and helpful
    ✅ Explain GENERAL benefits of CBD (relaxation, wellness)
    ✅ Provide information about products, prices, ingredients
    ✅ Reinforce that CBD is not a medication
    ✅ ALWAYS respond in English, regardless of the language used in the question
    ✅ When mentioning a product, ALWAYS include its link in markdown format: [Product Name](product_url)
    ✅ Use the product links provided in the catalog to help users navigate directly to products

    # COMPANY INFORMATION
    {context}

    # AVAILABLE PRODUCT CATALOG
    {products}`;

  constructor(
    private readonly contextService: ContextService,
    private readonly chatProductsService: ChatProductsService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Inicializa o modelo após o módulo estar pronto (env carregado)
   */
  onModuleInit() {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY') ||
                   this.configService.get<string>('GOOGLE_AI_API_KEY');

    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY or GOOGLE_AI_API_KEY must be set');
    }

    this.model = new ChatGoogleGenerativeAI({
      model: 'gemini-2.5-flash',
      temperature: 0.7,
      maxOutputTokens: 2048,
      apiKey,
    });

    this.chatTools = new ChatTools(this.contextService, this.chatProductsService);
    this.logger.log('ChatAgent initialized successfully');
  }

  /**
   * Executa o agente com uma pergunta e histórico opcional
   */
  async runAgent(
    question: string,
    chatHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
    category?: string,
  ): Promise<string> {
    try {
      // Pega contexto completo
      const context = this.contextService.getContext();

      // Carrega produtos do Shopify
      const products = await this.chatProductsService.getAllProducts();

      // Formata produtos para o contexto
      const productsContext = products.map(p =>
        `\n📦 ${p.title}\n   Categoria: ${p.productType || 'N/A'}\n   Preço: ${p.price}\n   ${p.available ? '✅ Disponível' : '❌ Indisponível'}\n   🔗 Link: ${p.url}\n   ${p.description.substring(0, 200)}${p.description.length > 200 ? '...' : ''}\n   Tags: ${p.tags.join(', ')}`
      ).join('\n---');

      // Instrução de filtro por categoria (se fornecida)
      let categoryInstruction = '';
      if (category) {
        categoryInstruction = `

    # CATEGORY FILTER (IMPORTANT)
    The user clicked on the "${category}" category card.
    PRIORITIZE recommending products that match this category.
    Look for products with tags, titles, or descriptions related to: ${category}
    Focus your recommendations on products most relevant to this specific need.
    `;
      }

      // Monta o system prompt com contexto + produtos + categoria
      const systemPrompt = this.SYSTEM_PROMPT
        .replace('{context}', context.substring(0, 5000))
        .replace('{products}', productsContext.substring(0, 10000))
        + categoryInstruction;

      // Converte histórico limitado (últimas 6 mensagens)
      const messages = [
        new SystemMessage(systemPrompt),
        ...chatHistory
          .slice(-6)
          .map((msg) =>
            msg.role === 'user'
              ? new HumanMessage(msg.content)
              : new AIMessage(msg.content),
          ),
        new HumanMessage(question),
      ];

      const result = await this.model.invoke(messages);

      return result.content as string;
    } catch (error) {
      this.logger.error(`Error in runAgent: ${error.message}`, error.stack);
      throw new Error(`Erro ao processar pergunta: ${error.message}`);
    }
  }

  /**
   * Executa o agente com streaming
   */
  async *streamAgent(
    question: string,
    chatHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  ): AsyncGenerator<string> {
    
    try {
      // Pega contexto
      const context = this.contextService.getContext();
      
      // Carrega produtos
      const products = await this.chatProductsService.getAllProducts();
      
      const productsContext = products.map(p =>
        `\n📦 ${p.title}\n   Categoria: ${p.productType || 'N/A'}\n   Preço: ${p.price}\n   ${p.available ? '✅ Disponível' : '❌ Indisponível'}\n   🔗 Link: ${p.url}\n   ${p.description.substring(0, 200)}${p.description.length > 200 ? '...' : ''}\n   Tags: ${p.tags.join(', ')}`
      ).join('\n---');
      
      const systemPrompt = this.SYSTEM_PROMPT
        .replace('{context}', context.substring(0, 5000))
        .replace('{products}', productsContext.substring(0, 10000));

      // Monta mensagens
      const messages = [
        new SystemMessage(systemPrompt),
        ...chatHistory
          .slice(-6)
          .map((msg) =>
            msg.role === 'user'
              ? new HumanMessage(msg.content)
              : new AIMessage(msg.content),
          ),
        new HumanMessage(question),
      ];

      // Stream do modelo
      const stream = await this.model.stream(messages);

      for await (const chunk of stream) {
        if (chunk.content) {
          yield chunk.content as string;
        }
      }
    } catch (error) {
      this.logger.error(`Error in streamAgent: ${error.message}`, error.stack);
      throw new Error(`Erro ao processar pergunta: ${error.message}`);
    }
  }

  /**
   * Converte array de mensagens simples para BaseMessage[]
   */
  convertToBaseMessages(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  ) {
    return messages.map((msg) => {
      if (msg.role === 'user') {
        return new HumanMessage(msg.content);
      } else {
        return new AIMessage(msg.content);
      }
    });
  }
}
