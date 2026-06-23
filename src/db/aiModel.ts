import { db } from "./index.ts";
import { projects, tasks, aiMemories, financeEntries, companies } from "./schema.ts";
import { eq, desc, inArray } from "drizzle-orm";
import { getAIProvider, AIMessage, AITool } from "../ai/AIProvider";

const aiProvider = getAIProvider();

const saveMemoryDeclaration: AITool = {
  name: "save_memory",
  description: "Salva uma nova memória no sistema para acesso futuro. Use isso sempre que o usuário fornecer informações importantes sobre ele, empresas, projetos ou decisões.",
  parameters: {
    properties: {
      category: {
        type: "string",
        description: "Categoria da memória (ex: Perfil, Empresa, Projeto, Preferências, Decisões)"
      },
      content: {
        type: "string",
        description: "O conteúdo a ser memorizado"
      },
      importance: {
        type: "integer",
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
    const response = await aiProvider.chat([
      { role: "user", content: prompt }
    ]);
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

  const messages: AIMessage[] = [{ role: 'system', content: systemInstruction }];
  
  for (const h of history) {
    if (h.role !== 'system' && h.text && h.text.trim()) {
      messages.push({ role: h.role === 'assistant' ? 'assistant' : 'user', content: h.text });
    }
  }
  messages.push({ role: 'user', content: prompt });

  try {
    let response = await aiProvider.chat(messages, [saveMemoryDeclaration]);

    if (response.toolCalls && response.toolCalls.length > 0) {
      for (const call of response.toolCalls) {
        if (call.name === "save_memory") {
          const { category, content, importance } = call.arguments;
          await db.insert(aiMemories).values({
            workspaceId,
            category,
            content,
            importance
          });
        }
      }
      
      // Optional: Since our AI framework natively supports tool calls, we could push the tool result back and re-call chat. 
      // For simplicity in the abstraction, if a memory is saved, we don't necessarily need a strict follow up, 
      // but let's append a system note that it was saved and call again to get the final text.
      messages.push({ role: 'assistant', content: "Memória salva com sucesso." });
      messages.push({ role: 'user', content: "Continue." });
      response = await aiProvider.chat(messages);
    }
    
    return response.text;
  } catch(e) {
    console.error(e);
    return "Desculpe, ocorreu um erro ao analisar os dados operacionais.";
  }
}
