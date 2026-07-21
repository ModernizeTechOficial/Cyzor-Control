import React, { useState, useEffect } from 'react';
import { 
  Cpu, Activity, Bot, Database, Settings, Terminal, Network, 
  Wrench, LineChart, MessageSquare, Zap, TestTube, Layers, Save, Plus, X, Loader2
} from 'lucide-react';
import { useAIStore, aiStore } from '../../../ai/useAIStore';
import { AIStoreState } from '../../../ai/store';
import { AIAgent } from '../../../ai/types';
import { useAuth } from '../../../context/AuthContext';

type TabId = 
  'dashboard' | 'agents' | 'prompts' | 'providers' | 'models' | 
  'contextos' | 'ferramentas' | 'uso' | 'memoria' | 'logs' | 
  'teste' | 'configuracoes';

export default function AIControlCenterView() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  const tabs: { id: TabId, label: string, icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'agents', label: 'Agents', icon: Bot },
    { id: 'prompts', label: 'Prompts', icon: MessageSquare },
    { id: 'providers', label: 'Providers', icon: Network },
    { id: 'models', label: 'Models', icon: Layers },
    { id: 'contextos', label: 'Contextos', icon: Database },
    { id: 'ferramentas', label: 'Ferramentas', icon: Wrench },
    { id: 'uso', label: 'Uso', icon: LineChart },
    { id: 'memoria', label: 'Memória', icon: Save },
    { id: 'logs', label: 'Logs', icon: Terminal },
    { id: 'teste', label: 'Teste de Agentes', icon: TestTube },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Cpu className="w-6 h-6 text-purple-600" />
            AI Control Center
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Governança, operação e monitoramento da infraestrutura de Inteligência Artificial.
          </p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 min-h-[600px]">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'agents' && <AgentsTab />}
        {activeTab === 'prompts' && <PromptsTab />}
        {activeTab === 'providers' && <ProvidersTab />}
        {activeTab === 'models' && <ModelsTab />}
        {activeTab === 'contextos' && <ContextsTab />}
        {activeTab === 'ferramentas' && <ToolsTab />}
        {activeTab === 'uso' && <UsageTab />}
        {activeTab === 'memoria' && <MemoryTab />}
        {activeTab === 'logs' && <LogsTab />}
        {activeTab === 'teste' && <TestingTab />}
        {activeTab === 'configuracoes' && <SettingsTab />}
      </div>
    </div>
  );
}

