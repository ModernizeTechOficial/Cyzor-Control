import React from 'react';
import { Sparkles, Terminal, ShieldAlert, BadgeDollarSign, Database, GitBranch, Cpu, PlusCircle } from 'lucide-react';
import { useEvents, PlatformEvent } from '../../../context/EventContext.tsx';

export default function ActivityTimeline() {
  const { events } = useEvents();

  // Map Category to icon type
  const mapCategoryToType = (category: PlatformEvent['category']): 'SAAS' | 'DEPLOY' | 'BILL' | 'BACKUP' | 'CLIENT' | 'PIPELINE' => {
    switch (category) {
      case 'deploys': return 'DEPLOY';
      case 'users': return 'CLIENT';
      case 'billing': return 'BILL';
      case 'infrastructure': return 'SAAS';
      case 'logs': return 'BACKUP';
      default: return 'PIPELINE';
    }
  };

  // Take the latest 6 events to display in the feed
  const displayEvents = events.slice(0, 6);

  return (
    <div className="bg-white border border-[#ECECEF] rounded-[24px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_25px_rgba(0,0,0,0.03)] transition-all duration-300">
      <div className="flex items-center justify-between pb-4 border-b border-[#ECECEF] mb-5">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 font-mono flex items-center gap-1.5">
            <Terminal size={14} className="text-zinc-600 animate-pulse" />
            Platform Activity Feed & Auditoria
          </h3>
          <p className="text-[10px] text-zinc-400 font-medium">Ações globais registradas no cluster de controle</p>
        </div>
        <span className="text-[8px] font-mono text-zinc-400 font-bold bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-md uppercase">
          Live stream active
        </span>
      </div>

      <div className="relative border-l border-zinc-200 pl-4 ml-2.5 space-y-6">
        {displayEvents.length === 0 ? (
          <p className="text-[10px] text-zinc-400 font-medium py-4 text-center">Nenhum log operacional recente.</p>
        ) : (
          displayEvents.map((act) => {
            const type = mapCategoryToType(act.category);
            let BulletIcon = PlusCircle;
            let bulletColor = 'bg-zinc-100 text-zinc-600 border-[#ECECEF]';
            
            if (type === 'SAAS') {
              BulletIcon = PlusCircle;
              bulletColor = 'bg-blue-50 text-blue-600 border-blue-100';
            } else if (type === 'DEPLOY') {
              BulletIcon = GitBranch;
              bulletColor = 'bg-purple-50 text-purple-600 border-purple-100';
            } else if (type === 'BILL') {
              BulletIcon = BadgeDollarSign;
              bulletColor = 'bg-emerald-50 text-emerald-600 border-emerald-100';
            } else if (type === 'BACKUP') {
              BulletIcon = Database;
              bulletColor = 'bg-cyan-50 text-cyan-600 border-cyan-100';
            } else if (type === 'PIPELINE') {
              BulletIcon = Cpu;
              bulletColor = 'bg-indigo-50 text-indigo-600 border-indigo-100';
            } else {
              BulletIcon = PlusCircle;
              bulletColor = 'bg-zinc-50 text-zinc-500 border-zinc-100';
            }

            return (
              <div key={act.id} className="relative group">
                {/* Pulsing indicator dot next to timeline bullet */}
                <div className="absolute -left-[27.5px] top-1.5 flex items-center justify-center">
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center bg-white group-hover:scale-110 transition-transform ${bulletColor}`}>
                    <BulletIcon size={11} />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-zinc-950">{act.title}</span>
                    <span className="text-[8px] font-mono text-zinc-400">{act.timestamp}</span>
                    {act.workspaceName && (
                      <span className="text-[8px] font-mono bg-zinc-50 border border-zinc-200 px-1.5 py-0.2 rounded text-zinc-500 font-semibold uppercase tracking-wider shrink-0 ml-auto select-none max-w-[120px] truncate">
                        {act.workspaceName}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">{act.description}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

