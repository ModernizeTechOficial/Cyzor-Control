import { useState } from 'react';
import { AgendaEvent, ChecklistItem, AgendaComment, AgendaAttachment } from '../types/agenda';
import { X, Calendar, Clock, MapPin, User, Video, ShieldAlert, FileText, Send, Paperclip, CheckSquare, Plus, Trash2, Edit3, Trash } from 'lucide-react';

interface EventDetailsDrawerProps {
  event: AgendaEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateEvent: (updated: AgendaEvent) => void;
  onDeleteEvent: (id: string) => void;
  onEditClick: (event: AgendaEvent) => void;
}

export default function EventDetailsDrawer({ event, isOpen, onClose, onUpdateEvent, onDeleteEvent, onEditClick }: EventDetailsDrawerProps) {
  const [newComment, setNewComment] = useState('');
  const [newCheckItem, setNewCheckItem] = useState('');

  if (!event || !isOpen) return null;

  // Toggle checklist item status
  const handleToggleChecklist = (id: string) => {
    const updatedChecklist = event.checklist.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    
    // Add history log
    const changedItem = event.checklist.find(item => item.id === id);
    const actionText = changedItem 
      ? `Marcou "${changedItem.text}" como ${!changedItem.completed ? 'Concluído' : 'Pendente'}` 
      : 'Alterou checklist';
      
    const updatedEvent: AgendaEvent = {
      ...event,
      checklist: updatedChecklist,
      history: [
        {
          id: `h-usr-${Date.now()}`,
          user: 'Admin User',
          action: actionText,
          time: 'Agora'
        },
        ...event.history
      ]
    };
    onUpdateEvent(updatedEvent);
  };

  // Add checklist item
  const handleAddCheckItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCheckItem.trim()) return;

    const newItem: ChecklistItem = {
      id: `chk-${Date.now()}`,
      text: newCheckItem.trim(),
      completed: false
    };

    const updatedEvent: AgendaEvent = {
      ...event,
      checklist: [...event.checklist, newItem],
      history: [
        {
          id: `h-usr-${Date.now()}`,
          user: 'Admin User',
          action: `Adicionou item "${newCheckItem.trim()}" ao checklist`,
          time: 'Agora'
        },
        ...event.history
      ]
    };
    onUpdateEvent(updatedEvent);
    setNewCheckItem('');
  };

  // Submit new comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: AgendaComment = {
      id: `c-usr-${Date.now()}`,
      author: 'Admin User',
      text: newComment.trim(),
      time: 'Agora'
    };

    const updatedEvent: AgendaEvent = {
      ...event,
      comments: [...event.comments, comment],
      history: [
        {
          id: `h-usr-${Date.now()}`,
          user: 'Admin User',
          action: 'Adicionou um comentário',
          time: 'Agora'
        },
        ...event.history
      ]
    };
    onUpdateEvent(updatedEvent);
    setNewComment('');
  };

  // Upload attachment simulator
  const handleAttachSimulatedFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const newFile: AgendaAttachment = {
        id: `at-usr-${Date.now()}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.name.endsWith('.pdf') ? 'pdf' : 
              file.name.endsWith('.xlsx') || file.name.endsWith('.xls') ? 'planilha' : 
              file.name.match(/\.(jpg|jpeg|png|gif)$/i) ? 'imagem' : 'documento'
      };

      const updatedEvent: AgendaEvent = {
        ...event,
        attachments: [...event.attachments, newFile],
        history: [
          {
            id: `h-usr-${Date.now()}`,
            user: 'Admin User',
            action: `Anexou o arquivo "${file.name}"`,
            time: 'Agora'
          },
          ...event.history
        ]
      };
      onUpdateEvent(updatedEvent);
    }
  };

  // Delete attachment
  const handleDeleteAttachment = (id: string, name: string) => {
    const updatedEvent: AgendaEvent = {
      ...event,
      attachments: event.attachments.filter(at => at.id !== id),
      history: [
        {
          id: `h-usr-${Date.now()}`,
          user: 'Admin User',
          action: `Removeu o anexo "${name}"`,
          time: 'Agora'
        },
        ...event.history
      ]
    };
    onUpdateEvent(updatedEvent);
  };

  // Change Event Status quickly
  const handleStatusChange = (newStatus: any) => {
    const oldStatus = event.status;
    const updatedEvent: AgendaEvent = {
      ...event,
      status: newStatus,
      history: [
        {
          id: `h-usr-${Date.now()}`,
          user: 'Admin User',
          action: `Mudou status de "${oldStatus}" para "${newStatus}"`,
          time: 'Agora'
        },
        ...event.history
      ]
    };
    onUpdateEvent(updatedEvent);
  };

  const getEventBadgeColor = (category: string) => {
    switch (category) {
      case 'Projetos': return 'bg-neutral-950 text-white';
      case 'Comercial': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Financeiro': return 'bg-violet-50 text-violet-800 border-violet-200';
      case 'RH': return 'bg-amber-50 text-amber-800 border-amber-200';
      default: return 'bg-neutral-50 text-[#111111] border-[#0F172A0D]';
    }
  };

  // Date helper
  const formattedDate = () => {
    try {
      const parts = event.date.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return event.date;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-[#111111]/30 backdrop-blur-[2px] transition-opacity" 
      />

      {/* Slideout Container */}
      <div className="relative w-full max-w-[500px] bg-white h-screen flex flex-col shadow-[-4px_0_32px_rgba(0,0,0,0.15)] z-10 overflow-hidden">
        {/* Drawer Header */}
        <div className="border-b border-[#0F172A0F] p-6 flex justify-between items-center bg-[#FAFAFA]">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${getEventBadgeColor(event.category)}`}>
              {event.category}
            </span>
            <span className="text-xs text-[#64748B] font-mono">{event.type}</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onEditClick(event)}
              className="p-2 hover:bg-neutral-200/50 rounded-xl transition-all text-[#111111]"
              title="Editar"
            >
              <Edit3 size={15} />
            </button>
            <button 
              onClick={() => {
                if (confirm('Tem certeza de que deseja excluir este evento?')) {
                  onDeleteEvent(event.id);
                  onClose();
                }
              }}
              className="p-2 hover:bg-red-50 text-red-600 rounded-xl transition-all"
              title="Excluir"
            >
              <Trash size={15} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-[#FAFAFA] rounded-xl transition-all text-[#64748B]"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content inside body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-6 custom-scrollbar">
          {/* Main Title & Description */}
          <div>
            <h2 className="text-2xl font-bold text-[#111111] tracking-tight mb-2">
              {event.title}
            </h2>
            <p className="text-sm text-[#64748B] leading-relaxed">
              {event.description || 'Nenhuma descrição fornecida.'}
            </p>
          </div>

          {/* Quick Date-Time specifications */}
          <div className="bg-[#FAFAFA] border border-[#0F172A0D] rounded-24 p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3.5 text-sm text-[#111111] font-semibold">
              <Calendar size={16} className="text-[#64748B]" />
              <span>{formattedDate()}</span>
            </div>
            <div className="flex items-center gap-3.5 text-sm text-[#111111] font-semibold">
              <Clock size={16} className="text-[#64748B]" />
              <span>{event.startTime} às {event.endTime} <span className="text-[#64748B] font-medium font-mono text-xs">({event.recurrence !== 'none' ? `Recorrente: ${event.recurrenceDescription || event.recurrence}` : 'Sem recorrência'})</span></span>
            </div>
            {event.location && (
              <div className="flex items-center gap-3.5 text-sm text-[#111111] font-semibold">
                <MapPin size={16} className="text-[#64748B]" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
            {event.owner && (
              <div className="flex items-center gap-3.5 text-sm text-[#111111] font-semibold">
                <User size={16} className="text-[#64748B]" />
                <span>Responsável: {event.owner}</span>
              </div>
            )}
          </div>

          {/* Linkages display */}
          {(event.linkedProject || event.linkedCompany || event.linkedTask) && (
            <div className="border-t border-[#0F172A0D] pt-5 flex flex-col gap-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Associações Internas</span>
              <div className="flex flex-col gap-2">
                {event.linkedCompany && (
                  <div className="text-xs bg-[#FAFAFA] border border-[#0F172A0F] rounded-xl p-3 flex justify-between items-center text-[#111111] font-medium">
                    <span>Empresa vinculada</span>
                    <span className="font-semibold text-neutral-950 underline">{event.linkedCompany.name}</span>
                  </div>
                )}
                {event.linkedProject && (
                  <div className="text-xs bg-[#FAFAFA] border border-[#0F172A0F] rounded-xl p-3 flex justify-between items-center text-[#111111] font-medium">
                    <span>Projeto vinculado</span>
                    <span className="font-semibold text-neutral-950 underline">{event.linkedProject.name}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reserved Resources list */}
          {event.reservedResources.length > 0 && (
            <div className="border-t border-[#0F172A0D] pt-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-2.5 block">Recursos & Salas Reservados</span>
              <div className="flex flex-wrap gap-2">
                {event.reservedResources.map((res, i) => (
                  <span key={i} className="text-xs bg-amber-50/70 border border-amber-200/50 text-amber-900 rounded-lg px-2.5 py-1 font-semibold">
                    🔑 {res}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Status quick switcher */}
          <div className="border-t border-[#0F172A0D] pt-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-2.5 block">Alterar Status do Evento</span>
            <div className="flex flex-wrap gap-2">
              {(['Agendado', 'Confirmado', 'Em andamento', 'Concluído', 'Cancelado', 'Adiado'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                    event.status === st 
                      ? 'bg-[#111111] border-[#111111] text-white shadow-sm font-bold' 
                      : 'bg-white border-[#0F172A0F] text-[#64748B] hover:text-[#111111] hover:bg-[#FAFAFA]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Checklist Area */}
          <div className="border-t border-[#0F172A0D] pt-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Tarefas Integradas (Checklist)</span>
              <span className="text-xs font-mono font-bold text-[#111111]">
                {event.checklist.filter(c => c.completed).length}/{event.checklist.length}
              </span>
            </div>

            <div className="flex flex-col gap-2.5 mb-3">
              {event.checklist.map(item => (
                <div 
                  key={item.id}
                  onClick={() => handleToggleChecklist(item.id)}
                  className="flex items-center gap-3 p-3 bg-[#FAFAFA] border border-[#0F172A0F] rounded-xl hover:bg-neutral-50 cursor-pointer text-xs"
                >
                  <input 
                    type="checkbox" 
                    checked={item.completed}
                    readOnly
                    className="rounded text-neutral-900 focus:ring-neutral-900 border-[#0F172A22]"
                  />
                  <span className={`font-semibold text-neutral-800 ${item.completed ? 'line-through text-[#64748B] font-normal' : ''}`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddCheckItem} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Próxima tarefa imediata..." 
                value={newCheckItem}
                onChange={e => setNewCheckItem(e.target.value)}
                className="flex-1 text-xs border border-[#0F172A0F] bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#111111]"
              />
              <button 
                type="submit"
                className="bg-[#111111] text-white px-3 border border-[#111111] rounded-xl text-xs font-bold hover:bg-black"
              >
                <Plus size={16} />
              </button>
            </form>
          </div>

          {/* Attachments Section */}
          <div className="border-t border-[#0F172A0D] pt-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Arquivos e Anexos</span>
              <label className="cursor-pointer text-[10px] font-bold uppercase tracking-widest text-neutral-700 hover:text-black flex items-center gap-1">
                <Paperclip size={12} />
                Anexar Arquivo
                <input 
                  type="file" 
                  onChange={handleAttachSimulatedFile}
                  className="hidden" 
                />
              </label>
            </div>

            {event.attachments.length === 0 ? (
              <p className="text-xs text-[#64748B] italic">Nenhum arquivo anexado ainda.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {event.attachments.map(file => (
                  <div key={file.id} className="flex justify-between items-center p-3 bg-[#FAFAFA] rounded-xl border border-[#0F172A0F] text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">
                        {file.type === 'pdf' ? '📕' : file.type === 'planilha' ? '📗' : '📄'}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-semibold text-neutral-900 truncate max-w-[200px]">{file.name}</span>
                        <span className="text-[10px] text-[#64748B]">{file.size}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteAttachment(file.id, file.name)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-lg"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Participants Row */}
          {event.participants.length > 0 && (
            <div className="border-t border-[#0F172A0D] pt-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-3 block">Profissionais Convidados</span>
              <div className="flex flex-col gap-2.5">
                {event.participants.map((person, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-[#FAFAFA] border border-[#0F172A0F] rounded-xl p-3">
                    <img src={person.avatar} alt={person.name} className="w-8 h-8 rounded-full border border-[#0F172A0F]" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#111111]">{person.name}</span>
                      <span className="text-[10px] text-[#64748B]">{person.role} ({person.area})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments list */}
          <div className="border-t border-[#0F172A0D] pt-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-3 block">Discussões e Brainstorms</span>
            
            <div className="flex flex-col gap-3 mb-4">
              {event.comments.length === 0 ? (
                <p className="text-xs text-[#64748B] italic">Sem discussões registradas. Comece uma agora mesmo!</p>
              ) : (
                event.comments.map(c => (
                  <div key={c.id} className="bg-[#FAFAFA] border border-[#0F172A09] rounded-2xl p-4 flex flex-col gap-1 text-xs">
                    <div className="flex justify-between items-center mb-1 font-semibold">
                      <span className="text-[#111111]">{c.author}</span>
                      <span className="text-[10px] text-[#64748B] font-mono">{c.time}</span>
                    </div>
                    <p className="text-neutral-700 leading-relaxed font-semibold">{c.text}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Adicione um detalhe ou nota técnica..." 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                className="flex-1 text-xs border border-[#0F172A0F] bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#111111]"
              />
              <button 
                type="submit"
                className="bg-[#111111] text-white px-4 border border-[#111111] rounded-xl text-xs font-bold hover:bg-black flex items-center justify-center gap-1"
              >
                <Send size={12} />
              </button>
            </form>
          </div>

          {/* Modification Logs / Activity History */}
          <div className="border-t border-[#0F172A0D] pt-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-3 block">Histórico de Alterações</span>
            <div className="flex flex-col gap-2.5 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
              {event.history.map(item => (
                <div key={item.id} className="text-[10px] text-[#64748B] flex justify-between items-baseline gap-2 border-b border-[#0F172A03] pb-1.5">
                  <span className="font-semibold text-[#111111] shrink-0">{item.user}</span>
                  <span className="truncate flex-1">{item.action}</span>
                  <span className="font-mono text-[9px] shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
