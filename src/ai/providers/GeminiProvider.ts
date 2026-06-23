import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { IAIProvider, AIMessage, AITool, AIResponse } from '../AIProvider';
import { env } from '../../config/env.ts';

export class GeminiProvider implements IAIProvider {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ 
      apiKey: env.geminiApiKey, 
      httpOptions: { headers: { "User-Agent": "aistudio-build" } } 
    });
  }

  async chat(messages: AIMessage[], tools?: AITool[]): Promise<AIResponse> {
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const otherMessages = messages.filter(m => m.role !== 'system');

    // Clean, map and strictly enforce alternating user/model roles
    const chatContents: any[] = [];
    let lastRole: string | null = null;
    
    for (const h of otherMessages) {
      if (h.content && h.content.trim()) {
        const mappedRole = h.role === 'assistant' ? 'model' : 'user';
        if (mappedRole !== lastRole) {
          chatContents.push({ role: mappedRole, parts: [{ text: h.content }] });
          lastRole = mappedRole;
        } else {
          if (chatContents.length > 0) {
             chatContents[chatContents.length - 1].parts[0].text += "\\n" + h.content;
          }
        }
      }
    }

    const tDeclarations: FunctionDeclaration[] = (tools || []).map(t => ({
      name: t.name,
      description: t.description,
      parameters: {
        type: Type.OBJECT,
        properties: t.parameters.properties,
        required: t.parameters.required
      }
    }));

    const response = await this.ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: chatContents,
      config: {
        systemInstruction: systemMessage,
        tools: tDeclarations.length > 0 ? [{ functionDeclarations: tDeclarations }] : undefined
      }
    });

    const toolCalls = response.functionCalls ? response.functionCalls.map(c => ({
      name: c.name,
      arguments: c.args
    })) : undefined;

    return {
      text: response.text || '',
      toolCalls: toolCalls && toolCalls.length > 0 ? toolCalls : undefined
    };
  }
}
