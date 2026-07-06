import { AIProvider, ChatRequest, ChatResponse, AIAgent } from '../types';

const BASE_SYSTEM_PROMPT = `Você é um assistente especializado da Cyzor Control.

DIRETRIZES DE COMPORTAMENTO:
1. NUNCA mencione que não conhece a empresa, que o chat acabou de iniciar ou que não tem memória de conversas anteriores.
2. Utilize SEMPRE o contexto fornecido abaixo para responder ao usuário.
3. Se o contexto contiver as informações necessárias, responda com base nelas de forma clara e profissional.
4. Se o contexto fornecido estiver vazio ou não contiver as informações solicitadas pelo usuário, pergunte ao usuário especificamente qual informação ele busca, e explique que você pode ajudar assim que tiver acesso aos dados corretos, mantendo o tom profissional e prestativo. NÃO diga apenas "não tenho contexto".
5. NÃO invente informações. Se não souber, seja honesto.
6. Responda SEMPRE no idioma do usuário, priorizando Português do Brasil (PT-BR).

DIRETRIZES DE FORMATAÇÃO (MUITO IMPORTANTE):
- Formate suas respostas para que sejam EXTREMAMENTE agradáveis, limpas e fáceis de ler. Evite blocos contínuos e densos de texto ("tudo junto").
- Use espaçamento generoso: adicione quebras de linha duplas entre parágrafos e seções diferentes.
- Use elementos Markdown ricos:
  * Títulos e subtítulos elegantes (ex: ### Título) para separar tópicos importantes.
  * Listas com marcadores (bullet points com hífen \`- \`) de forma hierárquica.
  * Termos importantes em **negrito** para destacar nomes, status, prioridades, datas ou valores.
  * Tabelas Markdown simples quando apresentar dados estruturados, financeiros, ou listas de tarefas com colunas (Ex: Colunas de Projeto, Status, Prioridade).
  * Linhas horizontais (três hífens: ---) para criar divisórias visuais claras entre seções muito distintas.
- Use emojis apropriados e com moderação no início de tópicos ou listas para enriquecer a leitura visual (Ex: 🏢 para Empresas, 📁 para Projetos, 📌 para Tarefas, 🚀 para Ideias, 💰 para Finanças).`;

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
        message: 'Configuração da API Groq pendente. Por favor, adicione sua chave de API nas configurações de IA no painel Admin.',
        provider: this.name,
        model: actualModel,
        duration: 50,
        tokensUsed: { prompt: 0, completion: 0, total: 0 }
      };
    }

    try {
      const historyMessages = Array.isArray(request.context?.history) 
        ? request.context.history.map((msg: any) => ({
            role: msg.role === 'model' || msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.text || (msg.parts && msg.parts[0] && msg.parts[0].text) || ''
          })).filter((msg: any) => msg.content)
        : [];

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: actualModel,
          messages: [
            { 
              role: 'system', 
              content: `${BASE_SYSTEM_PROMPT}\n\nINSTRUÇÕES DO AGENTE:\n${agent.systemPrompt || 'Você é um assistente prestativo.'}\n\nCONTEXTO DISPONÍVEL:\n${request.context?._rawString || JSON.stringify(request.context || {})}`
            },
            ...historyMessages,
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
