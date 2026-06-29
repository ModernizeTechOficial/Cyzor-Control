import { TrendingUp, Activity, Award, Clock } from 'lucide-react';

export default function IdeaInsights() {
  const topIdeas = [
    { name: 'Cyzor Analytics AI', score: 98, metric: 'Score' },
    { name: 'Integração WhatsApp API', score: 95, metric: 'Score' },
    { name: 'Módulo de Pagamentos', score: 92, metric: 'Score' },
  ];

  const activities = [
    { text: 'João moveu "Chatbot" para Pesquisa', time: 'Há 10 min' },
    { text: 'Maria adicionou 3 anexos em "ERP Mobile"', time: 'Há 1h' },
    { text: 'Carlos comentou em "Integração Stripe"', time: 'Há 2h' },
  ];

  return (
    <div className="flex flex-col gap-6">
      
      {/* Top Ideas */}
      <div className="bg-white border border-[#0F172A08] rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
            <Award size={18} className="text-amber-500" />
            Top Ideias
          </h3>
        </div>

        <div className="flex flex-col gap-4">
          {topIdeas.map((idea, i) => (
            <div key={i} className="flex items-center justify-between group">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-[#64748B] font-bold text-xs w-4">{i + 1}.</span>
                <p className="text-sm font-semibold text-[#111111] truncate">{idea.name}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{idea.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-[#0F172A08] rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
            <Activity size={18} className="text-[#64748B]" />
            Atividade Recente
          </h3>
        </div>

        <div className="flex flex-col gap-5">
          {activities.map((act, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FAFAFA] border border-[#0F172A05] flex items-center justify-center shrink-0 mt-0.5">
                <Clock size={14} className="text-[#64748B]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#111111] leading-snug mb-1">{act.text}</p>
                <p className="text-xs font-semibold text-[#64748B]">{act.time}</p>
              </div>
            </div>
          ))}
        </div>
        
        <button className="w-full mt-6 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#0F172A08] text-[#111111] text-xs font-bold uppercase tracking-widest hover:bg-white transition-all">
          Ver todas
        </button>
      </div>

    </div>
  );
}
