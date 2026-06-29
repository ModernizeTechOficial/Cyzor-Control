import { Shield, GitBranch, Terminal, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface Activity {
  id: string;
  action: string;
  time: string;
  type: 'deploy' | 'security' | 'git' | 'system';
  user: string;
  hash?: string;
}

export default function HomeTimeline() {
  const activities: Activity[] = [
    {
      id: '1',
      action: 'Deploy de segurança v2.3.9 concluído',
      time: '10:14',
      type: 'deploy',
      user: 'Carlos S. (DevOps)',
      hash: 'e8a4f10'
    },
    {
      id: '2',
      action: 'Integração com Gateway Auth SSO homologada',
      time: '09:42',
      type: 'security',
      user: 'Mariana T. (Security)'
    },
    {
      id: '3',
      action: 'Merge branch "release/v2.4.0-core" para "main"',
      time: '08:15',
      type: 'git',
      user: 'Guilherme R. (Tech Lead)',
      hash: '9fb42a1'
    },
    {
      id: '4',
      action: 'Backup geral do PostgreSQL concluído com sucesso',
      time: '04:00',
      type: 'system',
      user: 'Cyzor System'
    },
    {
      id: '5',
      action: 'Otimização de indexadores da tabela de produtos',
      time: 'Ontem',
      type: 'system',
      user: 'DBA Bot'
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'deploy':
        return <CheckCircle2 size={13} className="text-emerald-500" />;
      case 'security':
        return <Shield size={13} className="text-blue-500" />;
      case 'git':
        return <GitBranch size={13} className="text-purple-500" />;
      default:
        return <Terminal size={13} className="text-slate-500" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'deploy':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'security':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'git':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="bg-white border border-[#0F172A08] rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Feed de Operações Globais</span>
          </div>
          <button className="text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-0.5">
            Ver Todos <ChevronRight size={12} />
          </button>
        </div>

        <div className="relative border-l border-slate-100 pl-4 ml-2.5 space-y-6">
          {activities.map((act) => (
            <div key={act.id} className="relative group">
              {/* Timeline Icon Node */}
              <div className="absolute -left-[23px] top-1.5 w-[16px] h-[16px] rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:border-slate-400 transition-colors">
                {getIcon(act.type)}
              </div>

              {/* Activity Info */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#111111] leading-snug tracking-tight">
                    {act.action}
                  </span>
                  <span className="text-[10px] font-mono text-[#94A3B8] font-semibold flex-shrink-0">
                    {act.time}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getBadgeColor(act.type)}`}>
                    {act.type.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-[#64748B] font-medium">
                    {act.user}
                  </span>
                  {act.hash && (
                    <>
                      <span className="w-1 h-1 bg-slate-200 rounded-full" />
                      <span className="text-[9px] font-mono text-[#94A3B8] hover:text-slate-600 cursor-pointer">
                        {act.hash}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
