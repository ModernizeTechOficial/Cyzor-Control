export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AITool {
  name: string;
  description: string;
  parameters: any;
}

export interface AIToolCall {
  name: string;
  arguments: any;
}

export interface AIResponse {
  text: string;
  toolCalls?: AIToolCall[];
}

export interface IAIProvider {
  chat(messages: AIMessage[], tools?: AITool[]): Promise<AIResponse>;
}

import { GeminiProvider } from './providers/GeminiProvider';
import { OpenRouterProvider } from './providers/OpenRouterProvider';
import { OpenAIProvider } from './providers/OpenAIProvider';
import { ClaudeProvider } from './providers/ClaudeProvider';
import { DeepSeekProvider } from './providers/DeepSeekProvider';

export function getAIProvider(): IAIProvider {
  const providerType = process.env.AI_PROVIDER || 'gemini';
  
  switch (providerType) {
    case 'openrouter':
      return new OpenRouterProvider();
    case 'openai':
      return new OpenAIProvider();
    case 'claude':
      return new ClaudeProvider();
    case 'deepseek':
      return new DeepSeekProvider();
    case 'gemini':
    default:
      return new GeminiProvider();
  }
}
