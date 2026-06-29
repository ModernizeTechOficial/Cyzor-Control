import { CheckCircle2, Cpu, HardDrive, Database, Cloud, RefreshCw, Layers } from 'lucide-react';
import { motion } from 'motion/react';

export default function HomeWorkspaceStatus() {
  const status = [
    { 
      label: 'Serviço de API', 
      value: '99.98% Uptime', 
      status: 'healthy',
      icon: Cpu,
      meta: 'Média de latência: 12ms' 
    },
    { 
      label: 'Banco de Dados', 
      value: 'Conectado', 
      status: 'healthy',
      icon: Database,
      meta: 'Pool de conexões: 14/100' 
    },
    { 
      label: 'Nuvem GCP / Run', 
      value: 'Sincronizado', 
      status: 'healthy',
      icon: Cloud,
      meta: 'Região: us-west2 (GCP)' 
    },
    { 
      label: 'Último Deploy', 
      value: 'v2.3.9 (Sucesso)', 
      status: 'healthy',
      icon: RefreshCw,
      meta: 'Realizado há 4 horas' 
    },
    { 
      label: 'Backups de Disco', 
      value: 'Automatizado', 
      status: 'healthy',
      icon: Layers,
      meta: 'Próximo backup em 12h' 
    },
    { 
      label: 'Storage de Assets', 
      value: '7.4 GB / 100 GB', 
      status: 'warning',
      icon: HardDrive,
      meta: '7.4% de capacidade utilizada' 
    }
  ];

  return (
    <div className="bg-white border border-[#0F172A08] rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between h-full min-h-[380px]">
      <div>
        <div className="flex items-center justify-between mb-5">
          <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Infraestrutura & Redundância</h4>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Ativo
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-1 gap-4">
          {status.map((s, idx) => (
            <div key={idx} className="flex items-start justify-between p-3 rounded-xl hover:bg-slate-50/50 transition-colors border border-transparent hover:border-[#0F172A03] group">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100/70 text-slate-600 flex items-center justify-center group-hover:bg-white group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all">
                  <s.icon size={15} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#111111] leading-none">{s.label}</span>
                  <span className="text-[10px] text-[#64748B] font-medium mt-1 leading-none">{s.meta}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-end justify-center">
                <span className={`text-xs font-bold ${s.status === 'healthy' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {s.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
