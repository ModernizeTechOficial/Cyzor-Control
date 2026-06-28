import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { db } from "./index.ts";
import { projects, tasks, aiMemories, financeEntries, companies, workspaces, notes } from "./schema.ts";
import { eq, desc, inArray, and, sql } from "drizzle-orm";

export async function getAIInstance(workspaceId: number) {
  // Check if workspace has its own API key
  const [ws] = await db.select({ settings: workspaces.settings }).from(workspaces).where(eq(workspaces.id, workspaceId));
  const customKey = (ws?.settings as any)?.aiConfig?.apiKey;
  
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  
  console.log("Using API key:", apiKey ? "Configured" : "MISSING");
  
  if (!apiKey) {
    throw new Error("Gemini API Key not configured. Please set it in Settings > IA.");
  }

  return new GoogleGenAI({ 
    apiKey, 
    httpOptions: { headers: { "User-Agent": "aistudio-build" } } 
  });
}

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

const createProjectDeclaration: FunctionDeclaration = {
  name: "create_project",
  description: "Cria um novo projeto na plataforma.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: "O nome do projeto"
      },
      description: {
        type: Type.STRING,
        description: "A descrição do projeto"
      },
      status: {
        type: Type.STRING,
        description: "O status do projeto (Planejamento, Em Andamento, Concluído, Pausado, Cancelado)"
      }
    },
    required: ["name"],
  },
};

const updateProjectStatusDeclaration: FunctionDeclaration = {
  name: "update_project_status",
  description: "Atualiza o status de um projeto existente na plataforma.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      projectId: {
        type: Type.INTEGER,
        description: "O ID numérico do projeto (pode ser obtido da lista de projetos ativos no contexto)"
      },
      status: {
        type: Type.STRING,
        description: "O novo status do projeto (Planejamento, Em Andamento, Concluído, Pausado, Cancelado)"
      }
    },
    required: ["projectId", "status"],
  },
};

const createTaskDeclaration: FunctionDeclaration = {
  name: "create_task",
  description: "Cria uma nova tarefa.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      projectId: {
        type: Type.INTEGER,
        description: "O ID do projeto"
      },
      title: {
        type: Type.STRING,
        description: "O título da tarefa"
      },
      description: {
        type: Type.STRING,
        description: "A descrição da tarefa"
      },
      status: {
        type: Type.STRING,
        description: "O status da tarefa (PLANNED, ACTIVE, COMPLETED)"
      },
      priority: {
        type: Type.STRING,
        description: "A prioridade da tarefa (LOW, MEDIUM, HIGH, CRITICAL)"
      }
    },
    required: ["projectId", "title"],
  },
};

const updateTaskStatusDeclaration: FunctionDeclaration = {
  name: "update_task_status",
  description: "Atualiza o status de uma tarefa.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      taskId: {
        type: Type.INTEGER,
        description: "O ID numérico da tarefa"
      },
      status: {
        type: Type.STRING,
        description: "O novo status da tarefa (PLANNED, ACTIVE, COMPLETED)"
      }
    },
    required: ["taskId", "status"],
  },
};

const createCompanyDeclaration: FunctionDeclaration = {
  name: "create_company",
  description: "Cria uma nova empresa/cliente.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: "O nome da empresa"
      },
      industry: {
        type: Type.STRING,
        description: "A indústria/nicho da empresa"
      }
    },
    required: ["name"],
  },
};

const createFinanceEntryDeclaration: FunctionDeclaration = {
  name: "create_finance_entry",
  description: "Cria um novo registro financeiro (receita ou despesa).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      type: {
        type: Type.STRING,
        description: "O tipo (RECEITA ou DESPESA)"
      },
      amount: {
        type: Type.NUMBER,
        description: "O valor (ex: 1500.50)"
      },
      description: {
        type: Type.STRING,
        description: "A descrição (ex: 'Pagamento de servidor')"
      }
    },
    required: ["type", "amount", "description"],
  },
};

const createNoteDeclaration: FunctionDeclaration = {
  name: "create_note",
  description: "Cria uma nova nota no caderno de notas.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: "O título da nota"
      },
      content: {
        type: Type.STRING,
        description: "O conteúdo em texto da nota"
      }
    },
    required: ["title"],
  },
};

async function retryGenerateContent(ai: any, params: any, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await ai.models.generateContent(params);
    } catch (error: any) {
      if (error.status === 503 && i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
        continue;
      }
      throw error;
    }
  }
}

