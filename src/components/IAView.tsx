import { useState, useEffect } from 'react';
import { BotMessageSquare, Send, Sparkles, AlertTriangle, TrendingUp, Compass, Clock, Database, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import Markdown from 'react-markdown';
import StandardHeader from './layout/StandardHeader';

const SUGGESTIONS = [
  "Qual projeto devo priorizar?",
  "Quais ideias possuem maior potencial?",
  "Quais tarefas estão atrasadas?",
  "Quais empresas geram mais receita?",
  "O que está bloqueando meus projetos?"
];

export default function IAView() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Olá! Sou seu assistente de IA. Tenho acesso a todas as suas empresas, projetos, ideias, documentações e dados financeiros. Como posso ajudar você hoje?' }
  ]);
  const [insights, setInsights] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [memoryStats, setMemoryStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const { fetchWithAuth, activeWorkspace } = useAuth();

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

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 h-auto lg:h-[calc(100vh-220px)] text-left">
      
      {/* Principal: Chat Interface */}
      <div className="flex-1 flex flex-col bg-[#FFFFFF] rounded-[24px] sm:rounded-[30px] border border-[#0F172A0F] shadow-[0_20px_60px_rgba(0,0,0,0.02)] overflow-hidden h-[600px] lg:h-full">
        
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
        <div className="p-4 sm:p-6 border-t border-[#0F172A0F] bg-[#FFFFFF] flex-shrink-0">
          <div className="relative group flex items-center">
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend(query);
              }}
              placeholder="Pergunte sobre seus projetos..."
              className="w-full bg-[#FAFAFA] border border-[#0F172A0F] rounded-[16px] sm:rounded-[20px] py-3 sm:py-4 pl-4 sm:pl-6 pr-12 sm:pr-16 outline-none focus:border-[#111111]/30 hover:border-[#0F172A0F]-dark transition-all text-xs sm:text-sm font-medium placeholder:text-[#64748B]/50 shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
            />
            <button 
              onClick={() => handleSend(query)}
              disabled={!query.trim()}
              className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-[10px] sm:rounded-[14px] bg-[#111111] text-[#FFFFFF] flex items-center justify-center hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={14} className="-ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Painel Lateral */}
      <div className="w-full lg:w-[380px] flex-shrink-0 flex flex-col gap-6 lg:overflow-y-auto custom-scrollbar pb-6 lg:pr-2 h-auto lg:h-full">
        
        {/* Insights Área */}
        <div className="bg-[#FFFFFF] rounded-[24px] border border-[#0F172A0F] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col gap-6">
          <h3 className="text-sm font-bold uppercase text-[#111111] tracking-widest flex items-center gap-2 border-b border-[#0F172A0F] pb-3">
            <Sparkles size={16} /> Insights da Semana
          </h3>
          
          <div className="flex flex-col gap-5 text-left">
            {/* Resumo */}
            <div className="flex gap-3">
              <Compass size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-[#111111]">Resumo Automático</span>
                {loadingInsights ? (
                  <div className="h-4 bg-gray-100 rounded w-full animate-pulse mt-1"></div>
                ) : (
                  <p className="text-[11px] text-[#64748B] leading-relaxed">{insights?.summary || 'Carregando resumo...'}</p>
                )}
              </div>
            </div>

            {/* Oportunidades */}
            <div className="flex gap-3">
              <TrendingUp size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-[#111111]">Oportunidade</span>
                {loadingInsights ? (
                  <div className="h-4 bg-gray-100 rounded w-full animate-pulse mt-1"></div>
                ) : (
                  <p className="text-[11px] text-[#64748B] leading-relaxed">{insights?.opportunity || 'Nenhuma oportunidade aparente.'}</p>
                )}
              </div>
            </div>

            {/* Riscos */}
            <div className="flex gap-3">
              <AlertTriangle size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-[#111111]">Riscos Detectados</span>
                {loadingInsights ? (
                  <div className="h-4 bg-gray-100 rounded w-full animate-pulse mt-1"></div>
                ) : (
                  <p className="text-[11px] text-[#64748B] leading-relaxed">{insights?.risk || 'Nenhum risco severo detectado.'}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <CheckCircle2 size={18} className="text-[#10B981] flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-[#111111]">Recomendações</span>
                {loadingInsights ? (
                  <div className="h-4 bg-gray-100 rounded w-full animate-pulse mt-1"></div>
                ) : (
                  <p className="text-[11px] text-[#64748B] leading-relaxed">{insights?.recommendation || 'Gere mais registros para obter recomendações.'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Memória Organizacional */}
        <div className="bg-[#FFFFFF] rounded-[24px] border border-[#0F172A0F] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-[#0F172A0F] pb-3">
            <h3 className="text-sm font-bold uppercase text-[#111111] tracking-widest flex items-center gap-2">
              <Database size={16} /> Memória
            </h3>
            <span className="text-[10px] font-bold bg-[#FAFAFA] text-[#10B981] border border-[#10B981]/20 px-2 py-0.5 rounded flex items-center gap-1">
              Indexado
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-[12px] p-3 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Empresas</span>
              {loadingStats ? <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse mt-0.5"></div> : <span className="font-bold text-[#111111]">{memoryStats?.companies || 0} Ativas</span>}
            </div>
            <div className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-[12px] p-3 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Produtos</span>
              {loadingStats ? <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse mt-0.5"></div> : <span className="font-bold text-[#111111]">{memoryStats?.products || 0} Registrados</span>}
            </div>
            <div className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-[12px] p-3 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Projetos</span>
              {loadingStats ? <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse mt-0.5"></div> : <span className="font-bold text-[#111111]">{memoryStats?.projects || 0} em Andamento</span>}
            </div>
            <div className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-[12px] p-3 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Ideias</span>
              {loadingStats ? <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse mt-0.5"></div> : <span className="font-bold text-[#111111]">{memoryStats?.ideas || 0} Validações</span>}
            </div>
            <div className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-[12px] p-3 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Documentos</span>
              {loadingStats ? <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse mt-0.5"></div> : <span className="font-bold text-[#111111]">{memoryStats?.documents || 0} Indexados</span>}
            </div>
            <div className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-[12px] p-3 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Financeiro</span>
              {loadingStats ? <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse mt-0.5"></div> : <span className="font-bold text-[#111111]">{memoryStats?.financeSync ? 'Sincronizado' : 'Pendente'}</span>}
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <Clock size={12} className="text-[#64748B]" />
            <span className="text-[10px] font-medium text-[#64748B]">Última sincronização: Há 5 minutos</span>
          </div>

        </div>

      </div>
      </div>
    </div>
  );
}
