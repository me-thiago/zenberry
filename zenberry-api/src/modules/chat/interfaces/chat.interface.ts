export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatHistoryItem extends ChatMessage {
  timestamp?: Date;
}

export interface AgentConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  maxIterations: number;
}

export interface ToolCallResult {
  toolName: string;
  input: any;
  output: string;
  success: boolean;
}
