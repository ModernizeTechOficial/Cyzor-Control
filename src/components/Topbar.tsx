import { Search, Bell, PanelLeftClose, PanelLeft, Sun, Moon, LogOut, User, CheckCircle2, AlertTriangle, Info, Clock, ShieldCheck, HelpCircle, ChevronDown, Plus, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useBranding } from '../hooks/useBranding.ts';
import { View } from '../types.ts';

function NotificationMenu() {
  const { fetchWithAuth, activeWorkspace } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async (retries = 3) => {
    if (!activeWorkspace || !activeWorkspace.id) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetchWithAuth('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setLoading(false);
      } else if (retries > 0) {
        console.warn(`Failed to fetch notifications, retrying in 2s... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        await fetchNotifications(retries - 1);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await fetchNotifications(retries - 1);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchNotifications();

    // Background polling every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications(0);
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchWithAuth, activeWorkspace]);

  const handleToggleNotifications = () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    if (nextState) {
      setLoading(true);
      fetchNotifications(0);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    try {
      await fetchWithAuth('/api/notifications/read-all', {
        method: 'PUT'
      });
    } catch (err) {}
  };
  
  const markAsRead = async (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await fetchWithAuth(`/api/notifications/${id}/read`, {
        method: 'PUT'
      });
    } catch (err) {}
  };

  const getIconColor = (type: string) => {
    switch(type) {
      case 'success': return 'text-green-500 bg-green-50 border-green-100';
      case 'warning': return 'text-amber-500 bg-amber-50 border-amber-100';
      case 'error': return 'text-red-500 bg-red-50 border-red-100';
      default: return 'text-blue-500 bg-blue-50 border-blue-100';
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'success': return CheckCircle2;
      case 'warning': return AlertTriangle;
      case 'error': return AlertTriangle;
      default: return Info;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `Há ${diffMins} min`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `Há ${diffHrs} h`;
    return `Há ${Math.floor(diffHrs / 24)} d`;
  };

  return (
    <div className="relative" id="notifications-btn">
      <button 
        onClick={handleToggleNotifications}
        className="relative w-10 h-10 rounded-[14px] bg-[#FFFFFF] border border-[#0F172A0F] flex items-center justify-center hover:bg-[#FAFAFA] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)] text-[#111111]"
      >
        <Bell size={18} className={unreadCount > 0 ? "text-[#111111]" : "text-[#64748B]"} />
        {unreadCount > 0 && (
          <div className="absolute top-2 right-2 flex min-w-[14px] h-[14px] items-center justify-center rounded-full bg-[#111111] border-2 border-[#FFFFFF] px-[3px] text-[8px] font-bold text-white">
            {unreadCount}
          </div>
        )}
      </button>

      {showNotifications && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
          <div className="absolute right-0 mt-2.5 w-[320px] sm:w-[380px] bg-white border border-[#0F172A0F] rounded-[24px] p-4 shadow-[0_10px_40px_rgba(0,0,0,0.08)] z-50 flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#0F172A0F] mb-2">
              <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
                Notificações
                {unreadCount > 0 && (
                  <span className="bg-[#111111] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {unreadCount} novas
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-[10px] font-bold text-[#64748B] hover:text-[#111111] transition-colors"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>

            <div className="flex flex-col max-h-[400px] overflow-y-auto pr-1 -mr-1 custom-scrollbar gap-1">
              {loading ? (
                 <div className="py-8 flex text-[#64748B] justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#111111]"></div>
                 </div>
              ) : notifications.length > 0 ? (
                notifications.map(notification => {
                  const Icon = getIcon(notification.type);
                  return (
                    <div 
                      key={notification.id} 
                      className={`p-3 rounded-[16px] transition-all cursor-pointer border ${notification.isRead ? 'bg-transparent border-transparent hover:bg-[#FAFAFA]' : 'bg-[#FAFAFA] border-[#0F172A0F]'}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        <div className={`mt-0.5 shrink-0 flex items-center justify-center w-8 h-8 rounded-full border ${getIconColor(notification.type)}`}>
                          <Icon size={14} />
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className={`text-xs font-bold ${notification.isRead ? 'text-[#111111]/80' : 'text-[#111111]'}`}>
                              {notification.title}
                            </h4>
                            <span className="text-[10px] text-[#64748B] flex items-center gap-1 shrink-0 whitespace-nowrap">
                              <Clock size={10} /> {formatTime(notification.createdAt)}
                            </span>
                          </div>
                          <p className={`text-[11px] leading-relaxed ${notification.isRead ? 'text-[#64748B]/80' : 'text-[#64748B]'}`}>
                            {notification.description}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="shrink-0 w-2 h-2 rounded-full bg-[#111111] self-center" />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 flex flex-col items-center justify-center text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-[#FAFAFA] border border-[#0F172A0F] flex items-center justify-center text-[#64748B]">
                    <Bell size={20} />
                  </div>
                  <p className="text-xs text-[#64748B]">Nenhuma notificação no momento</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function UserProfileMenu({ setCurrentView }: { setCurrentView?: (view: View) => void }) {
  const { user, dbUser, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  if (!user) return null;

  return (
    <div className="relative" id="user-profile-btn">
      <button 
        onClick={() => setShowMenu(!showMenu)}
        className="w-10 h-10 rounded-[14px] bg-[#FFFFFF] border border-[#0F172A0F] overflow-hidden flex items-center justify-center hover:bg-[#FAFAFA] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <div className="bg-[#111111] text-white font-bold w-full h-full flex items-center justify-center text-sm uppercase">
            {user.email ? user.email.charAt(0) : 'U'}
          </div>
        )}
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 mt-2.5 w-60 bg-white border border-[#0F172A0F] rounded-[20px] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] z-50 flex flex-col gap-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1 px-1.5 pt-1 border-b border-[#0F172A0F] pb-3">
              <span className="text-xs font-bold text-[#111111] truncate">{user.displayName || 'Membro Cyzor'}</span>
              <span className="text-[10px] text-[#64748B] font-medium truncate">{user.email}</span>
            </div>
            
            {dbUser?.isPlatformAdmin && setCurrentView && (
              <button 
                onClick={() => {
                  setShowMenu(false);
                  setCurrentView('admin');
                }}
                className="w-full flex items-center gap-2.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-2.5 rounded-xl transition-all border border-transparent hover:border-indigo-100"
              >
                <ShieldCheck size={16} /> Painel Admin
              </button>
            )}
            
            <button 
              onClick={() => {
                setShowMenu(false);
                logout();
              }}
              className="w-full flex items-center gap-2.5 text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 p-2.5 rounded-xl transition-all border border-transparent hover:border-red-100"
            >
              <LogOut size={16} /> Terminar Sessão
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function WorkspaceSelector() {
  const { workspaces, activeWorkspace, updateSaaSBackend, setIsCreateWorkspaceModalOpen } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  if (workspaces.length <= 1 && !activeWorkspace) return null;

  return (
    <div className="relative">
      <button 
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#FAFAFA] border border-[#0F172A05] hover:border-[#0F172A15] transition-all group"
      >
        <div className="w-5 h-5 rounded-md bg-[#111111] flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
          {activeWorkspace?.name?.charAt(0) || 'W'}
        </div>
        <span className="text-xs font-bold text-[#111111] max-w-[120px] truncate">
          {activeWorkspace?.name || 'Workspace Principal'}
        </span>
        <ChevronDown size={14} className={`text-[#64748B] transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`} />
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute left-0 mt-2 w-64 bg-white border border-[#0F172A0F] rounded-[20px] p-2 shadow-[0_10px_30px_rgba(0,0,0,0.08)] z-50 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-3 py-2 border-b border-[#0F172A05] mb-1 flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Meus Workspaces</span>
              <button 
                onClick={() => {
                  setIsCreateWorkspaceModalOpen(true);
                  setShowMenu(false);
                }}
                className="p-1 hover:bg-[#FAFAFA] rounded-lg text-[#111111] transition-colors"
                title="Novo Workspace"
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar flex flex-col gap-1 pr-1">
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => {
                    updateSaaSBackend(undefined, workspace.id);
                    setShowMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${
                    activeWorkspace?.id === workspace.id 
                      ? 'bg-[#111111]/5 text-[#111111] font-bold' 
                      : 'text-[#64748B] hover:bg-[#FAFAFA] hover:text-[#111111]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm ${
                    activeWorkspace?.id === workspace.id ? 'bg-[#111111] text-white' : 'bg-[#F1F5F9] text-[#64748B]'
                  }`}>
                    {workspace.name.charAt(0)}
                  </div>
                  <div className="flex flex-col items-start overflow-hidden">
                    <span className="text-xs truncate w-full text-left">{workspace.name}</span>
                    <span className="text-[9px] font-medium opacity-60 uppercase tracking-tighter">
                      {workspace.ownerId === activeWorkspace?.ownerId ? 'Proprietário' : 'Membro'}
                    </span>
                  </div>
                  {activeWorkspace?.id === workspace.id && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#111111]" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="mt-1 pt-1 border-t border-[#0F172A05]">
              <button
                onClick={() => {
                  setIsCreateWorkspaceModalOpen(true);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 p-2 rounded-xl text-[#111111] font-bold hover:bg-[#FAFAFA] transition-all text-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-[#FAFAFA] border border-dashed border-[#0F172A20] flex items-center justify-center text-[#64748B]">
                  <Plus size={16} />
                </div>
                Criar novo Workspace
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function Topbar({ isSidebarCollapsed, toggleSidebar, setCurrentView }: { isSidebarCollapsed: boolean, toggleSidebar: () => void, setCurrentView?: (view: View) => void }) {
  const [isDark, setIsDark] = useState(false);
  const [time, setTime] = useState(new Date());
  const { activeWorkspace } = useAuth();
  const { appName } = useBranding();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const isDarkStored = localStorage.getItem('theme') === 'dark';
    setIsDark(isDarkStored);
    if (isDarkStored) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    
    if (newDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className={`fixed top-0 right-0 h-16 lg:h-20 bg-white/80 backdrop-blur-2xl border-b border-[#0F172A08] flex items-center justify-between px-4 sm:px-6 md:px-10 z-20 transition-all duration-300 left-0 ${isSidebarCollapsed ? 'lg:left-[88px]' : 'lg:left-[280px]'}`}>
      <div className="flex items-center gap-4 lg:gap-8 w-full max-w-4xl">
        <button onClick={toggleSidebar} className="text-[#64748B] hover:text-[#111111] transition-all flex items-center justify-center w-10 h-10 rounded-2xl hover:bg-white border border-transparent hover:border-[#0F172A0F] flex-shrink-0 group">
          {isSidebarCollapsed ? <PanelLeft size={18} className="group-hover:scale-110 transition-transform" /> : <PanelLeftClose size={18} className="group-hover:scale-110 transition-transform" />}
        </button>
        
        <div className="hidden lg:flex items-center gap-8 h-8 px-2">
           <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-black text-[#64748B] uppercase tracking-[0.2em] opacity-40">Software</span>
              <span className="text-[12px] font-bold text-[#111111] tracking-tight">{appName}</span>
           </div>
           <div className="w-px h-6 bg-[#0F172A08]" />
           <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-black text-[#64748B] uppercase tracking-[0.2em] opacity-40">Ambiente</span>
              <div className="flex items-center gap-3">
                 <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} />
                 <WorkspaceSelector />
              </div>
           </div>
        </div>

        <div className="relative w-full hidden md:block max-w-md ml-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] opacity-50" size={16} />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="w-full bg-[#FAFAFA] border border-[#0F172A05] hover:border-[#0F172A15] rounded-2xl py-2.5 pl-11 pr-14 text-[13px] outline-none focus:border-[#111111]/10 focus:bg-white transition-all text-[#111111] font-bold placeholder:text-[#64748B]/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-1 rounded-lg bg-white border border-[#0F172A08] shadow-sm hidden lg:flex">
            <span className="text-[10px] font-black text-[#111111] opacity-20">⌘</span>
            <span className="text-[10px] font-black text-[#111111] opacity-20">K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-8">
        <div className="hidden xl:flex items-center gap-6 pr-6 border-r border-[#0F172A08]">
           <div className="flex flex-col items-end gap-0.5">
              <span className="text-[13px] font-bold text-[#111111] tracking-tighter">
                 {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="text-[9px] font-black text-[#64748B] uppercase tracking-[0.2em] opacity-40">
                 {time.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase()}
              </span>
           </div>
           <div className="flex flex-col items-end gap-0.5">
              <span className="text-[10px] font-bold text-[#111111] flex items-center gap-1.5 tracking-tight">
                 <CheckCircle2 size={12} className="text-emerald-500" />
                 Synced
              </span>
              <span className="text-[9px] font-black text-[#64748B] uppercase tracking-[0.2em] opacity-40">Just now</span>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <button 
             onClick={toggleTheme}
             className="w-10 h-10 rounded-2xl bg-white border border-[#0F172A08] flex items-center justify-center hover:bg-[#FAFAFA] hover:border-[#0F172A15] transition-all shadow-sm text-[#111111] group"
           >
             {isDark ? <Sun size={18} className="text-[#64748B] group-hover:text-[#111111] transition-colors" /> : <Moon size={18} className="text-[#64748B] group-hover:text-[#111111] transition-colors" />}
           </button>
           <button 
             id="help-center-btn"
             onClick={() => window.dispatchEvent(new Event('restart-tour'))}
             className="w-10 h-10 rounded-2xl bg-white border border-[#0F172A08] flex items-center justify-center hover:bg-[#FAFAFA] hover:border-[#0F172A15] transition-all shadow-sm text-[#64748B] hover:text-[#111111] group"
             title="Fazer Tour"
           >
             <HelpCircle size={18} />
           </button>
           <NotificationMenu />
           <UserProfileMenu setCurrentView={setCurrentView} />
        </div>
      </div>
    </div>
  );
}
