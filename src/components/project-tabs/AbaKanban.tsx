import { useState, useEffect } from 'react';
import { ProjectExtended, Task } from '../../types/project';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, Search, Filter, Circle, CheckCircle2, MoreHorizontal, User, Tag, 
  Calendar, AlertCircle, ArrowUpRight, X, Trash2, Check, MessageSquare, 
  ListTodo, AlertTriangle, ArrowRight, CornerDownRight, CheckSquare, Square
} from 'lucide-react';
import TaskDetailModal from '../TaskDetailModal';
import { motion, AnimatePresence } from 'framer-motion';
import { showSuccess, confirmAction, showError } from '../../lib/alerts';

// Helper to convert date string (like "10 Jun" or "10 de Junho" or "2026-06-10") to "YYYY-MM-DD"
const convertToISODate = (dueDateStr: string): string => {
  if (!dueDateStr) return '';
  // Check if it's already in YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dueDateStr)) {
    return dueDateStr;
  }

  // Handle parsing informal formats like "10 Jun" or "10 de Junho"
  const mOpt: { [key: string]: string } = {
    'jan': '01', 'fev': '02', 'mar': '03', 'abr': '04', 'mai': '05', 'jun': '06',
    'jul': '07', 'ago': '08', 'set': '09', 'out': '10', 'nov': '11', 'dez': '12',
    'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04', 'maio': '05', 'junho': '06',
    'julho': '07', 'agosto': '08', 'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
  };

  const lower = dueDateStr.toLowerCase();
  
  // Try to find a day (1 or 2 digits)
  const dayMatch = lower.match(/\b(\d{1,2})\b/);
  const day = dayMatch ? dayMatch[1].padStart(2, '0') : '15';

  // Try to find a month name
  let month = '06'; // default to June as mocked
  for (const [key, val] of Object.entries(mOpt)) {
    if (lower.includes(key)) {
      month = val;
      break;
    }
  }

  // Year: standard current year or found in text
  const currentYear = new Date().getFullYear();
  const yearMatch = lower.match(/\b(20\d{2})\b/);
  const year = yearMatch ? yearMatch[1] : currentYear.toString();

  return `${year}-${month}-${day}`;
};

// Helper to convert "YYYY-MM-DD" date string to beautifully formatted short string (like "10 Jun")
const formatToReadableDate = (isoStr: string): string => {
  if (!isoStr) return '';
  const parts = isoStr.split('-');
  if (parts.length !== 3) return isoStr;
  
  const [year, month, day] = parts;
  const monthNames = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];
  
  const mIndex = parseInt(month, 10) - 1;
  const mName = mIndex >= 0 && mIndex < 12 ? monthNames[mIndex] : 'Jun';
  const cleanDay = parseInt(day, 10).toString();
  
  return `${cleanDay} ${mName}`;
};

interface AbaKanbanProps {
  project: ProjectExtended;
  onUpdateProject: (updated: ProjectExtended) => void;
}

