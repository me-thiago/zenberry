// @ts-nocheck
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { ContextService } from '../context/context.service';
import { ChatProductsService } from './services/chat-products.service';

/**
 * ChatTools
 * 
 * Define as ferramentas (tools) que o agente pode usar para responder perguntas
 */
export class ChatTools {
  constructor(
    private readonly contextService: ContextService,
    private readonly chatProductsService: ChatProductsService,
  ) {}

  /**
   * Ferramenta: Buscar produtos no catálogo Shopify
   */
  getProductSearchTool() {
    return new DynamicStructuredTool({
      name: 'search_products',
      description: 
        'Busca produtos REAIS no catálogo da Zenberry (Shopify). ' +
        'Use esta ferramenta quando o usuário perguntar sobre produtos específicos, ' +
        'preços, disponibilidade, ingredientes ou características de produtos. ' +
        'Exemplos: "qual óleo tem 20% de CBD?", "produtos para dormir", "preço do creme", "produtos disponíveis".',
      schema: z.object({
        keywords: z.string().describe(
          'Palavras-chave para buscar produtos. ' +
          'Exemplos: "óleo 20%", "gummies sleep", "creme", "cápsula 50mg", "CBD", "pet"'
        ),
      }),
      func: async ({ keywords }: { keywords: string }) => {
        try {
          const results = await this.chatProductsService.searchProducts(keywords);
          return results;
        } catch (error) {
          return `Erro ao buscar produtos: ${error.message}`;
        }
      },
    });
  }

  /**
   * Ferramenta: Obter informações da empresa/site
   */
  getSiteInfoTool() {
    return new DynamicStructuredTool({
      name: 'get_site_info',
      description:
        'Recupera informações sobre a empresa Zenberry, como missão, valores, ' +
        'política de envio, contato, horário de atendimento, etc. ' +
        'Use quando o usuário perguntar sobre a empresa, frete, contato ou políticas.',
      schema: z.object({
        section: z.string().describe(
          'Nome da seção a buscar. ' +
          'Exemplos: "contato", "envio", "sobre", "valores", "missão"'
        ),
      }),
      func: async ({ section }: { section: string }) => {
        try {
          const info = this.contextService.getInfoSection(section);
          return info;
        } catch (error) {
          return `Erro ao buscar informações: ${error.message}`;
        }
      },
    });
  }

  /**
   * Ferramenta: Obter contexto completo (use com moderação)
   */
  getFullContextTool() {
    return new DynamicStructuredTool({
      name: 'get_full_context',
      description:
        'Retorna TODO o contexto disponível (site + produtos). ' +
        'Use APENAS quando precisar de uma visão geral completa ou quando ' +
        'as outras ferramentas não foram suficientes. EVITE usar esta ferramenta ' +
        'para perguntas específicas - prefira search_products ou get_site_info.',
      schema: z.object({
        reason: z.string().describe('Por que você precisa do contexto completo?'),
      }),
      func: async ({ reason }: { reason: string }) => {
        try {
          console.log(`[Tool] Requesting full context. Reason: ${reason}`);
          const context = this.contextService.getContext();
          
          // Limita retorno se muito grande (segurança)
          if (context.length > 10000) {
            return context.substring(0, 10000) + '\n\n[... contexto truncado ...]';
          }
          
          return context;
        } catch (error) {
          return `Erro ao obter contexto: ${error.message}`;
        }
      },
    });
  }

  /**
   * Ferramenta: Calcular dosagem recomendada (exemplo de cálculo)
   */
  getDosageCalculatorTool() {
    return new DynamicStructuredTool({
      name: 'calculate_dosage',
      description:
        'Calcula uma sugestão de dosagem inicial baseada no peso do usuário. ' +
        'IMPORTANTE: Sempre reforce que esta é apenas uma sugestão geral e que ' +
        'o usuário deve consultar um profissional de saúde.',
      schema: z.object({
        weight_kg: z.number().describe('Peso do usuário em quilogramas'),
        concentration: z.enum(['low', 'medium', 'high']).describe(
          'Concentração desejada: low (10%), medium (20%), high (30%)'
        ),
      }),
      func: async ({ weight_kg, concentration }: { weight_kg: number; concentration: 'low' | 'medium' | 'high' }) => {
        // Fórmula simples: 0.25mg CBD por kg de peso corporal (dose inicial conservadora)
        const baseDoseMg = weight_kg * 0.25;
        
        let recommendedProduct = '';
        let drops = 0;

        if (concentration === 'low') {
          // Óleo 10% = ~5mg CBD por gota
          recommendedProduct = 'Óleo de CBD 10%';
          drops = Math.ceil(baseDoseMg / 5);
        } else if (concentration === 'medium') {
          // Óleo 20% = ~10mg CBD por gota
          recommendedProduct = 'Óleo de CBD 20%';
          drops = Math.ceil(baseDoseMg / 10);
        } else {
          // Óleo 30% = ~15mg CBD por gota
          recommendedProduct = 'Óleo de CBD 30%';
          drops = Math.ceil(baseDoseMg / 15);
        }

        return (
          `Baseado no peso de ${weight_kg}kg, uma dose inicial conservadora seria ` +
          `aproximadamente ${baseDoseMg.toFixed(1)}mg de CBD.\n\n` +
          `Com o ${recommendedProduct}, isso seria cerca de ${drops} gota(s) sublingual(is).\n\n` +
          `⚠️ IMPORTANTE: Esta é apenas uma sugestão GERAL e conservadora. ` +
          `A dosagem ideal varia muito de pessoa para pessoa. ` +
          `SEMPRE consulte um médico ou profissional de saúde qualificado antes de iniciar ` +
          `o uso de CBD, especialmente se você toma outros medicamentos.`
        );
      },
    });
  }

  /**
   * Retorna todas as ferramentas disponíveis
   */
  getAllTools() {
    return [
      this.getProductSearchTool(),
      this.getSiteInfoTool(),
      this.getDosageCalculatorTool(),
      this.getFullContextTool(),
    ];
  }
}
