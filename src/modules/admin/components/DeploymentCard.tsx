import React, { useState } from 'react';
import { CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';

export default function DeploymentCard() {
  const [events, setEvents] = useState([
    {
      id: 1,
      type: 'Workspace Created',
      message: 'Novo Workspace "Empresa Alpha" criado e provisionado',
      detail: 'Plan: Enterprise',
      status: 'success',
      time: '3 minutos atrás',
      author: 'Diego Rodrigues',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diego',
      duration: 'v4.1.0',
      category: 'provisioning'
    },
    {
      id: 2,
      type: 'Subscription Updated',
      message: 'Workspace "Loja Beta" migrado para plano Pro',
      detail: 'Stripe: sub_102948',
      status: 'success',
      time: '42 minutos atrás',
      author: 'Sistema (Bot)',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bot',
      duration: 'Stripe',
      category: 'billing'
    },
    {
      id: 3,
      type: 'Storage Alert',
      message: 'Limite de storage atingido por "Gamma S/A"',
      detail: 'Usage: 98% (50GB)',
      status: 'warning',
      time: '2 horas atrás',
      author: 'Infra Monitor',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Monitor',
      duration: 'AWS S3',
      category: 'infra'
    }
  ]);

  const [syncing, setSyncing] = useState(false);

  const handleRefreshEvents = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
    }, 1500);
  };

  return (
    <div className="bg-white border border-[#ECECEF] rounded-[24px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_25px_rgba(0,0,0,0.03)] transition-all duration-300">
      <div className="flex items-center justify-between pb-4 border-b border-[#ECECEF] mb-5">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 font-mono flex items-center gap-1.5">
            <RefreshCw size={14} className="text-zinc-600" />
            Atividade de Workspaces & Ciclo de Vida
          </h3>
          <p className="text-[10px] text-zinc-400 font-medium">Logs de provisionamento, assinaturas e status de instâncias</p>
        </div>
        <button 
          onClick={handleRefreshEvents}
          disabled={syncing}
          className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-[11px] font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={11} className={syncing ? 'animate-spin' : ''} />
          <span>Sincronizar Eventos</span>
        </button>
      </div>

      <div className="space-y-4">
        {events.map((ev) => (
          <div 
            key={ev.id} 
            className="p-4 bg-[#FAFAFB] border border-[#ECECEF] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-zinc-300 transition-all"
          >
            <div className="flex items-start gap-3.5">
              <img 
                src={ev.avatar} 
                alt={ev.author} 
                className="w-8 h-8 rounded-full border border-[#ECECEF] bg-white shrink-0 mt-0.5 object-cover" 
                referrerPolicy="no-referrer"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-zinc-950">
                    {ev.message}
                  </span>
                  <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-zinc-200/60 text-zinc-600 border border-zinc-300/40 shrink-0">
                    {ev.type}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-medium">
                  <span>Ator: <span className="text-zinc-600 font-semibold">{ev.author}</span></span>
                  <span>•</span>
                  <span>{ev.time}</span>
                  <span>•</span>
                  <span>Detalhe: <span className="font-mono font-bold text-zinc-600">{ev.detail}</span></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase ${
                ev.status === 'success' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-amber-50 border border-amber-100 text-amber-700'
              }`}>
                {ev.status === 'success' ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                <span>{ev.duration}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
