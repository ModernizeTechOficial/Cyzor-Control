import React, { useState, useEffect } from 'react';
import { Task, ProjectExtended, Activity } from '../types/project';
import { X, ListTodo, Trash2, MessageSquare, Check, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { showSuccess, showError } from '../lib/alerts';
import { FormGroup, FormLabel, FormInput, FormTextarea, FormSelect } from './ui/FormComponents';

interface TaskDetailModalProps {
  task: Task;
  project: ProjectExtended;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
}

export default function TaskDetailModal({ task, project, isOpen, onClose, onUpdateTask, onDeleteTask }: TaskDetailModalProps) {
  const { fetchWithAuth } = useAuth();
  const [taskDraft, setTaskDraft] = useState<Task | null>(null);
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [newCommentText, setNewCommentText] = useState('');

  useEffect(() => {
    if (isOpen && task) {
      setTaskDraft({
        ...task,
        description: task.description || '',
        subtasks: task.subtasks || [],
        taskComments: task.taskComments || [],
        dependencies: task.dependencies || [],
      });
      setNewSubtaskName('');
      setNewCommentText('');
    }
  }, [isOpen, task]);

  if (!isOpen || !taskDraft) return null;

  const teamMembers = project.team || [];

  const handleAddSubtask = () => {
    if (!newSubtaskName.trim()) return;
    const newSub = {
      id: Date.now(),
      name: newSubtaskName.trim(),
      isCompleted: false
    };
    setTaskDraft({
      ...taskDraft,
      subtasks: [...(taskDraft.subtasks || []), newSub]
    });
    setNewSubtaskName('');
  };

  const handleSaveTaskDetails = async () => {
    if (!taskDraft) return;

    const statusMap: { [key in 'todo' | 'in_progress' | 'review' | 'done']: string } = {
        'todo': 'TODO',
        'in_progress': 'IN_PROGRESS',
        'review': 'REVIEW',
        'done': 'DONE'
    };

    try {
        const response = await fetchWithAuth(`/api/tasks/${taskDraft.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: taskDraft.name,
                description: taskDraft.description,
                status: statusMap[taskDraft.column],
                priority: taskDraft.priority,
                assigneeUid: taskDraft.assignee, 
                dueDate: taskDraft.dueDate,
                tags: taskDraft.tags,
                subtasks: taskDraft.subtasks,
                taskComments: taskDraft.taskComments,
                sprintId: taskDraft.sprintId
            })
        });

        if (response.ok) {
            onUpdateTask(taskDraft);
            onClose();
            showSuccess('Tarefa salva com sucesso!');
        } else {
            showError('Houve um erro ao salvar a tarefa.');
        }
    } catch (e) {
        console.error(e);
        showError('Falha ao conectar.');
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs z-50 flex justify-center items-end sm:items-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-t-[24px] sm:rounded-[24px] shadow-[0_24px_60px_rgba(0,0,0,0.18)] border border-[#0F172A0D] w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#0F172A0D] p-5 md:p-6 bg-[#FAFAFA]/40">
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-mono font-bold uppercase text-[#64748B] tracking-wider bg-slate-100 rounded px-2 py-0.5">
              ID: #{taskDraft.id.toString().slice(-5)}
            </span>
            <span className="ml-2 text-[10px] text-slate-500 font-semibold">• Projeto: {project.name}</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-[#64748B] hover:text-[#111111] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-5 md:p-8">
            
            {/* Left side: Main controls */}
            <div className="lg:col-span-2 space-y-6 text-left">
              <FormGroup>
                <FormLabel>Nome da Atividade</FormLabel>
                <input
                  type="text"
                  value={taskDraft.name}
                  onChange={(e) => setTaskDraft({ ...taskDraft, name: e.target.value })}
                  className="w-full text-lg md:text-xl font-bold bg-transparent border-b border-slate-200 hover:border-indigo-500 focus:border-indigo-600 py-1 px-1 outline-none text-[#111111] transition-all"
                  placeholder="Nome da atividade..."
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Descrição Detalhada</FormLabel>
                <FormTextarea
                  value={taskDraft.description}
                  onChange={(e) => setTaskDraft({ ...taskDraft, description: e.target.value })}
                  placeholder="Descreva detalhadamente o que precisa ser feito..."
                  rows={4}
                />
              </FormGroup>

              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-wider font-bold text-[#64748B] flex items-center gap-1.5 border-t border-slate-100 pt-4">
                  <ListTodo size={14} /> Checklist ({taskDraft.subtasks?.length || 0})
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {taskDraft.subtasks?.map(sub => (
                    <div key={sub.id} className="flex items-center justify-between group/sub bg-slate-50/50 rounded-xl px-3 py-2 border border-slate-200/60">
                      <label className="flex items-center gap-2 cursor-pointer text-xs flex-1">
                        <input
                          type="checkbox"
                          checked={sub.isCompleted}
                          onChange={() => {
                            const updated = taskDraft.subtasks?.map(s => s.id === sub.id ? { ...s, isCompleted: !s.isCompleted } : s) || [];
                            setTaskDraft({ ...taskDraft, subtasks: updated });
                          }}
                          className="rounded border-slate-300 text-indigo-600 h-4 w-4 accent-indigo-600"
                        />
                        <span className={sub.isCompleted ? 'line-through text-slate-400' : 'text-slate-700 font-semibold'}>{sub.name}</span>
                      </label>
                      <button onClick={() => setTaskDraft({ ...taskDraft, subtasks: taskDraft.subtasks?.filter(s => s.id !== sub.id) || [] })} className="opacity-0 group-hover/sub:opacity-100 text-red-500 hover:text-red-600 transition-all p-1"><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <FormInput
                    value={newSubtaskName}
                    onChange={e => setNewSubtaskName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
                    placeholder="Adicionar subitem..."
                  />
                  <button onClick={handleAddSubtask} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 text-xs font-bold transition-all shadow-sm">Add</button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-wider font-bold text-[#64748B] flex items-center gap-1.5 border-t border-slate-100 pt-4">
                  <MessageSquare size={14} /> Discussão
                </label>
                <div className="flex gap-2">
                  <FormTextarea
                    value={newCommentText}
                    onChange={e => setNewCommentText(e.target.value)}
                    placeholder="Escreva um comentário..."
                    rows={2}
                  />
                  <button onClick={() => {
                    if (!newCommentText.trim()) return;
                    const newComm = { id: Date.now(), author: 'Você (Gestor)', text: newCommentText, time: 'Agora' };
                    setTaskDraft({ ...taskDraft, taskComments: [newComm, ...(taskDraft.taskComments || [])] });
                    setNewCommentText('');
                  }} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 text-xs font-bold h-12 self-end transition-all shadow-sm">Enviar</button>
                </div>
                <div className="space-y-3">
                  {taskDraft.taskComments?.map(comm => (
                    <div key={comm.id} className="bg-slate-50/50 rounded-xl p-3 border border-slate-100 shadow-sm">
                      <div className="flex justify-between text-[10px] font-bold mb-1">
                        <span className="text-slate-900">{comm.author}</span>
                        <span className="text-slate-500">{comm.time}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-semibold">{comm.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side: Meta */}
            <div className="bg-slate-50/50 border border-slate-200 rounded-[22px] p-5 space-y-5 text-left shadow-sm">
              <FormGroup>
                <FormLabel>Status</FormLabel>
                <FormSelect value={taskDraft.column} onChange={e => setTaskDraft({ ...taskDraft, column: e.target.value as any })}>
                  <option value="todo">A Fazer</option>
                  <option value="in_progress">Em Andamento</option>
                  <option value="review">Revisão</option>
                  <option value="done">Concluído</option>
                </FormSelect>
              </FormGroup>

              <FormGroup>
                <FormLabel>Sprint</FormLabel>
                <FormSelect value={taskDraft.sprintId || ''} onChange={e => setTaskDraft({ ...taskDraft, sprintId: e.target.value ? Number(e.target.value) : undefined })}>
                  <option value="">Backlog</option>
                  {project.sprints?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </FormSelect>
              </FormGroup>

              <FormGroup>
                <FormLabel>Responsável</FormLabel>
                <FormSelect value={taskDraft.assignee} onChange={e => setTaskDraft({ ...taskDraft, assignee: e.target.value })}>
                  <option value="Não atribuído">Não atribuído</option>
                  {teamMembers.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                </FormSelect>
              </FormGroup>

              <div className="space-y-1">
                <FormLabel>Prioridade</FormLabel>
                <div className="grid grid-cols-3 gap-1 bg-white p-1 border border-slate-200 rounded-xl shadow-sm">
                  {(['Alta', 'Média', 'Baixa'] as const).map(p => (
                    <button key={p} onClick={() => setTaskDraft({ ...taskDraft, priority: p })} className={`py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${taskDraft.priority === p ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>{p}</button>
                  ))}
                </div>
              </div>

              <FormGroup>
                <FormLabel>Data Limite</FormLabel>
                <FormInput type="date" value={taskDraft.dueDate} onChange={e => setTaskDraft({ ...taskDraft, dueDate: e.target.value })} />
              </FormGroup>

              <button onClick={() => { if(confirm('Excluir esta tarefa?')) onDeleteTask(taskDraft.id); }} className="w-full mt-4 py-2 flex items-center justify-center gap-1.5 text-xs text-red-600 border border-dashed border-red-200 rounded-lg font-bold hover:bg-red-50">
                <Trash2 size={13} /> Excluir Atividade
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 p-5 pb-8 sm:pb-5 bg-slate-50 flex justify-between">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">Cancelar</button>
          <button onClick={handleSaveTaskDetails} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"><Check size={14} /> Salvar Alterações</button>
        </div>
      </div>
    </div>
  );
}
