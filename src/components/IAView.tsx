import { useState, useEffect } from 'react';
import { BotMessageSquare, Send, Sparkles, AlertTriangle, TrendingUp, Compass, Clock, Database, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import Markdown from 'react-markdown';
import StandardHeader from './layout/StandardHeader';
import { motion } from 'motion/react';
import { View } from '../types';

const SUGGESTIONS = [
  "Qual projeto devo priorizar?",
  "Quais ideias possuem maior potencial?",
  "Quais tarefas estão atrasadas?",
  "Quais empresas geram mais receita?",
  "O que está bloqueando meus projetos?"
];

export default function IAView({ setCurrentView }: { setCurrentView: (view: View) => void }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Olá! Sou seu assistente de IA. Tenho acesso a todas as suas empresas, projetos, ideias, documentações e dados financeiros. Como posso ajudar você hoje?' }
  ]);
  const [insights, setInsights] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [memoryStats, setMemoryStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const { fetchWithAuth, activeWorkspace, dbUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'chat' | 'insights' | 'usage'>('chat');

  useEffect(() => {
    const fetchInsightsAndStats = async () => {
      try {
        const cacheKey = activeWorkspace ? `ai_insight_${activeWorkspace.id}` : null;
        let cachedInsight = null;
        
        if (cacheKey) {
          const cachedStr = sessionStorage.getItem(cacheKey);
          if (cachedStr) {
            try {
              const parsed = JSON.parse(cachedStr);
              if (Date.now() - parsed.timestamp < 60 * 60 * 1000) {
                cachedInsight = parsed.data;
              }
            } catch (e) {}
          }
        }

        const promises = [];
        
        if (cachedInsight) {
          setInsights(cachedInsight);
          setLoadingInsights(false);
        } else {
          promises.push(
            fetchWithAuth('/api/ai/insights')
              .then(res => res.json())
              .then(data => {
                setInsights(data);
                if (cacheKey) {
                  sessionStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
                }
              })
              .catch(console.error)
              .finally(() => setLoadingInsights(false))
          );
        }
        
        promises.push(
          fetchWithAuth('/api/ai/memory-stats')
            .then(res => res.json())
            .then(data => setMemoryStats(data))
            .catch(console.error)
            .finally(() => setLoadingStats(false))
        );

        await Promise.all(promises);
      } catch (err) {
        console.error(err);
      }
    };
    fetchInsightsAndStats();
  }, [fetchWithAuth, activeWorkspace]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    setQuery('');
    
    // Add user message
    setMessages(prev => [
      ...prev,
      { role: 'user', text }
    ]);

    // Add temporary assistant loading
    setMessages(prev => [
      ...prev,
      { role: 'assistant', text: 'Analisando dados...' }
    ]);

    try {
      const response = await fetchWithAuth('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          prompt: text,
          history: messages
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao obter resposta da IA');
      }

      const data = await response.json();

      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { role: 'assistant', text: data.text };
        return newMessages;
      });
    } catch (error) {
      console.error('Gemini API Error:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { role: 'assistant', text: 'Desculpe, ocorreu um erro ao se conectar com a IA.' };
        return newMessages;
      });
    }
  };

  return (
    <div className="flex flex-col gap-10 h-full animate-in fade-in duration-500 px-4 sm:px-6 lg:px-10">
      <StandardHeader 
        title="IA Intelligence"
        subtitle="Olimpo AI: Seu assistente de inteligência organizacional com acesso total ao ecossistema."
        actions={[
          {
            label: 'Sincronizar',
            icon: RefreshCw,
            onClick: () => {},
            variant: 'secondary'
          }
        ]}
      />

      {/* Tab Navigation */}
      <div className="flex border-b border-[#0F172A0F] gap-6">
        <button 
          onClick={() => setActiveTab('chat')}
          className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === 'chat' ? 'text-[#111111]' : 'text-[#64748B] hover:text-[#111111]'}`}
        >
          Chat Intelligence
          {activeTab === 'chat' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#111111] rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('insights')}
          className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === 'insights' ? 'text-[#111111]' : 'text-[#64748B] hover:text-[#111111]'}`}
        >
          Insights & Memória
          {activeTab === 'insights' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#111111] rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('usage')}
          className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === 'usage' ? 'text-[#111111]' : 'text-[#64748B] hover:text-[#111111]'}`}
        >
          Meu Uso (Beta)
          {activeTab === 'usage' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#111111] rounded-t-full" />}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 h-auto lg:min-h-[600px] text-left">
      
      {/* Principal Content Based on Tabs */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col bg-[#FFFFFF] rounded-[24px] sm:rounded-[30px] border border-[#0F172A0F] shadow-[0_20px_60px_rgba(0,0,0,0.02)] overflow-hidden h-[70vh] lg:h-[calc(100vh-320px)]">
          {/* Header */}
          <div className="px-5 sm:px-8 py-4 sm:py-6 border-b border-[#0F172A0F] bg-[#FAFAFA] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[12px] sm:rounded-[16px] bg-[#111111] flex items-center justify-center shadow-md">
                <BotMessageSquare size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-display font-bold text-[#111111] tracking-tight">Olimpo AI</h1>
                <p className="text-[10px] sm:text-xs font-semibold text-[#10B981] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#10B981] animate-pulse"></span> Online
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 flex flex-col gap-5 sm:gap-6 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 sm:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-[#FAFAFA] border border-[#0F172A0F] text-[#111111] font-bold text-xs sm:text-sm' : 'bg-[#111111] text-white shadow-md'}`}>
                  {msg.role === 'user' ? 'U' : <Sparkles size={16} />}
                </div>
                <div className={`max-w-[85%] sm:max-w-[70%] p-3 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-[#111111] text-white rounded-[16px] sm:rounded-[20px] rounded-tr-none shadow-md' 
                    : 'bg-[#FAFAFA] border border-[#0F172A0F] text-[#475569] rounded-[16px] sm:rounded-[20px] rounded-tl-none shadow-sm prose prose-sm prose-neutral max-w-none'
                }`}>
                  {msg.role === 'user' ? (
                    msg.text
                  ) : (
                    <div className="markdown-body">
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Sugestões inline */}
            {messages.length === 1 && (
              <div className="mt-6 sm:mt-8 flex flex-col gap-3">
                <h3 className="text-[10px] sm:text-[11px] font-bold uppercase text-[#64748B] tracking-widest pl-1">Sugestões de perguntas</h3>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((suggestion, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => handleSend(suggestion)}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#FFFFFF] border border-[#0F172A0F] rounded-[12px] sm:rounded-[16px] text-[10px] sm:text-xs font-semibold text-[#111111] hover:bg-[#FAFAFA] hover:shadow-sm transition-all"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-5 sm:p-6 border-t border-[#0F172A05] bg-[#FFFFFF] flex-shrink-0">
            <div className="relative group flex items-center">
              <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend(query);
                }}
                placeholder="Pergunte sobre seus projetos, finanças ou clientes..."
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-3.5 pl-5 pr-14 outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm font-medium placeholder:text-slate-400 shadow-sm"
              />
              <button 
                onClick={() => handleSend(query)}
                disabled={!query.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-[#111111] text-[#FFFFFF] flex items-center justify-center hover:bg-[#222222] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm active:scale-95"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
          {/* Insights Área */}
          <div className="bg-[#FFFFFF] rounded-[24px] border border-[#0F172A0F] p-8 shadow-sm flex flex-col gap-6 h-fit">
            <h3 className="text-sm font-bold uppercase text-[#111111] tracking-widest flex items-center gap-2 border-b border-[#0F172A0F] pb-4">
              <Sparkles size={18} className="text-blue-500" /> Insights Estratégicos
            </h3>
            
            <div className="flex flex-col gap-6 text-left">
              {/* Resumo */}
              <div className="flex gap-4 p-4 bg-blue-50/30 rounded-2xl border border-blue-500/5">
                <Compass size={20} className="text-blue-500 flex-shrink-0 mt-1" />
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-black text-[#111111] uppercase tracking-wider">Resumo Operacional</span>
                  {loadingInsights ? (
                    <div className="flex flex-col gap-2">
                       <div className="h-3 bg-gray-100 rounded w-full animate-pulse"></div>
                       <div className="h-3 bg-gray-100 rounded w-3/4 animate-pulse"></div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#64748B] leading-relaxed">{insights?.summary || 'Nenhum resumo gerado para este período.'}</p>
                  )}
                </div>
              </div>

              {/* Oportunidades */}
              <div className="flex gap-4 p-4 bg-green-50/30 rounded-2xl border border-green-500/5">
                <TrendingUp size={20} className="text-green-500 flex-shrink-0 mt-1" />
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-black text-[#111111] uppercase tracking-wider">Oportunidade Detectada</span>
                  {loadingInsights ? (
                    <div className="h-3 bg-gray-100 rounded w-full animate-pulse mt-1"></div>
                  ) : (
                    <p className="text-xs text-[#64748B] leading-relaxed">{insights?.opportunity || 'O Olimpo AI está analisando o mercado para você.'}</p>
                  )}
                </div>
              </div>

              {/* Riscos */}
              <div className="flex gap-4 p-4 bg-orange-50/30 rounded-2xl border border-orange-500/5">
                <AlertTriangle size={20} className="text-orange-500 flex-shrink-0 mt-1" />
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-black text-[#111111] uppercase tracking-wider">Análise de Riscos</span>
                  {loadingInsights ? (
                    <div className="h-3 bg-gray-100 rounded w-full animate-pulse mt-1"></div>
                  ) : (
                    <p className="text-xs text-[#64748B] leading-relaxed">{insights?.risk || 'Operação estável no momento.'}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-indigo-50/30 rounded-2xl border border-indigo-500/5">
                <CheckCircle2 size={20} className="text-indigo-500 flex-shrink-0 mt-1" />
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-black text-[#111111] uppercase tracking-wider">Recomendações IA</span>
                  {loadingInsights ? (
                    <div className="h-3 bg-gray-100 rounded w-full animate-pulse mt-1"></div>
                  ) : (
                    <p className="text-xs text-[#64748B] leading-relaxed">{insights?.recommendation || 'Continue alimentando o ecossistema para novos insights.'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Memória Organizacional */}
          <div className="bg-[#FFFFFF] rounded-[24px] border border-[#0F172A0F] p-8 shadow-sm flex flex-col gap-6 h-fit">
            <div className="flex justify-between items-center border-b border-[#0F172A0F] pb-4">
              <h3 className="text-sm font-bold uppercase text-[#111111] tracking-widest flex items-center gap-2">
                <Database size={18} className="text-[#111111]" /> Memória Corporativa
              </h3>
              <span className="text-[10px] font-black bg-[#111111] text-white px-3 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                Sincronizado
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-[20px] p-4 flex flex-col gap-1">
                <span className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest">Empresas</span>
                {loadingStats ? <div className="h-5 bg-gray-100 rounded w-1/2 animate-pulse mt-1"></div> : <span className="text-lg font-display font-black text-[#111111]">{memoryStats?.companies || 0} Ativas</span>}
              </div>
              <div className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-[20px] p-4 flex flex-col gap-1">
                <span className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest">Produtos</span>
                {loadingStats ? <div className="h-5 bg-gray-100 rounded w-1/2 animate-pulse mt-1"></div> : <span className="text-lg font-display font-black text-[#111111]">{memoryStats?.products || 0} Itens</span>}
              </div>
              <div className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-[20px] p-4 flex flex-col gap-1">
                <span className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest">Projetos</span>
                {loadingStats ? <div className="h-5 bg-gray-100 rounded w-1/2 animate-pulse mt-1"></div> : <span className="text-lg font-display font-black text-[#111111]">{memoryStats?.projects || 0} Ativos</span>}
              </div>
              <div className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-[20px] p-4 flex flex-col gap-1">
                <span className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest">Ideias</span>
                {loadingStats ? <div className="h-5 bg-gray-100 rounded w-1/2 animate-pulse mt-1"></div> : <span className="text-lg font-display font-black text-[#111111]">{memoryStats?.ideas || 0} Nodes</span>}
              </div>
              <div className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-[20px] p-4 flex flex-col gap-1">
                <span className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest">Documentos</span>
                {loadingStats ? <div className="h-5 bg-gray-100 rounded w-1/2 animate-pulse mt-1"></div> : <span className="text-lg font-display font-black text-[#111111]">{memoryStats?.documents || 0} Lidos</span>}
              </div>
              <div className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-[20px] p-4 flex flex-col gap-1">
                <span className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest">Financeiro</span>
                {loadingStats ? <div className="h-5 bg-gray-100 rounded w-1/2 animate-pulse mt-1"></div> : <span className="text-lg font-display font-black text-[#111111]">{memoryStats?.financeSync ? 'Conectado' : 'Aguardando'}</span>}
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-2 px-1">
              <Clock size={12} className="text-[#A1A1AA]" />
              <span className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest">Atualizado em tempo real</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'usage' && (
        <div className="flex-1 bg-white border border-[#0F172A0F] rounded-[30px] p-8 md:p-12 shadow-sm animate-in fade-in zoom-in-95 duration-300">
           <div className="max-w-3xl mx-auto flex flex-col gap-10">
              <div className="flex flex-col gap-3">
                <h2 className="text-3xl font-display font-black text-[#111111] tracking-tight">Consumo de Inteligência</h2>
                <p className="text-sm text-[#64748B] leading-relaxed">Acompanhe seu uso individual do Olimpo AI. No futuro, você poderá gerenciar seu saldo de tokens e faturas aqui.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-2xl p-6 flex flex-col gap-1">
                  <span className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest mb-2">Tokens Usados (Mês)</span>
                  <span className="text-2xl font-display font-black text-[#111111]">1.2k</span>
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full w-fit">Plano {dbUser?.currentPlan || 'Free'}</span>
                </div>
                <div className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-2xl p-6 flex flex-col gap-1">
                  <span className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest mb-2">Requisições IA</span>
                  <span className="text-2xl font-display font-black text-[#111111]">42</span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit">Ativo</span>
                </div>
                <div className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-2xl p-6 flex flex-col gap-1">
                  <span className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest mb-2">Saldo de Créditos</span>
                  <span className="text-2xl font-display font-black text-[#111111]">Ilimitado</span>
                  <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full w-fit">Beta Access</span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-black uppercase text-[#111111] tracking-widest">Histórico Recente</h3>
                <div className="border border-[#0F172A0F] rounded-2xl overflow-hidden">
                   <div className="bg-[#FAFAFA] p-4 text-[10px] font-black text-[#64748B] uppercase tracking-widest flex justify-between border-b border-[#0F172A0F]">
                      <span>Operação</span>
                      <span>Tokens</span>
                   </div>
                   <div className="divide-y divide-[#0F172A0F]">
                      {[
                        { op: 'Resumo de Dashboard', t: 450, d: 'Hoje' },
                        { op: 'Chat - Análise Financeira', t: 320, d: 'Hoje' },
                        { op: 'Geração de Insight', t: 150, d: 'Ontem' },
                        { op: 'Chat - Status de Projeto', t: 280, d: 'Ontem' },
                      ].map((h, i) => (
                        <div key={i} className="p-4 flex justify-between items-center bg-white hover:bg-[#FAFAFA] transition-colors">
                           <div className="flex flex-col">
                              <span className="text-xs font-bold text-[#111111]">{h.op}</span>
                              <span className="text-[9px] text-[#A1A1AA] font-bold uppercase">{h.d}</span>
                           </div>
                           <span className="text-xs font-black text-[#111111]">{h.t} tokens</span>
                        </div>
                      ))}
                   </div>
                </div>
              </div>

              <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Sparkles size={120} />
                 </div>
                 <div className="relative z-10 flex flex-col gap-4 max-w-md">
                    <h4 className="text-xl font-display font-black tracking-tight">Precisa de mais potência?</h4>
                    <p className="text-xs text-blue-100 leading-relaxed font-medium">Os planos corporativos oferecem modelos Gemini 1.5 Pro com maior janela de contexto e processamento prioritário.</p>
                    <button onClick={() => setCurrentView('configuracoes')} className="bg-white text-blue-600 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-all w-fit mt-2">Ver Planos Pro</button>
                 </div>
              </div>
           </div>
        </div>
      )}
      
      </div>
    </div>
  );
}
