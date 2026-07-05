import { AIProvider, ChatRequest, ChatResponse, AIAgent } from '../types';
import { GeminiProvider } from '../providers/GeminiProvider';
import { GroqProvider } from '../providers/GroqProvider';
import { aiStore } from '../store';

export class AIRouterService {
  private getActiveProviders(): Map<string, AIProvider> {
    const providersMap = new Map<string, AIProvider>();
    const state = aiStore.getState();
    const activeProviders = state.providers.filter(p => p.status === 'Ativo');
    console.log(`[AIRouterService] Active providers: ${activeProviders.map(p => p.name).join(', ')}`);

    for (const p of activeProviders) {
      if (p.name === 'Gemini') {
        const key = p.apiKey || process.env.GEMINI_API_KEY;
        console.log(`[AIRouterService] Gemini key present: ${!!key}`);
        if (key) {
          providersMap.set('Gemini', new GeminiProvider(key));
        }
      } else if (p.name === 'Groq') {
        const key = p.apiKey || (typeof process !== 'undefined' ? process.env.GROQ_API_KEY : '');
        console.log(`[AIRouterService] Groq key present: ${!!key}`);
        providersMap.set('Groq', new GroqProvider(key || ''));
      } else {
        // Stub provider for others
        providersMap.set(p.name, {
          name: p.name,
          generate: async (req, agent) => ({
            message: `This is a mocked response from ${p.name} using agent: ${agent.name}`,
            provider: p.name,
            model: 'mocked',
            duration: 100,
            tokensUsed: { prompt: 10, completion: 20, total: 30 }
          })
        });
      }
    }

    if (providersMap.size === 0) {
      // Stub provider if nothing is active
      providersMap.set('Stub', {
        name: 'Stub',
        generate: async (req, agent) => ({
          message: 'This is a mocked response from the AI Engine using agent: ' + agent.name,
          provider: 'Stub',
          model: 'mocked',
          duration: 100,
          tokensUsed: { prompt: 10, completion: 20, total: 30 }
        })
      });
    }

    return providersMap;
  }

  async route(request: ChatRequest, agent: AIAgent, overrideProvider?: string): Promise<ChatResponse> {
    const providers = this.getActiveProviders();
    const state = aiStore.getState();

    // 1. Check override
    if (overrideProvider && overrideProvider !== 'Auto' && providers.has(overrideProvider)) {
        try {
            return await providers.get(overrideProvider)!.generate(request, agent);
        } catch(e: any) {
            console.error(`[AIRouterService] Override provider ${overrideProvider} failed:`, e);
            throw new Error(`Override provider ${overrideProvider} failed: ${e.message}`);
        }
    }

    // 2. Check agent's model provider
    const agentModel = state.models.find(m => m.id === agent.modelId);
    console.log(`[AIRouterService] Checking agent model: ${agent.modelId}, provider: ${agentModel?.provider}`);
    if (agentModel && providers.has(agentModel.provider)) {
       try {
           return await providers.get(agentModel.provider)!.generate(request, agent);
       } catch(e: any) {
           console.error(`[AIRouterService] Agent model provider ${agentModel.provider} failed, falling back...`, e);
       }
    } else {
        console.warn(`[AIRouterService] Could not find provider for model: ${agent.modelId}`);
    }

    // 3. Check default provider
    const defaultProvider = state.settings?.defaultProvider;
    console.log(`[AIRouterService] Checking default provider: ${defaultProvider}`);
    if (defaultProvider && providers.has(defaultProvider)) {
      try {
        return await providers.get(defaultProvider)!.generate(request, agent);
      } catch(e) {
        console.error(`[AIRouterService] Default provider ${defaultProvider} failed, trying next...`, e);
      }
    }

    // 4. Fallback logic
    console.log(`[AIRouterService] Trying fallback providers...`);
    for (const [name, provider] of providers) {
      if (name === overrideProvider || name === defaultProvider || (agentModel && name === agentModel.provider)) continue;
      try {
        console.log(`[AIRouterService] Trying fallback provider: ${name}`);
        return await provider.generate(request, agent);
      } catch (error) {
        console.error(`[AIRouterService] Provider ${name} failed, trying next...`, error);
      }
    }
    throw new Error('All AI providers failed or none are active');
  }
}
