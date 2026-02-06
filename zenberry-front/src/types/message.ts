export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatHistory {
  role: "user" | "assistant";
  content: string;
}

export interface AskRequest {
  question: string;
  history?: ChatHistory[];
  category?: string;
}

export interface AskResponse {
  question: string;
  answer: string;
  timestamp: string;
}

export interface StreamRequest {
  question: string;
  history?: ChatHistory[];
}

export interface HealthResponse {
  status: string;
  model: string;
  contextLoaded: boolean;
  timestamp: string;
}

export interface InfoResponse {
  model: string;
  contextSize: number;
  maxTokens: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface ChatError {
  code: string;
  message: string;
  timestamp: Date;
}
