import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Terminal, ArrowRight, ShieldAlert, Navigation, FileText, CheckCircle2, DollarSign, FolderGit2 } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: any) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const { fetchWithAuth, activeWorkspace } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut to open/close
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Load searchable data from active workspace
  useEffect(() => {
    if (!isOpen || !activeWorkspace) return;
    
    const loadAllSearchData = async () => {
      setLoading(true);
      try {
        const [companies, clients, products, projects, ideas, docs, finance] = await Promise.all([
          fetchWithAuth('/api/companies').then(r => r.ok ? r.json() : []),
          fetchWithAuth('/api/clients').then(r => r.ok ? r.json() : []),
          fetchWithAuth('/api/products').then(r => r.ok ? r.json() : []),
          fetchWithAuth('/api/projects').then(r => r.ok ? r.json() : []),
          fetchWithAuth('/api/ideas').then(r => r.ok ? r.json() : []),
          fetchWithAuth('/api/documents').then(r => r.ok ? r.json() : []),
          fetchWithAuth('/api/finance').then(r => r.ok ? r.json() : [])
        ]);

        setResults({
          companies,
          clients,
          products,
          projects,
          ideas,
          docs,
          finance
        });
      } catch (err) {
        console.error("Failed to prefetch search data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAllSearchData();
  }, [isOpen, activeWorkspace]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  // Filter lists locally based on the typed search query
  const getFilteredResults = () => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const matches: any[] = [];

    // Search Projects
    if (results.projects) {
      results.projects.filter((p: any) => p.name?.toLowerCase().includes(query)).forEach((p: any) => {
        matches.push({ id: p.id, title: p.name, type: 'Projeto', view: 'projetos', icon: FolderGit2 });
      });
    }

    // Search Products
    if (results.products) {
      results.products.filter((p: any) => p.name?.toLowerCase().includes(query)).forEach((p: any) => {
        matches.push({ id: p.id, title: p.name, type: 'Produto', view: 'produtos', icon: Navigation });
      });
    }

    // Search Companies
    if (results.companies) {
      results.companies.filter((c: any) => c.name?.toLowerCase().includes(query)).forEach((c: any) => {
        matches.push({ id: c.id, title: c.name, type: 'Empresa', view: 'empresas', icon: Terminal });
      });
    }

    // Search Clients
    if (results.clients) {
      results.clients.filter((c: any) => c.name?.toLowerCase().includes(query)).forEach((c: any) => {
        matches.push({ id: c.id, title: c.name, type: 'Cliente', view: 'clientes', icon: Navigation });
      });
    }

    // Search Ideas
    if (results.ideas) {
      results.ideas.filter((i: any) => i.title?.toLowerCase().includes(query)).forEach((i: any) => {
        matches.push({ id: i.id, title: i.title, type: 'Ideia', view: 'ideias', icon: FileText });
      });
    }

    // Search Documents
    if (results.docs) {
      results.docs.filter((d: any) => d.title?.toLowerCase().includes(query)).forEach((d: any) => {
        matches.push({ id: d.id, title: d.title, type: 'Documento', view: 'documentacao', icon: FileText });
      });
    }

    return matches;
  };

  const filtered = getFilteredResults();

  // Pre-defined Quick Actions / Navigation items
  const quickActions = [
    { title: 'Ir para Dashboard', view: 'dashboard', subtitle: 'Visão executiva do Workspace' },
    { title: 'Ir para Módulo Financeiro', view: 'financeiro', subtitle: 'Despesas, receitas e fluxo de caixa' },
    { title: 'Ir para Portfólio de Produtos', view: 'produtos', subtitle: 'Gerenciamento de Roadmaps' },
    { title: 'Ir para Projetos & Sprints', view: 'projetos', subtitle: 'Kanban, tarefas e sprints' },
    { title: 'Ir para Gerenciamento da Equipe', view: 'equipe', subtitle: 'Colaboradores e produtividade' },
    { title: 'Ir para IA Assistant', view: 'ia', subtitle: 'Copiloto estratégico' }
  ].filter(action => !searchQuery || action.title.toLowerCase().includes(searchQuery.toLowerCase()));

  if (!isOpen) return null;

  return (
    <div 
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[110] flex items-start justify-center p-4 bg-[#111111]/30 backdrop-blur-md pt-[10vh]"
    >
      <div className="bg-white border border-[#0F172A0F] shadow-[0_30px_70px_rgba(0,0,0,0.15)] w-full max-w-2xl rounded-[24px] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#0F172A0F] bg-[#FAFAFA]">
          <Search size={18} className="text-[#64748B]" />
          <input 
            ref={inputRef}
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Digite para pesquisar entidades ou comandos rápidos..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-[#111111] placeholder-[#64748B] font-medium"
          />
          <span className="text-[10px] bg-white border border-[#0F172A0F] px-2 py-1 rounded-lg text-[#64748B] font-bold shadow-sm">ESC</span>
        </div>

        {/* Content & Results Box */}
        <div className="max-h-[380px] overflow-y-auto p-3 flex flex-col gap-4">
          
          {loading && (
            <div className="flex items-center justify-center py-10 gap-2 text-[#64748B]">
              <div className="w-4 h-4 border-2 border-[#111111]/15 border-t-[#111111] rounded-full animate-spin" />
              <span className="text-xs font-semibold">Sincronizando índices...</span>
            </div>
          )}

          {/* Matches section */}
          {!loading && filtered.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider px-2">Resultados da Pesquisa Global</span>
              {filtered.map((item, idx) => {
                const IconComponent = item.icon || Terminal;
                return (
                  <button
                    key={`${item.type}-${item.id}-${idx}`}
                    onClick={() => {
                      onNavigate(item.view);
                      onClose();
                    }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-[#FAFAFA] transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#FAFAFA] border border-[#0F172A0F] rounded-xl text-[#111111] group-hover:bg-white group-hover:shadow-sm transition-all">
                        <IconComponent size={14} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#111111] block">{item.title}</span>
                        <span className="text-[9px] text-[#64748B] block mt-0.5 font-semibold">ID #{item.id} — {item.type}</span>
                      </div>
                    </div>
                    <ArrowRight size={13} className="text-[#64748B] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Actions section */}
          {!loading && quickActions.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider px-2">Ações Rápidas & Comandos</span>
              {quickActions.map((action, idx) => (
                <button
                  key={`action-${idx}`}
                  onClick={() => {
                    onNavigate(action.view);
                    onClose();
                  }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[#FAFAFA] transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#FAFAFA] border border-[#0F172A0F] rounded-xl text-[#111111] group-hover:bg-white group-hover:shadow-sm transition-all">
                      <Terminal size={14} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#111111] block">{action.title}</span>
                      <span className="text-[9px] text-[#64748B] block mt-0.5">{action.subtitle}</span>
                    </div>
                  </div>
                  <span className="text-[9px] text-[#64748B] bg-white border border-[#0F172A0F] py-0.5 px-2 rounded-md font-bold shadow-xs">EXECUTAR</span>
                </button>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && quickActions.length === 0 && (
            <div className="text-center py-12 text-[#64748B] flex flex-col items-center justify-center gap-2">
              <ShieldAlert size={20} />
              <p className="text-xs">Nenhum resultado ou comando corresponde à sua pesquisa.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
