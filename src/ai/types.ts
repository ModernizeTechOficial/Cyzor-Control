export interface ChatRequest {
  message: string;
  context?: Record<string, any>; // Flexible context
  userId: string;
  workspaceId: string; // Changed to string
  agentId: string; // Add agentId
}

export interface ChatResponse {
  message: string;
  provider: string;
  model: string;
  duration: number;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  isActive: boolean;
}

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  modelId: string;
  temperature: number;
}

export interface AIProvider {
  name: string;
  generate(request: ChatRequest, agent: AIAgent): Promise<ChatResponse>;
}
