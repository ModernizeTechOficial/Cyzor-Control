export interface ChatRequest {
  message: string;
  context?: string;
  userId: string;
  workspaceId: number;
}

export interface ChatResponse {
  message: string;
  provider: string;
  model: string;
  duration: number;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
}

export interface AIProvider {
  name: string;
  chat(request: ChatRequest): Promise<ChatResponse>;
  models(): Promise<ModelInfo[]>;
  validateKey(): Promise<boolean>;
}
