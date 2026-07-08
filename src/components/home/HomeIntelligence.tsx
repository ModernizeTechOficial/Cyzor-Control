import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Mic, Paperclip, Globe, Send, ArrowRight, User, Bot, AlertCircle, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Markdown from 'react-markdown';
import { showSuccess, showError } from '../../lib/alerts';

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
  const [isMuted, setIsMuted] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const name = user?.displayName || 'Admin';

  const handleMicClick = () => {
    if (isRecording) {
      setIsRecording(false);
      showSuccess('Gravação finalizada.');
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showError('Seu navegador não suporta reconhecimento de voz.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      showSuccess('Ouvindo... Fale agora.');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
      if (event.error === 'not-allowed') {
        showError('Permissão de microfone negada. Autorize o uso do microfone no navegador.');
      } else if (event.error !== 'no-speech') {
        showError('Erro ao gravar áudio. Tente novamente.');
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    try {
      recognition.start();
    } catch (e) {
      setIsRecording(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.csv')) {
        try {
          const text = await file.text();
          // Truncate if too long to avoid token limits
          const truncated = text.substring(0, 3000);
          setInput(prev => prev + `\n[Conteúdo do arquivo ${file.name}]:\n${truncated}\n`);
          showSuccess(`O arquivo ${file.name} foi lido e adicionado ao contexto.`);
        } catch (err) {
          showError('Falha ao ler o arquivo.');
        }
      } else {
         setInput(prev => prev + ` [Arquivo anexado: ${file.name}] `);
         showSuccess(`O arquivo ${file.name} foi anexado (apenas nome). Para ler o conteúdo, use arquivos de texto.`);
      }
    }
  };

  const handlePaperclipClick = () => {
    fileInputRef.current?.click();
  };

  const handleGlobeClick = () => {
    const url = window.prompt("Insira o link (URL) que deseja enviar para o Olimpo AI analisar:");
    if (url) {
      setInput(prev => prev + ` [Link: ${url}] `);
      showSuccess('Link adicionado ao chat.');
    }
  };

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

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speakText = async (text: string) => {
    if (isMuted) return;
    
    // Stop any ongoing native speech
    window.speechSynthesis.cancel();
    
    // Stop any ongoing ElevenLabs audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    // Remove markdown symbols and format text for better narration
    const cleanText = text.replace(/[#*_~`]/g, '').replace(/\[(.*?)\]\(.*?\)/g, '$1');
    
    try {
      const response = await fetchWithAuth('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText })
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("audio/mpeg")) {
          const blob = await response.blob();
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          await audio.play();
          return; // Success! Realistic ElevenLabs audio is playing.
        }
      } else {
        const errData = await response.json();
        console.error("[ElevenLabs TTS Error]", errData);
        if (errData.error) {
          showError(`Erro ElevenLabs: ${errData.error}`);
        }
      }
    } catch (err: any) {
      console.warn("[ElevenLabs TTS] Failed, falling back to Web Speech Synthesis:", err);
    }
    
    // Fallback: Web Speech Synthesis
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.1; // Slightly faster for natural feel
    
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang === 'pt-BR' && v.name.includes('Google')) || 
                    voices.find(v => v.lang === 'pt-BR');
    if (ptVoice) {
      utterance.voice = ptVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  // Ensure voices are loaded (Chrome sometimes needs a trigger) and handle cleanup
  useEffect(() => {
    window.speechSynthesis.getVoices();
    return () => {
      window.speechSynthesis.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

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
        speakText(data.message);
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
    const handleVoiceCommand = (e: any) => {
      if (e.detail?.text) {
        handleSend(e.detail.text);
      }
    };
    
    window.addEventListener('voice-command-received', handleVoiceCommand);
    return () => window.removeEventListener('voice-command-received', handleVoiceCommand);
  }, [messages]);

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
          <button 
            onClick={() => {
              setIsMuted(!isMuted);
              if (!isMuted) window.speechSynthesis.cancel();
            }}
            className="text-[#94A3B8] hover:text-[#111111] p-1.5 rounded-lg hover:bg-slate-100 transition-all"
            title={isMuted ? "Ativar som" : "Desativar som"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
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
            <button 
              onClick={handleMicClick}
              className={`p-1.5 rounded-lg hover:bg-white transition-all ${isRecording ? 'text-red-500 bg-red-50 animate-pulse' : 'text-[#94A3B8] hover:text-[#111111]'}`}
              title="Gravar áudio"
            >
              <Mic size={14} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileChange} 
            />
            <button 
              onClick={handlePaperclipClick}
              className="text-[#94A3B8] hover:text-[#111111] p-1.5 rounded-lg hover:bg-white transition-all"
              title="Anexar arquivo"
            >
              <Paperclip size={14} />
            </button>
            <button 
              onClick={handleGlobeClick}
              className="text-[#94A3B8] hover:text-[#111111] p-1.5 rounded-lg hover:bg-white transition-all"
              title="Enviar link"
            >
              <Globe size={14} />
            </button>
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
