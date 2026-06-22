import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  fetchGoogleTaskLists, 
  createGoogleTaskList, 
  deleteGoogleTaskList, 
  fetchGoogleTasks, 
  createGoogleTask, 
  updateGoogleTask, 
  deleteGoogleTask,
  GoogleTaskList,
  GoogleTask
} from '../utils/googleTasks';
import { 
  CheckSquare, 
  Square, 
  Star, 
  Plus, 
  Trash2, 
  Edit2, 
  Calendar as CalendarIcon, 
  Search, 
  AlertCircle, 
  Check, 
  Clock, 
  FolderPlus, 
  RotateCw,
  Info,
  Sparkles
} from 'lucide-react';
import { safeToISOString } from '../../lib/dateUtils';

export default function GoogleTasksView() {
  const { googleTasksToken, connectGoogleTasks, user } = useAuth();
  
  // App states
  const [taskLists, setTaskLists] = useState<GoogleTaskList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<GoogleTask[]>([]);
  const [starredTaskIds, setStarredTaskIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('cyzor_starred_tasks');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // UI Flow States
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [listsError, setListsError] = useState<string | null>(null);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);

  // New item states
  const [showAddListForm, setShowAddListForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);

  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // Selection state for viewing/editing details
  const [selectedTask, setSelectedTask] = useState<GoogleTask | null>(null);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'completed' | 'starred' | 'all'>('pending');

  // Load Starred Task State and Persist
  useEffect(() => {
    localStorage.setItem('cyzor_starred_tasks', JSON.stringify(starredTaskIds));
  }, [starredTaskIds]);

  // Load Task Lists
  const loadTaskLists = async (token = googleTasksToken) => {
    if (!token) return;
    setIsLoadingLists(true);
    setListsError(null);
    try {
      const lists = await fetchGoogleTaskLists(token);
      setTaskLists(lists);
      if (lists.length > 0 && !selectedListId) {
        setSelectedListId(lists[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load Google Task Lists:', err);
      setListsError('Não foi possível carregar as listas de tarefas da sua conta Google.');
    } finally {
      setIsLoadingLists(false);
    }
  };

  // Load Tasks whenever selection or token changes
  const loadTasksForSelectedList = async (listId = selectedListId, token = googleTasksToken) => {
    if (!token || !listId) {
      setTasks([]);
      return;
    }
    setIsLoadingTasks(true);
    setTasksError(null);
    try {
      const fetchedTasks = await fetchGoogleTasks(token, listId, true);
      setTasks(fetchedTasks);
    } catch (err: any) {
      console.error('Failed to load Google Tasks:', err);
      setTasksError('Não foi possível sincronizar as tarefas desta lista.');
    } finally {
      setIsLoadingTasks(false);
    }
  };

  // Sync flow
  useEffect(() => {
    if (googleTasksToken) {
      loadTaskLists(googleTasksToken);
    }
  }, [googleTasksToken]);

  useEffect(() => {
    if (googleTasksToken && selectedListId) {
      loadTasksForSelectedList(selectedListId, googleTasksToken);
    }
  }, [selectedListId, googleTasksToken]);

  // Actions
  const handleConnect = async () => {
    setConnectError(null);
    try {
      await connectGoogleTasks();
    } catch (err: any) {
      console.error('Failed to connect to Google Tasks:', err);
      const isPopupClosed = err?.code === 'auth/popup-closed-by-user' || err?.message?.includes('popup-closed-by-user');
      const isPopupBlocked = err?.code === 'auth/popup-blocked' || err?.message?.includes('popup-blocked');
      
      if (isPopupClosed || isPopupBlocked) {
        setConnectError(
          'A janela de autenticação foi fechada ou bloqueada pelo navegador. Se você estiver usando o aplicativo dentro de um painel de visualização (iframe), o navegador costuma restringir popups de login automáticos por segurança. Abra o aplicativo em uma aba externa para conectar instantaneamente do Google.'
        );
      } else {
        setConnectError('A conexão ao Google Tasks foi cancelada ou falhou. Por favor, tente novamente.');
      }
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleTasksToken || !newListName.trim()) return;
    setIsCreatingList(true);
    try {
      const newList = await createGoogleTaskList(googleTasksToken, newListName.trim());
      setTaskLists(prev => [...prev, newList]);
      setSelectedListId(newList.id);
      setNewListName('');
      setShowAddListForm(false);
    } catch (err) {
      console.error('Error creating list:', err);
      alert('Falha ao criar lista de tarefas no Google Tasks.');
    } finally {
      setIsCreatingList(false);
    }
  };

  const handleDeleteList = async (listId: string, listName: string) => {
    if (!googleTasksToken) return;
    const confirmed = window.confirm(
      `Tem certeza que deseja apagar a lista "${listName}"? Todos os itens dela serão excluídos permanentemente no Google Tasks.`
    );
    if (!confirmed) return;

    try {
      await deleteGoogleTaskList(googleTasksToken, listId);
      setTaskLists(prev => prev.filter(l => l.id !== listId));
      if (selectedListId === listId) {
        const remaining = taskLists.filter(l => l.id !== listId);
        setSelectedListId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err) {
      console.error('Error deleting list:', err);
      alert('Falha ao deletar a lista de tarefas no Google Tasks.');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleTasksToken || !selectedListId || !newTaskTitle.trim()) return;
    setIsCreatingTask(true);
    try {
      const isDateValid = newTaskDue && !isNaN(Date.parse(newTaskDue));
      const formattedDate = safeToISOString(newTaskDue) || undefined;

      const created = await createGoogleTask(googleTasksToken, selectedListId, {
        title: newTaskTitle.trim(),
        notes: newTaskNotes.trim() || undefined,
        due: formattedDate,
        status: 'needsAction'
      });

      setTasks(prev => [created, ...prev]);
      setNewTaskTitle('');
      setNewTaskNotes('');
      setNewTaskDue('');
      setShowAddTaskModal(false);
    } catch (err) {
      console.error('Error creating task:', err);
      alert('Falha ao registrar tarefa no Google Tasks.');
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleToggleTaskStatus = async (task: GoogleTask) => {
    if (!googleTasksToken || !selectedListId) return;

    const newStatus = task.status === 'completed' ? 'needsAction' : 'completed';
    
    // Optimistic update
    setTasks(prev => 
      prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t)
    );

    try {
      await updateGoogleTask(googleTasksToken, selectedListId, task.id, {
        status: newStatus
      });
    } catch (err) {
      console.error('Error updating task status:', err);
      // Revert if error
      setTasks(prev => 
        prev.map(t => t.id === task.id ? { ...t, status: task.status } : t)
      );
    }
  };

  const handleUpdateTaskDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleTasksToken || !selectedListId || !selectedTask) return;
    setIsUpdatingTask(true);
    try {
      const isDateValid = selectedTask.due && !isNaN(Date.parse(selectedTask.due));
      const formattedDate = safeToISOString(selectedTask.due) || '';

      const updated = await updateGoogleTask(googleTasksToken, selectedListId, selectedTask.id, {
        title: selectedTask.title,
        notes: selectedTask.notes || '',
        due: formattedDate
      });

      setTasks(prev => prev.map(t => t.id === selectedTask.id ? updated : t));
      setSelectedTask(null);
    } catch (err) {
      console.error('Error updating task:', err);
      alert('Não foi possível salvar as alterações desta tarefa.');
    } finally {
      setIsUpdatingTask(false);
    }
  };

  const handleDeleteTask = async (taskId: string, title: string) => {
    if (!googleTasksToken || !selectedListId) return;
    const confirmed = window.confirm(
      `Deseja mesmo excluir permanentemente a tarefa "${title || 'Sem título'}"?`
    );
    if (!confirmed) return;

    try {
      await deleteGoogleTask(googleTasksToken, selectedListId, taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setStarredTaskIds(prev => prev.filter(id => id !== taskId));
      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('Não foi possível excluir esta tarefa.');
    }
  };

  const toggleStar = (taskId: string) => {
    setStarredTaskIds(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  // Compute selected list title
  const selectedListTitle = useMemo(() => {
    return taskLists.find(l => l.id === selectedListId)?.title || 'Lista de Tarefas';
  }, [taskLists, selectedListId]);

  // Filter tasks based on search & completion state
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = 
        task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.notes?.toLowerCase().includes(searchQuery.toLowerCase());

      const isStarred = starredTaskIds.includes(task.id);

      if (!matchesSearch) return false;

      if (statusFilter === 'pending') {
        return task.status === 'needsAction';
      }
      if (statusFilter === 'completed') {
        return task.status === 'completed';
      }
      if (statusFilter === 'starred') {
        return isStarred;
      }
      return true; // value 'all'
    });
  }, [tasks, searchQuery, statusFilter, starredTaskIds]);

  // Formatter for readable date
  const formatTaskDate = (isoString?: string) => {
    if (!isoString) return null;
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return null;
      return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return null;
    }
  };

  const isTaskOverdue = (isoString?: string, status?: string) => {
    if (!isoString || status === 'completed') return false;
    try {
      const date = new Date(isoString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date < today;
    } catch {
      return false;
    }
  };

  if (!googleTasksToken) {
    return (
      <div className="bg-white border border-[#0F172A0F] rounded-[24px] p-8 md:p-12 text-center max-w-2xl mx-auto my-12 shadow-sm">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <CheckSquare size={32} />
        </div>
        <h2 className="text-2xl font-display font-bold text-neutral-950 mb-3">Google Tasks Sincronizado</h2>
        <p className="text-[#64748B] text-base leading-relaxed mb-6 max-w-lg mx-auto">
          Conecte sua conta do Google de forma segura para sincronizar suas listas de pautas, organizar prioridades, categorizar itens e favoritar tarefas importantes diretamente na plataforma Cyzor.
        </p>

        {connectError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4.5 mb-6 flex flex-col items-start gap-3.5 text-xs max-w-md mx-auto relative text-left shadow-xs">
            <div className="flex items-start gap-3">
              <span className="text-base shrink-0 mt-0.5">⚠️</span>
              <div className="flex-1">
                <span className="font-bold block mb-0.5">Falha de Conexão</span>
                <p className="text-amber-800 leading-relaxed">{connectError}</p>
                
                {(connectError.includes('externa') || connectError.includes('nova aba')) && (
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
              onClick={() => setConnectError(null)}
              className="text-amber-500 hover:text-amber-800 font-bold absolute top-3.5 right-3.5 text-sm select-none cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={handleConnect}
          className="bg-[#111111] hover:bg-black text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-md mx-auto cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Conectar com Google Tasks
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-stretch bg-neutral-50/50 p-1 rounded-3xl">
      
      {/* Sidebar: Categories (Task Lists) */}
      <div className="w-full lg:w-[280px] shrink-0 flex flex-col gap-5 bg-white border border-[#0F172A0F] rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] h-fit">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <span className="text-[11px] font-bold text-neutral-800 uppercase tracking-widest flex items-center gap-1.5">
            📂 Categorias
          </span>
          <button
            type="button"
            onClick={() => setShowAddListForm(!showAddListForm)}
            className="p-1 hover:bg-[#FAFAFA] text-[#64748B] hover:text-[#111111] rounded-lg transition-colors"
            title="Criar Categoria"
          >
            <FolderPlus size={16} />
          </button>
        </div>

        {/* Create new list category */}
        {showAddListForm && (
          <form onSubmit={handleCreateList} className="flex flex-col gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200/50 mt-1">
            <input
              type="text"
              placeholder="Nome da categoria..."
              value={newListName}
              onChange={e => setNewListName(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 bg-white border border-[#0F172A1F] rounded-lg focus:outline-none focus:border-indigo-500"
              required
              disabled={isCreatingList}
            />
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => { setShowAddListForm(false); setNewListName(''); }}
                className="px-2.5 py-1 text-[10px] font-bold text-neutral-500 hover:text-neutral-800"
                disabled={isCreatingList}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-[#111111] hover:bg-black text-white px-3 py-1 text-[10px] font-bold rounded-md"
                disabled={isCreatingList}
              >
                {isCreatingList ? 'Criando...' : 'Adicionar'}
              </button>
            </div>
          </form>
        )}

        {/* Lists Container */}
        {isLoadingLists ? (
          <div className="flex flex-col items-center py-6 gap-2">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Sincronizando...</span>
          </div>
        ) : listsError ? (
          <div className="p-3 text-center bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-xs font-semibold">
            {listsError}
            <button
              onClick={() => loadTaskLists()}
              className="block underline mt-1 mx-auto text-[10px]"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto pr-1">
            {taskLists.map(list => {
              const isActive = selectedListId === list.id;
              return (
                <div
                  key={list.id}
                  className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-[#111111] text-white shadow-sm' 
                      : 'text-neutral-600 hover:bg-[#FAFAFA] hover:text-[#111111]'
                  }`}
                  onClick={() => setSelectedListId(list.id)}
                >
                  <span className="truncate pr-2 font-medium">
                    · {list.title}
                  </span>
                  
                  {/* Delete Option (only shows for lists that are not the default one) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteList(list.id, list.title);
                    }}
                    className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                      isActive ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white' : 'hover:bg-neutral-100 text-neutral-400 hover:text-rose-600'
                    }`}
                    title="Excluir Categoria"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
            {taskLists.length === 0 && (
              <span className="text-[11px] font-bold text-neutral-400 italic text-center py-4">
                Nenhuma categoria criada.
              </span>
            )}
          </div>
        )}

        {/* Connected account info */}
        <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400 bg-neutral-50 -mx-5 -mb-5 p-4 rounded-b-[24px]">
          <span className="font-semibold truncate max-w-[150px]">{user?.email || 'Workspace'}</span>
          <button
            onClick={() => loadTaskLists()}
            className="hover:text-indigo-600 transition-colors flex items-center gap-1 font-bold"
            title="Sincronizar tarefas"
          >
            <RotateCw size={12} /> Sync
          </button>
        </div>
      </div>

      {/* Main Board: Task Management Area */}
      <div className="flex-1 min-w-0 bg-white border border-[#0F172A0F] rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col gap-6">
        
        {/* Board Top Section: Header & Action Item */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
          <div>
            <span className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-widest block mb-0.5">
              PAINEL DIÁRIO DO GOOGLE TASKS
            </span>
            <h2 className="text-xl font-display font-bold text-neutral-950 flex items-center gap-2">
              📂 {selectedListTitle}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!selectedListId) {
                alert('Selecione ou crie uma categoria antes.');
                return;
              }
              setShowAddTaskModal(true);
            }}
            className="bg-[#111111] hover:bg-black text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all self-start md:self-center"
          >
            <Plus size={14} />
            Adicionar Tarefa
          </button>
        </div>

        {/* Board Second Row: Search & Filters Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex gap-1 bg-[#FAFAFA] border border-[#0F172A0F] p-1 rounded-xl w-fit">
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                statusFilter === 'pending'
                  ? 'bg-white text-neutral-900 border border-neutral-200 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-950'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                statusFilter === 'completed'
                  ? 'bg-white text-neutral-900 border border-neutral-200 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-950'
              }`}
            >
              Concluídas
            </button>
            <button
              onClick={() => setStatusFilter('starred')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
                statusFilter === 'starred'
                  ? 'bg-white text-neutral-900 border border-neutral-200 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-950'
              }`}
            >
              <Star size={11} className="fill-amber-400 text-amber-500" />
              Favoritos
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-neutral-900 border border-neutral-200 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-950'
              }`}
            >
              Todas
            </button>
          </div>

          {/* Search Inputs */}
          <div className="relative w-full md:max-w-[260px]">
            <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Pesquisar tarefas..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold pl-9 pr-3 py-2 bg-neutral-50 border border-[#0F172A14] focus:bg-white focus:border-[#111111] rounded-xl focus:outline-none"
            />
          </div>
        </div>

        {/* Board Main Canvas: List of Tasks */}
        <div className="flex-1 flex flex-col min-h-[350px]">
          {isLoadingTasks ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Sincronizando tarefas...</p>
            </div>
          ) : tasksError ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-rose-50/50 rounded-2xl border border-rose-100 max-w-md mx-auto my-10">
              <AlertCircle size={28} className="text-rose-500 mb-2" />
              <h3 className="text-sm font-bold text-neutral-900">Erro de Sincronização</h3>
              <p className="text-xs text-neutral-500 mt-1 mb-4">{tasksError}</p>
              <button
                onClick={() => loadTasksForSelectedList()}
                className="bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 px-4 py-2 rounded-xl text-xs font-bold"
              >
                Recarregar Lista
              </button>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 bg-neutral-50/40 rounded-2xl border border-dashed border-neutral-200 text-center px-4">
              <CheckSquare size={32} className="text-neutral-300 mb-3" />
              <h3 className="text-sm font-bold text-neutral-700">Nenhuma tarefa encontrada</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                Neste filtro de visualização ou busca não há tarefas no momento. Toque em "Adicionar Tarefa" para registrar uma nova pauta.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {filteredTasks.map(task => {
                const isCompleted = task.status === 'completed';
                const isOverdue = isTaskOverdue(task.due, task.status);
                const isStarred = starredTaskIds.includes(task.id);
                const readableDate = formatTaskDate(task.due);

                return (
                  <div
                    key={task.id}
                    className={`group flex items-start justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                      isCompleted 
                        ? 'bg-neutral-50/70 border-neutral-200/50 hover:bg-neutral-100/60' 
                        : 'bg-white border-neutral-200/80 hover:border-indigo-300 hover:shadow-xs'
                    }`}
                    onClick={() => setSelectedTask({ ...task, due: task.due ? task.due.substring(0, 10) : '' })}
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      {/* Checkbox Trigger */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleTaskStatus(task);
                        }}
                        className="text-neutral-400 hover:text-[#111111] shrink-0 mt-0.5"
                      >
                        {isCompleted ? (
                          <CheckSquare size={17} className="text-indigo-600" />
                        ) : (
                          <Square size={17} />
                        )}
                      </button>

                      {/* Title & Notes */}
                      <div className="flex-1 min-w-0">
                        <h4 
                          className={`text-sm font-bold truncate leading-snug ${
                            isCompleted 
                              ? 'line-through text-neutral-400' 
                              : 'text-neutral-900 group-hover:text-indigo-600'
                          }`}
                        >
                          {task.title || <span className="italic font-normal text-neutral-400">Sem título</span>}
                        </h4>
                        
                        {task.notes && (
                          <p className="text-xs text-neutral-500 mt-1 line-clamp-1 max-w-2xl font-medium">
                            {task.notes}
                          </p>
                        )}

                        {/* Badges/Dates info */}
                        {readableDate && (
                          <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold uppercase tracking-wider">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md ${
                              isOverdue 
                                ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                                : isCompleted 
                                ? 'bg-slate-50 text-slate-500 border border-slate-100' 
                                : 'bg-indigo-50/50 text-indigo-600 border border-indigo-100/50'
                            }`}>
                              <CalendarIcon size={10} />
                              {readableDate}
                              {isOverdue && ' (Atrasada)'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Leftside Controls: Star, Edit, Delete */}
                    <div className="flex items-center gap-1.5 shrink-0 self-start">
                      {/* Favorite/Star */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(task.id);
                        }}
                        className="p-1.5 hover:bg-neutral-150 rounded-lg transition-colors text-neutral-300 hover:text-amber-500"
                        title={isStarred ? "Remover dos favoritos" : "Marcar como favorito"}
                      >
                        <Star size={14} className={isStarred ? "fill-amber-400 text-amber-500" : "text-neutral-300"} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(task.id, task.title);
                        }}
                        className="p-1.5 hover:bg-neutral-100 text-neutral-300 hover:text-rose-600 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Deletar Tarefa"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Add New Task */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-[#111111]/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-neutral-100 shadow-xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-display font-bold text-neutral-950 mb-4 flex items-center gap-2">
              📝 Nova Tarefa em {selectedListTitle}
            </h3>

            <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Título da Tarefa
                </label>
                <input
                  type="text"
                  placeholder="Nome do to-do ou pauta..."
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  className="w-full text-xs font-semibold px-4 py-3 bg-neutral-50/50 border border-[#0F172A14] rounded-xl focus:bg-white focus:border-[#111111] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Notas / Observações
                </label>
                <textarea
                  placeholder="Descrição ou pauta detalhada..."
                  value={newTaskNotes}
                  onChange={e => setNewTaskNotes(e.target.value)}
                  rows={3}
                  className="w-full text-xs font-medium px-4 py-3 bg-neutral-50/50 border border-[#0F172A14] rounded-xl focus:bg-white focus:border-[#111111] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Data de Vencimento (Opcional)
                </label>
                <input
                  type="date"
                  value={newTaskDue}
                  onChange={e => setNewTaskDue(e.target.value)}
                  className="w-full text-xs font-semibold px-4 py-2.5 bg-neutral-50/50 border border-[#0F172A14] rounded-xl focus:bg-white focus:border-[#111111] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 text-xs font-bold text-neutral-500 hover:text-neutral-800 transition-colors"
                  disabled={isCreatingTask}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#111111] hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5"
                  disabled={isCreatingTask}
                >
                  {isCreatingTask ? 'Criando...' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PANEL 2: Edit Task Drawer / Dialog */}
      {selectedTask && (
        <div className="fixed inset-0 bg-[#111111]/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-neutral-100 shadow-xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <h3 className="text-base font-display font-bold text-neutral-950 flex items-center gap-1.5">
                ✏️ Editar Tarefa
              </h3>

              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="text-neutral-400 hover:text-neutral-800 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateTaskDetails} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Título da Tarefa
                </label>
                <input
                  type="text"
                  value={selectedTask.title || ''}
                  onChange={e => setSelectedTask({ ...selectedTask, title: e.target.value })}
                  className="w-full text-xs font-semibold px-4 py-3 bg-neutral-50/50 border border-[#0F172A14] rounded-xl focus:bg-white focus:border-[#111111] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Notas / Observações
                </label>
                <textarea
                  value={selectedTask.notes || ''}
                  onChange={e => setSelectedTask({ ...selectedTask, notes: e.target.value })}
                  rows={4}
                  className="w-full text-xs font-medium px-4 py-3 bg-neutral-50/50 border border-[#0F172A14] rounded-xl focus:bg-white focus:border-[#111111] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Data de Vencimento
                </label>
                <input
                  type="date"
                  value={selectedTask.due ? selectedTask.due.substring(0, 10) : ''}
                  onChange={e => setSelectedTask({ ...selectedTask, due: e.target.value })}
                  className="w-full text-xs font-semibold px-4 py-2.5 bg-neutral-50/50 border border-[#0F172A14] rounded-xl focus:bg-white focus:border-[#111111] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => handleDeleteTask(selectedTask.id, selectedTask.title || '')}
                  className="text-xs font-bold text-rose-500 hover:text-rose-700 hover:underline flex items-center gap-1"
                >
                  <Trash2 size={13} />
                  Deletar Tarefa
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTask(null)}
                    className="px-3.5 py-2 text-xs font-bold text-neutral-500 hover:text-neutral-800 transition-colors"
                    disabled={isUpdatingTask}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-[#111111] hover:bg-black text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
                    disabled={isUpdatingTask}
                  >
                    {isUpdatingTask ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
