import { AIProvider, ChatRequest, ChatResponse, AIAgent } from '../types';

export class GroqProvider implements AIProvider {
  name = 'Groq';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private mapModel(modelId: string): string {
    if (modelId.includes('llama-3-70b')) return 'llama-3.3-70b-versatile';
    if (modelId.includes('llama-3-8b')) return 'llama-3.3-8b-instant';
    return modelId || 'llama-3.3-8b-instant';
  }

  async generate(request: ChatRequest, agent: AIAgent): Promise<ChatResponse> {
    const start = Date.now();
    const actualModel = this.mapModel(agent.modelId);
    
    // Check if key is present
    if (!this.apiKey || this.apiKey === 'mock_groq_key' || this.apiKey.startsWith('mock_')) {
      return {
        message: 'Configuração da API Groq pendente. Por favor, configure sua GROQ_API_KEY no painel de segredos.',
        provider: this.name,
        model: actualModel,
        duration: 50,
        tokensUsed: { prompt: 0, completion: 0, total: 0 }
      };
    }

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: actualModel,
          messages: [
            { role: 'system', content: agent.systemPrompt || 'You are a helpful assistant.' },
            { role: 'user', content: request.message }
          ],
          temperature: agent.temperature || 0.7,
        })
      });

      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`Groq API Error: ${res.status} ${res.statusText} - ${errorBody}`);
      }

      const data = await res.json();
      const message = data.choices[0]?.message?.content || '';

      return {
        message,
        provider: this.name,
        model: data.model || actualModel,
        duration: Date.now() - start,
        tokensUsed: {
          prompt: data.usage?.prompt_tokens || 0,
          completion: data.usage?.completion_tokens || 0,
          total: data.usage?.total_tokens || 0
        }
      };
    } catch (error) {
      console.error('Groq generate error:', error);
      throw error;
    }
  }
}
