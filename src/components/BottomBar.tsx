import { useState } from 'react';
import { 
  LayoutDashboard, GitBranch, DollarSign, BotMessageSquare, 
  Menu, X, Building2, Users, Package, Lightbulb, FileText, 
  Calendar, StickyNote, Settings, TrendingUp, Star 
} from 'lucide-react';
import { View } from '../types';

export default function BottomBar({ 
  currentView, 
  setCurrentView 
}: { 
  currentView: View, 
  setCurrentView: (view: View) => void 
}) {
  const [showMenu, setShowMenu] = useState(false);

  // Main primary tabs on the bottom bar itself
  const mainTabs = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'projetos', label: 'Projetos', icon: GitBranch },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'ia', label: 'IA Copilot', icon: BotMessageSquare },
  ] as const;

  // The rest of the tabs grouped in "Mais"
  const moreTabs = [
    { id: 'roadmap', label: 'Planejamento', icon: TrendingUp },
    { id: 'empresas', label: 'Empresas', icon: Building2 },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'produtos', label: 'Produtos', icon: Package },
    { id: 'ideias', label: 'Ideias', icon: Lightbulb },
    { id: 'documentacao', label: 'Documentação', icon: FileText },
    { id: 'agenda', label: 'Agenda Google', icon: Calendar },
    { id: 'career-hub', label: 'Carreira', icon: Star },
    { id: 'keep', label: 'Google Keep', icon: StickyNote },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ] as const;

  const handleTabClick = (viewId: View) => {
    setCurrentView(viewId);
    setShowMenu(false);
  };

  const isMainTabActive = mainTabs.some(t => t.id === currentView);

  return (
    <>
      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#FFFFFF]/90 backdrop-blur-md border-t border-[#0F172A0F] z-40 flex justify-around items-center px-2 lg:hidden shadow-[0_-8px_30px_rgba(0,0,0,0.03)] pb-safe">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className="flex flex-col items-center justify-center flex-1 py-1 px-2 transition-all cursor-pointer"
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-[#111111] text-white' : 'text-[#64748B]'}`}>
                <Icon size={20} />
              </div>
              <span className={`text-[9px] mt-1 font-bold ${isActive ? 'text-[#111111]' : 'text-[#64748B]'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* More Tab */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex flex-col items-center justify-center flex-1 py-1 px-2 transition-all cursor-pointer"
        >
          <div className={`p-1.5 rounded-xl transition-all ${!isMainTabActive || showMenu ? 'bg-[#111111] text-white' : 'text-[#64748B]'}`}>
            {showMenu ? <X size={20} /> : <Menu size={20} />}
          </div>
          <span className={`text-[9px] mt-1 font-bold ${!isMainTabActive || showMenu ? 'text-[#111111]' : 'text-[#64748B]'}`}>
            Mais
          </span>
        </button>
      </div>

      {/* Slide-up Bottom Drawer Menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div 
            onClick={() => setShowMenu(false)}
            className="fixed inset-0 bg-[#111111]/30 backdrop-blur-xs z-30 lg:hidden block animate-in fade-in duration-200"
          />

          {/* Bottom Sheet Card */}
          <div className="fixed bottom-16 left-0 right-0 bg-[#FFFFFF] border-t border-[#0F172A0F] rounded-t-[24px] z-30 px-6 pt-5 pb-8 lg:hidden animate-in slide-in-from-bottom duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] text-left">
            {/* Header / Drag handle accent */}
            <div className="flex flex-col items-center mb-5">
              <div className="w-12 h-1 bg-gray-200 rounded-full mb-4"></div>
              <div className="w-full flex justify-between items-center">
                <span className="text-xs font-bold text-[#64748B] uppercase tracking-widest">Navegação Completa</span>
                <button 
                  onClick={() => setShowMenu(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Grid layout of options */}
            <div className="grid grid-cols-3 gap-y-6 gap-x-4">
              {moreTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentView === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id as View)}
                    className="flex flex-col items-center text-center p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2 border transition-all ${isActive ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-[#64748B] border-[#0F172A0F] group-hover:border-[#111111]/20'}`}>
                      <Icon size={18} />
                    </div>
                    <span className={`text-[10px] font-bold leading-tight ${isActive ? 'text-[#111111]' : 'text-[#64748B]'}`}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
