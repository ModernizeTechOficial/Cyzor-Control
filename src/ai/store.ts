import { AIAgent, ModelInfo, AIProvider } from './types';
import { Agents as InitialAgents } from './agents';

export interface AIStoreState {
  agents: AIAgent[];
  models: ModelInfo[];
  providers: { name: string; status: string; models: number; latency: string; apiKey?: string }[];
  history: any[];
  settings: {
    defaultProvider: string;
    enableCache: boolean;
  };
}

const DEFAULT_STATE: AIStoreState = {
  agents: Object.values(InitialAgents),
  models: [
    { id: 'llama-3-70b', name: 'llama-3-70b', provider: 'Groq', contextWindow: 8000, isActive: true },
    { id: 'llama-3-8b', name: 'llama-3-8b', provider: 'Groq', contextWindow: 8000, isActive: true },
    { id: 'gemini-1.5-flash', name: 'gemini-1.5-flash', provider: 'Gemini', contextWindow: 128000, isActive: true }
  ],
  providers: [
    { name: 'Groq', status: 'Preparado', models: 2, latency: '40ms' },
    { name: 'Gemini', status: 'Ativo', models: 1, latency: '800ms' },
    { name: 'OpenAI', status: 'Preparado', models: 0, latency: '-' },
  ],
  history: [],
  settings: {
    defaultProvider: 'Gemini',
    enableCache: true
  }
};

class AIStore {
  private state: AIStoreState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    let saved = null;
    if (typeof window !== 'undefined' && window.localStorage) {
        saved = localStorage.getItem('cyzor_ai_store');
    }
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.state = { ...DEFAULT_STATE, ...parsed };
        
        // Migration: Fix old model IDs
        this.state.agents = this.state.agents.map(agent => {
          if (agent.modelId === 'groq-llama-3') {
            return { ...agent, modelId: 'llama-3-70b' };
          }
          return agent;
        });
        
        // Merge missing initial agents if new ones were added in code
        const agentIds = new Set(this.state.agents.map(a => a.id));
        for (const initial of Object.values(InitialAgents)) {
           if (!agentIds.has(initial.id)) {
              this.state.agents.push(initial);
           }
        }
      } catch (e) {
        this.state = DEFAULT_STATE;
      }
    } else {
      this.state = DEFAULT_STATE;
    }
  }

  getState() {
    return this.state;
  }

  saveState(newState: Partial<AIStoreState>) {
    this.state = { ...this.state, ...newState };
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('cyzor_ai_store', JSON.stringify(this.state));
    }
    this.notify();
  }
  
  getAgent(id: string) {
    return this.state.agents.find(a => a.id === id);
  }

  updateAgent(id: string, updates: Partial<AIAgent>) {
    const agents = this.state.agents.map(a => a.id === id ? { ...a, ...updates } : a);
    this.saveState({ agents });
  }

  addAgent(agent: AIAgent) {
    this.saveState({ agents: [...this.state.agents, agent] });
  }

  deleteAgent(id: string) {
    this.saveState({ agents: this.state.agents.filter(a => a.id !== id) });
  }

  logHistory(log: any) {
    const history = [log, ...this.state.history].slice(0, 500); // keep last 500
    this.saveState({ history });
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }
}

export const aiStore = new AIStore();
