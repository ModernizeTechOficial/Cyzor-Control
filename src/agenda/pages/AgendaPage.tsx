import { useState, useMemo, useEffect } from 'react';
import { CalendarViewType, AgendaEvent, EventCategory } from '../types/agenda';
import { useAuth } from '../../context/AuthContext';
import StandardHeader from '../../components/layout/StandardHeader';
import { 
  fetchGoogleCalendarEvents, 
  createGoogleCalendarEvent, 
  deleteGoogleCalendarEvent, 
  updateGoogleCalendarEvent 
} from '../utils/googleCalendar';

// Views
import DayView from '../components/DayView';
import WeekView from '../components/WeekView';
import MonthView from '../components/MonthView';
import AgendaListView from '../components/AgendaListView';
import TimelineView from '../components/TimelineView';
import ExecutiveDashboard from '../components/ExecutiveDashboard';
import GoogleTasksView from '../components/GoogleTasksView';

// Side Panels
import DailyAgendaPanel from '../components/DailyAgendaPanel';
import UpcomingEvents from '../components/UpcomingEvents';

// Drawers & Modals
import EventDetailsDrawer from '../drawers/EventDetailsDrawer';
import EventModal from '../modals/EventModal';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search, 
  Filter, 
  Sparkles, 
  Layout, 
  Video, 
  Bell, 
  Building2,
  PieChart as ChartIcon,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Link2
} from 'lucide-react';

