import { Activity, GitCommit, Building2, CreditCard, Rocket, MoreHorizontal } from 'lucide-react';

export default function CompanyActivity() {
  const activities = [
    { id: 1, type: 'deploy', text: 'Deploy realizado', project: 'App Mobile v2.0', time: 'Há 2h', icon: Rocket, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 2, type: 'payment', text: 'Pagamento recebido', project: 'Acme Corp', amount: 'R$ 15.000', time: 'Há 4h', icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 3, type: 'company', text: 'Nova empresa', project: 'Stark Industries', time: 'Há 1 dia', icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 4, type: 'project', text: 'Projeto atualizado', project: 'E-commerce B2B', time: 'Há 2 dias', icon: GitCommit, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="bg-white border border-[#0F172A08] rounded-[28px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] h-fit relative overflow-hidden">
      <div className="flex justify-between items-center mb-8 relative z-10">
        <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
          <Activity size={18} className="text-[#64748B]" />
          Atividades Recentes
        </h3>
        <button className="p-1.5 rounded-lg hover:bg-[#FAFAFA] text-[#64748B] transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-6 relative z-10">
        {activities.map((act, i) => (
          <div key={act.id} className="flex gap-4 relative group cursor-default">
            {/* Timeline Line */}
            {i !== activities.length - 1 && (
              <div className="absolute left-5 top-12 bottom-[-24px] w-[2px] bg-[#0F172A05] group-hover:bg-[#0F172A0F] transition-colors" />
            )}
            
            <div className={`w-10 h-10 rounded-2xl ${act.bg} flex items-center justify-center shrink-0 border border-[#0F172A05] z-10 group-hover:scale-110 transition-transform duration-300`}>
              <act.icon size={18} className={act.color} />
            </div>
            
            <div className="pt-1">
              <p className="text-sm font-semibold text-[#111111] mb-0.5">{act.text}</p>
              <div className="flex items-center gap-2 text-xs text-[#64748B]">
                <span className="font-medium">{act.project}</span>
                {act.amount && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-[#0F172A15]" />
                    <span className="font-bold text-emerald-600">{act.amount}</span>
                  </>
                )}
                <span className="w-1 h-1 rounded-full bg-[#0F172A15]" />
                <span>{act.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-8 py-3 rounded-xl bg-[#FAFAFA] border border-[#0F172A08] text-[#111111] text-xs font-bold uppercase tracking-widest hover:bg-white hover:border-[#0F172A15] transition-all relative z-10">
        Ver todos os logs
      </button>
    </div>
  );
}
