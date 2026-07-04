import { AIProvider, ChatRequest, ChatResponse, ModelInfo } from '../types';
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

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const start = Date.now();
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3.5-flash', // Default model
        contents: request.message,
      });

      return {
        message: response.text || '',
        provider: this.name,
        model: 'gemini-3.5-flash',
        duration: Date.now() - start,
      };
    } catch (error) {
      console.error('Gemini chat error:', error);
      throw error;
    }
  }

  async models(): Promise<ModelInfo[]> {
    return [
      { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', provider: this.name },
      { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro', provider: this.name },
    ];
  }

  async validateKey(): Promise<boolean> {
    try {
      await this.models();
      return true;
    } catch {
      return false;
    }
  }
}
