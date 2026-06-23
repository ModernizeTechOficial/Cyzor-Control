import { IAIProvider, AIMessage, AITool, AIResponse } from '../AIProvider';

export class OpenRouterProvider implements IAIProvider {
  async chat(messages: AIMessage[], tools?: AITool[]): Promise<AIResponse> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('OPENROUTER_API_KEY environment variable is required');

    const mappedMessages = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    const mappedTools = tools ? tools.map(t => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: {
          type: 'object',
          properties: t.parameters.properties,
          required: t.parameters.required
        }
      }
    })) : undefined;

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash', // Default fallback for openrouter
        messages: mappedMessages,
        tools: mappedTools
      })
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenRouter API error: ${err}`);
    }

    const data = await res.json();
    const choice = data.choices[0].message;

    const toolCalls = choice.tool_calls ? choice.tool_calls.map((c: any) => ({
      name: c.function.name,
      arguments: JSON.parse(c.function.arguments)
    })) : undefined;

    return {
      text: choice.content || '',
      toolCalls: toolCalls && toolCalls.length > 0 ? toolCalls : undefined
    };
  }
}
