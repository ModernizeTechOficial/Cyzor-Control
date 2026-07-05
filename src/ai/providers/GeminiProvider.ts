import { AIProvider, ChatRequest, ChatResponse, ModelInfo, AIAgent } from '../types';
import { GoogleGenAI } from "@google/genai";

export class GeminiProvider implements AIProvider {
  name = 'Gemini';
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ 
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } }
    });
  }

  async generate(request: ChatRequest, agent: AIAgent): Promise<ChatResponse> {
    const start = Date.now();
    let modelToUse = agent.modelId?.includes('gemini') ? agent.modelId : 'gemini-1.5-flash-latest';
    if (modelToUse === 'gemini-3.5-flash') {
      modelToUse = 'gemini-1.5-flash-latest';
    }
    
    try {
      const response = await this.ai.models.generateContent({
        model: modelToUse,
        contents: request.message,
        config: {
          systemInstruction: agent.systemPrompt,
          temperature: agent.temperature
        }
      });

      return {
        message: response.text || '',
        provider: this.name,
        model: modelToUse,
        duration: Date.now() - start,
        tokensUsed: {
          prompt: response.usageMetadata?.promptTokenCount || 0,
          completion: response.usageMetadata?.candidatesTokenCount || 0,
          total: response.usageMetadata?.totalTokenCount || 0
        }
      };
    } catch (error) {
      console.error('Gemini generate error:', error);
      throw error;
    }
  }
}
