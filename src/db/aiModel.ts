import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { db } from "./index.ts";
import { projects, tasks, aiMemories, financeEntries, companies } from "./schema.ts";
import { eq, desc, inArray } from "drizzle-orm";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY, 
  httpOptions: { headers: { "User-Agent": "aistudio-build" } } 
});

const saveMemoryDeclaration: FunctionDeclaration = {
  name: "save_memory",
  description: "Salva uma nova memória no sistema para acesso futuro. Use isso sempre que o usuário fornecer informações importantes sobre ele, empresas, projetos ou decisões.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      category: {
        type: Type.STRING,
        description: "Categoria da memória (ex: Perfil, Empresa, Projeto, Preferências, Decisões)"
      },
      content: {
        type: Type.STRING,
        description: "O conteúdo a ser memorizado"
      },
      importance: {
        type: Type.INTEGER,
        description: "Importância de 1 a 10"
      }
    },
    required: ["category", "content", "importance"],
  },
};

export async function generateProactiveInsights(workspaceId: number) {
  // Obter contexto
  const allProjects = await db.select().from(projects).where(eq(projects.workspaceId, workspaceId));
  const projectIds = allProjects.map(p => p.id);
  
  let allTasks: any[] = [];
  if (projectIds.length > 0) {
    allTasks = await db.select().from(tasks).where(inArray(tasks.projectId, projectIds));
  }

  const allFinances = await db.select().from(financeEntries).where(eq(financeEntries.workspaceId, workspaceId));
  
  const totalReceita = allFinances.filter(f => f.type === 'RECEITA').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalDespesa = allFinances.filter(f => f.type === 'DESPESA').reduce((acc, curr) => acc + Number(curr.amount), 0);
  
  const prompt = `Analise os seguintes dados do usuário e gere um JSON com 3 insights proativos (oportunidades, riscos e recomendações).
Retorne APENAS um JSON no formato:
{
  "summary": "Resumo geral curto do estado da empresa",
  "opportunity": "Descrição de 1 oportunidade detectável",
  "risk": "Descrição de 1 risco ou problema detectável",
  "recommendation": "Uma recomendação de ação clara"
}

DADOS:
- Projetos: ${allProjects.map(p => p.name + ` (Status: ${p.status}, Prazo: ${p.dueDate || ''})`).join(', ')}
- Tarefas: ${allTasks.length} tarefas
- Receita total: R$ ${totalReceita.toFixed(2)}
- Despesa total: R$ ${totalDespesa.toFixed(2)}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error generating insights:", error);
    return {
      summary: "Falha ao analisar métricas automáticas.",
      opportunity: "Verifique os relatórios manualmente.",
      risk: "Conexão com a base analítica interrompida.",
      recommendation: "Tente recarregar a IA mais tarde."
    };
  }
}

export async function processAIChat(prompt: string, workspaceId: number, history: any[] = []) {
  // Coletar contexto
  const allProjects = await db.select().from(projects).where(eq(projects.workspaceId, workspaceId));
  const projectIds = allProjects.map(p => p.id);
  
  let allTasks: any[] = [];
  if (projectIds.length > 0) {
    allTasks = await db.select().from(tasks).where(inArray(tasks.projectId, projectIds));
  }

  const allFinances = await db.select().from(financeEntries).where(eq(financeEntries.workspaceId, workspaceId));
  const allMemories = await db.select().from(aiMemories).where(eq(aiMemories.workspaceId, workspaceId)).orderBy(desc(aiMemories.importance));

  const totalReceita = allFinances.filter(f => f.type === 'RECEITA').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalDespesa = allFinances.filter(f => f.type === 'DESPESA').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const lucro = totalReceita - totalDespesa;

  const systemInstruction = `Você é o "Olimpo AI", um assistente executivo e consultor operacional nativo da plataforma. 
Você possui acesso completo à plataforma do usuário e age como um coadministrador inteligente.

SUA PERSONALIDADE:
Você é proativo, analítico, direto e profissional.

CONTEXTO ATUAL DA PLATAFORMA:
Projetos Ativos: ${allProjects.length}
Tarefas: ${allTasks.length}

=== FINANCEIRO ===
Receita Mês: R$ ${totalReceita.toFixed(2)}
Despesa Mês: R$ ${totalDespesa.toFixed(2)}
Lucro: R$ ${lucro.toFixed(2)}

=== DETALHES DOS PROJETOS ===
${allProjects.map(p => `- ${p.name} (Status: ${p.status}, Prioridade: ${p.priority}, Prazo: ${p.dueDate || 'Sem prazo'})`).join('\n')}

=== DETALHES DAS TAREFAS ===
${allTasks.map(t => `- ${t.title} (Status: ${t.status}, Prioridade: ${t.priority})`).join('\n')}

=== MEMÓRIA PERSISTENTE ===
Estas são informações importantes anotadas sobre o usuário anteriormente:
${allMemories.map(m => `[${m.category} - Importância ${m.importance}/10]: ${m.content}`).join('\n')}

INSTRUÇÕES:
- Sempre que houver nova informação útil na conversa que deve ser lembrada a longo prazo, CHAME A FUNÇÃO \`save_memory\`.
- Use os dados fornecidos para gerar análises financeiras, analisar quais projetos estão mais atrasados, quais tarefas estão bloqueadas e sugerir reduções de custo ou priorizações quando perguntado.
- Responda como "Olimpo AI". Resuma informações de forma clara, não cite todos os detalhes um-a-um de forma robótica. Use formatação limpa quando necessário.`;

  // Clean, map and strictly enforce alternating user/model roles to prevent Gemini API 400 errors
  const chatContents: any[] = [];
  let lastRole: string | null = null;

  for (const h of history) {
    if (h.role !== 'system' && h.text && h.text.trim()) {
      const mappedRole = h.role === 'assistant' ? 'model' : h.role;
      if (mappedRole === 'model' || mappedRole === 'user') {
        if (mappedRole !== lastRole) {
          chatContents.push({
            role: mappedRole,
            parts: [{ text: h.text }]
          });
          lastRole = mappedRole;
        } else {
          // Merge consecutive same-role text entries to maintain strict alternation
          if (chatContents.length > 0) {
            chatContents[chatContents.length - 1].parts[0].text += "\n" + h.text;
          }
        }
      }
    }
  }

  // Append current prompt, merging with last item if last role was user, or creating a new user entry
  if (lastRole === 'user') {
    if (chatContents.length > 0) {
      chatContents[chatContents.length - 1].parts[0].text += "\n" + prompt;
    }
  } else {
    chatContents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });
  }

  try {
    let response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: chatContents,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: [saveMemoryDeclaration] }]
      }
    });

    // Check if the model wants to call a function
    if (response.functionCalls && response.functionCalls.length > 0) {
      for (const call of response.functionCalls) {
        if (call.name === "save_memory") {
          const { category, content, importance } = call.args as any;
          await db.insert(aiMemories).values({
            workspaceId,
            category,
            content,
            importance
          });
        }
      }
      
      const functionResponseParts = response.functionCalls.map(call => ({
        functionResponse: {
            name: call.name,
            response: { status: 'success' }
        }
      }));

      // Need to send the function response back to the model
      response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
            ...chatContents, 
            { role: 'model', parts: response.candidates?.[0]?.content?.parts || [] }, 
            { role: 'user', parts: functionResponseParts }
        ],
        config: {
            systemInstruction,
            tools: [{ functionDeclarations: [saveMemoryDeclaration] }]
        }
      });
    }

    return response.text;
  } catch(e) {
    console.error(e);
    return "Desculpe, ocorreu um erro ao analisar os dados operacionais.";
  }
}