export default function AbaKanban({ project, onUpdateProject }: AbaKanbanProps) {
  const { fetchWithAuth } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  
  // New task inline form state
  const [isCreatingTask, setIsCreatingTask] = useState<string | null>(null); // columnId
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'Alta' | 'Média' | 'Baixa'>('Média');
  const [newTaskTags, setNewTaskTags] = useState('');

  // Task selection details modal state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const tasks = project.tasks || [];
  const teamMembers = project.team || [];

  useEffect(() => {
    if (selectedTask) {
       const updated = tasks.find(t => t.id === selectedTask.id);
       if (updated) setSelectedTask(updated);
    }
  }, [project.tasks]);

  const handleUpdateTask = (updatedTask: Task) => {
    const updatedTasks = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    onUpdateProject({
        ...project,
        tasks: updatedTasks
    });
    setSelectedTask(updatedTask);
  };

  const handleRemoveTask = async (taskId: number) => {
    if (!await confirmAction('Excluir Tarefa', 'Tem certeza que deseja excluir esta tarefa?')) return;

    try {
        const res = await fetchWithAuth(`/api/tasks/${taskId}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            const updatedTasks = tasks.filter(t => t.id !== taskId);
            onUpdateProject({
              ...project,
              tasks: updatedTasks,
            });
            setSelectedTask(null);
            showSuccess('Tarefa excluída!');
        } else {
            showError('Erro ao excluir tarefa.');
        }
    } catch (e) {
        console.error(e);
        showError('Erro ao excluir tarefa.');
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData('projectIdTaskId', taskId.toString());
  };

  const handleDrop = async (e: React.DragEvent, targetColumn: 'todo' | 'in_progress' | 'review' | 'done') => {
    e.preventDefault();
    const taskIdStr = e.dataTransfer.getData('projectIdTaskId');
    if (!taskIdStr) return;

    const taskId = parseInt(taskIdStr, 10);
    const movedTask = tasks.find(t => t.id === taskId);
    if (!movedTask) return;

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
            body: JSON.stringify({ status: statusMap[targetColumn] })
        });

        if (res.ok) {
            const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, column: targetColumn } : t);

            // Track in activity history
            const activityLog = {
              id: Date.now(),
              user: 'Usuário',
              action: `moveu a tarefa "${movedTask.name}" para ${getColumnLabel(targetColumn)}`,
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

  const handleCreateTask = async (columnId: 'todo' | 'in_progress' | 'review' | 'done') => {
    if (!newTaskName.trim()) return;

    const statusMap: { [key in 'todo' | 'in_progress' | 'review' | 'done']: string } = {
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
                title: newTaskName,
                status: statusMap[columnId],
                priority: newTaskPriority === 'Alta' ? 'HIGH' : newTaskPriority === 'Baixa' ? 'LOW' : 'MEDIUM',
                assigneeUid: newTaskAssignee,
                sprintId: project.currentSprintId // Use current sprint if available
            })
        });

        if (res.ok) {
            const newTaskFromApi = await res.json();
            
            const newTask: Task = {
              id: newTaskFromApi.id,
              name: newTaskFromApi.title,
              assignee: newTaskFromApi.assigneeUid || 'Não atribuído',
              priority: newTaskPriority,
              column: columnId,
              sprintId: newTaskFromApi.sprintId,
              tags: newTaskTags ? newTaskTags.split(',').map(t => t.trim()) : ['Atividade'],
              dueDate: newTaskFromApi.dueDate || '',
              dependencies: [],
              description: newTaskFromApi.description || '',
              subtasks: [],
              taskComments: []
            };

            const updatedTasks = [...tasks, newTask];
            onUpdateProject({
              ...project,
              tasks: updatedTasks
            });

            // Reset fields
            setNewTaskName('');
            setIsCreatingTask(null);
            showSuccess('Tarefa criada!');
        } else {
            showError('Houve um erro ao criar a tarefa.');
        }
    } catch (e) {
        console.error(e);
        showError('Erro de conexão ao criar a tarefa.');
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter ? t.priority === priorityFilter : true;
    const matchesAssignee = assigneeFilter ? t.assignee === assigneeFilter : true;
    return matchesSearch && matchesPriority && matchesAssignee;
  });

  const getColumnLabel = (colId: string) => {
    switch (colId) {
      case 'todo': return 'A Fazer';
      case 'in_progress': return 'Em Andamento';
      case 'review': return 'Revisão';
      case 'done': return 'Concluído';
      default: return colId;
    }
  };

  const columns: Array<'todo' | 'in_progress' | 'review' | 'done'> = ['todo', 'in_progress', 'review', 'done'];

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 h-full min-h-[550px] animate-in fade-in duration-200">
      
      {/* Filters Hub Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-[#0F172A0F] pb-6">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" size={16} />
          <input
            type="text"
            placeholder="Buscar por tarefa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAFAFA] border border-[#0F172A0F] rounded-[12px] py-3 pl-10 pr-4 text-xs outline-none focus:border-[#111111]/30 text-[#111111]"
          />
        </div>

        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-semibold">
            <Filter size={14} /> Filtros:
          </div>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[12px] px-3 py-2 text-xs font-semibold text-[#64748B] outline-none cursor-pointer"
          >
            <option value="">Prioridade: Todas</option>
            <option value="Alta">Alta</option>
            <option value="Média">Média</option>
            <option value="Baixa">Baixa</option>
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[12px] px-3 py-2 text-xs font-semibold text-[#64748B] outline-none max-w-[160px] cursor-pointer"
          >
            <option value="">Responsável: Todos</option>
            {teamMembers.map(member => (
              <option key={member.name} value={member.name}>{member.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Board Columns container */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start overflow-x-auto pb-4 custom-scrollbar">
        {columns.map(colId => {
          const columnTasks = filteredTasks.filter(t => t.column === colId);
          return (
            <div 
              key={colId}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, colId)}
              className="bg-[#FAFAFA]/50 border border-[#0F172A0F] rounded-[24px] p-4 flex flex-col gap-4 min-w-[250px]"
            >
              <div className="flex justify-between items-center px-1">
                <h4 className="text-[10px] font-bold uppercase text-[#64748B] tracking-widest">
                  {getColumnLabel(colId)}
                </h4>
                <span className="text-[10px] font-bold bg-[#FFFFFF] border border-[#0F172A0F] text-[#111111] px-2 py-0.5 rounded-lg shadow-sm">
                  {columnTasks.length}
                </span>
              </div>

              {/* Task Cards Stack */}
              <div className="flex flex-col gap-3 min-h-[300px]">
                <AnimatePresence>
                {columnTasks.map(task => {
                  const subtasksCount = task.subtasks?.length || 0;
                  const completedSubtasks = task.subtasks?.filter(s => s.isCompleted).length || 0;
                  const currentComments = task.taskComments?.length || 0;

                  // Check if this task is blocked by active dependencies
                  const activeBlockedDeps = task.dependencies?.map(depId => tasks.find(t => t.id === depId)).filter(depTask => depTask && depTask.column !== 'done') || [];
                  const isBlocked = activeBlockedDeps.length > 0;

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      key={task.id}
                      draggable
                      onDragStart={(e: any) => handleDragStart(e, task.id)}
                      onClick={() => setSelectedTask(task)}
                      className="bg-[#FFFFFF] p-4 rounded-[16px] border border-[#0F172A0F] hover:border-[#111111]/30 hover:shadow-md shadow-[0_2px_12px_rgba(0,0,0,0.01)] transition-all cursor-pointer group flex flex-col gap-3 text-left"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          task.priority === 'Alta' ? 'bg-red-50 text-red-700 border border-red-100' :
                          task.priority === 'Média' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-slate-50 text-slate-700 border border-slate-100'
                        }`}>
                          {task.priority}
                        </span>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveTask(task.id);
                          }}
                          className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
                          title="Deletar tarefa"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <h5 className="text-[13px] font-bold text-[#111111] leading-snug group-hover:text-black transition-colors">
                        {task.name}
                      </h5>

                      {/* Dependencies Block */}
                      {isBlocked && (
                        <div className="flex items-center gap-1.5 text-[9.5px] text-amber-600 font-bold bg-amber-50 border border-amber-100/50 px-2.5 py-1 rounded-[8px]">
                          <AlertTriangle size={11} className="shrink-0 animate-pulse text-amber-600" />
                          <span className="truncate">Bloqueado por {activeBlockedDeps.length} {activeBlockedDeps.length > 1 ? 'atividades' : 'atividade'}</span>
                        </div>
                      )}

                      {/* Display Description (trimmed description) */}
                      {task.description && (
                        <p className="text-[11px] text-[#64748B] line-clamp-2 leading-relaxed font-medium">
                          {task.description}
                        </p>
                      )}

                      {/* Checklist indicator */}
                      {subtasksCount > 0 && (
                        <div className="space-y-1 mt-0.5">
                          <div className="flex items-center justify-between text-[9px] font-bold text-[#64748B]">
                            <span className="flex items-center gap-1">
                              <CheckSquare size={10} className="text-emerald-600" /> Checklist: {completedSubtasks}/{subtasksCount}
                            </span>
                            <span>{Math.round((completedSubtasks / subtasksCount) * 100)}%</span>
                          </div>
                          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full transition-all duration-300" 
                              style={{ width: `${(completedSubtasks / subtasksCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Tags List */}
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {task.tags.map(tag => (
                            <span key={tag} className="text-[9px] font-bold bg-[#FAFAFA] text-[#64748B] px-1.5 py-0.5 rounded border border-[#0F172A0F]/50">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-between items-center border-t border-[#0F172A0F] pt-3 mt-1 text-[10px] text-[#64748B]">
                        <div className="flex items-center gap-1.5">
                          <div className="w-[18px] h-[18px] rounded-full bg-[#111111] text-white flex items-center justify-center text-[8px] font-extrabold shadow-sm">
                            {task.assignee?.charAt(0) || 'U'}
                          </div>
                          <span className="font-semibold text-[#111111] truncate max-w-[80px]">
                            {task.assignee || 'Sem responsável'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {currentComments > 0 && (
                            <span className="flex items-center gap-0.5 font-bold bg-[#FAFAFA] px-1.5 py-0.5 rounded border border-[#0F172A0F]">
                              <MessageSquare size={10} /> {currentComments}
                            </span>
                          )}

                          {task.dueDate && (
                            <span className="font-semibold flex items-center gap-1">
                              <Calendar size={10} /> {task.dueDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                </AnimatePresence>

                {isCreatingTask === colId ? (
                  <div className="bg-[#FFFFFF] p-4 rounded-[16px] border border-[#111111]/10 shadow-sm flex flex-col gap-3 animate-in fade-in duration-150">
                    <input
                      type="text"
                      placeholder="Nome da tarefa..."
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      className="w-full text-xs font-semibold bg-[#FAFAFA] border border-[#0F172A0F] rounded-lg p-2 outline-none focus:border-[#111111]/30 text-[#111111]"
                      autoFocus
                    />
                    
                    <select
                      value={newTaskAssignee}
                      onChange={(e) => setNewTaskAssignee(e.target.value)}
                      className="w-full text-xs bg-[#FAFAFA] border border-[#0F172A0F] rounded-lg p-2 outline-none text-[#64748B] font-semibold cursor-pointer"
                    >
                      <option value="">Sem responsável</option>
                      {teamMembers.map(m => (
                        <option key={m.name} value={m.name}>{m.name}</option>
                      ))}
                    </select>

                    <div className="flex items-center justify-between gap-2">
                      <select
                        value={newTaskPriority}
                        onChange={(e: any) => setNewTaskPriority(e.target.value)}
                        className="text-xs bg-[#FAFAFA] border border-[#0F172A0F] rounded-lg p-1.5 outline-none font-semibold text-[#64748B] cursor-pointer"
                      >
                        <option value="Alta">Alta</option>
                        <option value="Média">Média</option>
                        <option value="Baixa">Baixa</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Tags (atraso, bug)"
                        value={newTaskTags}
                        onChange={(e) => setNewTaskTags(e.target.value)}
                        className="text-[10px] bg-[#FAFAFA] border border-[#0F172A0F] rounded-lg p-1.5 outline-none font-semibold w-28 text-[#111111]"
                      />
                    </div>

                    <div className="flex justify-end gap-2 mt-1">
                      <button 
                        onClick={() => setIsCreatingTask(null)}
                        className="text-[11px] font-bold text-[#64748B] py-1 px-2.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={() => handleCreateTask(colId)}
                        className="text-[11px] font-bold text-white bg-[#111111] py-1 px-3 rounded-lg hover:bg-black cursor-pointer"
                      >
                        Criar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setNewTaskName('');
                      setIsCreatingTask(colId);
                    }}
                    className="w-full py-2.5 rounded-[12px] text-[11px] font-bold text-[#64748B] border border-dashed border-[#0F172A0F] hover:border-[#111111]/30 hover:bg-[#FAFAFA] hover:text-[#111111] transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} strokeWidth={2.5} />
                    <span>Adicionar tarefa</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

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
