import { AIProvider, ChatRequest, ChatResponse, ModelInfo, AIAgent } from '../types';
import { GoogleGenAI } from "@google/genai";

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
      const historyContents = Array.isArray(request.context?.history)
        ? request.context.history.map((msg: any) => ({
            role: msg.role === 'model' || msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.text || (msg.parts && msg.parts[0] && msg.parts[0].text) || '' }]
          })).filter((msg: any) => msg.parts[0].text)
        : [];

      const contents = [
        ...historyContents,
        { role: 'user', parts: [{ text: request.message }] }
      ];

      const response = await this.ai.models.generateContent({
        model: modelToUse,
        contents: contents,
        config: {
          systemInstruction: `${BASE_SYSTEM_PROMPT}\n\nINSTRUÇÕES DO AGENTE:\n${agent.systemPrompt || 'Você é um assistente prestativo.'}\n\nCONTEXTO DISPONÍVEL:\n${request.context?._rawString || JSON.stringify(request.context || {})}`,
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
