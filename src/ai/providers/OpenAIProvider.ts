import { IAIProvider, AIMessage, AITool, AIResponse } from '../AIProvider';

export class OpenAIProvider implements IAIProvider {
  async chat(messages: AIMessage[], tools?: AITool[]): Promise<AIResponse> {
    throw new Error("OpenAIProvider not fully implemented. Use OpenRouterProvider.");
  }
}
