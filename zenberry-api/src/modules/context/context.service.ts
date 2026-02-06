import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * ContextService
 * 
 * Responsável por carregar e cachear em memória todo o contexto necessário
 * para o agente (informações do site, produtos, etc.)
 */
@Injectable()
export class ContextService implements OnModuleInit {
  private readonly logger = new Logger(ContextService.name);
  private contextCache: string = '';
  private lastLoadTime: Date | null = null;

  /**
   * Carrega automaticamente o contexto quando o módulo é inicializado
   */
  async onModuleInit() {
    await this.loadContext();
    this.logger.log('Context loaded and cached successfully');
  }

  /**
   * Carrega todos os arquivos .md da pasta data/ e concatena em uma string
   */
  private async loadContext(): Promise<void> {
    try {
      const dataPath = join(__dirname, 'data');
      
      // Lista dos arquivos de contexto a serem carregados (ordem importa!)
      const contextFiles = [
        '01_basic_science_cannabinoids.md',
        '02_extraction_spectrums.md',
        '03_benefits_wellness_guide.md',
        '04_dosage_consumption_guide.md',
        '05_safety_legality_compliance.md',
        '06_about_zenberry_faq.md',
      ];

      const contextParts: string[] = [];

      for (const fileName of contextFiles) {
        const filePath = join(dataPath, fileName);
        try {
          const content = await readFile(filePath, 'utf-8');
          contextParts.push(`\n\n=== ${fileName.toUpperCase()} ===\n${content}`);
        } catch (error) {
          this.logger.warn(`Failed to load context file ${fileName}: ${error.message}`);
        }
      }

      this.contextCache = contextParts.join('\n');
      this.lastLoadTime = new Date();
      
      this.logger.debug(`Loaded ${contextParts.length} context files, total size: ${this.contextCache.length} chars`);
    } catch (error) {
      this.logger.error('Failed to load context', error);
      throw error;
    }
  }

  /**
   * Retorna o contexto completo em cache
   */
  getContext(): string {
    if (!this.contextCache) {
      this.logger.warn('Context cache is empty');
    }
    return this.contextCache;
  }

  /**
   * Força reload do contexto (útil para atualizações)
   */
  async reloadContext(): Promise<void> {
    this.logger.log('Reloading context...');
    await this.loadContext();
  }

  /**
   * Retorna informações sobre o cache
   */
  getCacheInfo() {
    return {
      size: this.contextCache.length,
      lastLoadTime: this.lastLoadTime,
      isEmpty: !this.contextCache,
    };
  }

  /**
   * Busca produtos específicos no contexto usando palavras-chave
   */
  searchProducts(keywords: string): string {
    const lowerKeywords = keywords.toLowerCase();
    const lines = this.contextCache.split('\n');
    
    const relevantLines: string[] = [];
    let captureBlock = false;
    let blockContent: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Detecta início de bloco de produto (### título)
      if (line.startsWith('###')) {
        // Se já estava capturando um bloco, salva-o
        if (captureBlock && blockContent.length > 0) {
          relevantLines.push(...blockContent);
        }
        
        // Reseta para novo bloco
        blockContent = [line];
        captureBlock = line.toLowerCase().includes(lowerKeywords);
      } else if (blockContent.length > 0) {
        // Continua capturando o bloco atual
        blockContent.push(line);
        
        // Também marca para captura se encontrar keyword no conteúdo
        if (line.toLowerCase().includes(lowerKeywords)) {
          captureBlock = true;
        }
      }
    }

    // Adiciona último bloco se relevante
    if (captureBlock && blockContent.length > 0) {
      relevantLines.push(...blockContent);
    }

    return relevantLines.length > 0 
      ? relevantLines.join('\n') 
      : `Nenhum produto encontrado para: ${keywords}`;
  }

  /**
   * Extrai informações específicas do contexto
   */
  getInfoSection(sectionName: string): string {
    const lines = this.contextCache.split('\n');
    const sectionStart = lines.findIndex(line => 
      line.toLowerCase().includes(sectionName.toLowerCase())
    );

    if (sectionStart === -1) {
      return `Seção "${sectionName}" não encontrada no contexto.`;
    }

    // Captura até a próxima seção ## ou fim
    const sectionLines: string[] = [];
    for (let i = sectionStart; i < lines.length; i++) {
      const line = lines[i];
      
      // Para quando encontrar outra seção de mesmo nível
      if (i > sectionStart && line.startsWith('##') && !line.startsWith('###')) {
        break;
      }
      
      sectionLines.push(line);
    }

    return sectionLines.join('\n');
  }
}
