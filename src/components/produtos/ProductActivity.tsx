import { useState, useEffect } from 'react';
import { Activity, Rocket, Package, AlertCircle, RefreshCw, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ProductActivity() {
  const { token } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    fetch('/api/deploys', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          setActivities(data.slice(0, 5)); // show top 5
        }
      })
      .catch(e => console.error("Error fetching activity:", e));
  }, [token]);

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
        {activities.length === 0 ? (
           <p className="text-xs text-[#64748B]">Nenhuma atividade registrada.</p>
        ) : activities.map((act, i) => {
          const isSuccess = act.status === 'success';
          const icon = isSuccess ? Rocket : AlertCircle;
          const bg = isSuccess ? 'bg-emerald-50' : 'bg-red-50';
          const color = isSuccess ? 'text-emerald-600' : 'text-red-600';
          const text = isSuccess ? 'Deploy realizado com sucesso' : 'Falha no deploy';
          
          return (
            <div key={act.id} className="flex gap-4 relative group cursor-default">
              {/* Timeline Line */}
              {i !== activities.length - 1 && (
                <div className="absolute left-5 top-12 bottom-[-24px] w-[2px] bg-[#0F172A05] group-hover:bg-[#0F172A0F] transition-colors" />
              )}
              
              <div className={`w-10 h-10 rounded-2xl ${bg} flex items-center justify-center shrink-0 border border-[#0F172A05] z-10 group-hover:scale-110 transition-transform duration-300`}>
                {icon({ size: 18, className: color })}
              </div>
              
              <div className="pt-1">
                <p className="text-sm font-semibold text-[#111111] mb-0.5">{text}</p>
                <div className="flex items-center gap-2 text-xs text-[#64748B]">
                  <span className="font-medium">{act.version}</span>
                  <span className="w-1 h-1 rounded-full bg-[#0F172A15]" />
                  <span>{new Date(act.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
    </div>
  );
}
