import { IAIProvider, AIMessage, AITool, AIResponse } from '../AIProvider';

export class ClaudeProvider implements IAIProvider {
  async chat(messages: AIMessage[], tools?: AITool[]): Promise<AIResponse> {
    throw new Error("ClaudeProvider not fully implemented. Use OpenRouterProvider.");
  }
}
