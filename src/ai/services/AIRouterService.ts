import { AIProvider, ChatRequest, ChatResponse } from '../types';
import { GeminiProvider } from '../providers/GeminiProvider';

export class AIRouterService {
  private providers: Map<string, AIProvider> = new Map();

  constructor() {
    // In production, load from DB
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      this.providers.set('Gemini', new GeminiProvider(geminiKey));
    }
  }

  async chat(request: ChatRequest, providerName?: string): Promise<ChatResponse> {
    if (providerName && this.providers.has(providerName)) {
      return await this.providers.get(providerName)!.chat(request);
    }

    // Fallback logic
    for (const [name, provider] of this.providers) {
      try {
        return await provider.chat(request);
      } catch (error) {
        console.error(`Provider ${name} failed, trying next...`);
      }
    }

    throw new Error('All AI providers failed');
  }
}