export default function AgendaPage() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [currentCalendarView, setCurrentCalendarView] = useState<CalendarViewType>('dia');
  const [showExecutiveDashboard, setShowExecutiveDashboard] = useState(false);
  
  // Google Calendar Integration State
  const { googleCalendarToken, connectGoogleCalendar, user, token, activeWorkspace, fetchWithAuth } = useAuth();
  const [isSyncingGCal, setIsSyncingGCal] = useState(false);
  const [gcalError, setGcalError] = useState<string | null>(null);

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('todos');
  const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);

  // Modals / Drawers State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  
  // Prefilled modal state
  const [prefilledHour, setPrefilledHour] = useState<string | undefined>(undefined);
  const [prefilledDate, setPrefilledDate] = useState<string | undefined>(undefined);

  // Fetch events from real backend
  useEffect(() => {
    const fetchEvents = async () => {
      if (!activeWorkspace) return;
      try {
        setLoading(true);
        const res = await fetchWithAuth('/api/agenda');
        if (res.ok) {
          const data = await res.json();
          setEvents(data || []);
        }
      } catch (err) {
        console.error("Failed to load agenda events from DB:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [fetchWithAuth, activeWorkspace]);

  // Fetch and Sync Google Calendar Events
  const syncGoogleCalendar = async () => {
    if (!googleCalendarToken) return;
    setIsSyncingGCal(true);
    setGcalError(null);
    try {
      const gcalEvents = await fetchGoogleCalendarEvents(googleCalendarToken);
      setEvents(prev => {
        // Keep local manual events, but clear stale Google Calendar events to avoid duplicates
        const localOnly = prev.filter(e => !e.id.startsWith('gcal-'));
        return [...localOnly, ...gcalEvents];
      });
    } catch (err: any) {
      console.error('Failed to fetch Google Calendar events:', err);
      setGcalError('Falha ao sincronizar eventos da Google. Reconecte a sua conta.');
    } finally {
      setIsSyncingGCal(false);
    }
  };

  // Sync automatically when the calendar page lands and we have a token
  useEffect(() => {
    if (googleCalendarToken) {
      syncGoogleCalendar();
    }
  }, [googleCalendarToken]);

  const handleConnectGCal = async () => {
    setGcalError(null);
    try {
      await connectGoogleCalendar();
    } catch (err: any) {
      console.error('Error connecting to GCal:', err);
      const isPopupClosed = err?.code === 'auth/popup-closed-by-user' || err?.message?.includes('popup-closed-by-user');
      const isPopupBlocked = err?.code === 'auth/popup-blocked' || err?.message?.includes('popup-blocked');
      
      if (isPopupClosed || isPopupBlocked) {
        setGcalError(
          'A janela de autenticação foi fechada ou bloqueada pelo navegador. Se você estiver usando o aplicativo dentro do painel integrado, o navegador costuma restringir popups automáticos por segurança. Abra o aplicativo em uma aba externa para conectar.'
        );
      } else {
        setGcalError('Patar de login do Google Calendar foi cancelado ou falhou.');
      }
    }
  };

  // Clean active events: exclude mock items starting with 'evt-' when Google Calendar is connected
  const activeEvents = useMemo(() => {
    if (googleCalendarToken) {
      return events.filter(e => !e.id.startsWith('evt-'));
    }
    return events;
  }, [events, googleCalendarToken]);

  // Filtered Events based on search and category
  const filteredEvents = useMemo(() => {
    return activeEvents.filter(event => {
      const matchesSearch = 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.location && event.location.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = 
        selectedCategoryFilter === 'todos' || 
        event.category === selectedCategoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [activeEvents, searchQuery, selectedCategoryFilter]);

  // Event handlers
  const handleSaveEvent = async (saved: AgendaEvent) => {
    const exists = events.some(e => e.id === saved.id);
    if (exists) {
      const isGoogleEvent = googleCalendarToken && saved.id.startsWith('gcal-');
      if (!isGoogleEvent) {
        try {
          const res = await fetchWithAuth(`/api/agenda/${saved.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(saved)
          });
          if (res.ok) {
            const updated = await res.json();
            setEvents(events.map(e => e.id === saved.id ? updated : e));
            if (selectedEvent?.id === saved.id) {
              setSelectedEvent(updated);
            }
          }
        } catch (err) {
          console.error("Failed to update event in DB:", err);
        }
      } else {
        setEvents(events.map(e => e.id === saved.id ? saved : e));
        if (selectedEvent?.id === saved.id) {
          setSelectedEvent(saved);
        }
        try {
          await updateGoogleCalendarEvent(googleCalendarToken, saved);
        } catch (err) {
          console.error('Failed to update Google Calendar event online:', err);
        }
      }
    } else {
      let finalEvent = saved;
      // If connected to Google Calendar, push the newly created event over
      if (googleCalendarToken) {
        try {
          const gcalResult = await createGoogleCalendarEvent(googleCalendarToken, saved);
          if (gcalResult && gcalResult.id) {
            finalEvent = {
              ...saved,
              id: `gcal-${gcalResult.id}`,
              location: gcalResult.location || saved.location,
              attachments: gcalResult.hangoutLink ? [
                ...saved.attachments,
                {
                  id: `glink-${gcalResult.id}`,
                  name: 'Entrar no Google Meet',
                  type: 'link',
                  size: '0 KB',
                  url: gcalResult.hangoutLink
                }
              ] : saved.attachments
            };
            setEvents([...events, finalEvent]);
          }
        } catch (err) {
          console.error('Failed to create event on Google Calendar:', err);
        }
      } else {
        try {
          const res = await fetchWithAuth('/api/agenda', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(saved)
          });
          if (res.ok) {
            const created = await res.json();
            setEvents([...events, created]);
          }
        } catch (err) {
          console.error("Failed to save event to DB:", err);
        }
      }
    }
  };

  const handleDeleteEvent = async (id: string) => {
    const isGoogleEvent = googleCalendarToken && id.startsWith('gcal-');
    if (!isGoogleEvent) {
      try {
        await fetchWithAuth(`/api/agenda/${id}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.error("Failed to delete event from DB:", err);
      }
    } else {
      try {
        await deleteGoogleCalendarEvent(googleCalendarToken, id);
      } catch (err) {
        console.error('Failed to delete event from Google Calendar online:', err);
      }
    }
    setEvents(events.filter(e => e.id !== id));
    if (selectedEvent?.id === id) {
      setSelectedEvent(null);
      setIsDrawerOpen(false);
    }
  };

  const handleUpdateEvent = async (updated: AgendaEvent) => {
    const isGoogleEvent = googleCalendarToken && updated.id.startsWith('gcal-');
    if (!isGoogleEvent) {
      try {
        const res = await fetchWithAuth(`/api/agenda/${updated.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updated)
        });
        if (res.ok) {
          const newEvt = await res.json();
          setEvents(events.map(e => e.id === updated.id ? newEvt : e));
          if (selectedEvent?.id === updated.id) {
            setSelectedEvent(newEvt);
          }
        }
      } catch (err) {
        console.error("Failed to update event in DB:", err);
      }
    } else {
      setEvents(events.map(e => e.id === updated.id ? updated : e));
      if (selectedEvent?.id === updated.id) {
        setSelectedEvent(updated);
      }
      try {
        await updateGoogleCalendarEvent(googleCalendarToken, updated);
      } catch (err) {
        console.error('Failed to update Google Calendar event online:', err);
      }
    }
  };

  const handleEventClick = (event: AgendaEvent) => {
    setSelectedEvent(event);
    setIsDrawerOpen(true);
  };

  const handleQuickAdd = (date: string, hour: string) => {
    setPrefilledDate(date);
    setPrefilledHour(hour);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleOpenNewEvent = (customType?: 'reuniao' | 'lembrete') => {
    setPrefilledDate(selectedDate);
    setPrefilledHour(undefined);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  // Navigations of date helper
  const navigateDate = (direction: 'forward' | 'backward') => {
    const baseDate = new Date(selectedDate);
    const offset = direction === 'forward' ? 1 : -1;
    
    if (currentCalendarView === 'dia') {
      baseDate.setDate(baseDate.getDate() + offset);
    } else if (currentCalendarView === 'semana') {
      baseDate.setDate(baseDate.getDate() + (offset * 7));
    } else {
      baseDate.setMonth(baseDate.getMonth() + offset);
    }
    
    setSelectedDate(baseDate.toISOString().split('T')[0]);
  };

  // Get current active date label for navigation bar
  const dateNavigationLabel = useMemo(() => {
    try {
      const parts = selectedDate.split('-');
      const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      
      if (currentCalendarView === 'dia') {
        return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
      } else if (currentCalendarView === 'semana') {
        const startDay = new Date(date);
        const dayIndex = date.getDay();
        const diff = startDay.getDate() - dayIndex + (dayIndex === 0 ? -6 : 1);
        startDay.setDate(diff);

        const endDay = new Date(startDay);
        endDay.setDate(startDay.getDate() + 6);
        
        return `${startDay.getDate()} ${startDay.toLocaleDateString('pt-BR', { month: 'short' })} - ${endDay.getDate()} ${endDay.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}`;
      } else {
        return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();
      }
    } catch {
      return selectedDate;
    }
  }, [selectedDate, currentCalendarView]);

  return (
    <div id="agenda-module" className="flex flex-col gap-10 animate-in fade-in duration-500 px-4 sm:px-6 lg:px-10 pb-12">
      
      {/* 1. Header Area */}
      <StandardHeader 
        title="Agenda"
        subtitle="Planejamento integrado e inteligência analítica de compromissos."
        actions={[
          {
            label: 'Novo Compromisso',
            icon: Plus,
            onClick: () => handleOpenNewEvent(),
            variant: 'primary'
          },
          {
            label: 'Nova Reunião',
            icon: Video,
            onClick: () => handleOpenNewEvent('reuniao'),
            variant: 'secondary'
          },
          {
            label: showExecutiveDashboard ? 'Calendário' : 'Painel Executivo',
            icon: ChartIcon,
            onClick: () => setShowExecutiveDashboard(!showExecutiveDashboard),
            variant: 'secondary'
          }
        ]}
      />

      {/* Google Calendar Sync Integration Panel */}
      <section className="bg-[#FAFBF9] border border-[#DEE2E6]/60 rounded-[24px] p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="bg-[#E9ECEF] p-3 rounded-2xl text-neutral-800 shrink-0">
            <Calendar size={22} className="text-[#000000]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
              Google Calendar
              {googleCalendarToken ? (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Sincronizado
                </span>
              ) : (
                <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full">
                  Não Conectado
                </span>
              )}
            </h3>
            <p className="text-xs text-[#64748B] mt-1 font-medium">
              {googleCalendarToken 
                ? `Conectado com sucesso à conta ${user?.email || 'Google'}. Seus compromissos são lidos e atualizados automaticamente.`
                : 'Integre com seu Google Calendar para visualizar e gerenciar compromissos e reuniões virtuais em tempo real.'
              }
            </p>
            {gcalError && (
              <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3.5 max-w-xl text-left">
                <p className="text-xs font-semibold flex items-start gap-1.5 leading-relaxed">
                  <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                  <span className="flex-1">
                    {gcalError}
                    
                    {(gcalError.includes('externa') || gcalError.includes('nova aba')) && (
                      <span className="block mt-2">
                        <a 
                          href={window.location.href} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors no-underline cursor-pointer"
                        >
                          <Sparkles size={11} className="text-amber-200" />
                          Abrir em Nova Aba
                        </a>
                      </span>
                    )}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
          {googleCalendarToken ? (
            <>
              <button
                type="button"
                onClick={syncGoogleCalendar}
                disabled={isSyncingGCal}
                className="bg-white text-neutral-800 border border-[#DEE2E6] hover:bg-neutral-50 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <RefreshCw size={13} className={isSyncingGCal ? "animate-spin text-neutral-500" : "text-neutral-500"} />
                {isSyncingGCal ? 'Sincronizando...' : 'Recarregar'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleConnectGCal}
              className="bg-white text-[#111111] border border-[#DEE2E6] hover:bg-neutral-50 shadow-sm px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Conectar Google Calendar
            </button>
          )}
        </div>
      </section>

      {/* Conditional Dashboard Render */}
      {showExecutiveDashboard ? (
        <ExecutiveDashboard events={activeEvents} />
      ) : (
        <>
          {/* 2. Controls Toolbar (Search, Filters, View selector, Date Navigator) */}
          <section className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white border border-[#0F172A0F] rounded-[24px] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
            
            {/* View Selector Tabs */}
            <div className="flex flex-wrap gap-1 bg-[#FAFAFA] border border-[#0F172A0F] p-1 rounded-2xl shrink-0">
              {([
                { id: 'dia', label: 'Visão Dia' },
                { id: 'semana', label: 'Semana' },
                { id: 'mes', label: 'Mensal' },
                { id: 'agenda', label: 'Lista' },
                { id: 'timeline', label: 'Timeline' },
                { id: 'tarefas', label: 'Google Tasks ⭐' }
              ] as const).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentCalendarView(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    currentCalendarView === tab.id 
                      ? 'bg-[#111111] text-white shadow-sm' 
                      : 'text-[#64748B] hover:text-[#111111]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Date Navigator Bar */}
            {currentCalendarView !== 'tarefas' && (
              <div className="flex items-center gap-3 bg-[#FAFAFA] border border-[#0F172A0F] rounded-2xl p-1 shrink-0">
                <button 
                  onClick={() => navigateDate('backward')}
                  className="p-2 hover:bg-white rounded-xl transition-all text-[#111111]"
                  title="Retroceder"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-bold text-[#111111] tracking-wider uppercase min-w-[120px] text-center font-mono">
                  {dateNavigationLabel}
                </span>
                <button 
                  onClick={() => navigateDate('forward')}
                  className="p-2 hover:bg-white rounded-xl transition-all text-[#111111]"
                  title="Avançar"
                >
                  <ChevronRight size={16} />
                </button>
                <button 
                  onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                  className="text-[10px] font-bold text-[#64748B] hover:text-[#111111] uppercase tracking-widest px-2.5 hover:underline"
                >
                  Hoje
                </button>
              </div>
            )}

            {/* Search & Custom Categories dropdown filter */}
            {currentCalendarView !== 'tarefas' && (
              <div className="flex items-center gap-3 flex-1 xl:max-w-[380px]">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#64748B]" />
                  <input 
                    type="text"
                    placeholder="Pesquisar pautas ou locais..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full text-xs bg-[#FAFAFA] border border-[#0F172A14] focus:bg-white focus:border-[#111111] pl-10 pr-4 py-2.5 rounded-2xl focus:outline-none placeholder-[#64748B]"
                  />
                </div>

                {/* Category Filter */}
                <div className="relative">
                  <button 
                    onClick={() => setShowFiltersDropdown(!showFiltersDropdown)}
                    className={`p-2.5 border rounded-2xl hover:bg-[#FAFAFA] text-[#64748B] hover:text-[#111111] transition-all flex items-center gap-2 ${
                      selectedCategoryFilter !== 'todos' ? 'border-[#111111] text-[#111111] bg-[#FAFAFA]' : 'border-[#0F172A14]'
                    }`}
                    title="Filtro de Setores"
                  >
                    <Filter size={15} />
                    {selectedCategoryFilter !== 'todos' && <span className="text-xs font-bold uppercase">{selectedCategoryFilter}</span>}
                  </button>

                  {/* Dropdown Card */}
                  {showFiltersDropdown && (
                    <div className="absolute right-0 mt-2 bg-white border border-[#0F172A0F] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] w-[180px] py-1.5 z-30">
                      <button 
                        onClick={() => { setSelectedCategoryFilter('todos'); setShowFiltersDropdown(false); }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-neutral-800 hover:bg-[#FAFAFA]"
                      >
                        📂 Todos Setores
                      </button>
                      {(['Projetos', 'Administrativo', 'Comercial', 'Financeiro', 'RH', 'Operacional', 'Marketing', 'Tecnologia'] as const).map(cat => (
                        <button 
                          key={cat}
                          onClick={() => { setSelectedCategoryFilter(cat); setShowFiltersDropdown(false); }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#111111] hover:bg-[#FAFAFA]"
                        >
                          · {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* 3. Main content Layout split */}
          <div className="flex flex-col xl:flex-row gap-6 md:gap-8 items-stretch">
            
            {/* Left Primary Calendar stage */}
            <div className={`flex-1 min-w-0 transition-all duration-300`}>
              
              {/* Day View */}
              {currentCalendarView === 'dia' && (
                <DayView 
                  selectedDate={selectedDate}
                  events={filteredEvents}
                  onEventClick={handleEventClick}
                  onQuickAdd={handleQuickAdd}
                />
              )}

              {/* Week View */}
              {currentCalendarView === 'semana' && (
                <WeekView 
                  selectedDate={selectedDate}
                  events={filteredEvents}
                  onEventClick={handleEventClick}
                  onQuickAdd={handleQuickAdd}
                  setSelectedDate={setSelectedDate}
                />
              )}

              {/* Month View */}
              {currentCalendarView === 'mes' && (
                <MonthView 
                  selectedDate={selectedDate}
                  events={filteredEvents}
                  onEventClick={handleEventClick}
                  onQuickAdd={handleQuickAdd}
                  setSelectedDate={setSelectedDate}
                />
              )}

              {/* List View */}
              {currentCalendarView === 'agenda' && (
                <AgendaListView 
                  events={filteredEvents}
                  onEventClick={handleEventClick}
                  selectedDate={selectedDate}
                />
              )}

              {/* Timeline View */}
              {currentCalendarView === 'timeline' && (
                <TimelineView 
                  events={filteredEvents}
                  onEventClick={handleEventClick}
                />
              )}

              {/* Google Tasks Integrated Dashboard */}
              {currentCalendarView === 'tarefas' && (
                <GoogleTasksView />
              )}

            </div>

            {/* Right stackable sidebars (only shown for dia view to prevent layout squeeze for 7 columns) */}
            {currentCalendarView === 'dia' && (
              <div className="w-full xl:w-[340px] shrink-0 flex flex-col gap-6 md:gap-8">
                
                {/* Daily progression summary info */}
                <DailyAgendaPanel 
                  events={activeEvents}
                  selectedDate={selectedDate}
                  onEventClick={handleEventClick}
                />

                {/* Chronologically upcoming events info */}
                <UpcomingEvents 
                  events={activeEvents}
                  onEventClick={handleEventClick}
                />

              </div>
            )}

          </div>
        </>
      )}

      {/* 4. Overlay Drawers and dialog Modals */}
      <EventDetailsDrawer 
        event={selectedEvent}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdateEvent={handleUpdateEvent}
        onDeleteEvent={handleDeleteEvent}
        onEditClick={(evt) => {
          setSelectedEvent(evt);
          setIsModalOpen(true);
        }}
      />

      <EventModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPrefilledDate(undefined);
          setPrefilledHour(undefined);
        }}
        onSave={handleSaveEvent}
        eventToEdit={selectedEvent}
        initialDate={prefilledDate}
        initialHour={prefilledHour}
      />

    </div>
  );
}
