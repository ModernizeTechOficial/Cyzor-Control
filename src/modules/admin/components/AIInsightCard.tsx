import React from 'react';
import { Sparkles, ArrowUpRight, TrendingUp, ShieldAlert, Zap, Layers, RefreshCw } from 'lucide-react';

export default function AIInsightCard() {
  const insights = [
    {
      id: 1,
      type: 'success',
      icon: TrendingUp,
      title: 'Aceleração de Receita',
      description: 'A receita recorrente mensal (MRR) cresceu 18.4% nos últimos 7 dias.',
      badge: 'Faturamento'
    },
    {
      id: 2,
      type: 'info',
      icon: Zap,
      title: 'Plano Pro Líder de Vendas',
      description: 'O plano Professional é a assinatura mais adquirida pelas novas empresas (64% de adesão).',
      badge: 'SaaS Catalogo'
    },
    {
      id: 3,
      type: 'warning',
      icon: ShieldAlert,
      title: 'Limites de Quotas Próximos',
      description: '2 workspaces parceiros atingiram 90% do limite máximo de armazenamento em nuvem.',
      badge: 'Recursos'
    },
    {
      id: 4,
      type: 'warning',
      icon: Layers,
      title: 'Pico de Conexões no PostgreSQL',
      description: 'Cluster de banco de dados apresentou aumento de uso (78 pool ativos). Monitorando pooling do Node.',
      badge: 'Database'
    },
    {
      id: 5,
      type: 'opportunity',
      icon: Sparkles,
      title: 'Potencial de Upsell Detectado',
      description: 'Existe oportunidade para upgrade de plano Enterprise em 5 empresas de alto tráfego.',
      badge: 'Inteligência'
    }
  ];

  return (
    <div className="bg-white border border-[#ECECEF] rounded-[24px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_25px_rgba(0,0,0,0.03)] transition-all duration-300">
      <div className="flex items-center justify-between pb-4 border-b border-[#ECECEF] mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Sparkles size={14} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 font-mono">CYZOR AI Insights</h3>
            <p className="text-[10px] text-zinc-400 font-medium font-sans">Sugestões de negócio geradas dinamicamente</p>
          </div>
        </div>
        <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full">
          Agent Active
        </span>
      </div>

      <div className="space-y-3.5">
        {insights.map((insight) => {
          const Icon = insight.icon;
          let badgeStyle = 'bg-zinc-50 border-zinc-200 text-zinc-600';
          let iconStyle = 'bg-zinc-50 text-zinc-700 border-[#ECECEF]';
          if (insight.type === 'success') {
            badgeStyle = 'bg-emerald-50 border-emerald-100 text-emerald-700';
            iconStyle = 'bg-emerald-50 text-emerald-600 border-emerald-100';
          } else if (insight.type === 'warning') {
            badgeStyle = 'bg-rose-50 border-rose-100 text-rose-700';
            iconStyle = 'bg-rose-50 text-rose-600 border-rose-100';
          } else if (insight.type === 'opportunity') {
            badgeStyle = 'bg-indigo-50 border-indigo-100 text-indigo-700';
            iconStyle = 'bg-indigo-50 text-indigo-600 border-indigo-100';
          }

          return (
            <div 
              key={insight.id} 
              className="flex items-start gap-3.5 p-3 rounded-[16px] border border-[#ECECEF] hover:border-zinc-300 hover:shadow-sm transition-all bg-white relative overflow-hidden group"
            >
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 ${iconStyle}`}>
                <Icon size={14} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <h4 className="text-[11px] font-bold text-zinc-950 truncate">{insight.title}</h4>
                  <span className={`text-[8px] font-mono uppercase tracking-widest font-extrabold px-1.5 py-0.2 rounded border shrink-0 ${badgeStyle}`}>
                    {insight.badge}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">{insight.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-[#ECECEF] flex justify-between items-center text-[9px] text-zinc-400 font-mono">
        <span>Próximo diagnóstico em:</span>
        <span className="font-bold flex items-center gap-1">
          <RefreshCw size={10} className="animate-spin text-indigo-600" />
          Realtime
        </span>
      </div>
    </div>
  );
}
