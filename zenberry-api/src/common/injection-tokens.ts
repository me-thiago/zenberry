export const TOKENS = {
    EMAIL: Symbol('EmailPort'),
    CACHE: Symbol('CachePort'),
    BUCKET: Symbol('BucketPort'),
    
    // AI Provider tokens
    AI_ANTHROPIC: Symbol('AnthropicAIPort'),
    AI_GEMINI: Symbol('GeminiAIPort'),
    AI_GPT_OSS: Symbol('GPTOSSAIPort'),
    AI_QWEN: Symbol('QwenAIPort'),
    AI_OPENAI: Symbol('OpenAIPort'),
    AI_PERPLEXITY: Symbol('PerplexityAIPort'),
    AI_MANAGER: Symbol('AIManagerService'),

    // Transcription Provider tokens
    TRANSCRIPTION_ASSEMBLY_AI: Symbol('AssemblyAITranscriptionPort'),
    TRANSCRIPTION_WHISPER_LOCAL: Symbol('WhisperLocalTranscriptionPort'),
    TRANSCRIPTION_MANAGER: Symbol('TranscriptionManagerService'),
} as const;