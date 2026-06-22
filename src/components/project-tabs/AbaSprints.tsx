import { useState, useEffect } from 'react';
import { ProjectExtended, Task, Sprint } from '../../types/project';
import { useAuth } from '../../context/AuthContext';
import { Play, Calendar, CheckSquare, BarChart, Plus, ChevronRight, Zap, Target } from 'lucide-react';
import TaskDetailModal from '../TaskDetailModal';

interface AbaSprintsProps {
  project: ProjectExtended;
  onUpdateProject: (updated: ProjectExtended) => void;
}

export default function AbaSprints({ project, onUpdateProject }: AbaSprintsProps) {
  const { fetchWithAuth } = useAuth();
  const sprints = project.sprints || [];
  const velocity = project.velocity || [];
  
  // Set initial sprint to Active one, or the first one, or 0
  const initialSprintId = project.currentSprintId || (sprints.find(s => s.status === 'Ativa')?.id) || (sprints[0]?.id) || 0;
  const [selectedSprintId, setSelectedSprintId] = useState<number>(initialSprintId);

  // Sync selectedSprintId if it was 0 and sprints were loaded
  useEffect(() => {
    if (selectedSprintId === 0 && sprints.length > 0) {
        setSelectedSprintId(sprints[0].id);
    }
  }, [sprints, selectedSprintId]);

  const selectedSprint = sprints.find(s => s.id === selectedSprintId) || sprints[0];
  const sprintTasks = (project.tasks || []).filter(t => t.sprintId === selectedSprintId);
  const doneSprintTasks = sprintTasks.filter(t => t.column === 'done');
  const sprintProgress = sprintTasks.length > 0 ? Math.round((doneSprintTasks.length / sprintTasks.length) * 100) : 0;

  // Sprint Kanban move items
  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData('sprintTaskId', taskId.toString());
  };

  const handleDrop = async (e: React.DragEvent, targetCol: 'todo' | 'in_progress' | 'review' | 'done') => {
    e.preventDefault();
    const taskIdStr = e.dataTransfer.getData('sprintTaskId');
    if (!taskIdStr) return;

    const taskId = parseInt(taskIdStr, 10);
    const taskToMove = (project.tasks || []).find(t => t.id === taskId);
    if (!taskToMove) return;

    const statusMap: { [key: string]: string } = {
        'todo': 'TODO',
        'in_progress': 'IN_PROGRESS',
        'review': 'REVIEW',
        'done': 'DONE'
    };

    try {
        const res = await fetchWithAuth(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: statusMap[targetCol] })
        });

        if (res.ok) {
            const updatedTasks = (project.tasks || []).map(t => t.id === taskId ? { ...t, column: targetCol } : t);
            const activityLog = {
                id: Date.now(),
                user: 'Usuário',
                action: `moveu a tarefa da Sprint "${taskToMove.name}" para ${getColLabel(targetCol)}`,
                time: 'Agora'
            };

            onUpdateProject({
                ...project,
                tasks: updatedTasks,
                history: [activityLog, ...(project.history || [])]
            });
        }
    } catch (e) {
        console.error(e);
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Sprint>>({});

  const [isCreatingTask, setIsCreatingTask] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleUpdateTask = (updatedTask: Task) => {
    const updatedTasks = (project.tasks || []).map(t => t.id === updatedTask.id ? updatedTask : t);
    onUpdateProject({
        ...project,
        tasks: updatedTasks
    });
    setSelectedTask(updatedTask);
  };

  const handleRemoveTask = async (taskId: number) => {
    try {
        const res = await fetchWithAuth(`/api/tasks/${taskId}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            const updatedTasks = (project.tasks || []).filter(t => t.id !== taskId);
            onUpdateProject({
              ...project,
              tasks: updatedTasks,
            });
            setSelectedTask(null);
        }
    } catch (e) {
        console.error(e);
    }
  };

  const handleCreateTask = async (column: string) => {
    if (!newTaskTitle.trim() || !selectedSprintId) return;

    const statusMap: any = {
        'todo': 'TODO',
        'in_progress': 'IN_PROGRESS',
        'review': 'REVIEW',
        'done': 'DONE'
    };

    try {
        const res = await fetchWithAuth('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectId: project.id,
                sprintId: selectedSprintId,
                title: newTaskTitle.trim(),
                status: statusMap[column] || 'TODO',
                priority: 'MEDIUM'
            })
        });

        if (res.ok) {
            const apiTask = await res.json();
            const newTask: Task = {
                id: apiTask.id,
                name: apiTask.title,
                assignee: 'Não Atribuído',
                priority: 'Média',
                column: column as any,
                sprintId: selectedSprintId,
                tags: [],
                dueDate: '',
                description: '',
                subtasks: [],
                taskComments: []
            };

            onUpdateProject({
                ...project,
                tasks: [...(project.tasks || []), newTask]
            });
            setNewTaskTitle('');
            setIsCreatingTask(null);
        }
    } catch (e) {
        console.error(e);
    }
  };

  const handleCreateSprint = async () => {
    try {
        const sprintName = `Sprint ${(sprints.length + 1).toString().padStart(2, '0')}`;
        const res = await fetchWithAuth('/api/sprints', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectId: project.id,
                name: sprintName,
                goal: 'Nova Sprint de Entrega',
                status: 'PLANNED',
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 2 weeks default
            })
        });

        if (res.ok) {
            const apiSprint = await res.json();
            const newSprint: Sprint = {
                id: apiSprint.id,
                name: apiSprint.name,
                goal: apiSprint.goal || 'Nova Sprint de Entrega',
                startDate: apiSprint.startDate ? new Date(apiSprint.startDate).toLocaleDateString() : 'Em breve',
                endDate: apiSprint.endDate ? new Date(apiSprint.endDate).toLocaleDateString() : 'Em breve',
                status: apiSprint.status === 'ACTIVE' ? 'Ativa' : apiSprint.status === 'COMPLETED' ? 'Finalizada' : 'Planejada'
            };

            onUpdateProject({
                ...project,
                sprints: [...sprints, newSprint],
            });
            setSelectedSprintId(newSprint.id);
        }
    } catch (e) {
        console.error(e);
    }
  };

  const handleSaveSprint = async () => {
    if (!selectedSprint) return;

    try {
        const apiStatus = editForm.status === 'Ativa' ? 'ACTIVE' : editForm.status === 'Finalizada' ? 'COMPLETED' : 'PLANNED';
        
        const res = await fetchWithAuth(`/api/sprints/${selectedSprint.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: editForm.name,
                goal: editForm.goal,
                status: apiStatus,
                startDate: editForm.startDate,
                endDate: editForm.endDate
            })
        });

        if (res.ok) {
            const apiSprint = await res.json();
            const updatedSprint: Sprint = {
                id: apiSprint.id,
                name: apiSprint.name,
                goal: apiSprint.goal || '',
                startDate: apiSprint.startDate ? new Date(apiSprint.startDate).toLocaleDateString() : 'Em breve',
                endDate: apiSprint.endDate ? new Date(apiSprint.endDate).toLocaleDateString() : 'Em breve',
                status: apiSprint.status === 'ACTIVE' ? 'Ativa' : apiSprint.status === 'COMPLETED' ? 'Finalizada' : 'Planejada'
            };

            onUpdateProject({
                ...project,
                sprints: sprints.map(s => s.id === updatedSprint.id ? updatedSprint : s),
            });
            setIsEditing(false);
        }
    } catch (e) {
        console.error(e);
    }
  };

  const startEditing = () => {
      setEditForm({ ...selectedSprint });
      setIsEditing(true);
  };

  const columns: Array<'todo' | 'in_progress' | 'review' | 'done'> = ['todo', 'in_progress', 'review', 'done'];
  const getColLabel = (col: string) => {
    switch (col) {
      case 'todo': return 'A Fazer';
      case 'in_progress': return 'Em Andamento';
      case 'review': return 'Revisão';
      case 'done': return 'Concluído';
      default: return col;
    }
  };

  return (
    <div className="p-8 flex flex-col gap-8 h-full animate-in fade-in duration-200">
      
      {/* Sprints Horizontal Selector bar */}
      <div className="flex items-center justify-between border-b border-[#0F172A0F] pb-4 overflow-x-auto gap-4 scrollbar-none">
        <div className="flex gap-3">
          {sprints.map((sprint) => {
            const isActive = sprint.id === selectedSprintId;
            return (
              <button
                key={sprint.id}
                onClick={() => setSelectedSprintId(sprint.id)}
                className={`py-2 px-5 rounded-[12px] text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer border ${
                  isActive 
                    ? 'bg-[#111111] text-white border-[#111111] shadow-sm' 
                    : 'bg-white hover:bg-[#FAFAFA] text-[#64748B] border-[#0F172A0F]'
                }`}
              >
                <Zap size={12} className={isActive ? 'text-white fill-white/20' : 'text-[#64748B]'} />
                {sprint.name}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleCreateSprint}
          className="py-2 px-4 border border-dashed border-[#0F172A0F] hover:border-[#111111]/30 text-[#64748B] hover:text-[#111111] text-xs font-bold rounded-[12px] bg-white hover:bg-[#FAFAFA] flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Plus size={12} strokeWidth={2.5} /> Nova Sprint
        </button>
      </div>

      {selectedSprint ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Sprint Main Profile */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col gap-4">
              {isEditing ? (
                  <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                          <h3 className="text-lg font-bold">Editar Sprint</h3>
                          <div className="flex gap-2">
                              <button 
                                onClick={async () => {
                                    if (confirm('Excluir esta sprint permanentemente?')) {
                                        try {
                                            const res = await fetchWithAuth(`/api/sprints/${selectedSprint.id}`, {
                                                method: 'DELETE'
                                            });
                                            if (res.ok) {
                                                onUpdateProject({
                                                    ...project,
                                                    sprints: sprints.filter(s => s.id !== selectedSprint.id)
                                                });
                                                setIsEditing(false);
                                                setSelectedSprintId(0);
                                            }
                                        } catch (e) {
                                            console.error(e);
                                        }
                                    }
                                }}
                                className="mr-8 px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                              >
                                Excluir
                              </button>
                              <button onClick={() => setIsEditing(false)} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">Cancelar</button>
                              <button onClick={handleSaveSprint} className="px-3 py-1 bg-black text-white rounded-lg text-xs font-bold">Salvar</button>
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-gray-500 uppercase">Nome</label>
                              <input 
                                  value={editForm.name || ''} 
                                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                                  className="border border-[#0F172A0F] rounded-lg px-3 py-2 text-sm"
                              />
                          </div>
                          <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-gray-500 uppercase">Status</label>
                              <select 
                                  value={editForm.status || 'Planejada'} 
                                  onChange={e => setEditForm({...editForm, status: e.target.value as any})}
                                  className="border border-[#0F172A0F] rounded-lg px-3 py-2 text-sm"
                              >
                                  <option value="Planejada">Planejada</option>
                                  <option value="Ativa">Ativa</option>
                                  <option value="Finalizada">Finalizada</option>
                              </select>
                          </div>
                          <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-gray-500 uppercase">Início</label>
                              <input 
                                  type="date"
                                  value={editForm.startDate?.split('/').reverse().join('-') || ''} 
                                  onChange={e => setEditForm({...editForm, startDate: e.target.value})}
                                  className="border border-[#0F172A0F] rounded-lg px-3 py-2 text-sm"
                              />
                          </div>
                          <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-gray-500 uppercase">Fim</label>
                              <input 
                                  type="date"
                                  value={editForm.endDate?.split('/').reverse().join('-') || ''} 
                                  onChange={e => setEditForm({...editForm, endDate: e.target.value})}
                                  className="border border-[#0F172A0F] rounded-lg px-3 py-2 text-sm"
                              />
                          </div>
                      </div>
                      <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">Objetivo</label>
                          <textarea 
                              value={editForm.goal || ''} 
                              onChange={e => setEditForm({...editForm, goal: e.target.value})}
                              className="border border-[#0F172A0F] rounded-lg px-3 py-2 text-sm resize-none h-20"
                          />
                      </div>
                  </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        selectedSprint.status === 'Ativa' ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/10' :
                        selectedSprint.status === 'Finalizada' ? 'bg-slate-100 text-slate-700' :
                        'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {selectedSprint.status}
                      </span>
                      <h3 className="text-xl font-display font-bold text-[#111111] mt-2">{selectedSprint.name}</h3>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <button 
                            onClick={startEditing}
                            className="text-[10px] font-bold text-gray-400 hover:text-black transition-colors"
                        >
                            Editar Detalhes
                        </button>
                        <div className="text-right text-xs text-[#64748B] font-semibold flex items-center gap-1.5 bg-[#FAFAFA] border border-[#0F172A0F] rounded-lg px-3 py-1">
                            <Calendar size={13} /> {selectedSprint.startDate} - {selectedSprint.endDate}
                        </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#FAFAFA] rounded-[14px] border border-[#0F172A0F] flex items-start gap-2 text-xs text-[#475569] font-medium leading-relaxed">
                    <Target size={14} className="text-[#111111] mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-[#111111]">Objetivo da Sprint:</span> {selectedSprint.goal}
                    </div>
                  </div>
                </>
              )}

              {/* Progress and status metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Progresso das Tarefas ({doneSprintTasks.length}/{sprintTasks.length})</span>
                  <div className="flex items-center gap-3">
                    <div className="w-full h-1.5 bg-[#FAFAFA] border border-[#0F172A0F] rounded-full overflow-hidden">
                      <div className="h-full bg-black rounded-full" style={{ width: `${sprintProgress}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-[#111111]">{sprintProgress}%</span>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-[#FAFAFA] border border-[#0F172A0F] px-4 py-2 rounded-xl text-xs font-semibold">
                  <span className="text-[#64748B]">Story Points Alocados:</span>
                  <span className="text-base font-bold text-[#111111]">{sprintTasks.length * 8} pts</span>
                </div>
              </div>
            </div>

            {/* Scoped Sprint Kanban Board */}
            <div className="flex flex-col gap-4">
              <h4 className="text-[11px] font-bold uppercase text-[#64748B] tracking-widest border-b border-[#0F172A0F] pb-2">
                Quadro de Tarefas da Sprint
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#FAFAFA]/40 p-3 rounded-[20px] border border-[#0F172A0F]">
                {columns.map(col => {
                  const tasksInCol = sprintTasks.filter(t => t.column === col);
                  return (
                    <div 
                      key={col}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, col)}
                      className="bg-white border border-[#0F172A0F] rounded-[16px] p-3 flex flex-col gap-2 min-h-[220px]"
                    >
                      <div className="flex justify-between items-center border-b border-[#0F172A0F]/50 pb-1.5 mb-1">
                        <span className="text-[9px] font-bold uppercase text-[#64748B]">{getColLabel(col)}</span>
                        <span className="text-[8px] font-bold bg-[#FAFAFA] px-1.5 py-0.5 rounded-md border border-[#0F172A0F]">{tasksInCol.length}</span>
                      </div>

                      <div className="flex flex-col gap-2 flex-grow overflow-y-auto min-h-[150px]">
                        {tasksInCol.map(task => (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            onClick={() => setSelectedTask(task)}
                            className="bg-[#FAFAFA]/70 border border-[#0F172A0F] rounded-[12px] p-2.5 cursor-grab active:cursor-grabbing hover:bg-white transition-all hover:shadow-sm"
                          >
                            <h5 className="text-[11px] font-semibold text-[#111111] leading-tight mb-2">{task.name}</h5>
                            <div className="flex items-center justify-between text-[8px] font-bold text-[#64748B]">
                              <span>{task.assignee}</span>
                              <span className={task.priority === 'Alta' ? 'text-red-500' : ''}>{task.priority}</span>
                            </div>
                          </div>
                        ))}
                        
                        {isCreatingTask === col ? (
                            <div className="p-2 bg-[#FAFAFA] border border-[#0F172A0F] rounded-[12px] flex flex-col gap-2 animate-in slide-in-from-top-2 duration-200">
                                <input 
                                    autoFocus
                                    className="bg-transparent border-none text-[11px] font-medium outline-none placeholder:text-gray-400"
                                    placeholder="Título da tarefa..."
                                    value={newTaskTitle}
                                    onChange={e => setNewTaskTitle(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleCreateTask(col)}
                                />
                                <div className="flex justify-end gap-2">
                                    <button 
                                        onClick={() => setIsCreatingTask(null)}
                                        className="text-[9px] font-bold text-gray-400 hover:text-black"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        onClick={() => handleCreateTask(col)}
                                        className="bg-black text-white px-2 py-0.5 rounded-[6px] text-[9px] font-bold"
                                    >
                                        Criar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button 
                                onClick={() => setIsCreatingTask(col)}
                                className="group flex items-center justify-center gap-1.5 py-2 border border-dashed border-[#0F172A0F] rounded-[12px] hover:border-[#111111]/20 hover:bg-[#FAFAFA] transition-all cursor-pointer"
                            >
                                <Plus size={10} className="text-gray-400 group-hover:text-black" />
                                <span className="text-[9px] font-bold text-gray-400 group-hover:text-black">Nova Tarefa</span>
                            </button>
                        )}
                        
                        {tasksInCol.length === 0 && !isCreatingTask && (
                          <div className="flex-grow flex items-center justify-center border border-dashed border-[#0F172A0F]/50 rounded-[12px] h-20 text-[9px] text-[#64748B] text-center px-2">
                            Sem tarefas nesta coluna
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Historical Velocity Log */}
          <div className="flex flex-col gap-4">
            <div className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col gap-4">
              <h4 className="text-[11px] font-bold uppercase text-[#64748B] tracking-widest border-b border-[#0F172A0F] pb-3 flex items-center gap-1.5">
                <BarChart size={14} /> Histórico de Velocidade
              </h4>

              <div className="flex flex-col gap-3">
                {velocity.map((v, i) => (
                  <div key={v.sprint} className="flex justify-between items-center p-3 bg-[#FAFAFA] border border-[#0F172A0F] rounded-[12px]">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-black/5 text-[#111111] flex items-center justify-center text-[10px] font-bold">
                        {i + 1}
                      </div>
                      <span className="text-xs font-bold text-[#111111]">{v.sprint}</span>
                    </div>
                    
                    <span className="text-xs font-mono font-bold text-[#64748B] bg-white border border-[#0F172A0F] px-2.5 py-1 rounded-md">
                      {v.pts > 0 ? `${v.pts} pts` : '--'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="text-center py-10">Não há Sprints disponíveis.</div>
      )}

      {/* Shared Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal 
          isOpen={!!selectedTask}
          task={selectedTask}
          project={project}
          onClose={() => setSelectedTask(null)}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleRemoveTask}
        />
      )}
    </div>
  );
}
