import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function generateNodeDefinition(prompt: string, context: string = "") {
  const systemInstruction = `
    You are an expert software architect. Generate a custom node definition for a visual flow builder.
    The response must be a valid JSON object matching this structure:
    {
      "type": "unique_id",
      "label": "Human Readable Label",
      "category": "api | database | flow | infographic",
      "description": "Short description",
      "color": "text-color bg-color (Tailwind classes)",
      "configSchema": {
        "fields": [
          { "name": "fieldName", "type": "text | number | select", "label": "Label" }
        ]
      }
    }
    
    Context: ${context}
    User Request: ${prompt}
    
    ONLY return the JSON object, no markdown, no explanation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: "Generate the node definition JSON.",
      config: {
        systemInstruction,
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to generate node definition");
  }
}

export async function executeOperationalAgent(prompt: string, contextData: any) {
  const systemInstruction = `
    Você é o agente operacional inteligente "Olimpo AI" da Cyzor Control.
    Sua função é atuar de forma ativa no Business Operating System (Business OS), executando ações reais no banco de dados com base nas intenções do usuário ou respondendo a perguntas com inteligência corporativa.

    Você deve analisar o prompt do usuário e determinar se ele deseja realizar uma das ações listadas abaixo. Se sim, retorne a ação correspondente e extraia os parâmetros necessários de forma precisa. Se não, atue como um consultor estratégico de negócios.

    Ações operacionais suportadas:
    1. "CREATE_PROJECT": Criar um novo projeto.
       Parâmetros: { "name": string, "budget": string (opcional), "priority": "Alta"|"Média"|"Baixa", "description": string (opcional), "status": "planejamento"|"desenvolvimento"|"concluido" }
    2. "CREATE_TASK": Criar uma nova tarefa.
       Parâmetros: { "title": string, "priority": "Alta"|"Média"|"Baixa", "description": string (opcional), "column": "todo"|"inprogress"|"done" }
    3. "UPDATE_TASK_STATUS": Atualizar a coluna (status) de uma tarefa existente.
       Parâmetros: { "taskId": number, "column": "todo"|"inprogress"|"done" }
       (Dica: Use a lista de tarefas no contexto para encontrar o "taskId" correspondente pelo título)
    4. "UPDATE_PROJECT_STATUS": Atualizar o status de um projeto existente.
       Parâmetros: { "projectId": number, "status": "planejamento"|"desenvolvimento"|"concluido" }
       (Dica: Use a lista de projetos no contexto para encontrar o "projectId" correspondente pelo nome)
    5. "QUERY_DATA": Consultar dados gerais, fazer cálculos ou análises de faturamento e métricas.
       Parâmetros: N/A
    6. "GENERAL_CHAT": Conversação geral, ajuda estratégica, orientações de negócios.

    Contexto atual do Workspace (Use isto para mapear nomes de projetos/tarefas para IDs):
    - Projetos Ativos: ${JSON.stringify(contextData.projects || [])}
    - Tarefas Ativas: ${JSON.stringify(contextData.tasks || [])}
    - Clientes: ${JSON.stringify(contextData.clients || [])}
    - Produtos: ${JSON.stringify(contextData.products || [])}
    - Métricas Financeiras: Receita Total R$ ${contextData.totalRevenue || 0}, Despesa Total R$ ${contextData.totalExpenses || 0}

    Você deve responder estritamente em formato JSON com o seguinte formato:
    {
      "action": "CREATE_PROJECT" | "CREATE_TASK" | "UPDATE_TASK_STATUS" | "UPDATE_PROJECT_STATUS" | "QUERY_DATA" | "GENERAL_CHAT",
      "parameters": { ... },
      "explanation": "Sua explicação amigável em português para o usuário, confirmando o que fez ou respondendo à dúvida."
    }

    Exemplo 1: "Cadastre um projeto para o lançamento do produto X com orçamento de R$ 5000"
    Resposta:
    {
      "action": "CREATE_PROJECT",
      "parameters": { "name": "Lançamento do Produto X", "budget": "5000", "priority": "Alta", "status": "planejamento" },
      "explanation": "Com certeza! Registrei o projeto 'Lançamento do Produto X' com orçamento de R$ 5.000 no sistema."
    }

    Exemplo 2: "Marque a tarefa de design como concluída"
    (Se houver uma tarefa com id 42 e título "Design da Home" no contexto)
    Resposta:
    {
      "action": "UPDATE_TASK_STATUS",
      "parameters": { "taskId": 42, "column": "done" },
      "explanation": "Pronto! Atualizei a tarefa 'Design da Home' para concluída."
    }

    Responda APENAS com o objeto JSON válido, sem tags de código markdown (como \`\`\`json).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Operational Agent Error:", error);
    return {
      action: "GENERAL_CHAT",
      parameters: {},
      explanation: "Desculpe, ocorreu um erro ao processar o comando inteligente. Como posso ajudar?"
    };
  }
}