function DashboardTab() {
  const store = useAIStore();
  
  const metrics = [
    { label: 'Providers Ativos', value: store.providers.filter(p => p.status === 'Ativo').length.toString(), trend: 'OK', icon: Network },
    { label: 'Modelos Disponíveis', value: store.models.filter(m => m.isActive).length.toString(), trend: 'OK', icon: Layers },
    { label: 'Agentes Ativos', value: store.agents.length.toString(), trend: 'OK', icon: Bot },
    { label: 'Total de Requisições', value: store.history.length.toString(), trend: '100%', icon: Activity },
    { label: 'Tokens Utilizados', value: store.history.reduce((acc, h) => acc + (h.tokens?.total || 0), 0).toLocaleString(), trend: '-', icon: Zap },
    { label: 'Tempo Médio', value: store.history.length > 0 ? Math.round(store.history.reduce((acc, h) => acc + (h.duration || 0), 0) / store.history.length) + 'ms' : '0ms', trend: '-', icon: Terminal },
    { label: 'Custo Estimado', value: '$ 0.00', trend: '-', icon: LineChart },
    { label: 'Erros (24h)', value: store.history.filter(h => h.error).length.toString(), trend: '-', icon: Wrench },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Visão Geral da IA</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex flex-col gap-2">
            <div className="flex items-center justify-between text-gray-500">
              <m.icon className="w-5 h-5" />
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{m.trend}</span>
            </div>
            <div className="mt-2">
              <p className="text-3xl font-bold text-gray-900">{m.value}</p>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{m.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AgentsTab() {
  const store = useAIStore();
  const [editingAgent, setEditingAgent] = useState<AIAgent | null>(null);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const agentData: AIAgent = {
      id: editingAgent?.id || `agent-${Date.now()}`,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      systemPrompt: formData.get('systemPrompt') as string,
      modelId: formData.get('modelId') as string,
      temperature: parseFloat(formData.get('temperature') as string),
    };

    if (editingAgent && store.agents.some(a => a.id === editingAgent.id)) {
      aiStore.updateAgent(agentData.id, agentData);
    } else {
      aiStore.addAgent(agentData);
    }
    setEditingAgent(null);
  };

  if (editingAgent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="text-lg font-semibold text-gray-900">
             {editingAgent.id ? 'Editar Agente' : 'Novo Agente'}
           </h3>
           <button onClick={() => setEditingAgent(null)} className="text-gray-500 hover:text-gray-700">
             <X className="w-5 h-5" />
           </button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Agente</label>
                <input required name="name" defaultValue={editingAgent.name} className="w-full p-2 border border-gray-300 rounded-lg" />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                <select name="modelId" defaultValue={editingAgent.modelId} className="w-full p-2 border border-gray-300 rounded-lg">
                  {store.models.map(m => <option key={m.id} value={m.id}>{m.name} ({m.provider})</option>)}
                </select>
             </div>
             <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <input required name="description" defaultValue={editingAgent.description} className="w-full p-2 border border-gray-300 rounded-lg" />
             </div>
             <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">System Prompt</label>
                <textarea required name="systemPrompt" defaultValue={editingAgent.systemPrompt} className="w-full p-2 border border-gray-300 rounded-lg h-32 font-mono text-sm" />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temperatura</label>
                <input required type="number" step="0.1" min="0" max="2" name="temperature" defaultValue={editingAgent.temperature || 0.7} className="w-full p-2 border border-gray-300 rounded-lg" />
             </div>
          </div>
          <div className="pt-4 flex gap-2 justify-end">
            <button type="button" onClick={() => setEditingAgent(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">Salvar Agente</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Gerenciamento de Agentes</h3>
        <button onClick={() => setEditingAgent({} as AIAgent)} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors">
          <Plus className="w-4 h-4" />
          Novo Agente
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3">Agente</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Modelo</th>
              <th className="px-4 py-3">Temp.</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {store.agents.map(agent => (
              <tr key={agent.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-3 font-medium text-gray-900">{agent.name}</td>
                <td className="px-4 py-3 text-gray-600 truncate max-w-xs">{agent.description}</td>
                <td className="px-4 py-3 text-gray-600">{agent.modelId}</td>
                <td className="px-4 py-3 text-gray-600">{agent.temperature}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditingAgent(agent)} className="text-purple-600 hover:text-purple-800 font-medium mr-3">Editar</button>
                  <button onClick={() => {
                     if (window.confirm('Tem certeza?')) aiStore.deleteAgent(agent.id);
                  }} className="text-red-600 hover:text-red-800 font-medium">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PromptsTab() {
  const store = useAIStore();
  const [selectedAgentId, setSelectedAgentId] = useState<string>(store.agents[0]?.id || '');

  const selectedAgent = store.agents.find(a => a.id === selectedAgentId);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedAgent) {
       const formData = new FormData(e.currentTarget);
       aiStore.updateAgent(selectedAgent.id, {
          systemPrompt: formData.get('systemPrompt') as string
       });
       alert('Prompt salvo com sucesso!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Editor de Prompts</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-2 border-r border-gray-100 pr-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Agentes</p>
          {store.agents.map((agent) => (
            <div 
              key={agent.id} 
              onClick={() => setSelectedAgentId(agent.id)}
              className={`p-3 rounded-lg text-sm cursor-pointer ${agent.id === selectedAgentId ? 'bg-purple-50 text-purple-700 font-medium border border-purple-100' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {agent.name}
            </div>
          ))}
        </div>
        <div className="md:col-span-3 space-y-4">
          {selectedAgent ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">System Prompt ({selectedAgent.name})</label>
                <textarea 
                  name="systemPrompt"
                  key={selectedAgent.id}
                  defaultValue={selectedAgent.systemPrompt}
                  className="w-full h-64 p-4 rounded-xl border border-gray-200 font-mono text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="font-medium text-gray-700">Variáveis disponíveis via Contexto (Entidade):</span>
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{"context.module"}</code>
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{"context.data.*"}</code>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors">
                  <Save className="w-4 h-4" />
                  Salvar Prompt
                </button>
              </div>
            </form>
          ) : (
            <div className="text-gray-500">Selecione um agente.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProvidersTab() {
  const store = useAIStore();
  const { fetchWithAuth } = useAuth();
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    syncProviders();
  }, []);

  const syncProviders = async () => {
    try {
      setSyncing(true);
      const res = await fetchWithAuth('/api/ai/config/providers');
      if (res.ok) {
        const dbProviders = await res.json();
        // Merge DB data with store
        const providers = store.providers.map(p => {
          const dbP = dbProviders.find((dp: any) => dp.name === p.name);
          if (dbP) {
            return { 
              ...p, 
              status: dbP.enabled ? 'Ativo' : 'Inativo',
              apiKey: dbP.apiKey // This will be masked from server
            };
          }
          // If not in DB and is not Gemini (Gemini uses process.env.GEMINI_API_KEY as standard fallback)
          if (p.name !== 'Gemini') {
            return {
              ...p,
              status: 'Preparado',
              apiKey: undefined
            };
          }
          return p;
        });
        aiStore.saveState({ providers });
      }
    } catch (e) {
      console.error('Failed to sync providers:', e);
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveApiKey = async (e: React.FormEvent<HTMLFormElement>, name: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const apiKey = formData.get('apiKey') as string;
    
    if (apiKey) {
      try {
        setSyncing(true);
        const res = await fetchWithAuth('/api/ai/config/providers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, apiKey, enabled: true })
        });

        if (res.ok) {
          const providers = store.providers.map(p => p.name === name ? { ...p, status: 'Ativo', apiKey: '****' + apiKey.slice(-4) } : p);
          aiStore.saveState({ providers });
          setEditingProvider(null);
          alert('Configuração salva com sucesso no servidor!');
        } else {
          alert('Erro ao salvar no servidor.');
        }
      } catch (e) {
        console.error(e);
        alert('Erro de conexão ao salvar.');
      } finally {
        setSyncing(false);
      }
    }
  };

  const toggleProviderStatus = async (name: string, currentStatus: string) => {
    if (currentStatus === 'Preparado') return;
    const newEnabled = currentStatus !== 'Ativo';
    
    try {
      setSyncing(true);
      const res = await fetchWithAuth('/api/ai/config/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, enabled: newEnabled })
      });

      if (res.ok) {
        const newStatus = newEnabled ? 'Ativo' : 'Inativo';
        const providers = store.providers.map(p => p.name === name ? { ...p, status: newStatus } : p);
        aiStore.saveState({ providers });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Provedores de IA</h3>
        {syncing && <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {store.providers.map((p, i) => (
          <div key={i} className={`p-5 rounded-xl border flex flex-col gap-4 ${p.status === 'Ativo' ? 'border-purple-200 bg-purple-50/10' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Network className="w-5 h-5 text-gray-600" />
                </div>
                <h4 className="font-bold text-gray-900">{p.name}</h4>
              </div>
              <div className="flex items-center gap-3">
                 <span className={`px-2.5 py-1 text-xs rounded-full font-medium border ${p.status === 'Ativo' ? 'bg-green-50 text-green-700 border-green-200' : p.status === 'Inativo' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                   {p.status}
                 </span>
                 {p.status !== 'Preparado' && (
                    <button 
                       disabled={syncing}
                       onClick={() => toggleProviderStatus(p.name, p.status)} 
                       className={`text-xs font-medium px-2 py-1 rounded ${p.status === 'Ativo' ? 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50' : 'bg-purple-600 text-white hover:bg-purple-700'} disabled:opacity-50`}
                    >
                       {p.status === 'Ativo' ? 'Desativar' : 'Ativar'}
                    </button>
                 )}
              </div>
            </div>
            {p.status === 'Ativo' || p.status === 'Inativo' ? (
              <div className="flex gap-4 text-sm text-gray-600 border-t border-gray-100 pt-4">
                <div>Modelos: <span className="font-semibold text-gray-900">{p.models}</span></div>
                <div>Latência Média: <span className="font-semibold text-gray-900">{p.latency}</span></div>
                <button 
                  disabled={syncing}
                  onClick={() => setEditingProvider(p.name)} 
                  className="ml-auto text-purple-600 hover:text-purple-800 font-medium disabled:opacity-50"
                >
                  Editar Chave
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => handleSaveApiKey(e, p.name)} className="border-t border-gray-100 pt-4 flex gap-2">
                <input name="apiKey" required type="password" placeholder="API Key..." className="flex-1 p-2 border border-gray-200 rounded text-sm outline-none focus:ring-1 focus:ring-purple-500" />
                <button disabled={syncing} type="submit" className="text-sm font-medium text-white bg-purple-600 px-3 py-1.5 rounded hover:bg-purple-700 disabled:opacity-50">
                  {syncing ? '...' : 'Salvar'}
                </button>
              </form>
            )}
            {editingProvider === p.name && p.status === 'Ativo' && (
              <form onSubmit={(e) => handleSaveApiKey(e, p.name)} className="border-t border-gray-100 pt-4 flex gap-2">
                <input name="apiKey" required type="password" placeholder="Nova API Key..." className="flex-1 p-2 border border-gray-200 rounded text-sm outline-none focus:ring-1 focus:ring-purple-500" />
                <button disabled={syncing} type="submit" className="text-sm font-medium text-white bg-purple-600 px-3 py-1.5 rounded hover:bg-purple-700 disabled:opacity-50">
                  {syncing ? '...' : 'Atualizar'}
                </button>
                <button type="button" onClick={() => setEditingProvider(null)} className="text-sm font-medium text-gray-600 px-3 py-1.5 rounded hover:bg-gray-100 border border-gray-200">Cancelar</button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ModelsTab() {
  const store = useAIStore();
  
  const toggleModelActive = (id: string) => {
    const models = store.models.map(m => m.id === id ? { ...m, isActive: !m.isActive } : m);
    aiStore.saveState({ models });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Modelos Cadastrados</h3>
        <button className="text-sm font-medium text-purple-600 hover:text-purple-700">Sincronizar Modelos</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3">Modelo</th>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Context Window</th>
              <th className="px-4 py-3">Ativo</th>
              <th className="px-4 py-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {store.models.map((m, i) => (
              <tr key={i} className="hover:bg-gray-50/50">
                <td className="px-4 py-3 font-medium text-gray-900">{m.name}</td>
                <td className="px-4 py-3 text-gray-600">{m.provider}</td>
                <td className="px-4 py-3 text-gray-600">{m.contextWindow.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 text-xs rounded-full font-medium border ${m.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                    {m.isActive ? 'Sim' : 'Não'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => toggleModelActive(m.id)} className={`text-sm font-medium ${m.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}>
                    {m.isActive ? 'Desativar' : 'Ativar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ContextsTab() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Context Builders</h3>
      <p className="text-sm text-gray-500">Configure as injeções automáticas de contexto baseadas na navegação do usuário.</p>
      
      <div className="space-y-4">
        {[
          { module: 'Projetos', data: ['Backlog', 'Sprint', 'Roadmap', 'Equipe'] },
          { module: 'Empresas', data: ['Indicadores de Evolução', 'Clientes', 'Produtos', 'Saúde'] },
          { module: 'Financeiro', data: ['Receitas', 'Despesas', 'Fluxo de Caixa', 'MRR'] }
        ].map((ctx, i) => (
          <div key={i} className="p-4 rounded-xl border border-gray-200 flex flex-col gap-3">
            <h4 className="font-bold text-gray-900">{ctx.module}</h4>
            <div className="flex flex-wrap gap-2">
              {ctx.data.map((d, j) => (
                <span key={j} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium border border-gray-200">
                  {d}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ToolsTab() {
  return (
    <div className="space-y-6 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
      <Wrench className="w-12 h-12 text-gray-300 mb-4" />
      <h3 className="text-xl font-bold text-gray-900">Permissões de Ferramentas</h3>
      <p className="text-gray-500 max-w-md">Gerencie quais ações e dados cada agente pode manipular autonomamente. (Em desenvolvimento para a v2.0)</p>
    </div>
  );
}

function UsageTab() {
  return (
    <div className="space-y-6 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
      <LineChart className="w-12 h-12 text-gray-300 mb-4" />
      <h3 className="text-xl font-bold text-gray-900">Painel de Utilização</h3>
      <p className="text-gray-500 max-w-md">Estatísticas detalhadas de uso por Workspace e Usuário.</p>
    </div>
  );
}

function MemoryTab() {
  return (
    <div className="space-y-6 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
      <Save className="w-12 h-12 text-gray-300 mb-4" />
      <h3 className="text-xl font-bold text-gray-900">Memória de Workspaces</h3>
      <p className="text-gray-500 max-w-md">Visualização de resumos e preferências armazenadas a longo prazo para cada Workspace.</p>
    </div>
  );
}

function LogsTab() {
  const store = useAIStore();
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Logs de Transações</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Agente</th>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Tokens (Total)</th>
              <th className="px-4 py-3">Duração</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {store.history.length === 0 ? (
               <tr>
                 <td colSpan={6} className="px-4 py-6 text-center text-gray-500">Nenhum log registrado ainda. Realize testes ou use a IA na plataforma.</td>
               </tr>
            ) : store.history.map((log, i) => (
              <tr key={i} className="hover:bg-gray-50/50">
                <td className="px-4 py-3 font-medium text-gray-900">{new Date(log.date).toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-600">{log.agentName}</td>
                <td className="px-4 py-3 text-gray-600">{log.provider}</td>
                <td className="px-4 py-3 text-gray-600">{log.tokens?.total || '-'}</td>
                <td className="px-4 py-3 text-gray-600">{log.duration ? `${log.duration}ms` : '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 text-xs rounded-full font-medium border ${!log.error ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {!log.error ? 'Sucesso' : 'Erro'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TestingTab() {
  const store = useAIStore();
  const { fetchWithAuth } = useAuth();
  const [selectedAgentId, setSelectedAgentId] = useState<string>(store.agents[0]?.id || '');
  const [module, setModule] = useState('project');
  const [selectedProvider, setSelectedProvider] = useState<string>('Auto');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<{ rawString?: string, result?: string, error?: string, metrics?: any } | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedAgent = store.agents.find(a => a.id === selectedAgentId);

  const handleTest = async () => {
     if (!selectedAgent) return;
     setLoading(true);
     setOutput(null);

     try {
       const { ContextBuilder } = await import('../../../ai/context/ContextBuilder');
       const context = await ContextBuilder.buildContext(module as any, 'test-entity-123');
       
       const finalPrompt = input 
          ? `Input do usuário:\n${input}`
          : 'Teste genérico do agente.';

       const response = await fetchWithAuth('/api/ai/chat', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           message: finalPrompt,
           context,
           agentId: selectedAgent.id,
           overrideAgent: selectedAgent
         })
       });

       if (!response.ok) {
         const errorText = await response.text();
         throw new Error(`Erro na API: ${errorText}`);
       }

       const responseData = await response.json();

       setOutput({
          rawString: ContextBuilder.formatContextForPrompt(context),
          result: responseData.text,
          metrics: {
            duration: responseData.duration || 0,
            tokens: responseData.tokensUsed || { total: responseData.tokensUsed || 0 },
            provider: responseData.provider || 'Groq'
          }
       });

       aiStore.logHistory({
          date: new Date().toISOString(),
          agentName: selectedAgent.name,
          provider: responseData.metrics?.provider || 'Groq',
          duration: responseData.metrics?.duration || 0,
          tokens: responseData.metrics?.tokens || { total: 0 },
       });

     } catch (e: any) {
       setOutput({ error: e.message || 'Unknown error' });
       aiStore.logHistory({
          date: new Date().toISOString(),
          agentName: selectedAgent.name,
          error: true
       });
     } finally {
       setLoading(false);
     }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Playground de Agentes</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agente</label>
              <select value={selectedAgentId} onChange={(e) => setSelectedAgentId(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-200 text-sm">
                {store.agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contexto Simulado</label>
              <select value={module} onChange={(e) => setModule(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-200 text-sm">
                <option value="project">Projeto</option>
                <option value="finance">Financeiro</option>
                <option value="company">Empresa</option>
                <option value="product">Produto</option>
                <option value="idea">Ideia</option>
                <option value="workspace">Workspace Geral</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provedor Override</label>
              <select value={selectedProvider} onChange={(e) => setSelectedProvider(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-200 text-sm">
                <option value="Auto">Auto (Fallback/Engine)</option>
                {store.providers.filter(p => p.status === 'Ativo').map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entrada (Simulação do Usuário)</label>
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-32 p-3 rounded-lg border border-gray-200 text-sm resize-none focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Ex: Crie um plano de ação para este projeto..."
            />
          </div>
          <button 
             onClick={handleTest}
             disabled={loading}
             className="w-full bg-gray-900 text-white font-medium py-2.5 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <TestTube className="w-5 h-5" />}
            {loading ? 'Processando...' : 'Executar Simulação'}
          </button>
        </div>
        
        <div className="bg-gray-900 rounded-xl p-5 text-gray-300 font-mono text-xs overflow-y-auto h-auto min-h-[384px] max-h-[600px] flex flex-col gap-4">
          {!output && !loading ? (
             <div className="text-gray-500 h-full flex items-center justify-center text-center">Aguardando simulação... preencha os dados e execute.</div>
          ) : (
            <>
              {output?.rawString && (
                <div>
                  <div className="text-gray-500 mb-1">// Contexto Injetado:</div>
                  <pre className="text-blue-300 whitespace-pre-wrap">{output.rawString}</pre>
                </div>
              )}
              {output?.result && (
                <div>
                  <div className="text-gray-500 mb-1">// Resposta do Modelo:</div>
                  <div className="text-green-400 whitespace-pre-wrap leading-relaxed">{output.result}</div>
                </div>
              )}
              {output?.error && (
                <div>
                  <div className="text-red-500 mb-1">// Error:</div>
                  <div className="text-red-400">{output.error}</div>
                </div>
              )}
              {output?.metrics && (
                <div className="border-t border-gray-800 pt-4 mt-4 text-gray-500 flex flex-wrap gap-4">
                   <div>Provider: <span className="text-gray-300">{output.metrics.provider}</span></div>
                   <div>Time: <span className="text-gray-300">{output.metrics.duration}ms</span></div>
                   {output.metrics.tokens && (
                     <div>Tokens: <span className="text-gray-300">Prompt: {output.metrics.tokens.prompt} | Completion: {output.metrics.tokens.completion} | Total: {output.metrics.tokens.total}</span></div>
                   )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  const store = useAIStore();

  const updateSetting = (key: keyof AIStoreState['settings'], value: any) => {
    aiStore.saveState({ settings: { ...store.settings, [key]: value } });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h3 className="text-lg font-semibold text-gray-900">Configurações Globais da IA</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
          <div>
            <h4 className="font-bold text-gray-900">Provider Padrão</h4>
            <p className="text-sm text-gray-500">Utilizado como fallback se o agente não especificar.</p>
          </div>
          <select 
            value={store.settings?.defaultProvider || 'Groq'} 
            onChange={(e) => updateSetting('defaultProvider', e.target.value)}
            className="p-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
          >
            {store.providers.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
          </select>
        </div>
        
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
          <div>
            <h4 className="font-bold text-gray-900">Cache de Respostas</h4>
            <p className="text-sm text-gray-500">Ativar reuso de respostas para requisições idênticas.</p>
          </div>
          <div className="relative inline-flex items-center cursor-pointer" onClick={() => updateSetting('enableCache', !(store.settings?.enableCache ?? true))}>
            <input type="checkbox" className="sr-only peer" checked={store.settings?.enableCache ?? true} readOnly />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
