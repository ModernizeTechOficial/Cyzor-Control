import { useState, useEffect, useMemo } from 'react';
import { X, Package, LayoutGrid, DollarSign, FileText, LineChart, Target, Settings, Building2, Calendar, GitBranch, ArrowUpRight, Copy, CheckCircle2, AlertTriangle, Users, Save, Edit3, Trash2, Plus, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProductDetailsModal({ 
  product, 
  isOpen, 
  onClose,
  onSave,
  onDelete,
  companies = []
}: { 
  product: any, 
  isOpen: boolean, 
  onClose: () => void,
  onSave?: (p: any) => void,
  onDelete?: (id: any) => void,
  companies?: any[]
}) {
  const { fetchWithAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('visao_geral');
  const [editedProduct, setEditedProduct] = useState<any>(null);
  const [finance, setFinance] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    if (product) {
      setActiveTab('visao_geral');
      setEditedProduct(product);

      const fetchDetails = async () => {
        try {
          const [finRes, docRes, taskRes] = await Promise.all([
            fetchWithAuth('/api/finance'),
            fetchWithAuth('/api/documents'),
            fetchWithAuth('/api/tasks'),
          ]);
          
          if (finRes.ok) {
            // Find projects for this product
            // As finance entries map to projects or companies, not strictly products...
            // Let's proxy to global finance and filter if possible
            setFinance(await finRes.json());
          }
          if (docRes.ok) setDocuments(await docRes.json());
          if (taskRes.ok) setTasks(await taskRes.json());

        } catch (e) {
          console.error("Failed to load details", e);
        }
      };
      fetchDetails();

    } else {
      setEditedProduct(null);
    }
  }, [product, isOpen]);

  if (!isOpen || !editedProduct) return null;

  const handleUpdate = (updates: any) => {
    const updated = { ...editedProduct, ...updates };
    setEditedProduct(updated);
    if (onSave) onSave(updated);
  };

  const tabs = [
    { id: 'visao_geral', label: 'Visão Geral', icon: Package },
    { id: 'projetos', label: 'Projetos', icon: GitBranch },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'documentacao', label: 'Documentação', icon: FileText },
    { id: 'roadmap', label: 'Roadmap', icon: Target },
    { id: 'metricas', label: 'Métricas', icon: LineChart },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/30 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] w-full h-full sm:h-[95vh] max-w-[100vw] sm:max-w-7xl sm:rounded-[30px] border border-[#0F172A0F] shadow-[0_30px_80px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header / Tabs */}
        <div className="flex flex-col border-b border-[#0F172A0F] bg-[#FAFAFA]">
          {/* Top Bar */}
          <div className="px-8 py-6 flex items-start justify-between">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-[20px] bg-[#111111] text-white flex items-center justify-center font-display font-bold text-3xl shadow-lg">
                {editedProduct.logo || editedProduct.name?.charAt(0) || 'P'}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-[#FFFFFF] border border-[#0F172A0F] rounded text-[#64748B]">
                    {editedProduct.empresa}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-[#10B981]/10 border border-[#10B981]/20 rounded text-[#10B981]">
                    {editedProduct.status}
                  </span>
                </div>
                <h2 className="text-3xl font-display font-bold text-[#111111] tracking-tight">{editedProduct.name}</h2>
              </div>
            </div>
            
            <button onClick={onClose} className="w-10 h-10 rounded-[14px] flex items-center justify-center hover:bg-[#E2E8F0]/50 text-[#111111] transition-colors border border-transparent">
              <X size={24} strokeWidth={2} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex px-8 gap-6 overflow-x-auto custom-scrollbar border-t border-[#0F172A0F]/50">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 transition-all font-bold text-sm whitespace-nowrap ${
                    isActive 
                      ? 'border-[#111111] text-[#111111]' 
                      : 'border-transparent text-[#64748B] hover:text-[#111111] hover:border-[#111111]/30'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-[#FFFFFF]">
          {activeTab === 'visao_geral' && <AbaVisaoGeral product={editedProduct} onSave={handleUpdate} companies={companies} />}
          {activeTab === 'projetos' && <AbaProjetos product={editedProduct} onSave={handleUpdate} />}
          {activeTab === 'roadmap' && <AbaRoadmap product={{...editedProduct, tasks}} onSave={handleUpdate} />}
          {activeTab === 'financeiro' && <AbaFinanceiro finance={finance} />}
          {activeTab === 'documentacao' && <AbaDocumentacao documents={documents} />}
          {activeTab === 'metricas' && <AbaMetricas product={editedProduct} tasks={tasks} />}
          {activeTab === 'configuracoes' && <AbaConfiguracoes product={editedProduct} onDelete={() => onDelete?.(editedProduct.id)} />}
        </div>
        
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------
// Aba Visão Geral
// --------------------------------------------------------------------------------
function AbaVisaoGeral({ product, onSave, companies = [] }: { product: any, onSave: (p: any) => void, companies?: any[] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(product);

  useEffect(() => {
    setFormData(product);
  }, [product]);

  const handleSave = () => {
    onSave({
      ...formData,
      companyId: formData.companyId ? Number(formData.companyId) : undefined
    });
    setIsEditing(false);
  };

  return (
    <div className="p-8 flex flex-col gap-8 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniCard label="Projetos Vinculados" value={product.projectsCount || 0} icon={GitBranch} />
        <MiniCard label="Receita Estimada" value={product.revenue || 'R$ 0,00'} icon={DollarSign} />
        <MiniCard label="Status Atual" value={product.status || 'N/A'} icon={Target} />
        <MiniCard label="Última Atualização" value={product.updated || '-'} icon={Clock} />
      </div>

      <div className="flex flex-col gap-4 bg-[#FAFAFA] border border-[#0F172A0F] rounded-[24px] p-8">
        <div className="flex items-center justify-between border-b border-[#0F172A0F] pb-2">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#64748B]">Detalhes do Produto</h3>
          {!isEditing ? (
            <button onClick={() => { setFormData(product); setIsEditing(true); }} className="text-xs font-bold text-[#111111] hover:underline flex items-center gap-1">
              <Edit3 size={14} /> Editar
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setIsEditing(false)} className="text-xs font-bold text-[#64748B] hover:text-[#111111]">Cancelar</button>
              <button onClick={handleSave} className="text-xs font-bold text-[#FFFFFF] bg-[#111111] px-3 py-1 rounded-[8px] hover:bg-black">Salvar</button>
            </div>
          )}
        </div>

        {!isEditing ? (
          <>
            <p className="text-sm text-[#475569] leading-relaxed">
              {product.desc || 'Nenhuma descrição fornecida.'}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
              <DetailBox label="Empresa" value={product.empresa} />
              <DetailBox label="ID do Produto" value={`PRD-${(product.id || 0).toString().padStart(4, '0')}`} />
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">Nome</label>
              <input type="text" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[10px] px-3 py-2 text-sm font-semibold outline-none focus:border-[#111111]/30" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">Descrição</label>
              <textarea value={formData.desc || ''} onChange={(e) => setFormData({...formData, desc: e.target.value})} className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[10px] px-3 py-2 text-sm font-medium outline-none focus:border-[#111111]/30 min-h-[80px]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2 w-full">
                <label className="text-[11px] font-bold tracking-widest uppercase text-[#64748B] px-1">EMPRESA VINCULADA</label>
                <div className="relative group">
                  <select 
                    value={formData.companyId || ''} 
                    onChange={(e) => setFormData({...formData, companyId: e.target.value})}
                    className="w-full bg-[#FFFFFF] border border-[#0F172A0F] rounded-[10px] px-3 py-2 text-sm font-semibold outline-none focus:border-[#111111]/30 transition-all text-[#111111]"
                  >
                    <option value="">Nenhuma / Interno</option>
                    {companies.map(c => (
                       <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">Status</label>
                <select 
                  value={formData.status || 'Planejamento'} 
                  onChange={(e) => setFormData({...formData, status: e.target.value})} 
                  className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[10px] px-3 py-2 text-sm font-semibold outline-none focus:border-[#111111]/30"
                >
                  <option value="Planejamento">Planejamento</option>
                  <option value="Desenvolvimento">Desenvolvimento</option>
                  <option value="Beta">Beta</option>
                  <option value="Produção">Produção</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MiniCard({ label, value, icon: Icon }: { label: string, value: string | number, icon: any }) {
  return (
    <div className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[20px] p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <div className="w-8 h-8 rounded-lg bg-[#FAFAFA] border border-[#0F172A0F] flex items-center justify-center text-[#64748B]">
        <Icon size={16} />
      </div>
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">{label}</span>
        <h4 className="text-2xl font-bold text-[#111111]">{value}</h4>
      </div>
    </div>
  );
}

function DetailBox({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">{label}</span>
      <span className="text-sm font-semibold text-[#111111]">{value}</span>
    </div>
  );
}

// --------------------------------------------------------------------------------
// Aba Projetos
// --------------------------------------------------------------------------------
function AbaProjetos({ product, onSave }: { product: any, onSave: (p: any) => void }) {
  const projects = product.projectsList || [];
  const [isAdding, setIsAdding] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', deadline: '', progress: '0%', status: 'Planejado' });

  const convertToISODate = (dueDateStr: string): string => {
    if (!dueDateStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dueDateStr)) return dueDateStr;

    const mOpt: { [key: string]: string } = {
      'jan': '01', 'fev': '02', 'mar': '03', 'abr': '04', 'mai': '05', 'jun': '06',
      'jul': '07', 'ago': '08', 'set': '09', 'out': '10', 'nov': '11', 'dez': '12',
      'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04', 'maio': '05', 'junho': '06',
      'julho': '07', 'agosto': '08', 'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
    };

    const lower = dueDateStr.toLowerCase();
    const dayMatch = lower.match(/\b(\d{1,2})\b/);
    const day = dayMatch ? dayMatch[1].padStart(2, '0') : '15';

    let month = '06';
    for (const [key, val] of Object.entries(mOpt)) {
      if (lower.includes(key)) {
        month = val;
        break;
      }
    }

    const currentYear = new Date().getFullYear();
    const yearMatch = lower.match(/\b(20\d{2})\b/);
    const year = yearMatch ? yearMatch[1] : currentYear.toString();

    return `${year}-${month}-${day}`;
  };

  const formatToReadableDate = (isoStr: string): string => {
    if (!isoStr) return '';
    const parts = isoStr.split('-');
    if (parts.length !== 3) return isoStr;
    
    const [year, month, day] = parts;
    const monthNames = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    
    const mIndex = parseInt(month, 10) - 1;
    const mName = mIndex >= 0 && mIndex < 12 ? monthNames[mIndex] : 'Jun';
    const cleanDay = parseInt(day, 10).toString();
    
    return `${cleanDay} ${mName}`;
  };

  const handleAddProject = () => {
    if (newProject.name) {
      const updatedList = [...projects, { ...newProject, id: Date.now() }];
      onSave({ 
        projectsList: updatedList,
        projects: updatedList.length 
      });
      setIsAdding(false);
      setNewProject({ name: '', deadline: '', progress: '0%', status: 'Planejado' });
    }
  };

  const handleDeleteProject = (id: any) => {
    const updatedList = projects.filter((p: any) => p.id !== id);
    onSave({ 
      projectsList: updatedList,
      projects: updatedList.length 
    });
  };

  return (
    <div className="p-8 flex flex-col gap-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-[#111111]">Projetos Relacionados</h3>
        <button onClick={() => setIsAdding(true)} className="bg-[#111111] text-white px-4 py-2 rounded-[12px] font-bold text-xs shadow-sm hover:bg-black transition-colors">
          Novo Projeto
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {isAdding && (
          <div className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-[16px] p-5 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-4 flex-1">
              <input type="text" placeholder="Nome do Projeto" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} className="px-3 py-2 rounded-[10px] border border-[#0F172A0F] text-sm font-semibold flex-1 outline-none focus:border-[#111111]/30" />
              <input type="date" value={convertToISODate(newProject.deadline)} onChange={e => setNewProject({...newProject, deadline: formatToReadableDate(e.target.value)})} className="w-40 px-3 py-2 rounded-[10px] border border-[#0F172A0F] text-sm font-semibold outline-none focus:border-[#111111]/30 cursor-pointer" />
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button onClick={() => setIsAdding(false)} className="text-[#64748B] text-xs font-bold px-3 py-2">Cancelar</button>
              <button onClick={handleAddProject} className="bg-[#111111] text-white px-4 py-2 rounded-[10px] text-xs font-bold">Salvar</button>
            </div>
          </div>
        )}

        {projects.length > 0 ? projects.map((p: any) => (
          <div key={p.id} className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-[16px] p-5 flex items-center justify-between hover:bg-[#F1F5F9]/50 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#FFFFFF] border border-[#0F172A0F] rounded-[10px] flex items-center justify-center text-[#111111]">
                <GitBranch size={16} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[#111111]">{p.name}</span>
                <span className="text-xs font-semibold text-[#64748B]">Prazo: {p.deadline}</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex flex-col gap-1 w-32">
                <div className="flex justify-between text-[10px] font-bold text-[#64748B]">
                  <span>Progresso</span>
                  <span>{p.progress}</span>
                </div>
                <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#111111]" style={{ width: p.progress }}></div>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded border ${p.status === 'Atrasado' ? 'bg-red-50 text-red-600 border-red-100' : p.status === 'Planejado' ? 'bg-gray-100 text-gray-600 border-gray-200' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                {p.status}
              </span>
              <button onClick={() => handleDeleteProject(p.id)} className="w-8 h-8 rounded-[8px] bg-white border border-[#0F172A0F] flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        )) : (
          <p className="text-center text-sm font-medium text-[#64748B] py-10 bg-[#FAFAFA] rounded-[16px] border border-dashed border-[#0F172A0F]">Nenhum projeto vinculado.</p>
        )}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------
// Aba Roadmap
// --------------------------------------------------------------------------------
function AbaRoadmap({ product, onSave }: { product: any, onSave: (p: any) => void }) {
  const columns = ['Backlog', 'Planejado', 'Em Desenvolvimento', 'Testes', 'Lançado'];
  
  const tasks = product.roadmapTasks || [
    { id: 1, text: 'Definição da arquitetura', column: 'Planejado' },
    { id: 2, text: 'Entrevistas com usuários', column: 'Lançado' }
  ];

  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [addingToCol, setAddingToCol] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const saveTasks = (newTasks: any[]) => {
    onSave({ roadmapTasks: newTasks });
  };

  const startDrag = (id: number) => {
    setDraggingId(id);
  };

  const handleDrop = (col: string) => {
    if (draggingId === null) return;
    const newTasks = tasks.map((t: any) => t.id === draggingId ? { ...t, column: col } : t);
    saveTasks(newTasks);
    setDraggingId(null);
    setDragOverCol(null);
  };

  const saveEdit = (id: number) => {
    const newTasks = tasks.map((t: any) => t.id === id ? { ...t, text: editValue } : t);
    saveTasks(newTasks);
    setEditingId(null);
  };

  const addTask = (col: string) => {
    if (editValue.trim() === '') {
      setAddingToCol(null);
      return;
    }
    saveTasks([...tasks, { id: Date.now(), text: editValue, column: col }]);
    setAddingToCol(null);
    setEditValue('');
  };

  return (
    <div className="p-8 h-full flex flex-col gap-6 custom-scrollbar overflow-x-auto min-h-[500px]">
      <div className="flex gap-4 min-w-max h-full">
        {columns.map((col) => (
          <div 
            key={col} 
            className={`w-[300px] flex-shrink-0 flex flex-col gap-4 bg-[#FAFAFA]/50 border border-[#0F172A0F] rounded-[24px] p-4 transition-colors ${dragOverCol === col ? 'bg-[#F1F5F9]' : ''}`}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverCol(col); }}
            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverCol(null); }}
            onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleDrop(col); }}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold uppercase text-[#64748B] tracking-widest">{col}</h4>
              <button onClick={() => { setAddingToCol(col); setEditValue(''); }} className="text-[#64748B] hover:text-[#111111]">
                <Plus size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-3 min-h-[100px]">
              {tasks.filter((t: any) => t.column === col).map((task: any) => (
                <div 
                  key={task.id}
                  draggable
                  onDragStart={(e) => { e.stopPropagation(); startDrag(task.id); }}
                  onDragEnd={(e) => { e.stopPropagation(); setDraggingId(null); }}
                  className={`bg-[#FFFFFF] border border-[#0F172A0F] rounded-[16px] p-4 text-sm font-semibold text-[#111111] shadow-sm cursor-grab active:cursor-grabbing group transition-all ${draggingId === task.id ? 'opacity-50 scale-95' : ''}`}
                >
                  {editingId === task.id ? (
                    <div className="flex flex-col gap-2">
                      <textarea 
                        autoFocus
                        value={editValue} 
                        onChange={e => setEditValue(e.target.value)} 
                        className="w-full text-sm font-medium outline-none resize-none bg-transparent"
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => saveTasks(tasks.filter((t: any) => t.id !== task.id))} className="text-red-500 hover:text-red-700 text-xs font-bold">Excluir</button>
                        <button onClick={() => setEditingId(null)} className="text-[#64748B] text-xs font-bold">Cancelar</button>
                        <button onClick={() => saveEdit(task.id)} className="bg-[#111111] text-white px-2 py-1 rounded text-xs font-bold">Salvar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <span className="leading-snug flex-1">{task.text}</span>
                      <button onClick={() => { setEditingId(task.id); setEditValue(task.text); }} className="text-[#64748B] opacity-0 group-hover:opacity-100 hover:text-[#111111] bg-[#FAFAFA] rounded-md p-1">
                        <Edit3 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {addingToCol === col && (
                <div className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[16px] p-4 text-sm font-semibold shadow-sm">
                  <textarea 
                    autoFocus
                    placeholder="Nova tarefa..."
                    value={editValue} 
                    onChange={e => setEditValue(e.target.value)} 
                    className="w-full text-sm font-medium outline-none resize-none bg-transparent"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => setAddingToCol(null)} className="text-[#64748B] text-xs font-bold">Cancelar</button>
                    <button onClick={() => addTask(col)} className="bg-[#111111] text-white px-2 py-1 rounded text-xs font-bold">Adicionar</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------
// Aba Financeiro
// --------------------------------------------------------------------------------
function AbaFinanceiro({ finance = [] }: { finance?: any[] }) {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const metrics = useMemo(() => {
    let monthlyRev = 0;
    let annualRev = 0;
    let operationalCosts = 0;

    finance.forEach(f => {
      const d = new Date(f.date);
      const isCurrentMonth = d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      const amount = Number(f.amount);
      
      if (f.type === 'RECEITA') {
        annualRev += amount;
        if (isCurrentMonth) monthlyRev += amount;
      } else if (f.type === 'DESPESA' && isCurrentMonth) {
        operationalCosts += amount;
      }
    });

    const profit = monthlyRev - operationalCosts;
    const margin = monthlyRev > 0 ? ((profit / monthlyRev) * 100).toFixed(0) : 0;

    return { monthlyRev, annualRev, operationalCosts, margin };
  }, [finance]);

  return (
    <div className="p-8 flex flex-col gap-8 max-w-5xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <MiniCard label="Receita Mensal" value={`R$ ${metrics.monthlyRev.toLocaleString('pt-BR')}`} icon={DollarSign} />
         <MiniCard label="Receita Anual" value={`R$ ${metrics.annualRev.toLocaleString('pt-BR')}`} icon={LineChart} />
         <MiniCard label="Custos Oper." value={`R$ ${metrics.operationalCosts.toLocaleString('pt-BR')}`} icon={AlertTriangle} />
         <MiniCard label="Margem" value={`${metrics.margin}%`} icon={CheckCircle2} />
      </div>
      <div className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-[24px] h-[300px] flex items-center justify-center">
        <span className="text-[#64748B] font-bold uppercase tracking-widest text-sm text-center">
          Integração Gráfica em Breve
        </span>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------
// Aba Documentação
// --------------------------------------------------------------------------------
function AbaDocumentacao({ documents = [] }: { documents?: any[] }) {
  return (
    <div className="p-8 flex flex-col gap-8 max-w-5xl mx-auto">
      {documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {documents.map(d => (
            <div key={d.id} className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[20px] p-5 flex flex-col gap-3 shadow-sm hover:border-[#111111]/30 cursor-pointer">
              <div className="w-10 h-10 bg-[#FAFAFA] rounded-[10px] text-[#111111] flex items-center justify-center">
                <FileText size={18} />
              </div>
              <h4 className="font-bold text-[#111111] line-clamp-1">{d.title}</h4>
              <span className="text-xs text-[#64748B]">Criado em {new Date(d.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-[#FAFAFA] rounded-[16px] border border-dashed border-[#0F172A0F]">
          <p className="text-[#64748B] text-sm font-medium">Nenhum documento relacionado encontrado.</p>
        </div>
      )}
    </div>
  );
}

// --------------------------------------------------------------------------------
// Aba Métricas
// --------------------------------------------------------------------------------
function AbaMetricas({ product, tasks = [] }: { product: any, tasks?: any[] }) {
  const activeProjects = product?.projects || 0;
  const openTasks = tasks.filter(t => t.status !== 'DONE').length;

  return (
    <div className="p-8 flex flex-col gap-8 max-w-5xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <MiniCard label="Crescimento" value="+0%" icon={LineChart} />
         <MiniCard label="Projetos Ativos" value={activeProjects} icon={LayoutGrid} />
         <MiniCard label="Tarefas Abertas" value={openTasks} icon={Target} />
         <MiniCard label="Acessos Hoje" value="0" icon={Users} />
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------
// Aba Configurações
// --------------------------------------------------------------------------------
function AbaConfiguracoes({ product, onDelete }: { product: any, onDelete: () => void }) {
  return (
    <div className="p-8 flex flex-col gap-8 max-w-3xl mx-auto">
      <div className="flex flex-col gap-4">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#64748B] border-b border-[#0F172A0F] pb-2">Geral</h3>
        <div className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[20px] p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#111111]">Nome Original do Produto</label>
            <input type="text" readOnly className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-[12px] px-4 py-2 font-medium text-sm text-[#111111] outline-none" value={product.name} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#111111]">Chave de API (Leitura)</label>
            <div className="flex gap-2">
              <input type="password" readOnly className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-[12px] px-4 py-2 font-medium text-sm text-[#64748B] outline-none flex-1" value="sk-live-1234567890abcdef" />
              <button className="bg-[#111111] text-white px-4 py-2 rounded-[12px] font-bold text-xs"><Copy size={16}/></button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-red-500 border-b border-red-100 pb-2">Zona de Perigo</h3>
        <div className="bg-red-50 border border-red-100 rounded-[20px] p-6 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-bold text-red-700">Arquivar Produto</span>
            <span className="text-xs text-red-600">Remove o produto das listagens principais mas mantém os dados.</span>
          </div>
          <button onClick={onDelete} className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-[12px] font-bold text-xs hover:bg-red-100 transition-colors">
            Arquivar
          </button>
        </div>
      </div>
    </div>
  );
}
