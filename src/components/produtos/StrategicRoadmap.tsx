import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  TrendingUp, Calendar, List, Layers, Plus, Star, MapPin, CheckCircle2, 
  HelpCircle, MoreHorizontal, ArrowRight, User, AlertCircle, ShieldCheck
} from 'lucide-react';

interface StrategicRoadmapProps {
  productId?: number;
}

export const StrategicRoadmap: React.FC<StrategicRoadmapProps> = ({ productId }) => {
  const { fetchWithAuth, activeWorkspace } = useAuth();
  const [roadmapsList, setRoadmapsList] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'timeline' | 'kanban' | 'list'>('timeline');
  const [products, setProducts] = useState<any[]>([]);
  
  // Form fields for new initiative
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newStatus, setNewStatus] = useState('PLANNING');
  const [newPriority, setNewPriority] = useState('MEDIUM');
  const [newProgress, setNewProgress] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(productId || null);

  useEffect(() => {
    fetchRoadmaps();
    fetchProducts();
  }, [productId, activeWorkspace]);

  const fetchRoadmaps = async () => {
    try {
      const res = await fetchWithAuth('/api/roadmaps');
      if (res.ok) {
        const data = await res.json();
        // Filter by productId if scoped
        if (productId) {
          setRoadmapsList(data.filter((r: any) => r.productId === productId));
        } else {
          setRoadmapsList(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch roadmaps:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetchWithAuth('/api/products');
      if (res.ok) {
        setProducts(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  const handleCreateInitiative = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetchWithAuth('/api/roadmaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductId || productId || null,
          title: newTitle,
          description: newDesc,
          status: newStatus,
          priority: newPriority,
          progress: newProgress,
          dependencies: []
        })
      });

      if (res.ok) {
        setNewTitle('');
        setNewDesc('');
        setNewStatus('PLANNING');
        setNewPriority('MEDIUM');
        setNewProgress(0);
        setIsAdding(false);
        fetchRoadmaps();
      }
    } catch (err) {
      console.error("Error creating initiative:", err);
    }
  };

  const getPriorityBadge = (prio: string) => {
    switch (prio) {
      case 'CRITICAL':
        return <span className="text-[9px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded">Crítico</span>;
      case 'HIGH':
        return <span className="text-[9px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded">Alta</span>;
      case 'MEDIUM':
        return <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded">Média</span>;
      default:
        return <span className="text-[9px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">Baixa</span>;
    }
  };

  return (
    <div className="bg-white border border-[#0F172A0F] rounded-[30px] p-6 shadow-sm flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#0F172A05] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-[#111111] text-white rounded-2xl">
            <Layers size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#111111]">Roadmap Estratégico</h3>
            <p className="text-[11px] text-[#64748B]">Evolução de produtos, versões e entregas</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View selectors */}
          <div className="flex bg-[#FAFAFA] border border-[#0F172A0F] p-1 rounded-xl">
            {[
              { id: 'timeline', label: 'Timeline', icon: Calendar },
              { id: 'kanban', label: 'Quadro', icon: TrendingUp },
              { id: 'list', label: 'Lista', icon: List }
            ].map(v => {
              const Icon = v.icon;
              return (
                <button
                  key={v.id}
                  onClick={() => setViewMode(v.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    viewMode === v.id ? 'bg-white text-[#111111] shadow-sm' : 'text-[#64748B] hover:text-[#111111]'
                  }`}
                >
                  <Icon size={12} />
                  {v.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="bg-[#111111] text-white py-2 px-3.5 rounded-xl text-xs font-bold hover:bg-[#111111]/90 flex items-center gap-1.5 transition-all"
          >
            <Plus size={13} /> Nova Iniciativa
          </button>
        </div>
      </div>

      {/* Adding Initiative Panel */}
      {isAdding && (
        <form onSubmit={handleCreateInitiative} className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-2xl p-5 flex flex-col gap-4 animate-in slide-in-from-top-4 duration-300">
          <h4 className="text-xs font-bold text-[#111111]">Adicionar Iniciativa ao Roadmap</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-[#64748B] font-bold block mb-1">Título da Feature/Iniciativa</label>
              <input 
                type="text" 
                value={newTitle} 
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: Refatoração do Core SDK, Nova UI bento, etc."
                className="w-full bg-white border border-[#0F172A0F] rounded-xl py-2 px-3 text-xs text-[#111111] focus:outline-none"
              />
            </div>

            {!productId && (
              <div>
                <label className="text-[10px] text-[#64748B] font-bold block mb-1">Produto Associado</label>
                <select
                  value={selectedProductId || ''}
                  onChange={(e) => setSelectedProductId(Number(e.target.value))}
                  className="w-full bg-white border border-[#0F172A0F] rounded-xl py-2.5 px-3 text-xs text-[#111111] focus:outline-none"
                >
                  <option value="">Selecione...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] text-[#64748B] font-bold block mb-1">Descrição Detalhada</label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Gargalos, dependências, objetivos e escopo..."
              className="w-full bg-white border border-[#0F172A0F] rounded-xl p-3 text-xs text-[#111111] focus:outline-none resize-none"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] text-[#64748B] font-bold block mb-1">Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full bg-white border border-[#0F172A0F] rounded-xl py-2 px-3 text-xs text-[#111111] focus:outline-none"
              >
                <option value="PLANNING">Planejamento</option>
                <option value="IN_PROGRESS">Em Desenvolvimento</option>
                <option value="SHIPPED">Lançado</option>
                <option value="DEFERRED">Adiado</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-[#64748B] font-bold block mb-1">Prioridade</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full bg-white border border-[#0F172A0F] rounded-xl py-2 px-3 text-xs text-[#111111] focus:outline-none"
              >
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
                <option value="CRITICAL">Crítica</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-[#64748B] font-bold block mb-1">Progresso %</label>
              <input
                type="number"
                min={0}
                max={100}
                value={newProgress}
                onChange={(e) => setNewProgress(Number(e.target.value))}
                className="w-full bg-white border border-[#0F172A0F] rounded-xl py-2 px-3 text-xs text-[#111111] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-xs font-bold text-[#64748B] hover:text-[#111111]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-[#111111] text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-[#111111]/90"
            >
              Criar Iniciativa
            </button>
          </div>
        </form>
      )}

      {/* ROADMAP VIEW MODES */}
      <div className="flex-1">
        {/* TIMELINE MODE */}
        {viewMode === 'timeline' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-[#FAFAFA] border border-[#0F172A05] p-3 rounded-xl text-[10px] font-bold text-[#64748B]">
              <span>RELEASE SCHEDULE</span>
              <span>ESTIMATED TIME / PROGRESS</span>
            </div>
            <div className="relative border-l-2 border-dashed border-[#0F172A0F] ml-4 pl-6 space-y-6">
              {roadmapsList.map((item) => (
                <div key={item.id} className="relative">
                  <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#111111] border border-white" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#FAFAFA] border border-[#0F172A05] rounded-2xl hover:border-[#111111]/10 transition-all">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#111111]">{item.title}</span>
                        {getPriorityBadge(item.priority)}
                      </div>
                      <p className="text-[10px] text-[#64748B] mt-1">{item.description || 'Nenhuma descrição detalhada.'}</p>
                      <span className="inline-block mt-2 text-[8px] font-bold text-white bg-[#111111] px-2 py-0.5 rounded-full uppercase">
                        {item.status}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs font-bold text-[#111111]">{item.progress}%</span>
                      <div className="w-24 bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#111111] h-full transition-all duration-500" style={{ width: `${item.progress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {roadmapsList.length === 0 && (
                <div className="text-center py-10 text-[#64748B]">
                  <p className="text-xs">Nenhuma iniciativa registrada. Clique em "Nova Iniciativa" para começar o roadmap.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* KANBAN MODE */}
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['PLANNING', 'IN_PROGRESS', 'SHIPPED', 'DEFERRED'].map(col => {
              const items = roadmapsList.filter(item => item.status === col);
              return (
                <div key={col} className="bg-[#FAFAFA] border border-[#0F172A05] rounded-2xl p-4 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#111111] tracking-wider uppercase">{col.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] bg-[#111111]/5 text-[#111111] px-2 py-0.5 rounded-full font-bold">{items.length}</span>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {items.map(item => (
                      <div key={item.id} className="bg-white border border-[#0F172A0F] rounded-xl p-3 shadow-xs hover:shadow-sm transition-all flex flex-col gap-2">
                        <span className="text-xs font-bold text-[#111111]">{item.title}</span>
                        {item.description && <p className="text-[9px] text-[#64748B] line-clamp-2 leading-relaxed">{item.description}</p>}
                        <div className="flex items-center justify-between gap-2 border-t border-[#0F172A05] pt-2 mt-1">
                          {getPriorityBadge(item.priority)}
                          <span className="text-[10px] font-bold text-[#111111]">{item.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* LIST MODE */}
        {viewMode === 'list' && (
          <div className="border border-[#0F172A0F] rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAFAFA] border-b border-[#0F172A05] text-[#64748B] font-bold">
                  <th className="p-4">Iniciativa / Objetivo</th>
                  <th className="p-4">Prioridade</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Progresso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0F172A05]">
                {roadmapsList.map(item => (
                  <tr key={item.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-[#111111]">{item.title}</div>
                      {item.description && <div className="text-[10px] text-[#64748B] mt-0.5 max-w-sm line-clamp-1">{item.description}</div>}
                    </td>
                    <td className="p-4">{getPriorityBadge(item.priority)}</td>
                    <td className="p-4">
                      <span className="text-[10px] bg-[#111111] text-white px-2 py-0.5 rounded-full uppercase">
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold">{item.progress}%</span>
                        <div className="w-20 bg-[#E2E8F0] h-1 rounded-full overflow-hidden">
                          <div className="bg-[#111111] h-full" style={{ width: `${item.progress}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
