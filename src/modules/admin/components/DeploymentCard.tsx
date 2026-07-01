import React, { useState } from 'react';
import { GitBranch, GitCommit, Play, RotateCcw, CheckCircle2, RefreshCw, Sparkles, ExternalLink } from 'lucide-react';

export default function DeploymentCard() {
  const [deploys, setDeploys] = useState([
    {
      id: 1,
      commit: 'f2c7a91',
      message: 'feat: add Gemini autocomplete and SaaS index indexers',
      branch: 'main',
      status: 'success',
      time: '3 minutos atrás',
      author: 'Diego Rodrigues',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diego',
      duration: '48s',
      pipeline: 'production'
    },
    {
      id: 2,
      commit: 'a910bf2',
      message: 'fix(billing): stripe recurring tax calculation override',
      branch: 'main',
      status: 'success',
      time: '42 minutos atrás',
      author: 'Aline Santos',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aline',
      duration: '52s',
      pipeline: 'production'
    },
    {
      id: 3,
      commit: '8b7762a',
      message: 'perf: optimize PostgreSQL multi-tenant connection pooler',
      branch: 'main',
      status: 'success',
      time: '2 horas atrás',
      author: 'Lucas Mendes',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas',
      duration: '1m 12s',
      pipeline: 'production'
    }
  ]);

  const [triggeringDeploy, setTriggeringDeploy] = useState(false);

  const handleManualDeploy = () => {
    setTriggeringDeploy(true);
    setTimeout(() => {
      setTriggeringDeploy(false);
      const newDeploy = {
        id: Date.now(),
        commit: Math.random().toString(16).substring(2, 9),
        message: 'chore: automatic system rebuild from Cyzor HQ Admin',
        branch: 'main',
        status: 'success',
        time: 'Just now',
        author: 'Diego Rodrigues',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diego',
        duration: '32s',
        pipeline: 'production'
      };
      setDeploys(prev => [newDeploy, ...prev]);
    }, 2000);
  };

  const handleRollback = (commit: string) => {
    alert(`Rollback acionado com sucesso para o commit: ${commit}`);
  };

  return (
    <div className="bg-white border border-[#ECECEF] rounded-[24px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_25px_rgba(0,0,0,0.03)] transition-all duration-300">
      <div className="flex items-center justify-between pb-4 border-b border-[#ECECEF] mb-5">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 font-mono flex items-center gap-1.5">
            <GitBranch size={14} className="text-zinc-600" />
            Últimos Deploys & GitHub Pipelines
          </h3>
          <p className="text-[10px] text-zinc-400 font-medium">Controle de versionamento e compilações automáticas</p>
        </div>
        <button 
          onClick={handleManualDeploy}
          disabled={triggeringDeploy}
          className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-[11px] font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
        >
          {triggeringDeploy ? (
            <RefreshCw size={11} className="animate-spin" />
          ) : (
            <Play size={11} fill="white" />
          )}
          <span>Disparar Build</span>
        </button>
      </div>

      <div className="space-y-4">
        {deploys.map((dep) => (
          <div 
            key={dep.id} 
            className="p-4 bg-[#FAFAFB] border border-[#ECECEF] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-zinc-300 transition-all"
          >
            <div className="flex items-start gap-3.5">
              <img 
                src={dep.avatar} 
                alt={dep.author} 
                className="w-8 h-8 rounded-full border border-[#ECECEF] bg-white shrink-0 mt-0.5 object-cover" 
                referrerPolicy="no-referrer"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-zinc-950 hover:underline cursor-pointer flex items-center gap-1">
                    {dep.message}
                    <ExternalLink size={10} className="text-zinc-400" />
                  </span>
                  <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-zinc-200/60 text-zinc-600 border border-zinc-300/40 shrink-0">
                    {dep.commit}
                  </span>
                  <span className="text-[8px] font-mono font-extrabold uppercase px-1.5 py-0.2 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 shrink-0">
                    {dep.branch}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-medium">
                  <span>Por: <span className="text-zinc-600 font-semibold">{dep.author}</span></span>
                  <span>•</span>
                  <span>{dep.time}</span>
                  <span>•</span>
                  <span>Duração: <span className="font-mono font-bold text-zinc-600">{dep.duration}</span></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold font-mono uppercase">
                <CheckCircle2 size={11} />
                <span>Production</span>
              </div>
              <button 
                onClick={() => handleRollback(dep.commit)}
                className="p-2 bg-white border border-[#ECECEF] text-zinc-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm group"
                title="Efetuar Rollback para esta versão"
              >
                <RotateCcw size={12} className="group-hover:rotate-[-45deg] transition-transform duration-300" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
