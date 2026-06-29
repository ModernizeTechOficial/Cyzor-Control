import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import StandardHeader from './layout/StandardHeader';
import { 
  Plus, 
  Trash2, 
  Search, 
  Check, 
  Pin, 
  Folder, 
  Palette, 
  CheckSquare, 
  Grid, 
  List, 
  Tag, 
  Archive, 
  RotateCw, 
  Sparkles,
  Edit3,
  CheckCircle,
  Square,
  AlertCircle
} from 'lucide-react';

export interface KeepNote {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'checklist';
  checklistItems: { id: string; text: string; completed: boolean }[];
  color: string; // e.g., 'white', 'yellow', 'red', 'green', 'blue', 'teal', 'purple', 'pink'
  isPinned: boolean;
  label?: string;
  updatedAt: string;
}

const NOTE_COLORS = [
  { id: 'white', bg: 'bg-white border-neutral-200/80', dot: 'bg-white border border-neutral-300', label: 'Padrão' },
  { id: 'red', bg: 'bg-[#FDEDEC] border-[#FADBD8]', dot: 'bg-[#FADBD8]', label: 'Vermelho' },
  { id: 'yellow', bg: 'bg-[#FEF9E7] border-[#F9E79F]', dot: 'bg-[#F9E79F]', label: 'Amarelo' },
  { id: 'green', bg: 'bg-[#EAF2F8] border-[#D4E6F1]', dot: 'bg-[#D4E6F1]', label: 'Azul Claro' }, // matching keep soft tones
  { id: 'teal', bg: 'bg-[#E8F8F5] border-[#D1F2EB]', dot: 'bg-[#D1F2EB]', label: 'Verde Mar' },
  { id: 'blue', bg: 'bg-[#EBF5FB] border-[#D6EAF8]', dot: 'bg-[#D6EAF8]', label: 'Azul Escuro' },
  { id: 'purple', bg: 'bg-[#F5EEF8] border-[#EBDEF0]', dot: 'bg-[#EBDEF0]', label: 'Roxo' },
  { id: 'pink', bg: 'bg-[#FDEDF6] border-[#FADCEB]', dot: 'bg-[#FADCEB]', label: 'Rosa' }
];

const KEEP_LABELS = ['Trabalho', 'Pessoal', 'Pautas', 'Metas', 'Financeiro', 'Ideias', 'Lembretes'];

