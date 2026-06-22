import React, { useState, useEffect } from 'react';
import { Task, ProjectExtended, Activity } from '../types/project';
import { X, ListTodo, Trash2, MessageSquare, Check, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { showSuccess, showError } from '../lib/alerts';

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
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-[#64748B] block">Nome da Atividade</label>
                <input
                  type="text"
                  value={taskDraft.name}
                  onChange={(e) => setTaskDraft({ ...taskDraft, name: e.target.value })}
                  className="w-full text-lg md:text-xl font-bold bg-transparent border-b border-transparent hover:border-[#0F172A1F] focus:border-[#111111] py-1 px-1 outline-none text-[#111111] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-[#64748B] block">Descrição Detalhada</label>
                <textarea
                  value={taskDraft.description}
                  onChange={(e) => setTaskDraft({ ...taskDraft, description: e.target.value })}
                  className="w-full h-28 bg-[#FAFAFA] border border-[#0F172A0D] rounded-[14px] p-3 text-xs outline-none focus:border-[#111111]/30 text-[#111111] resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-wider font-bold text-[#64748B] flex items-center gap-1.5 border-t border-[#0F172A0D] pt-4">
                  <ListTodo size={14} /> Checklist ({taskDraft.subtasks?.length || 0})
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {taskDraft.subtasks?.map(sub => (
                    <div key={sub.id} className="flex items-center justify-between group/sub bg-[#FAFAFA] rounded-xl px-3 py-2 border border-[#0F172A07]">
                      <label className="flex items-center gap-2 cursor-pointer text-xs flex-1">
                        <input
                          type="checkbox"
                          checked={sub.isCompleted}
                          onChange={() => {
                            const updated = taskDraft.subtasks?.map(s => s.id === sub.id ? { ...s, isCompleted: !s.isCompleted } : s) || [];
                            setTaskDraft({ ...taskDraft, subtasks: updated });
                          }}
                          className="rounded border-[#0F172A1F] text-black h-4 w-4"
                        />
                        <span className={sub.isCompleted ? 'line-through text-[#64748B]' : 'text-[#111111] font-semibold'}>{sub.name}</span>
                      </label>
                      <button onClick={() => setTaskDraft({ ...taskDraft, subtasks: taskDraft.subtasks?.filter(s => s.id !== sub.id) || [] })} className="opacity-0 group-hover/sub:opacity-100 text-red-600"><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={newSubtaskName}
                    onChange={e => setNewSubtaskName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
                    placeholder="Adicionar subitem..."
                    className="flex-1 text-xs bg-[#FAFAFA] border border-[#0F172A0D] rounded-xl px-3 py-2 outline-none"
                  />
                  <button onClick={handleAddSubtask} className="bg-[#111111] text-white rounded-xl px-4 text-xs font-bold">Add</button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-wider font-bold text-[#64748B] flex items-center gap-1.5 border-t border-[#0F172A0D] pt-4">
                  <MessageSquare size={14} /> Discussão
                </label>
                <div className="flex gap-2">
                  <textarea
                    value={newCommentText}
                    onChange={e => setNewCommentText(e.target.value)}
                    placeholder="Escreva um comentário..."
                    className="flex-1 h-16 bg-[#FAFAFA] border border-[#0F172A0D] rounded-xl p-2.5 text-xs outline-none"
                  />
                  <button onClick={() => {
                    if (!newCommentText.trim()) return;
                    const newComm = { id: Date.now(), author: 'Você (Gestor)', text: newCommentText, time: 'Agora' };
                    setTaskDraft({ ...taskDraft, taskComments: [newComm, ...(taskDraft.taskComments || [])] });
                    setNewCommentText('');
                  }} className="bg-[#111111] text-white rounded-xl px-4 text-xs font-bold">Enviar</button>
                </div>
                <div className="space-y-3">
                  {taskDraft.taskComments?.map(comm => (
                    <div key={comm.id} className="bg-slate-50 rounded-xl p-3 border border-[#0F172A05]">
                      <div className="flex justify-between text-[10px] font-bold mb-1">
                        <span className="text-[#111111]">{comm.author}</span>
                        <span className="text-[#64748B]">{comm.time}</span>
                      </div>
                      <p className="text-xs text-[#111111]/90 leading-relaxed font-semibold">{comm.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side: Meta */}
            <div className="bg-[#FAFAFA]/70 border border-[#0F172A0D] rounded-[22px] p-5 space-y-5 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[#64748B]">Status</label>
                <select value={taskDraft.column} onChange={e => setTaskDraft({ ...taskDraft, column: e.target.value as any })} className="w-full bg-white border border-[#0F172A0F] rounded-lg p-2 text-xs font-bold">
                  <option value="todo">A Fazer</option>
                  <option value="in_progress">Em Andamento</option>
                  <option value="review">Revisão</option>
                  <option value="done">Concluído</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[#64748B]">Sprint</label>
                <select value={taskDraft.sprintId || ''} onChange={e => setTaskDraft({ ...taskDraft, sprintId: e.target.value ? Number(e.target.value) : undefined })} className="w-full bg-white border border-[#0F172A0F] rounded-lg p-2 text-xs font-bold">
                  <option value="">Backlog</option>
                  {project.sprints?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[#64748B]">Responsável</label>
                <select value={taskDraft.assignee} onChange={e => setTaskDraft({ ...taskDraft, assignee: e.target.value })} className="w-full bg-white border border-[#0F172A0F] rounded-lg p-2 text-xs font-bold">
                  <option value="Não atribuído">Não atribuído</option>
                  {teamMembers.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[#64748B]">Prioridade</label>
                <div className="grid grid-cols-3 gap-1 bg-white p-1 border border-[#0F172A0F] rounded-lg">
                  {(['Alta', 'Média', 'Baixa'] as const).map(p => (
                    <button key={p} onClick={() => setTaskDraft({ ...taskDraft, priority: p })} className={`py-1 rounded-md text-[10px] font-bold uppercase ${taskDraft.priority === p ? 'bg-black text-white' : 'text-gray-400'}`}>{p}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[#64748B]">Data Limite</label>
                <input type="date" value={taskDraft.dueDate} onChange={e => setTaskDraft({ ...taskDraft, dueDate: e.target.value })} className="w-full bg-white border border-[#0F172A0F] rounded-lg p-2 text-xs font-bold" />
              </div>

              <button onClick={() => { if(confirm('Excluir esta tarefa?')) onDeleteTask(taskDraft.id); }} className="w-full mt-4 py-2 flex items-center justify-center gap-1.5 text-xs text-red-600 border border-dashed border-red-200 rounded-lg font-bold hover:bg-red-50">
                <Trash2 size={13} /> Excluir Atividade
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-[#0F172A0D] p-5 pb-8 sm:pb-5 bg-[#FAFAFA]/70 flex justify-between">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-[#64748B]">Cancelar</button>
          <button onClick={handleSaveTaskDetails} className="bg-[#111111] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"><Check size={14} /> Salvar</button>
        </div>
      </div>
    </div>
  );
}
