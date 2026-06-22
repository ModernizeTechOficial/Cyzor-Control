import { ProjectExtended } from '../../types/project';
import { History, Clock, FilePlus, ChevronRight, Check } from 'lucide-react';

interface AbaHistoricoProps {
  project: ProjectExtended;
}

export default function AbaHistorico({ project }: AbaHistoricoProps) {
  const history = project.history || [];

  return (
    <div className="p-8 flex flex-col gap-6 max-w-3xl mx-auto h-full animate-in fade-in duration-200">
      
      <h3 className="text-[11px] font-bold uppercase text-[#64748B] tracking-widest border-b border-[#0F172A0F] pb-3 flex items-center gap-1.5 mb-2">
        <History size={14} className="text-[#111111]" /> Log de Atividades da Iniciativa (Activity Feed)
      </h3>

      <div className="relative pl-6 border-l border-[#0F172A0F] ml-3 flex flex-col gap-6">
        {history.map((log) => {
          return (
            <div key={log.id} className="relative group">
              {/* Dot decoration log indicator */}
              <div className="absolute -left-[30px] top-1.5 w-3 h-3 rounded-full border border-[#0F172A0F] bg-white flex items-center justify-center">
                <div className="w-1 h-1 bg-black rounded-full" />
              </div>

              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#111111] bg-[#FAFAFA] border border-[#0F172A0F] rounded-md px-1.5 py-0.5">
                    {log.user}
                  </span>
                  <span className="text-xs text-[#475569] font-medium leading-relaxed">
                    {log.action}
                  </span>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1">
                  <Clock size={11} /> {log.time}
                </span>
              </div>
            </div>
          );
        })}

        {history.length === 0 && (
          <div className="text-center py-6 text-xs text-[#64748B] font-semibold italic">Nenhum evento registrado no histórico ainda.</div>
        )}
      </div>

    </div>
  );
}