export default function GoogleKeepView() {
  // Keep states
  const [notes, setNotes] = useState<KeepNote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [keepError, setKeepError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Note Creator input states
  const [isExpandingCreator, setIsExpandingCreator] = useState(false);
  const [creatorType, setCreatorType] = useState<'text' | 'checklist'>('text');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newColor, setNewColor] = useState('white');
  const [newNewLabel, setNewNewLabel] = useState('');
  const [checklistInputItems, setChecklistInputItems] = useState<{ id: string; text: string; completed: boolean }[]>([
    { id: '1', text: '', completed: false }
  ]);
  
  // Form color pick popover
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // Active editing modal state
  const [activeEditingNote, setActiveEditingNote] = useState<KeepNote | null>(null);
  const [editShowColorPicker, setEditShowColorPicker] = useState(false);

  const creatorRef = useRef<HTMLDivElement>(null);
  const { fetchWithAuth } = useAuth();

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const response = await fetchWithAuth('/api/notes');
      if (response.ok) {
        const data = await response.json();
        // Convert from database schema to KeepNote format
        const formattedNotes = data.map((note: any) => ({
          id: note.id.toString(),
          title: note.title,
          content: note.content || '',
          type: note.content && note.content.startsWith('[{"id"') ? 'checklist' : 'text',
          checklistItems: note.content && note.content.startsWith('[{"id"') ? JSON.parse(note.content) : [],
          color: note.color,
          isPinned: note.isPinned,
          label: (note.tags && note.tags.length > 0) ? note.tags[0] : undefined,
          updatedAt: note.updatedAt
        }));
        setNotes(formattedNotes);
      } else {
        setKeepError("Não foi possível carregar as notas do servidor.");
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      setKeepError("Falha de conexão ao carregar as notas.");
    } finally {
      setIsLoading(false);
    }
  };

  // Load state from API
  useEffect(() => {
    fetchNotes();
  }, []);

  // Add / Remove items in checklist creator
  const addChecklistInputLine = () => {
    setChecklistInputItems(prev => [
      ...prev,
      { id: Date.now().toString() + Math.random(), text: '', completed: false }
    ]);
  };

  const handleChecklistInputTextChange = (id: string, text: string) => {
    setChecklistInputItems(prev => prev.map(item => item.id === id ? { ...item, text } : item));
  };

  const removeChecklistInputLine = (id: string) => {
    if (checklistInputItems.length === 1) {
      setChecklistInputItems([{ id: '1', text: '', completed: false }]);
    } else {
      setChecklistInputItems(prev => prev.filter(item => item.id !== id));
    }
  };

  // Save new Note
  const handleSaveNewNote = async () => {
    if (!newTitle.trim() && !newContent.trim() && (creatorType === 'checklist' && checklistInputItems.every(i => !i.text.trim()))) {
      // Completely empty, just collapse
      setIsExpandingCreator(false);
      return;
    }

    const newNoteContent = creatorType === 'text' 
      ? newContent.trim() 
      : JSON.stringify(checklistInputItems.filter(item => item.text.trim() !== ''));

    const tags = newNewLabel ? [newNewLabel] : [];

    try {
      const response = await fetchWithAuth('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newNoteContent,
          color: newColor,
          isPinned: false,
          tags: tags
        })
      });

      if (response.ok) {
        await fetchNotes();
        // Reset creator inputs
        setNewTitle('');
        setNewContent('');
        setNewColor('white');
        setNewNewLabel('');
        setChecklistInputItems([{ id: '1', text: '', completed: false }]);
        setIsExpandingCreator(false);
        setShowColorPicker(false);
      } else {
        setKeepError("Não foi possível salvar a nova nota.");
      }
    } catch (error) {
      console.error("Error saving new note:", error);
      setKeepError("Falha de conexão ao salvar a nota.");
    }
  };

  // Delete Note
  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await fetchWithAuth(`/api/notes/${noteId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setNotes(notes.filter(n => n.id !== noteId));
      } else {
         setKeepError("Não foi possível excluir a nota.");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      setKeepError("Falha de conexão ao excluir a nota.");
    }
  };

  // Update note helper
  const updateNoteServer = async (noteId: string, updates: any) => {
    try {
      const response = await fetchWithAuth(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) {
         setKeepError("Não foi possível atualizar a nota.");
      } else {
         // Keep local UI in sync smoothly without full reload if it's just a toggle
         await fetchNotes();
      }
    } catch (error) {
      console.error("Error updating note:", error);
      setKeepError("Falha de conexão ao atualizar a nota.");
    }
  };

  // Pin Note
  const handleTogglePin = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    // Optimistic UI update
    setNotes(notes.map(n => n.id === noteId ? { ...n, isPinned: !n.isPinned } : n));
    
    updateNoteServer(noteId, { isPinned: !note.isPinned });
  };

  // Change note color interactively
  const handleChangeNoteColor = (noteId: string, color: string) => {
    // Optimistic UI update
    setNotes(notes.map(n => n.id === noteId ? { ...n, color } : n));
    
    updateNoteServer(noteId, { color });
  };

  // Toggle checklist item within live notes cards
  const handleToggleChecklistItem = (noteId: string, itemId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note || note.type !== 'checklist') return;

    const updatedChecklist = note.checklistItems.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    
    // Optimistic update
    setNotes(notes.map(n => n.id === noteId ? { ...n, checklistItems: updatedChecklist } : n));
    
    updateNoteServer(noteId, { content: JSON.stringify(updatedChecklist) });
  };

  // Update complete note modal save
  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEditingNote) return;

    // Filter out blank checklist items if it is of type checklist
    const processedChecklistItems = activeEditingNote.type === 'checklist' 
        ? activeEditingNote.checklistItems.filter(item => item.text.trim() !== '')
        : [];
        
    const contentToSave = activeEditingNote.type === 'checklist' 
        ? JSON.stringify(processedChecklistItems) 
        : activeEditingNote.content;

    const tags = activeEditingNote.label ? [activeEditingNote.label] : [];

    const updates = {
      title: activeEditingNote.title,
      content: contentToSave,
      color: activeEditingNote.color,
      isPinned: activeEditingNote.isPinned,
      tags: tags
    };

    setActiveEditingNote(null);
    await updateNoteServer(activeEditingNote.id, updates);
  };

  const addEditChecklistItem = () => {
    if (!activeEditingNote) return;
    const newItem = { id: Date.now().toString(), text: '', completed: false };
    setActiveEditingNote({
      ...activeEditingNote,
      checklistItems: [...activeEditingNote.checklistItems, newItem]
    });
  };

  // Filters computed using useMemo
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.checklistItems.some(i => i.text.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesLabel = selectedLabel ? note.label === selectedLabel : true;

      return matchesSearch && matchesLabel;
    });
  }, [notes, searchQuery, selectedLabel]);

  const pinnedNotes = useMemo(() => filteredNotes.filter(n => n.isPinned), [filteredNotes]);
  const otherNotes = useMemo(() => filteredNotes.filter(n => !n.isPinned), [filteredNotes]);

  return (
    <div className="flex flex-col gap-10 min-h-screen px-4 sm:px-6 lg:px-10 pb-12">
      
      {/* 1. Header & Quick View Switcher */}
      <div className="flex flex-col gap-8">
        <StandardHeader 
          title="Caderno de Notas"
          subtitle="Capture pensamentos, monte listas de tarefas e organize ideias de forma ágil em cartões inteligentes."
          actions={[
            {
              label: 'Visualização',
              icon: viewMode === 'grid' ? Grid : List,
              onClick: () => setViewMode(viewMode === 'grid' ? 'list' : 'grid'),
              variant: 'secondary'
            }
          ]}
        />
      </div>

      {/* 2. Google Keep Core Split: Labels sidebar and main Notes area */}
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-stretch">
        
        {/* Left Side: Label filters */}
        <div className="w-full lg:w-[240px] shrink-0 flex flex-col gap-4 bg-white border border-[#0F172A0F] rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] h-fit">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pb-2 border-b border-neutral-100">
            🏷️ Marcadores
          </span>

          <div className="flex flex-col gap-1">
            <button
              onClick={() => setSelectedLabel(null)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left truncate ${
                selectedLabel === null
                  ? 'bg-amber-50/75 border border-amber-150/40 text-amber-900'
                  : 'text-neutral-600 hover:bg-[#FAFAFA] hover:text-[#111111]'
              }`}
            >
              <span>📂 Todas as Notas</span>
              <span className="text-[10px] px-1.5 py-0.5 font-bold bg-neutral-100 rounded-md text-neutral-500">{notes.length}</span>
            </button>

            {KEEP_LABELS.map(lbl => {
              const count = notes.filter(n => n.label === lbl).length;
              return (
                <button
                  key={lbl}
                  onClick={() => setSelectedLabel(lbl)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left truncate ${
                    selectedLabel === lbl
                      ? 'bg-amber-50/75 border border-amber-150/40 text-amber-900'
                      : 'text-neutral-600 hover:bg-[#FAFAFA] hover:text-[#111111]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Tag size={12} className="text-neutral-400 shrink-0" />
                    {lbl}
                  </span>
                  {count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 font-bold bg-neutral-100/80 text-neutral-500 rounded-md">{count}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-dashed border-neutral-100 flex flex-col gap-1.5 text-[11px] text-neutral-400 font-medium">
            <span className="font-semibold block text-[10px] text-neutral-700 uppercase tracking-wider mb-0.5">💡 Organização Rápida</span>
            <span>· Cartões coloridos dinâmicos</span>
            <span>· Marcadores de categoria</span>
            <span>· Notas no topo por pinos</span>
          </div>
        </div>

        {/* Right Side: Note Creator & Notes container */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          
          {/* Error Message Banner */}
          {keepError && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 flex flex-col sm:flex-row items-start gap-3.5 text-xs max-w-xl mx-auto w-full relative shadow-xs">
              <div className="flex items-start gap-3 flex-1">
                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold block mb-0.5">Falha de Conexão</span>
                  <p className="text-amber-800 leading-relaxed">{keepError}</p>
                  
                  {(keepError.includes('externa') || keepError.includes('nova aba')) && (
                    <div className="mt-2.5">
                      <a 
                        href={window.location.href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors no-underline cursor-pointer"
                      >
                        <Sparkles size={11} className="text-amber-200" />
                        Abrir em Nova Aba
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setKeepError(null)}
                className="text-amber-500 hover:text-amber-800 font-bold sm:self-start self-end text-sm select-none cursor-pointer p-1"
                title="Fechar alerta"
              >
                ✕
              </button>
            </div>
          )}

          {/* Creator Widget Box (Expands smoothly) */}
          <div ref={creatorRef} className="max-w-xl mx-auto w-full">
            <div className={`bg-white border rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${isExpandingCreator ? 'border-neutral-350 shadow-md p-4' : 'border-neutral-200 p-2 py-2 px-4.5 flex items-center justify-between gap-3'}`}>
              
              {!isExpandingCreator ? (
                <>
                  <input
                    type="text"
                    placeholder="Criar uma nota ou rascunho..."
                    onClick={() => {
                      setIsExpandingCreator(true);
                      setCreatorType('text');
                    }}
                    className="w-full text-sm font-semibold text-neutral-800 bg-transparent focus:outline-none cursor-pointer"
                  />
                  
                  <div className="flex items-center gap-1.5 shrink-0 select-none">
                    <button
                      type="button"
                      onClick={() => {
                        setIsExpandingCreator(true);
                        setCreatorType('checklist');
                      }}
                      className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-800 transition-colors"
                      title="Nova lista de controle"
                    >
                      <CheckSquare size={17} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  {/* Expanded Mode */}
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      placeholder="Título"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      className="w-full text-base font-bold text-neutral-900 bg-transparent focus:outline-none placeholder-neutral-400"
                    />
                    <button
                      type="button"
                      onClick={handleSaveNewNote}
                      className="text-neutral-400 hover:text-neutral-800"
                      title="Fechar"
                    >
                      <Check size={18} />
                    </button>
                  </div>

                  {creatorType === 'text' ? (
                    <textarea
                      placeholder="Criar uma nota..."
                      value={newContent}
                      onChange={e => setNewContent(e.target.value)}
                      rows={3}
                      className="w-full text-sm font-medium text-neutral-700 bg-transparent focus:outline-none resize-none placeholder-neutral-400"
                    />
                  ) : (
                    <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto mt-1 pr-1">
                      {checklistInputItems.map((item, index) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <Square size={14} className="text-neutral-300" />
                          <input
                            type="text"
                            placeholder="Item de tarefa"
                            value={item.text}
                            onChange={e => handleChecklistInputTextChange(item.id, e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addChecklistInputLine();
                              }
                            }}
                            className="flex-1 text-xs font-semibold text-neutral-700 bg-transparent focus:outline-none border-b border-transparent focus:border-neutral-200"
                            autoFocus={index === checklistInputItems.length - 1}
                          />
                          <button
                            type="button"
                            onClick={() => removeChecklistInputLine(item.id)}
                            className="text-neutral-300 hover:text-rose-500 rounded p-0.5"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addChecklistInputLine}
                        className="text-[10px] font-bold uppercase text-indigo-600 hover:text-indigo-800 tracking-wider flex items-center gap-1 self-start mt-1.5"
                      >
                        <Plus size={11} /> Adicionar Item
                      </button>
                    </div>
                  )}

                  {/* Creator Tools Row */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-neutral-100/60 mt-1 relative">
                    <div className="flex items-center gap-2">
                      
                      {/* Color Palette Popover trigger */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowColorPicker(!showColorPicker)}
                          className="p-1.5 hover:bg-neutral-50 rounded-lg text-[#64748B] hover:text-[#111111]"
                          title="Mudar plano de fundo"
                        >
                          <Palette size={15} />
                        </button>

                        {showColorPicker && (
                          <div className="absolute left-0 bottom-full mb-2 bg-white border border-[#0F172A0F] p-2 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.1)] flex gap-1.5 z-20">
                            {NOTE_COLORS.map(colorItem => {
                              const isSelected = newColor === colorItem.id;
                              return (
                                <button
                                  key={colorItem.id}
                                  type="button"
                                  onClick={() => setNewColor(colorItem.id)}
                                  className={`w-6 h-6 rounded-full shrink-0 ${colorItem.dot} ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
                                  title={colorItem.label}
                                />
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Label selector */}
                      <select
                        value={newNewLabel}
                        onChange={e => setNewNewLabel(e.target.value)}
                        className="bg-neutral-50 hover:bg-neutral-100 text-[10px] font-bold uppercase border border-neutral-200 rounded-lg text-neutral-600 px-2 py-1 outline-none transition-all cursor-pointer"
                      >
                        <option value="">Sem Marcador</option>
                        {KEEP_LABELS.map(lbl => (
                          <option key={lbl} value={lbl}>{lbl}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsExpandingCreator(false);
                          setNewTitle('');
                          setNewContent('');
                          setChecklistInputItems([{ id: '1', text: '', completed: false }]);
                        }}
                        className="px-3 py-1 text-[11px] font-bold text-neutral-500 hover:text-neutral-800"
                      >
                        Cancelar
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleSaveNewNote}
                        className="bg-[#111111] hover:bg-black text-white px-3.5 py-1 text-[11px] font-bold rounded-lg uppercase tracking-wider"
                      >
                        Criar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Find Toolbar search */}
          <div className="relative w-full max-w-md mx-auto">
            <Search size={14} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Pesquisar notas ou checklists..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold pl-10 pr-4 py-2 bg-white border border-neutral-200 focus:border-[#111111] rounded-2xl focus:outline-none"
            />
          </div>

          {/* Notes Canvas Grid & Lists */}
          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 bg-white border border-dashed border-neutral-200 rounded-3xl text-center max-w-md mx-auto w-full mt-4">
              <Folder size={32} className="text-neutral-300 mb-3 animate-pulse" />
              <h3 className="text-sm font-bold text-neutral-700">Nenhuma nota encontrada</h3>
              <p className="text-xs text-neutral-500 mt-1.5">
                {searchQuery || selectedLabel 
                  ? 'Não encontramos notas para os filtros fornecidos. Remova as buscas para ver todos.' 
                  : 'Crie um rascunho de nota ou insira uma lista de tarefas rápido usando o criador no topo.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-8 w-full">
              
              {/* Pinned notes section if there are any */}
              {pinnedNotes.length > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-1.5">
                    <Pin size={11} className="text-neutral-400 fill-neutral-400" />
                    <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Marcadas no Topo</span>
                  </div>
                  
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5' : 'flex flex-col gap-4'}>
                    {pinnedNotes.map(n => renderNoteCard(n))}
                  </div>
                </div>
              )}

              {/* Other notes section */}
              <div className="flex flex-col gap-3">
                {pinnedNotes.length > 0 && otherNotes.length > 0 && (
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Outras notas</span>
                )}
                
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5' : 'flex flex-col gap-4'}>
                  {otherNotes.map(n => renderNoteCard(n))}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* modal editing popup */}
      {activeEditingNote && (
        <div className="fixed inset-0 bg-[#111111]/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-neutral-100 shadow-xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <h3 className="text-base font-display font-bold text-neutral-950 flex items-center gap-1.5">
                📝 Editar Nota
              </h3>

              <button
                type="button"
                onClick={() => setActiveEditingNote(null)}
                className="text-neutral-400 hover:text-neutral-800 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateNote} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Título da Nota
                </label>
                <input
                  type="text"
                  value={activeEditingNote.title || ''}
                  onChange={e => setActiveEditingNote({ ...activeEditingNote, title: e.target.value })}
                  className="w-full text-xs font-semibold px-4 py-3 bg-neutral-50/50 border border-[#0F172A14] rounded-xl focus:bg-white focus:border-[#111111] focus:outline-none"
                />
              </div>

              {activeEditingNote.type === 'text' ? (
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                    Conteúdo
                  </label>
                  <textarea
                    value={activeEditingNote.content || ''}
                    onChange={e => setActiveEditingNote({ ...activeEditingNote, content: e.target.value })}
                    rows={4}
                    className="w-full text-xs font-medium px-4 py-3 bg-neutral-50/50 border border-[#0F172A14] rounded-xl focus:bg-white focus:border-[#111111] focus:outline-none resize-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                    Lista de Controle
                  </label>
                  <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
                    {activeEditingNote.checklistItems.map(item => (
                      <div key={item.id} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const updatedItems = activeEditingNote.checklistItems.map(it => 
                              it.id === item.id ? { ...it, completed: !it.completed } : it
                            );
                            setActiveEditingNote({ ...activeEditingNote, checklistItems: updatedItems });
                          }}
                          className="text-neutral-400 hover:text-indigo-600"
                        >
                          {item.completed ? <CheckSquare size={14} className="text-indigo-600" /> : <Square size={14} />}
                        </button>
                        <input
                          type="text"
                          value={item.text}
                          onChange={e => {
                            const updatedItems = activeEditingNote.checklistItems.map(it => 
                              it.id === item.id ? { ...it, text: e.target.value } : it
                            );
                            setActiveEditingNote({ ...activeEditingNote, checklistItems: updatedItems });
                          }}
                          className={`flex-1 text-xs font-semibold text-neutral-700 bg-transparent focus:outline-none ${item.completed ? 'line-through text-neutral-400' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updatedItems = activeEditingNote.checklistItems.filter(it => it.id !== item.id);
                            setActiveEditingNote({ ...activeEditingNote, checklistItems: updatedItems });
                          }}
                          className="text-neutral-300 hover:text-rose-500"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addEditChecklistItem}
                      className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider flex items-center gap-1 mt-1 border-dashed border border-neutral-200 rounded p-1 justify-center bg-neutral-50 hover:bg-neutral-100"
                    >
                      + Novo Item
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center gap-3 pt-3 border-t border-neutral-100">
                <div className="flex items-center gap-2">
                  <select
                    value={activeEditingNote.label || ''}
                    onChange={e => setActiveEditingNote({ ...activeEditingNote, label: e.target.value || undefined })}
                    className="bg-neutral-50 border border-neutral-200 rounded-lg text-[10px] font-bold uppercase text-neutral-600 px-2 py-1 outline-none transition-all cursor-pointer"
                  >
                    <option value="">Sem Marcador</option>
                    {KEEP_LABELS.map(lbl => (
                      <option key={lbl} value={lbl}>{lbl}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveEditingNote(null)}
                    className="px-3.5 py-2 text-xs font-bold text-neutral-500 hover:text-neutral-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-[#111111] hover:bg-black text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );

  // Note Card Renderer
  function renderNoteCard(note: KeepNote) {
    const isCompleted = note.type === 'checklist' && note.checklistItems.length > 0 && note.checklistItems.every(i => i.completed);
    const resolvedColorItem = NOTE_COLORS.find(c => c.id === note.color) || NOTE_COLORS[0];

    return (
      <div
        key={note.id}
        onClick={() => setActiveEditingNote(note)}
        className={`${resolvedColorItem.bg} border rounded-2xl p-4.5 flex flex-col justify-between gap-4.5 shadow-sm hover:shadow-md hover:border-neutral-350 transition-all group cursor-pointer relative ${viewMode === 'list' ? 'flex-row items-start justify-between min-h-fit gap-6' : ''}`}
      >
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          {/* Top Line: Title & pin button */}
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-bold text-sm text-neutral-900 group-hover:text-amber-600 transition-colors leading-snug truncate">
              {note.title || <span className="italic font-normal text-neutral-400">Sem título</span>}
            </h4>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleTogglePin(note.id);
              }}
              className="text-neutral-400 hover:text-amber-500 shrink-0 p-1 rounded-md transition-colors"
              title={note.isPinned ? "Desafixar do topo" : "Fixar no topo"}
            >
              <Pin size={13} className={note.isPinned ? "fill-amber-500 text-amber-500" : "text-neutral-300 hover:scale-110 transition-transform"} />
            </button>
          </div>

          {/* Content display depending on note type */}
          {note.type === 'text' ? (
            <p className="text-xs text-neutral-600 font-medium leading-relaxed whitespace-pre-wrap break-words line-clamp-6">
              {note.content}
            </p>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto pr-1">
              {note.checklistItems.map(item => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-2 py-0.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleChecklistItem(note.id, item.id);
                  }}
                >
                  <span className="shrink-0 text-neutral-400">
                    {item.completed ? <CheckSquare size={13} className="text-[#6366F1]" /> : <Square size={13} />}
                  </span>
                  <span className={`text-[11px] font-semibold truncate ${item.completed ? 'line-through text-neutral-400 font-normal' : 'text-neutral-750'}`}>
                    {item.text}
                  </span>
                </div>
              ))}
              {note.checklistItems.length === 0 && (
                <span className="text-[10px] italic text-neutral-400 font-medium">Nenhum item adicionado</span>
              )}
            </div>
          )}
        </div>

        {/* Bottom tag / marker & Toolbar tools */}
        <div className={`flex items-center justify-between border-t border-dashed border-neutral-200/55 pt-3 mt-1.5 ${viewMode === 'list' ? 'shrink-0 self-center flex-col gap-3 min-w-[120px] max-w-[140px] border-t-0 p-0 m-0 border-l border-neutral-100 pl-4 items-end' : ''}`}>
          {/* Label selector indicator tag */}
          <div className="flex items-center gap-1.5">
            {note.label ? (
              <span className="bg-neutral-100/80 border border-neutral-200/50 text-[9px] font-extrabold uppercase text-neutral-500 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Tag size={8} />
                {note.label}
              </span>
            ) : (
              <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-[0.05em]">Keep</span>
            )}
          </div>

          {/* Edit/Trash Actions */}
          <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            {/* Color trigger buttons inside note cards */}
            <div className="relative group/palette">
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="p-1 px-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100/60 rounded-md transition-colors"
                title="Trocar cor"
              >
                <Palette size={12} />
              </button>

              <div className="hidden group-hover/palette:flex absolute bottom-full right-0 mb-1 bg-white border border-neutral-200 p-1 rounded-lg shadow-md gap-1 z-10 animate-in fade-in slide-in-from-bottom-1 duration-100">
                {NOTE_COLORS.slice(0, 5).map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChangeNoteColor(note.id, c.id);
                    }}
                    className={`w-4.5 h-4.5 rounded-full ${c.dot} border border-neutral-300 hover:scale-110 transition-transform`}
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteNote(note.id);
              }}
              className="p-1 px-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
              title="Excluir nota"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </div>
    );
  }
}
