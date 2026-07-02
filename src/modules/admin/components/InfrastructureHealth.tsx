import React from 'react';
import { Server, ShieldCheck, Cpu, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function InfrastructureHealth() {
  const services = [
    { name: 'Core API Gateway', latency: '42ms', uptime: '99.99%', status: 'Operational', incident: 'Nenhum' },
    { name: 'Cloud SQL (PostgreSQL)', latency: '8ms', uptime: '100.00%', status: 'Operational', incident: 'Nenhum' },
    { name: 'Redis Cache (Sessões)', latency: '2ms', uptime: '99.98%', status: 'Operational', incident: 'Nenhum' },
    { name: 'S3 Asset Storage', latency: '12ms', uptime: '100.00%', status: 'Operational', incident: 'Nenhum' },
    { name: 'Cyzor Edge Delivery', latency: '18ms', uptime: '99.99%', status: 'Operational', incident: 'Nenhum' },
    { name: 'Mensageria & Webhooks', latency: '5ms', uptime: '99.95%', status: 'Operational', incident: '14 dias atrás' },
    { name: 'Workers de Automação', latency: 'N/A', uptime: '100.00%', status: 'Operational', incident: 'Nenhum' },
    { name: 'Motor de Faturamento', latency: '120ms', uptime: '99.90%', status: 'Operational', incident: 'Nenhum' },
    { name: 'Gerenciador de Domínios', latency: 'N/A', uptime: '100.00%', status: 'Operational', incident: 'Nenhum' },
    { name: 'Backups de Segurança', latency: 'N/A', uptime: '100.00%', status: 'Backup Ativo', incident: 'Nenhum' }
  ];

  return (
    <div className="bg-white border border-[#ECECEF] rounded-[24px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_25px_rgba(0,0,0,0.03)] transition-all duration-300">
      <div className="flex items-center justify-between pb-4 border-b border-[#ECECEF] mb-5">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 font-mono flex items-center gap-2">
            <Server size={14} className="text-zinc-600" />
            Infraestrutura Global & Health status
          </h3>
          <p className="text-[10px] text-zinc-400 font-medium">Latência e integridade das instâncias em tempo real</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-mono font-bold uppercase animate-pulse">
          <ShieldCheck size={12} />
          <span>All Operational</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {services.map((svc, i) => (
          <div 
            key={i} 
            className="p-3 bg-zinc-50/50 border border-[#ECECEF] rounded-2xl flex items-center justify-between hover:bg-white hover:border-zinc-300 transition-all group"
          >
            <div className="flex items-center gap-3">
              {/* status indicator dot */}
              <div className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-bold text-zinc-950 truncate">{svc.name}</span>
                <span className="text-[9px] text-zinc-400 font-medium font-mono flex items-center gap-1.5">
                  Latência: <span className="text-zinc-700 font-bold">{svc.latency}</span>
                </span>
              </div>
            </div>

            <div className="flex items-end flex-col gap-0.5 font-mono shrink-0">
              <span className="text-[11px] text-zinc-900 font-bold">{svc.uptime} uptime</span>
              <span className="text-[8px] text-zinc-400 font-semibold uppercase">Incidente: {svc.incident}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-[#ECECEF] flex justify-between items-center text-[9px] text-zinc-400 font-mono">
        <span>SISTEMA CLOUD:</span>
        <span className="text-indigo-600 font-bold flex items-center gap-1">
          GOOGLE CLOUD RUN PLATFORM
          <ArrowUpRight size={10} />
        </span>
      </div>
    </div>
  );
}
