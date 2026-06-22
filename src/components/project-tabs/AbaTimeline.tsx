import { useState } from 'react';
import { ProjectExtended, Task } from '../../types/project';
import { Calendar, Layers, Clock, CheckCircle2, Circle, AlertCircle, Plus, Link2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AbaTimelineProps {
  project: ProjectExtended;
  onUpdateProject: (updated: ProjectExtended) => void;
}

export default function AbaTimeline({ project, onUpdateProject }: AbaTimelineProps) {
  const [sourceTaskId, setSourceTaskId] = useState<string>('');
  const [targetTaskId, setTargetTaskId] = useState<string>('');
  const { fetchWithAuth } = useAuth();

  const tasks = project.tasks || [];
  const milestones = project.milestones || [];

  // Union of tasks and milestones sorted by date or default sequence
  const timelineItems = [
    ...tasks.map(t => ({
      id: t.id,
      type: 'task',
      title: t.name,
      subtitle: `Alocado para: ${t.assignee}`,
      date: t.dueDate || 'Definir',
      completed: t.column === 'done',
      priority: t.priority,
      dependencies: t.dependencies || []
    })),
    ...milestones.map(m => ({
      id: m.id,
      type: 'milestone',
      title: `Marco: ${m.title}`,
      subtitle: m.desc,
      date: m.date,
      completed: m.status === 'Concluído',
      priority: 'Alta',
      dependencies: []
    }))
  ];

  const handleAddDependency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceTaskId || !targetTaskId || sourceTaskId === targetTaskId) return;

    const sourceId = parseInt(sourceTaskId, 10);
    const targetId = parseInt(targetTaskId, 10);

    const updatedTasks = tasks.map(t => {
      if (t.id === sourceId) {
        const currentDeps = t.dependencies || [];
        if (!currentDeps.includes(targetId)) {
          return { ...t, dependencies: [...currentDeps, targetId] };
        }
      }
      return t;
    });

    // Add activity log
    const sourceTask = tasks.find(t => t.id === sourceId);
    const targetTask = tasks.find(t => t.id === targetId);
    
    // Sync with backend
    const syncBackend = async () => {
        const sourceTask = tasks.find(t => t.id === sourceId);
        if (sourceTask) {
            const currentDeps = sourceTask.dependencies || [];
            if (!currentDeps.includes(targetId)) {
                try {
                    await fetchWithAuth(`/api/tasks/${sourceId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ dependencies: [...currentDeps, targetId] })
                    });
                } catch (e) {
                    console.error('Error syncing dependencies:', e);
                }
            }
        }
    };
    syncBackend();

    const log = {
      id: Date.now(),
      user: 'Usuário',
      action: `marcou dependência: "${sourceTask?.name}" agora depende de "${targetTask?.name}"`,
      time: 'Agora'
    };

    onUpdateProject({
      ...project,
      tasks: updatedTasks,
      history: [log, ...(project.history || [])]
    });

    setSourceTaskId('');
    setTargetTaskId('');
  };

  const getTaskNameById = (id: number) => {
    return tasks.find(t => t.id === id)?.name || `Tarefa #${id}`;
  };

  return (
    <div className="p-8 flex flex-col gap-10 h-full animate-in fade-in duration-200">
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left 3 columns: Vertical timeline lists */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <h3 className="text-[11px] font-bold uppercase text-[#64748B] tracking-widest border-b border-[#0F172A0F] pb-3 flex items-center gap-1.5">
            <Layers size={14} /> Cronograma de Atividades e Marcos
          </h3>

          <div className="relative pl-6 border-l border-[#0F172A0F] ml-3 flex flex-col gap-8">
            {timelineItems.map((item, index) => {
              const isMilestone = item.type === 'milestone';
              return (
                <div key={`${item.type}-${item.id}`} className="relative group">
                  {/* Circle locator on left axis line */}
                  <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center transition-colors ${
                    item.completed 
                      ? 'border-[#111111] bg-[#111111] text-white' 
                      : 'border-[#64748B]/30'
                  }`}>
                    {item.completed && <div className="w-1 h-1 bg-white rounded-full"></div>}
                  </div>

                  {/* Item Content box */}
                  <div className={`bg-white border rounded-[20px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.01)] flex flex-col gap-3 group-hover:shadow-md transition-all ${
                    isMilestone ? 'border-[#111111]/15 bg-neutral-50/50' : 'border-[#0F172A0F]'
                  }`}>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                      <div>
                        {isMilestone && (
                          <span className="text-[9px] font-bold uppercase tracking-wide text-[#64748B] bg-white border border-[#0F172A0F] px-1.5 py-0.5 rounded-md mb-1.5 inline-block">
                            Marco do Projeto
                          </span>
                        )}
                        <h4 className={`text-sm font-bold ${item.completed ? 'text-[#64748B] line-through' : 'text-[#111111]'}`}>
                          {item.title}
                        </h4>
                        <p className="text-xs text-[#64748B] font-medium leading-relaxed mt-1">{item.subtitle}</p>
                      </div>

                      <span className="text-xs font-mono font-bold text-[#64748B] bg-[#FAFAFA] border border-[#0F172A0F] rounded-lg px-2.5 py-1 flex items-center gap-1.5 self-start">
                        <Calendar size={12} /> {item.date}
                      </span>
                    </div>

                    {/* Exibir dependências */}
                    {item.dependencies && item.dependencies.length > 0 && (
                      <div className="flex flex-col gap-1.5 bg-[#FAFAFA] border border-[#0F172A0F]/60 p-3 rounded-xl mt-1.5">
                        <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1">
                          <AlertCircle size={10} className="text-[#111111]" /> Dependências impeditivas:
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-0.5">
                          {item.dependencies.map(depId => (
                            <span 
                              key={depId} 
                              className="text-[10px] font-semibold text-[#111111] bg-white border border-[#111111]/10 px-2 py-0.5 rounded-md flex items-center gap-1"
                              title="Esta tarefa só pode começar após a conclusão desta dependência"
                            >
                              🔒 Requisito: {getTaskNameById(depId)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Manage / Define dependencies form */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col gap-5">
            <h4 className="text-[11px] font-bold uppercase text-[#64748B] tracking-widest border-b border-[#0F172A0F] pb-3 flex items-center gap-1.5">
              <Link2 size={14} /> Vincular Dependência
            </h4>

            <p className="text-[11px] text-[#64748B] font-medium leading-relaxed">
              Marque o encadeamento pré-requisito lógico entre as tarefas do projeto para exibição clara de alertas de bloqueio.
            </p>

            <form onSubmit={handleAddDependency} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">A tarefa...</label>
                <select
                  value={sourceTaskId}
                  onChange={(e) => setSourceTaskId(e.target.value)}
                  className="bg-[#FAFAFA] border border-[#0F172A0F] text-xs font-semibold text-[#111111] rounded-xl p-2.5 outline-none focus:border-[#111111]/30"
                  required
                >
                  <option value="">Selecionar tarefa...</option>
                  {tasks.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">... depende de / precisa de:</label>
                <select
                  value={targetTaskId}
                  onChange={(e) => setTargetTaskId(e.target.value)}
                  className="bg-[#FAFAFA] border border-[#0F172A0F] text-xs font-semibold text-[#111111] rounded-xl p-2.5 outline-none focus:border-[#111111]/30"
                  required
                >
                  <option value="">Selecionar tarefa principal...</option>
                  {tasks.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={!sourceTaskId || !targetTaskId || sourceTaskId === targetTaskId}
                className="w-full bg-[#111111] text-white py-2.5 text-xs font-bold rounded-xl hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                Vincular
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
}
