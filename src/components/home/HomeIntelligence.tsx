import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Mic, Paperclip, Globe, Send, ArrowRight, User, Bot, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Markdown from 'react-markdown';

interface Props {
  insights?: any[];
  onClose?: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function HomeIntelligence({ insights, onClose }: Props) {
  const { user, fetchWithAuth } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const name = user?.displayName || 'Admin';

  const quickActions = [
    { label: 'Projetos', prompt: 'Me dê um resumo do andamento dos projetos ativos.' },
    { label: 'Deploys', prompt: 'Qual o status dos últimos deploys no ecossistema?' },
    { label: 'Faturamento', prompt: 'Como está a saúde financeira do workspace atual?' },
    { label: 'Empresas', prompt: 'Liste as principais organizações cadastradas.' }
  ];

  const suggestions = [
    { label: 'Resumo operacional', prompt: 'Gere um relatório analítico sobre os indicadores da Home.' },
    { label: 'Análise de deploys', prompt: 'Existem riscos em homologação ou produção hoje?' },
  ];

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetchWithAuth('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          context: {
            history: messages.map(msg => ({
              role: msg.role === 'user' ? 'user' : 'model',
              parts: [{ text: msg.content }]
            }))
          },
          agentId: 'workspace-assistant'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Desculpe, ocorreu um erro ao processar sua solicitação no momento.' }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erro de conexão com o Cyzor Intelligence.' }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="bg-white border border-[#0F172A08] rounded-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.06)] flex flex-col h-[550px] overflow-hidden w-full">
      {/* Sidebar Header */}
      <div className="p-5 border-b border-[#0F172A05] flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-blue-600 animate-pulse" />
          <span className="text-sm font-bold text-[#111111] tracking-tight">Cyzor Intelligence</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Copilot</span>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-[#94A3B8] hover:text-[#111111] p-1.5 rounded-lg hover:bg-slate-100 transition-all"
              aria-label="Fechar Chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Main Conversational Container */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar flex flex-col">
        {messages.length === 0 ? (
          /* Empty State / Conversational Landing */
          <div className="my-auto flex flex-col items-center text-center px-4">
            <h2 className="text-2xl font-bold text-[#111111] tracking-tight mb-2">
              Como posso ajudar<br />você, {name}?
            </h2>
            <p className="text-xs text-[#64748B] max-w-xs leading-relaxed mb-6">
              Você pode perguntar qualquer coisa sobre os projetos, faturamento, deploys ou operações do ecossistema.
            </p>

            {/* Quick Action Capsules */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(action.prompt)}
                  className="text-xs font-semibold text-[#475569] bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-full hover:bg-[#111111] hover:text-white hover:border-transparent transition-all duration-300"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat Messages List */
          <div className="space-y-4 flex-1">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role !== 'user' && (
                  <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5 border border-blue-100">
                    <Bot size={14} />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-[20px] p-4 text-xs leading-relaxed ${msg.role === 'user' ? 'bg-[#111111] text-white rounded-tr-none' : 'bg-slate-50 text-[#334155] rounded-tl-none border border-[#0F172A05]'}`}>
                  {msg.role === 'user' ? (
                    msg.content
                  ) : (
                    <div className="markdown-body text-left">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-[#111111] flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5 border border-blue-100 animate-pulse">
                  <Bot size={14} />
                </div>
                <div className="bg-slate-50 rounded-[20px] rounded-tl-none p-4 border border-[#0F172A05] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Box Bottom Container */}
      <div className="p-6 border-t border-[#0F172A05] bg-white flex flex-col gap-3">
        {/* Quick Suggestion Chips (visible before or during chat) */}
        {messages.length === 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {suggestions.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSend(sug.prompt)}
                className="text-[10px] font-bold text-[#64748B] hover:text-[#111111] bg-[#FAFAFA] border border-[#0F172A05] hover:border-slate-300 px-3 py-1 rounded-xl whitespace-nowrap transition-all duration-300 flex-shrink-0"
              >
                {sug.label}
              </button>
            ))}
          </div>
        )}

        {/* Input Text Area Wrapper */}
        <div className="flex items-center gap-2 border border-[#0F172A08] bg-[#FAFAFA] rounded-2xl p-2 focus-within:border-slate-300 transition-all">
          <div className="flex items-center gap-1.5 pl-1.5">
            <button className="text-[#94A3B8] hover:text-[#111111] p-1.5 rounded-lg hover:bg-white transition-all"><Mic size={14} /></button>
            <button className="text-[#94A3B8] hover:text-[#111111] p-1.5 rounded-lg hover:bg-white transition-all"><Paperclip size={14} /></button>
            <button className="text-[#94A3B8] hover:text-[#111111] p-1.5 rounded-lg hover:bg-white transition-all"><Globe size={14} /></button>
          </div>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend(input)}
            placeholder="Como posso ajudar hoje?"
            className="flex-1 bg-transparent text-xs text-[#111111] placeholder-[#94A3B8] focus:outline-none px-2 py-1.5"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || loading}
            className="bg-[#111111] hover:bg-blue-600 text-white rounded-xl p-2 transition-all disabled:opacity-50 disabled:hover:bg-[#111111]"
          >
            <Send size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