export async function generateProactiveInsights(workspaceId: number) {
  const ai = await getAIInstance(workspaceId);
  // Obter contexto resumido
  const allProjects = await db.select({
    id: projects.id,
    name: projects.name,
    status: projects.status,
    dueDate: projects.dueDate,
    priority: projects.priority
  }).from(projects)
    .where(eq(projects.workspaceId, workspaceId))
    .limit(20);
    
  const projectIds = allProjects.map(p => p.id);
  
  let allTasksCount = 0;
  if (projectIds.length > 0) {
    const tasksData = await db.select({ id: tasks.id }).from(tasks).where(inArray(tasks.projectId, projectIds));
    allTasksCount = tasksData.length;
  }

  const allFinances = await db.select({
    type: financeEntries.type,
    amount: financeEntries.amount
  }).from(financeEntries)
    .where(eq(financeEntries.workspaceId, workspaceId));
  
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
- Tarefas: ${allTasksCount} tarefas totais nos projetos listados
- Receita total: R$ ${totalReceita.toFixed(2)}
- Despesa total: R$ ${totalDespesa.toFixed(2)}
`;

  try {
    const response = await retryGenerateContent(ai, {
      model: 'gemini-3.1-flash-lite',
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
  const ai = await getAIInstance(workspaceId);

  // Coletar contexto otimizado
  const allProjects = await db.select({
    id: projects.id,
    name: projects.name,
    status: projects.status,
    priority: projects.priority
  }).from(projects).where(eq(projects.workspaceId, workspaceId)).limit(20);
  
  const projectIds = allProjects.map(p => p.id);
  
  let pendingTasksCount = 0;
  if (projectIds.length > 0) {
    const tasksData = await db.select({ id: tasks.id, status: tasks.status })
      .from(tasks)
      .where(and(inArray(tasks.projectId, projectIds), sql`${tasks.status} != 'Concluído'`));
    pendingTasksCount = tasksData.length;
  }

  const allFinances = await db.select({
    type: financeEntries.type,
    amount: financeEntries.amount
  }).from(financeEntries).where(eq(financeEntries.workspaceId, workspaceId));

  const allMemories = await db.select().from(aiMemories)
    .where(eq(aiMemories.workspaceId, workspaceId))
    .orderBy(desc(aiMemories.importance))
    .limit(10);

  const totalReceita = allFinances.filter(f => f.type === 'RECEITA').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalDespesa = allFinances.filter(f => f.type === 'DESPESA').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const lucro = totalReceita - totalDespesa;

  const systemInstruction = `Você é o "Olimpo AI", um assistente executivo e consultor operacional nativo da plataforma. 
Você possui acesso completo à plataforma do usuário e age como um coadministrador inteligente.

SUA PERSONALIDADE:
Você é proativo, analítico, direto e profissional.

CONTEXTO ATUAL DA PLATAFORMA:
Projetos Ativos (Top 20): ${allProjects.length}
Tarefas Pendentes: ${pendingTasksCount}

=== FINANCEIRO ===
Receita Mês: R$ ${totalReceita.toFixed(2)}
Despesa Mês: R$ ${totalDespesa.toFixed(2)}
Lucro: R$ ${lucro.toFixed(2)}

=== RESUMO OPERACIONAL (TOP 10) ===
${allProjects.slice(0, 10).map(p => `- ID: ${p.id} | ${p.name} (Status: ${p.status}, Prioridade: ${p.priority})`).join('\n')}

=== MEMÓRIA PERSISTENTE (TOP 10) ===
${allMemories.map(m => `[${m.category}]: ${m.content}`).join('\n')}

INSTRUÇÕES:
- Sempre que houver nova informação útil na conversa que deve ser lembrada a longo prazo, CHAME A FUNÇÃO \`save_memory\`.
- Crie ou atualize PROJETOS usando \`create_project\` e \`update_project_status\`.
- Crie ou atualize TAREFAS usando \`create_task\` e \`update_task_status\`.
- Crie registros FINANCEIROS usando \`create_finance_entry\`.
- Crie EMPRESAS usando \`create_company\`.
- Crie notas no CADERNO DE NOTAS usando \`create_note\`.
- Você deve SEMPRE usar essas funções em vez de apenas dizer que vai fazer. AJA na plataforma!
- Responda como "Olimpo AI". Resuma informações de forma clara, não cite todos os detalhes um-a-um. Use formatação limpa.`;

  // Filter and map history, ensuring it starts with a 'user' role
  const chatContents: any[] = [];
  let lastRole: string | null = null;

  // Find the first user message to start the conversation
  const firstUserIndex = history.findIndex(h => h.role === 'user');
  const validHistory = firstUserIndex !== -1 ? history.slice(firstUserIndex) : [];

  for (const h of validHistory) {
    if (h.role !== 'system' && h.text && h.text.trim()) {
      const mappedRole = h.role === 'assistant' ? 'model' : h.role;
      if (mappedRole === 'model' || mappedRole === 'user') {
        if (mappedRole !== lastRole) {
          chatContents.push({
            role: mappedRole,
            parts: [{ text: h.text }]
          });
          lastRole = mappedRole;
        } else if (chatContents.length > 0) {
          chatContents[chatContents.length - 1].parts[0].text += "\n" + h.text;
        }
      }
    }
  }

  // Append current prompt
  if (lastRole === 'user' && chatContents.length > 0) {
    chatContents[chatContents.length - 1].parts[0].text += "\n" + prompt;
  } else {
    chatContents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });
  }

  try {
    const response = await retryGenerateContent(ai, {
      model: 'gemini-3.1-flash-lite',
      contents: chatContents,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: [
          saveMemoryDeclaration, 
          createProjectDeclaration, 
          updateProjectStatusDeclaration,
          createTaskDeclaration,
          updateTaskStatusDeclaration,
          createCompanyDeclaration,
          createFinanceEntryDeclaration,
          createNoteDeclaration
        ] }]
      }
    });

    // Check for function calls
    const functionCalls = response.functionCalls;
    if (functionCalls && functionCalls.length > 0) {
      for (const call of functionCalls) {
        if (call.name === "save_memory") {
          const { category, content, importance } = call.args as any;
          await db.insert(aiMemories).values({
            workspaceId,
            category,
            content,
            importance: Number(importance) || 5
          });
        } else if (call.name === "create_project") {
          const { name, description, status } = call.args as any;
          await db.insert(projects).values({
            workspaceId,
            name,
            description: description || "",
            status: status || "Planejamento",
            progress: 0,
            priority: "Média"
          });
        } else if (call.name === "update_project_status") {
          const { projectId, status } = call.args as any;
          await db.update(projects).set({ status }).where(and(eq(projects.id, Number(projectId)), eq(projects.workspaceId, workspaceId)));
        } else if (call.name === "create_task") {
          const { projectId, title, description, status, priority } = call.args as any;
          await db.insert(tasks).values({
            projectId: Number(projectId),
            title,
            description: description || "",
            status: status || "PLANNED",
            priority: priority || "MEDIUM"
          });
        } else if (call.name === "update_task_status") {
          const { taskId, status } = call.args as any;
          await db.update(tasks).set({ status }).where(eq(tasks.id, Number(taskId)));
        } else if (call.name === "create_company") {
          const { name, industry } = call.args as any;
          await db.insert(companies).values({
            workspaceId,
            name,
            industry: industry || ""
          });
        } else if (call.name === "create_finance_entry") {
          const { type, amount, description } = call.args as any;
          await db.insert(financeEntries).values({
            workspaceId,
            type,
            amount: amount.toString(),
            description,
            date: new Date()
          });
        } else if (call.name === "create_note") {
          const { title, content } = call.args as any;
          await db.insert(notes).values({
            workspaceId,
            title,
            content: content || ""
          });
        }
      }
      
      const functionResponseParts = functionCalls.map(call => ({
        functionResponse: {
            name: call.name,
            response: { status: 'success' }
        }
      }));

      // Need to send the function response back to the model
      const finalResponse = await retryGenerateContent(ai, {
        model: 'gemini-3.1-flash-lite',
        contents: [
            ...chatContents, 
            { role: 'model', parts: response.candidates?.[0]?.content?.parts || [] }, 
            { role: 'user', parts: functionResponseParts }
        ],
        config: {
            systemInstruction,
            tools: [{ functionDeclarations: [
              saveMemoryDeclaration, 
              createProjectDeclaration, 
              updateProjectStatusDeclaration,
              createTaskDeclaration,
              updateTaskStatusDeclaration,
              createCompanyDeclaration,
              createFinanceEntryDeclaration,
              createNoteDeclaration
            ] }]
        }
      });
      return finalResponse.text;
    }

    return response.text;
  } catch(e) {
    console.error(e);
    return "Desculpe, ocorreu um erro ao analisar os dados operacionais.";
  }
}
