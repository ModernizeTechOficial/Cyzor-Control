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
    indent = 0,
    onAdd
  }: any) => {
    return (
      <div className="flex flex-col">
        <div 
          onClick={(e) => {
            if (onClick) onClick(e);
            else if (hasChildren && onExpand) onExpand(e);

          }}
  
          className={`group flex items-center justify-between py-1.5 pr-2 rounded-lg cursor-pointer transition-all ${
            active ? 'bg-[#111111]/5 text-[#111111] font-bold' : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#111111]'
          }`}
          style={{ paddingLeft: `${8 + indent * 12}px` }}
        >
          <div className="flex items-center gap-2 overflow-hidden flex-1">
            {hasChildren ? (
              <button onClick={onExpand} className="p-0.5 rounded hover:bg-black/5 text-[#94A3B8] group-hover:text-black">
                {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            ) : (
              <div className="w-[18px]" />
            )}
            <Icon size={15} strokeWidth={active ? 2.5 : 2} className={`flex-shrink-0 ${active ? 'text-[#111111]' : 'text-[#94A3B8] group-hover:text-[#111111]'}`} />
            <span className={`text-[13px] truncate ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {badge && !active && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-600">
                {badge}
              </span>
            )}
            {onAdd && (
              <button 
                onClick={(e) => { e.stopPropagation(); onAdd(e); }}
                className="p-1 rounded text-[#94A3B8] hover:bg-black/5 hover:text-black"
              >
                <Plus size={14} />
              </button>
            )}
            <button className="p-1 rounded text-[#94A3B8] hover:bg-black/5 hover:text-black">
              <MoreHorizontal size={14} />
            </button>
          </div>
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

      <nav className={`fixed left-0 top-0 h-screen flex flex-col py-4 border-r border-[#0F172A05] bg-[#FAFAFB] lg:rounded-r-[24px] shadow-[1px_0_10px_rgba(0,0,0,0.01)] z-40 transition-all duration-300 ${isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-[80px] px-2' : 'translate-x-0 w-[280px] px-3'}`}>
        
        {/* Workspace Brand Header */}
        <div className={`flex items-center mb-6 px-3 cursor-pointer hover:bg-black/5 rounded-lg py-2 -mt-2 -mx-2 mx-1 ${isCollapsed ? 'lg:justify-center' : 'gap-3'}`} onClick={() => handleNavigate('dashboard')}>
          <div className="w-[36px] h-[36px] flex items-center justify-center flex-shrink-0 relative bg-[#111111] rounded-lg text-white font-bold text-sm shadow-sm">
            {iconUrl ? (
              <img src={iconUrl} alt="Logo" className="w-full h-full object-contain rounded-lg" referrerPolicy="no-referrer" />
            ) : appName.charAt(0)}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-[#111111] truncate">{appName}</span>
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${currentPlan === 'free' ? 'bg-amber-100 text-amber-800' : 'bg-neutral-100 text-neutral-800'}`}>
                  {currentPlan}
                </span>
              </div>
              <span className="text-[11px] text-[#64748B] font-medium truncate">{activeWorkspace?.name || 'Workspace'}</span>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="flex flex-col gap-4 w-full flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pb-20">
          
          {/* Main Top Actions */}
          <div className="flex flex-col gap-0.5">
            <NavItem 
              icon={LayoutDashboard} 
              label="Dashboard" 
              active={currentView === 'dashboard'} 
              onClick={() => handleNavigate('dashboard')} 
            />
            <NavItem 
              icon={TrendingUp} 
              label="Planejamento Estratégico" 
              active={currentView === 'roadmap'} 
              onClick={() => handleNavigate('roadmap')} 
            />
            <NavItem 
              icon={BotMessageSquare} 
              label="IA Intelligence" 
              active={currentView === 'ia'} 
              onClick={() => handleNavigate('ia')} 
              badge={badges?.ia > 0 ? badges.ia.toString() : null}
            />
          </div>

          {/* Favoritos */}
          <div className="flex flex-col gap-0.5">
            {!isCollapsed && (
              <div 
                className="flex items-center justify-between px-2 py-1 cursor-pointer text-[#94A3B8] hover:text-[#111111] group"
                onClick={toggleFavoritos}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest">Favoritos</span>
                {favoritosExpanded ? <ChevronDown size={12} className="opacity-0 group-hover:opacity-100" /> : <ChevronRight size={12} className="opacity-0 group-hover:opacity-100" />}
              </div>
            )}
            <AnimatePresence>
              {favoritosExpanded && !isCollapsed && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex flex-col gap-0.5">
                  <NavItem icon={Star} label="Visão Geral ERP" indent={1} onClick={() => handleNavigate('projetos')} />
                  <NavItem icon={Star} label="Cliente Toyota" indent={1} onClick={() => handleNavigate('clientes')} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Recentes */}
          <div className="flex flex-col gap-0.5">
            {!isCollapsed && (
              <div 
                className="flex items-center justify-between px-2 py-1 cursor-pointer text-[#94A3B8] hover:text-[#111111] group"
                onClick={toggleRecentes}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest">Recentes</span>
                {recentesExpanded ? <ChevronDown size={12} className="opacity-0 group-hover:opacity-100" /> : <ChevronRight size={12} className="opacity-0 group-hover:opacity-100" />}
              </div>
            )}
            <AnimatePresence>
              {recentesExpanded && !isCollapsed && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex flex-col gap-0.5">
                  <NavItem icon={Clock} label="Marketplace" indent={1} onClick={() => handleNavigate('projetos')} />
                  <NavItem icon={Clock} label="Documento SLA" indent={1} onClick={() => handleNavigate('documentacao')} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hierarchy: Empresas -> Projetos, Produtos, etc */}
          <div className="flex flex-col gap-0.5">
            {!isCollapsed && (
              <div 
                className="flex items-center justify-between px-2 py-1 cursor-pointer text-[#94A3B8] hover:text-[#111111] group"
                onClick={toggleEmpresas}
              >
                <div className="flex items-center gap-1.5">
                   <span className="text-[10px] font-bold uppercase tracking-widest">Empresas</span>
                   <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#0F172A05] text-[#64748B]">{companies.length}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                  <button className="p-1 hover:bg-black/5 rounded" onClick={(e) => { e.stopPropagation(); handleNavigate('empresas'); }}><Plus size={12} /></button>
                  {empresasExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </div>
              </div>
            )}
            
            <AnimatePresence>
              {empresasExpanded && !isCollapsed && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex flex-col gap-0.5">
                  
                  {/* Search bar inside group */}
                  <div className="px-3 py-1.5 mb-1">
                     <div className="relative flex items-center w-full">
                        <Search size={12} className="absolute left-2.5 text-[#94A3B8]" />
                        <input 
                           type="text" 
                           placeholder="Pesquisar empresa..."
                           value={companySearch}
                           onChange={(e) => setCompanySearch(e.target.value)}
                           className="w-full bg-[#F1F5F9] border-none text-[11px] rounded-lg pl-7 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-[#111111] placeholder:text-[#94A3B8]"
                        />
                     </div>
                  </div>

                  {filteredCompanies.length === 0 && (
                    <div className="text-[11px] text-[#94A3B8] px-8 py-2 font-medium">Nenhuma empresa encontrada.</div>
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

          {/* Secondary Groups */}
          <div className="flex flex-col gap-0.5 mt-2 border-t border-[#0F172A05] pt-4">
            <NavItem icon={Users} label="Clientes" active={currentView === 'clientes'} onClick={() => handleNavigate('clientes')} />
            <NavItem icon={DollarSign} label="Financeiro" active={currentView === 'financeiro'} onClick={() => handleNavigate('financeiro')} />
            <NavItem icon={Users} label="Equipe" active={currentView === 'equipe'} onClick={() => handleNavigate('equipe')} />
            <NavItem icon={Lightbulb} label="Ideias" active={currentView === 'ideias'} onClick={() => handleNavigate('ideias')} />
            <NavItem icon={FileText} label="Documentação" active={currentView === 'documentacao'} onClick={() => handleNavigate('documentacao')} />
          </div>

          <div className="flex flex-col gap-0.5 mt-2 border-t border-[#0F172A05] pt-4">
            <NavItem icon={Settings} label="Configurações" active={currentView === 'configuracoes'} onClick={() => handleNavigate('configuracoes')} />
            {dbUser?.isPlatformAdmin && (
               <NavItem icon={ShieldCheck} label="Admin Cyzor" active={currentView === 'admin'} onClick={() => handleNavigate('admin')} />
            )}
          </div>
        </div>

        {/* Bottom Profile */}
        <div className="mt-auto pt-3 border-t border-[#0F172A05] px-2">
          {!isCollapsed ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#0F172A05] shadow-sm cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleNavigate('configuracoes')}>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 flex-shrink-0">
                  {dbUser?.name ? dbUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[11px] font-bold text-[#111111] truncate">{dbUser?.name || 'Operador'}</span>
                  <span className="text-[9px] text-[#64748B] truncate">{dbUser?.email}</span>
                </div>
              </div>
              <Settings size={14} className="text-[#94A3B8]" />
            </div>
          ) : (
            <div className="flex justify-center p-2" onClick={() => handleNavigate('configuracoes')}>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 cursor-pointer">
                {dbUser?.name ? dbUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
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
    <div className="flex flex-col">
      <div
        className={`group flex items-center justify-between py-1.5 pr-2 pl-2 rounded-lg cursor-pointer transition-all ${isActive ? 'bg-[#111111]/5 text-[#111111]' : 'text-[#475569] hover:bg-[#F1F5F9]'}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <button className="p-0.5 rounded text-[#94A3B8] hover:text-black">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          <Building2 size={14} className="flex-shrink-0 text-[#94A3B8]" />
          <span className="text-[13px] font-medium truncate hover:underline" onClick={(e) => { e.stopPropagation(); handleNavigate('empresas', { companyId: company.id }); }}>{company.name}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1 rounded text-[#94A3B8] hover:bg-black/5" onClick={(e) => { e.stopPropagation(); handleNavigate('empresas', { companyId: company.id }); }}><Star size={12} /></button>
          <button className="p-1 rounded text-[#94A3B8] hover:bg-black/5" onClick={(e) => { e.stopPropagation(); }}><MoreHorizontal size={14} /></button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex flex-col gap-0.5 mt-0.5 mb-1 relative before:absolute before:left-[17px] before:top-0 before:bottom-2 before:w-[1px] before:bg-slate-200">
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
        className={`group flex items-center justify-between py-1.5 pr-2 pl-[32px] rounded-lg cursor-pointer transition-all ${active ? 'text-[#111111] font-bold bg-[#111111]/5' : 'text-[#64748B] hover:bg-[#F1F5F9]'}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          {items.length > 0 ? (
            <button className="p-0.5 text-[#94A3B8]" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
              {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
          ) : (
             <div className="w-[16px]" />
          )}
          <Icon size={14} className="flex-shrink-0 text-[#94A3B8]" />
          <span className="text-[12px] truncate hover:underline" onClick={(e) => { e.stopPropagation(); onClick(e); }}>{label}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {count > 0 && !active && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#0F172A05] text-[#64748B]">
              {count}
            </span>
          )}
          <button className="p-1 rounded text-[#94A3B8] hover:bg-black/5" onClick={(e) => { e.stopPropagation(); handleNavigate(itemType, { companyId, add: true }); }}><Plus size={12} /></button>
        </div>
      </div>
      
      <AnimatePresence>
        {expanded && items.length > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex flex-col gap-0.5 pb-1 relative before:absolute before:left-[39px] before:top-0 before:bottom-2 before:w-[1px] before:bg-slate-100">
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
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
function LeafNode({ icon: Icon, label, indent = 0, onClick, active }: any) {
  return (
    <div 
      className={`group flex items-center justify-between py-1.5 pr-2 rounded-lg cursor-pointer transition-all ${active ? 'text-[#111111] font-bold bg-[#111111]/5' : 'text-[#64748B] hover:bg-[#F1F5F9]'}`}
      style={{ paddingLeft: `${32 + indent * 20}px` }}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 overflow-hidden flex-1">
        <Icon size={13} className="flex-shrink-0 text-[#94A3B8]" />
        <span className="text-[11.5px] truncate">{label}</span>
      </div>
    </div>
  );
}

