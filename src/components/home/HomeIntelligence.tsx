import { Sparkles } from 'lucide-react';

interface Insight {
  id: string;
  message: string;
  type: 'high' | 'medium' | 'low';
}

interface Props {
  insights: Insight[];
}

export default function HomeIntelligence({ insights }: Props) {
  return (
    <div className="bg-[#111111] text-white border border-slate-800 rounded-[24px] p-8">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles size={18} className="text-blue-400" />
        <h2 className="text-lg font-bold">Cyzor Intelligence</h2>
      </div>
      <div className="space-y-4">
        {insights.map(insight => (
          <div key={insight.id} className="p-4 bg-slate-900 rounded-xl border border-slate-800">
            <p className="text-sm font-medium">{insight.message}</p>
            <button className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mt-2">Resolver</button>
          </div>
        ))}
        {insights.length === 0 && <p className="text-sm text-slate-400">Sistema operando normalmente.</p>}
      </div>
    </div>
  );
}
