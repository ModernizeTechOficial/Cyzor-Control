import { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { View } from '../types';

export default function AIAssistant({ setCurrentView }: { setCurrentView?: (view: View) => void }) {
  const { token, activeWorkspace } = useAuth();
  const [insight, setInsight] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsight = async () => {
      if (!activeWorkspace) return;
      
      const cacheKey = `ai_insight_${activeWorkspace.id}`;
      const ignoredKey = `ai_insight_ignored_${activeWorkspace.id}`;
      
      const ignoredAt = sessionStorage.getItem(ignoredKey);
      const oneHour = 60 * 60 * 1000;
      
      if (ignoredAt && (Date.now() - parseInt(ignoredAt)) < oneHour) {
        setInsight(null);
        setLoading(false);
        return;
      }

      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < oneHour) {
            setInsight(parsed.data);
            setLoading(false);
            return;
          }
        } catch (e) {
          // ignore parsing error let it fetch
        }
      }

      try {
        const response = await fetch('/api/ai/insights', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setInsight(data);
          sessionStorage.setItem(cacheKey, JSON.stringify({
            data,
            timestamp: Date.now()
          }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsight();
  }, [token, activeWorkspace]);

  const handleAction = () => {
    if (setCurrentView) {
      setCurrentView('ia');
    }
  };

  const handleIgnore = () => {
    setInsight(null);
    if (activeWorkspace) {
      sessionStorage.setItem(`ai_insight_ignored_${activeWorkspace.id}`, Date.now().toString());
      sessionStorage.removeItem(`ai_insight_${activeWorkspace.id}`);
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[30px] p-8 flex flex-col gap-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] relative overflow-hidden">
      {/* Cyzor Tech Detail */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#111111]/10 to-transparent"></div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[14px] bg-[#111111] flex items-center justify-center flex-shrink-0">
            <Sparkles size={18} className="text-[#FFFFFF]" />
          </div>
          <h3 className="text-xl font-display font-bold text-[#111111] tracking-tight">Intelligence</h3>
        </div>
      </div>
      <div className="bg-[#FAFAFA] border border-[#0F172A0F] p-5 rounded-[20px] text-sm text-[#64748B] leading-relaxed relative min-h-[100px] flex flex-col justify-center">
        {loading ? (
           <div className="flex items-center justify-center gap-2">
             <Loader2 size={16} className="animate-spin text-[#111111]" />
             <span>Analisando base de dados...</span>
           </div>
        ) : (
          <>
            <div className="absolute -left-1 top-6 w-2 h-2 rounded-full bg-[#111111] animate-pulse"></div>
            {insight ? (
              <>
                <strong className="text-[#111111] block mb-1">Anomalia detectada / Risco:</strong> 
                {insight.risk}
                <hr className="my-2 border-[#0F172A0F]" />
                <strong className="text-[#111111] block mb-1">Recomendação:</strong>
                {insight.recommendation}
              </>
            ) : (
               <span>Nenhuma anomalia crítica detectada no momento.</span>
            )}
          </>
        )}
      </div>
      <div className="flex gap-3 mt-auto pt-2">
        <button onClick={handleAction} disabled={loading || !insight} className="flex-1 bg-[#111111] text-[#FFFFFF] py-3 rounded-[14px] text-sm font-bold shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:bg-black transition-colors disabled:opacity-50">Iniciar Ação</button>
        <button onClick={handleIgnore} disabled={loading || !insight} className="flex-1 bg-[#FFFFFF] border border-[#0F172A0F] text-[#111111] py-3 rounded-[14px] text-sm font-bold hover:bg-[#FAFAFA] transition-colors disabled:opacity-50">Ignorar</button>
      </div>
    </div>
  );
}
