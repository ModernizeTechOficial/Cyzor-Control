import { IAIProvider, AIMessage, AITool, AIResponse } from '../AIProvider';

export class DeepSeekProvider implements IAIProvider {
  async chat(messages: AIMessage[], tools?: AITool[]): Promise<AIResponse> {
    throw new Error("DeepSeekProvider not fully implemented. Use OpenRouterProvider.");
  }
}
