import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from '../context/AuthContext.tsx';
import { useBranding } from '../hooks/useBranding.ts';
import { useNavigation } from '../context/NavigationContext.tsx';
import { useCompanies, useProjects, useProducts } from '../hooks/useCyzorQueries';
import { 
  LayoutDashboard, Building2, Users, Package, GitBranch, Lightbulb, FileText, 
  DollarSign, BotMessageSquare, Settings, Calendar, ShieldCheck, StickyNote, 
  Workflow, ChevronRight, ChevronDown, Plus, MoreHorizontal, Star, Clock, Folder,
  MoreVertical, Briefcase, Search, Shield, TrendingUp
} from 'lucide-react';
import { View } from '../types';

function useExpandedState(key: string, defaultValue: boolean = false) {
  const [expanded, setExpanded] = useState(() => {
    const saved = localStorage.getItem(`cyzor_sidebar_expanded_${key}`);
    if (saved !== null) return saved === 'true';
    return defaultValue;
  });

  const toggle = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setExpanded(prev => {
      const next = !prev;
      localStorage.setItem(`cyzor_sidebar_expanded_${key}`, String(next));
      return next;
    });
  };

  return [expanded, toggle, setExpanded] as const;
}

export default function Sidebar({ 
  isCollapsed, 
  toggleSidebar, 
  currentView, 
  setCurrentView 
}: { 
  isCollapsed: boolean, 
  toggleSidebar: () => void,
  currentView: View,
  setCurrentView: (view: View) => void
}) {
  const { activeWorkspace, dbUser } = useAuth();
  const { iconUrl, appName } = useBranding();
  const { badges, setGlobalFilters, globalFilters } = useNavigation();
  const currentPlan = dbUser?.currentPlan || 'free';

  // Queries
  const { data: companies = [] } = useCompanies();
  const { data: projects = [] } = useProjects();
  const { data: products = [] } = useProducts();

  const [companySearch, setCompanySearch] = useState('');

  const filteredCompanies = useMemo(() => {
    if (!companySearch) return companies;
    return companies.filter((c: any) => c.name.toLowerCase().includes(companySearch.toLowerCase()));
  }, [companies, companySearch]);

  const handleNavigate = (view: View, filters?: { 
    companyId?: string | number, 
    projectId?: string | number,
    productId?: string | number,
    clientId?: string | number,
    documentId?: string | number,
    ideaId?: string | number
  }) => {
    if (filters) {
      setGlobalFilters(filters);
    } else {
      // Preserve companyId if it exists but clear other sub-filters
      if (globalFilters.companyId) {
        setGlobalFilters({ companyId: globalFilters.companyId });
      } else {
        setGlobalFilters({});
      }
    }
    setCurrentView(view);
    if (!isCollapsed && window.innerWidth < 1024) toggleSidebar();
  };

  const NavItem = ({ 
    icon: Icon, 
    label, 
    active, 
    onClick, 
    onExpand, 
    expanded, 
    hasChildren, 
    badge,
    indent = 0
  }: any) => {
    return (
      <div className="flex flex-col px-3 relative">
        <div 
          onClick={(e) => {
            if (onClick) onClick(e);
            else if (hasChildren && onExpand) onExpand(e);
          }}
          className={`group flex items-center ${isCollapsed ? 'justify-center' : 'justify-between pr-3'} py-[11px] rounded-xl cursor-pointer transition-all duration-200 relative ${
            active 
              ? 'text-[#18181B]' 
              : 'text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#18181B]'
          }`}
          style={!isCollapsed ? { paddingLeft: `${indent > 0 ? 16 + indent * 16 : 12}px` } : {}}
        >
          <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-3.5 overflow-hidden flex-1'}`}>
            <Icon 
              size={isCollapsed ? 22 : 19} 
              strokeWidth={active ? 2.5 : 2} 
              className={`flex-shrink-0 transition-colors ${active ? 'text-[#18181B]' : 'text-[#A1A1AA] group-hover:text-[#18181B]'}`} 
            />
            {!isCollapsed && (
              <span className={`text-[13px] tracking-tight truncate ${active ? 'font-black' : 'font-semibold'}`}>{label}</span>
            )}
          </div>

          {!isCollapsed && active && (
            <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-[3px] h-4 bg-yellow-400 rounded-l-full shadow-[0_0_8px_rgba(250,204,21,0.4)]" />
          )}
          
          {isCollapsed && active && (
            <div className="absolute right-[-12px] top-1/2 -translate-y-1/2 w-[3px] h-4 bg-yellow-400 rounded-l-full" />
          )}

          {!isCollapsed && (
            <div className="flex items-center gap-1">
              {badge && (
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${active ? 'bg-blue-500 text-white' : 'bg-[#E4E4E7] text-[#52525B]'}`}>
                  {badge}
                </span>
              )}
              {hasChildren && (
                 <ChevronDown size={14} className={`transition-transform duration-200 ${expanded ? 'rotate-0' : '-rotate-90'} ${active ? 'text-[#18181B]' : 'text-[#A1A1AA]'}`} />
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const [empresasExpanded, toggleEmpresas] = useExpandedState('empresas', true);
  const [favoritosExpanded, toggleFavoritos] = useExpandedState('favoritos', true);
  const [recentesExpanded, toggleRecentes] = useExpandedState('recentes', true);
  
  return (
    <>
      {!isCollapsed && (
        <div className="fixed inset-0 bg-[#0F172A]/10 backdrop-blur-[2px] z-30 lg:hidden transition-all" onClick={toggleSidebar} />
      )}

      <nav id="sidebar-nav" className={`fixed left-0 top-0 h-screen flex flex-col py-6 border-r border-[#0F172A05] bg-white lg:rounded-r-[32px] shadow-xl shadow-black/[0.01] z-40 transition-all duration-300 ${isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-[84px] px-3' : 'translate-x-0 w-[290px] px-5'}`}>
        
        {/* Workspace Brand Header */}
        <div className={`flex items-center mb-8 px-2 cursor-pointer hover:bg-black/[0.02] rounded-2xl py-2.5 transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'gap-3.5'}`} onClick={() => handleNavigate('dashboard')}>
          <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 relative transition-all duration-300 ${!iconUrl ? 'bg-[#18181B] text-white rounded-xl font-black text-lg shadow-sm' : ''}`}>
            {iconUrl ? (
              <img src={iconUrl} alt="Logo" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
            ) : (
              <span>{appName.charAt(0)}</span>
            )}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[15px] font-black text-[#18181B] tracking-tight truncate">{appName}</span>
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest ${currentPlan === 'free' ? 'bg-amber-100 text-amber-800' : 'bg-[#F4F4F5] text-[#18181B]'}`}>
                  {currentPlan}
                </span>
              </div>
              <span className="text-[10px] text-[#71717A] font-bold uppercase tracking-[0.05em] truncate">{activeWorkspace?.name || 'Workspace'}</span>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="flex flex-col gap-2 w-full flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pb-20">
          
          {/* Dynamic Navigation for Expanded or Collapsed States */}
          {isCollapsed ? (
            <div className="flex flex-col gap-0.5">
              <NavItem 
                icon={LayoutDashboard} 
                label="Dashboard" 
                active={currentView === 'dashboard'} 
                onClick={() => handleNavigate('dashboard')} 
              />
              <NavItem 
                icon={TrendingUp} 
                label="Estratégia" 
                active={currentView === 'roadmap'} 
                onClick={() => handleNavigate('roadmap')} 
              />
              <NavItem 
                icon={Calendar} 
                label="Agenda" 
                active={currentView === 'agenda'} 
                onClick={() => handleNavigate('agenda')} 
              />
              <NavItem 
                icon={Building2} 
                label="Empresas" 
                active={currentView === 'empresas'} 
                onClick={() => {
                  setGlobalFilters({});
                  setCurrentView('empresas');
                }} 
              />
              <NavItem 
                icon={Users} 
                label="Clientes" 
                active={currentView === 'clientes'} 
                onClick={() => handleNavigate('clientes')} 
              />
              <NavItem 
                icon={Lightbulb} 
                label="Ideias" 
                active={currentView === 'ideias'} 
                onClick={() => handleNavigate('ideias')} 
              />
              <NavItem 
                icon={DollarSign} 
                label="Financeiro" 
                active={currentView === 'financeiro'} 
                onClick={() => handleNavigate('financeiro')} 
              />
              <NavItem 
                icon={Users} 
                label="Equipe" 
                active={currentView === 'equipe'} 
                onClick={() => handleNavigate('equipe')} 
              />
              <NavItem 
                icon={BotMessageSquare} 
                label="IA Intel" 
                active={currentView === 'ia'} 
                onClick={() => handleNavigate('ia')} 
                badge={badges?.ia > 0 ? badges.ia.toString() : null}
              />
              <NavItem 
                icon={Workflow} 
                label="Flow Builder" 
                active={currentView === 'flow-builder'} 
                onClick={() => handleNavigate('flow-builder')} 
              />
              <NavItem 
                icon={FileText} 
                label="Documentação" 
                active={currentView === 'documentacao'} 
                onClick={() => handleNavigate('documentacao')} 
              />
              <NavItem 
                icon={StickyNote} 
                label="Keep Notas" 
                active={currentView === 'keep'} 
                onClick={() => handleNavigate('keep')} 
              />
              <NavItem 
                icon={Settings} 
                label="Configurações" 
                active={currentView === 'configuracoes'} 
                onClick={() => handleNavigate('configuracoes')} 
              />
              {dbUser?.isPlatformAdmin && (
                 <NavItem icon={ShieldCheck} label="Admin" active={currentView === 'admin'} onClick={() => handleNavigate('admin')} />
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              
              {/* Section: Operacional */}
              <div className="flex flex-col gap-0.5">
                <div className="px-6 py-1">
                  <span className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-[0.2em]">Operacional</span>
                </div>
                <NavItem 
                  icon={LayoutDashboard} 
                  label="Dashboard" 
                  active={currentView === 'dashboard'} 
                  onClick={() => handleNavigate('dashboard')} 
                />
                <NavItem 
                  icon={TrendingUp} 
                  label="Estratégia" 
                  active={currentView === 'roadmap'} 
                  onClick={() => handleNavigate('roadmap')} 
                />
                <NavItem 
                  icon={Building2} 
                  label="Empresas" 
                  active={currentView === 'empresas'} 
                  onClick={() => {
                    setGlobalFilters({});
                    setCurrentView('empresas');
                  }} 
                />
                <NavItem 
                  icon={Calendar} 
                  label="Agenda" 
                  active={currentView === 'agenda'} 
                  onClick={() => handleNavigate('agenda')} 
                />
              </div>

              {/* Section: Relacionamento & Vendas */}
              <div className="flex flex-col gap-0.5">
                <div className="px-6 py-1">
                  <span className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-[0.2em]">Relacionamento</span>
                </div>
                <NavItem 
                  icon={Users} 
                  label="Clientes" 
                  active={currentView === 'clientes'} 
                  onClick={() => handleNavigate('clientes')} 
                />
                <NavItem 
                  icon={Lightbulb} 
                  label="Ideias & Negócios" 
                  active={currentView === 'ideias'} 
                  onClick={() => handleNavigate('ideias')} 
                />
              </div>

              {/* Section: Controladoria */}
              <div className="flex flex-col gap-0.5">
                <div className="px-6 py-1">
                  <span className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-[0.2em]">Controladoria</span>
                </div>
                <NavItem 
                  icon={DollarSign} 
                  label="Financeiro" 
                  active={currentView === 'financeiro'} 
                  onClick={() => handleNavigate('financeiro')} 
                />
                <NavItem 
                  icon={Users} 
                  label="Equipe" 
                  active={currentView === 'equipe'} 
                  onClick={() => handleNavigate('equipe')} 
                />
              </div>

              {/* Section: Tecnologia & Processos */}
              <div className="flex flex-col gap-0.5">
                <div className="px-6 py-1">
                  <span className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-[0.2em]">Tecnologia & IA</span>
                </div>
                <NavItem 
                  icon={BotMessageSquare} 
                  label="IA Intel" 
                  active={currentView === 'ia'} 
                  onClick={() => handleNavigate('ia')} 
                  badge={badges?.ia > 0 ? badges.ia.toString() : null}
                />
                <NavItem 
                  icon={Workflow} 
                  label="Flow Builder" 
                  active={currentView === 'flow-builder'} 
                  onClick={() => handleNavigate('flow-builder')} 
                />
                <NavItem 
                  icon={FileText} 
                  label="Documentação" 
                  active={currentView === 'documentacao'} 
                  onClick={() => handleNavigate('documentacao')} 
                />
                <NavItem 
                  icon={StickyNote} 
                  label="Keep Notas" 
                  active={currentView === 'keep'} 
                  onClick={() => handleNavigate('keep')} 
                />
              </div>

              {/* Section: Empresas Hierarchy */}
              <div className="flex flex-col gap-0.5">
                <div 
                  className="flex items-center justify-between px-6 py-1.5 cursor-pointer text-[#A1A1AA] hover:text-[#18181B] group transition-colors"
                  onClick={toggleEmpresas}
                >
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black uppercase tracking-[0.1em]">Minhas Empresas</span>
                     <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-[#F4F4F5] text-[#71717A]">{companies.length}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 hover:bg-black/5 rounded-md" onClick={(e) => { e.stopPropagation(); handleNavigate('empresas'); }}><Plus size={14} /></button>
                    {empresasExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </div>
                </div>
                
                <AnimatePresence>
                  {empresasExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex flex-col gap-0.5">
                      {/* Search bar inside group */}
                      <div className="px-5 py-2 mb-2">
                         <div className="relative flex items-center w-full">
                            <Search size={14} className="absolute left-3 text-[#A1A1AA]" />
                            <input 
                               type="text" 
                               placeholder="Pesquisar..."
                               value={companySearch}
                               onChange={(e) => setCompanySearch(e.target.value)}
                               className="w-full bg-[#F4F4F5] border-none text-[12px] rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-black/5 text-[#18181B] placeholder:text-[#A1A1AA] transition-all"
                            />
                         </div>
                      </div>

                      {filteredCompanies.length === 0 && (
                        <div className="text-[11px] text-[#94A3B8] px-10 py-2 font-medium">Nenhuma empresa encontrada.</div>
                      )}
                      {filteredCompanies.map((company: any) => (
                        <CompanyNode 
                          key={company.id} 
                          company={company} 
                          projects={projects.filter((p: any) => p.companyId === company.id)}
                          products={products.filter((p: any) => p.companyId === company.id)}
                          currentView={currentView}
                          globalFilters={globalFilters}
                          handleNavigate={handleNavigate}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Section: Configurações & Geral */}
              <div className="flex flex-col gap-0.5">
                <div className="px-6 py-1">
                  <span className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-[0.2em]">Preferências</span>
                </div>
                <NavItem 
                  icon={Settings} 
                  label="Configurações" 
                  active={currentView === 'configuracoes'} 
                  onClick={() => handleNavigate('configuracoes')} 
                />
                {dbUser?.isPlatformAdmin && (
                   <NavItem icon={ShieldCheck} label="Admin" active={currentView === 'admin'} onClick={() => handleNavigate('admin')} />
                )}
              </div>

            </div>
          )}
        </div>

        {/* Bottom Profile */}
        <div className={`mt-auto pt-6 border-t border-[#F4F4F5] ${isCollapsed ? 'px-0' : 'px-1'}`}>
          {!isCollapsed ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-2.5 rounded-2xl cursor-pointer hover:bg-[#F9FAFB] transition-all group" onClick={() => handleNavigate('configuracoes')}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#F4F4F5] border border-[#E5E7EB] flex items-center justify-center text-[13px] font-black text-[#18181B] flex-shrink-0 overflow-hidden">
                    {dbUser?.name ? dbUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[13px] font-black text-[#18181B] truncate">{dbUser?.name || 'Operador'}</span>
                    <span className="text-[10px] text-[#A1A1AA] font-bold tracking-tight truncate">{dbUser?.email}</span>
                  </div>
                </div>
              </div>
              <div className="px-3 pb-2">
                 <button className="w-full flex items-center gap-3.5 py-3 px-3.5 rounded-xl text-[#71717A] hover:bg-red-50 hover:text-red-600 transition-all font-bold text-[13px]">
                   <Settings size={19} className="rotate-90" />
                   <span>Log Out</span>
                 </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 py-4">
              <div className="w-11 h-11 rounded-full bg-[#F4F4F5] border border-[#E5E7EB] flex items-center justify-center text-sm font-black text-[#18181B] cursor-pointer hover:bg-white transition-all shadow-sm">
                {dbUser?.name ? dbUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <button className="text-[#A1A1AA] hover:text-red-600 transition-colors">
                <Settings size={22} className="rotate-90" />
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}

// Subcomponents for recursion
function CompanyNode({ company, projects, products, currentView, globalFilters, handleNavigate }: any) {
  const [expanded, toggle, setExpanded] = useExpandedState(`company_${company.id}`, false);
  const isActive = currentView === 'empresas' && globalFilters.companyId === company.id;

  return (
    <div className="flex flex-col px-3">
      <div
        className={`group flex items-center justify-between py-[11px] pr-3 pl-3 rounded-xl cursor-pointer transition-all duration-200 relative ${isActive ? 'text-[#18181B]' : 'text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#18181B]'}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3.5 overflow-hidden flex-1">
          <Building2 size={19} className={`flex-shrink-0 ${isActive ? 'text-[#18181B]' : 'text-[#A1A1AA]'}`} />
          <span className={`text-[13px] tracking-tight truncate ${isActive ? 'font-black' : 'font-semibold'}`} onClick={(e) => { e.stopPropagation(); handleNavigate('empresas', { companyId: company.id }); }}>{company.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
           {isActive && (
              <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-[3px] h-4 bg-yellow-400 rounded-l-full shadow-[0_0_8px_rgba(250,204,21,0.4)]" />
           )}
           <ChevronDown size={14} className={`transition-transform duration-200 ${expanded ? 'rotate-0' : '-rotate-90'} ${isActive ? 'text-[#18181B]' : 'text-[#A1A1AA]'}`} />
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            className="flex flex-col gap-0.5 mt-0.5 mb-2 relative before:absolute before:left-[22px] before:top-0 before:bottom-3 before:w-[1.5px] before:bg-[#E4E4E7] before:z-10"
          >
            <SubNode icon={GitBranch} label="Projetos" count={projects.length} onClick={() => handleNavigate('projetos', { companyId: company.id })} active={currentView === 'projetos' && globalFilters.companyId === company.id} items={projects} itemType="projetos" handleNavigate={handleNavigate} companyId={company.id} />
            <SubNode icon={Package} label="Produtos" count={products.length} onClick={() => handleNavigate('produtos', { companyId: company.id })} active={currentView === 'produtos' && globalFilters.companyId === company.id} items={products} itemType="produtos" handleNavigate={handleNavigate} companyId={company.id} />
            <LeafNode icon={Users} label="Clientes" onClick={() => handleNavigate('clientes', { companyId: company.id })} active={currentView === 'clientes' && globalFilters.companyId === company.id} />
            <LeafNode icon={DollarSign} label="Financeiro" onClick={() => handleNavigate('financeiro', { companyId: company.id })} active={currentView === 'financeiro' && globalFilters.companyId === company.id} />
            <LeafNode icon={FileText} label="Documentos" onClick={() => handleNavigate('documentacao', { companyId: company.id })} active={currentView === 'documentacao' && globalFilters.companyId === company.id} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SubNode({ icon: Icon, label, count, onClick, active, items, itemType, handleNavigate, companyId }: any) {
  const [expanded, toggle, setExpanded] = useExpandedState(`sub_${label}_${companyId}`, false);

  return (
    <div className="flex flex-col relative">
      <div 
        className={`group flex items-center justify-between py-2 pr-3 pl-[35px] rounded-xl cursor-pointer transition-all duration-200 relative z-0 ${active ? 'text-[#18181B] bg-[#F9FAFB]' : 'text-[#71717A] hover:bg-[#F4F4F5]'}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="absolute left-[22px] top-1/2 -translate-y-1/2 w-[13px] h-[1.5px] bg-[#E4E4E7] z-10" />
        <div className="flex items-center gap-3 overflow-hidden flex-1 relative z-20">
          <Icon size={17} className={`flex-shrink-0 ${active ? 'text-[#18181B]' : 'text-[#A1A1AA]'}`} />
          <span className={`text-[13px] tracking-tight truncate ${active ? 'font-black' : 'font-semibold'}`} onClick={(e) => { e.stopPropagation(); onClick(e); }}>{label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {count > 0 && !active && (
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-[#E4E4E7] text-[#52525B]">
              {count}
            </span>
          )}
          <ChevronDown size={14} className={`transition-transform duration-200 ${expanded ? 'rotate-0' : '-rotate-90'} ${active ? 'text-[#18181B]' : 'text-[#A1A1AA]'}`} />
        </div>
      </div>
      
      <AnimatePresence>
        {expanded && items.length > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            className="flex flex-col gap-0.5 pb-1 relative before:absolute before:left-[51px] before:top-0 before:bottom-3 before:w-[1.5px] before:bg-[#E4E4E7] before:z-10"
          >
            {items.map((item: any) => {
              const itemFilters: any = { companyId };
              if (itemType === 'projetos') itemFilters.projectId = item.id;
              else if (itemType === 'produtos') itemFilters.productId = item.id;

              return (
                <LeafNode 
                  key={item.id} 
                  icon={Folder} 
                  label={item.name} 
                  indent={1} 
                  onClick={() => handleNavigate(itemType, itemFilters)} 
                  active={false}
                  parentIsSubNode={true}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LeafNode({ icon: Icon, label, indent = 0, onClick, active, parentIsSubNode = false }: any) {
  return (
    <div 
      className={`group flex items-center justify-between py-2 pr-3 rounded-xl cursor-pointer transition-all duration-200 relative z-0 ${active ? 'text-[#18181B] font-bold bg-[#F9FAFB]' : 'text-[#71717A] hover:bg-[#F4F4F5]'}`}
      style={{ paddingLeft: `${parentIsSubNode ? 64 : 35}px` }}
      onClick={onClick}
    >
      <div className="absolute left-[22px] top-1/2 -translate-y-1/2 w-[13px] h-[1.5px] bg-[#E4E4E7] z-10" style={parentIsSubNode ? { left: '51px' } : {}} />
      <div className="flex items-center gap-3 overflow-hidden flex-1 relative z-20">
        <Icon size={15} className={`flex-shrink-0 ${active ? 'text-[#18181B]' : 'text-[#A1A1AA]'}`} />
        <span className={`text-[12.5px] tracking-tight truncate ${active ? 'font-black' : 'font-semibold'}`}>{label}</span>
      </div>
    </div>
  );
}

