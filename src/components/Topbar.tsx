import { Search, Bell, PanelLeftClose, PanelLeft, Sun, Moon, LogOut, User, CheckCircle2, AlertTriangle, Info, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';

function NotificationMenu() {
  const { token, activeWorkspace } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!activeWorkspace) return;
      try {
        const res = await fetch('/api/notifications', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [token, activeWorkspace]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {}
  };
  
  const markAsRead = async (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
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
    <div className="relative">
      <button 
        onClick={() => setShowNotifications(!showNotifications)}
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

function UserProfileMenu() {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
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

export default function Topbar({ isSidebarCollapsed, toggleSidebar }: { isSidebarCollapsed: boolean, toggleSidebar: () => void }) {
  const [isDark, setIsDark] = useState(false);

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
    <div className={`fixed top-0 right-0 h-16 lg:h-20 bg-[#FAFAFA]/80 backdrop-blur-md border-b border-[#0F172A0F] flex items-center justify-between px-4 sm:px-6 md:px-8 z-20 transition-all duration-300 left-0 ${isSidebarCollapsed ? 'lg:left-[88px]' : 'lg:left-[280px]'}`}>
      <div className="flex items-center gap-2 lg:gap-4 w-full max-w-xl">
        <button onClick={toggleSidebar} className="text-[#64748B] hover:text-[#111111] transition-colors flex items-center justify-center w-10 h-10 rounded-[14px] hover:bg-[#FFFFFF] border border-transparent hover:border-[#0F172A0F] flex-shrink-0">
          {isSidebarCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
        </button>
        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
          <input 
            type="text" 
            placeholder="Busca universal..." 
            className="w-full bg-[#FFFFFF] border border-[#0F172A0F] shadow-[0_2px_8px_rgba(0,0,0,0.02)] rounded-[20px] py-2.5 pl-11 pr-14 text-sm outline-none focus:border-[#111111]/20 transition-all text-[#111111] font-medium placeholder:text-[#64748B]/60"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-[#FAFAFA] border border-[#0F172A0F] text-[10px] text-[#64748B] font-medium tracking-widest uppercase hidden lg:block">
            ⌘ K
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 lg:gap-4">
        <button 
          onClick={toggleTheme}
          className="relative w-10 h-10 rounded-[14px] bg-[#FFFFFF] border border-[#0F172A0F] flex items-center justify-center hover:bg-[#FAFAFA] transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.02)] text-[#111111] group"
        >
          {isDark ? <Sun size={18} className="text-[#64748B] group-hover:text-[#111111] transition-colors" /> : <Moon size={18} className="text-[#64748B] group-hover:text-[#111111] transition-colors" />}
        </button>
        <NotificationMenu />
        <UserProfileMenu />
      </div>
    </div>
  );
}
