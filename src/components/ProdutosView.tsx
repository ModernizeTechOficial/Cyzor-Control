import { useState, useEffect, useMemo } from 'react';
import ProductDetailsModal from './ProductDetailsModal';
import NewProductModal from './NewProductModal';
import { useAuth } from '../context/AuthContext';
import { useProducts, useCompanies, useProjects } from '../hooks/useCyzorQueries';
import { SkeletonKanban } from './common/skeletons/SkeletonKanban';
import { useQueryClient } from '@tanstack/react-query';

import StandardHeader from './layout/StandardHeader';
import { Plus } from 'lucide-react';
import ProductStats from './produtos/ProductStats';
import ProductActivity from './produtos/ProductActivity';
import ProductEvents from './produtos/ProductEvents';
import ProductActionBar from './produtos/ProductActionBar';
import TimelineView, { TimelineItem } from './common/TimelineView';

import BoardToolbar from './common/management/BoardToolbar';
import BoardKanban, { KanbanColumn, KanbanItem } from './common/management/BoardKanban';
import BoardList from './common/management/BoardList';

const PRODUTOS_COLUMNS: KanbanColumn[] = [
  { id: 'Planejamento', label: 'Planejamento', badge: 'bg-neutral-50 text-neutral-500 border border-neutral-200/50' },
  { id: 'Em Desenvolvimento', label: 'Em Desenvolvimento', badge: 'bg-orange-50 text-orange-800 border border-orange-200/50' },
  { id: 'Beta', label: 'Beta', badge: 'bg-blue-50 text-blue-800 border border-blue-200/50' },
  { id: 'Produção', label: 'Em Produção', badge: 'bg-emerald-50 text-emerald-800 border border-emerald-200/30' }
];

export default function ProdutosView() {
  const { data: productsData, isLoading: isProductsLoading } = useProducts();
  const { data: companiesData } = useCompanies();
  const { data: projectsData } = useProjects();

  const [products, setProducts] = useState<any[]>([]);
  useEffect(() => { if (productsData) setProducts(productsData); }, [productsData]);
  const [companies, setCompanies] = useState<any[]>([]);
  useEffect(() => { if (companiesData) setCompanies(companiesData); }, [companiesData]);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  useEffect(() => { if (projectsData) setProjectsList(projectsData); }, [projectsData]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'timeline' | 'gantt'>('kanban');
  
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const { fetchWithAuth, activeWorkspace } = useAuth();

  const handleUpdateProductDates = async (productId: number, newStartDate: string, newEndDate: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const tags = prod.tags && Array.isArray(prod.tags) ? prod.tags : [];
    const cleanTags = tags.filter((t: string) => !t.startsWith('start:') && !t.startsWith('end:'));
    const updatedTags = [...cleanTags, `start:${newStartDate}`, `end:${newEndDate}`];

    try {
      const res = await fetchWithAuth(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tags: updatedTags
        })
      });

      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, tags: updatedTags } : p));
      }
    } catch (e) {
      console.error("Error updating product dates in timeline:", e);
    }
  };

  const fetchData = async () => {
    if (!activeWorkspace) return;
    try {
      const [resProd, resComp, resProj] = await Promise.all([
        fetchWithAuth('/api/products'),
        fetchWithAuth('/api/companies'),
        fetchWithAuth('/api/projects')
      ]);
      if (resProd.ok) setProducts(await resProd.json());
      if (resComp.ok) setCompanies(await resComp.json());
      if (resProj.ok) setProjectsList(await resProj.json());
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeWorkspace]);

  // Derived state with metrics
  const mappedProducts = useMemo(() => {
    return products.map(p => {
      const company = companies.find(c => c.id === p.companyId);
      const linkedProjects = projectsList.filter(proj => proj.productId === p.id);
      
      return {
        ...p,
        empresa: p.empresa || (company ? company.name : 'Empresa Interna'),
        companyName: p.companyName || (company ? company.name : 'Empresa Interna'),
        desc: p.description,
        projectsCount: p.projectsCount !== undefined ? p.projectsCount : linkedProjects.length,
        revenue: p.revenue !== undefined ? p.revenue : 'R$ 0,00',
        logo: p.logo || (p.name ? p.name.charAt(0).toUpperCase() : 'P'),
        updated: new Date(p.updatedAt || p.createdAt || Date.now()).toLocaleDateString()
      };
    });
  }, [products, companies, projectsList]);

  const filteredProducts = useMemo(() => mappedProducts.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.empresa?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter !== 'ALL') {
      const s = p.status?.toUpperCase() || 'PRODUÇÃO';
      if (statusFilter === 'PRODUÇÃO' && s !== 'PRODUÇÃO') matchesStatus = false;
      if (statusFilter === 'EM DESENVOLVIMENTO' && s !== 'EM DESENVOLVIMENTO' && s !== 'DESENVOLVIMENTO') matchesStatus = false;
      if (statusFilter === 'BETA' && s !== 'BETA') matchesStatus = false;
      if (statusFilter === 'PLANEJAMENTO' && s !== 'PLANEJAMENTO') matchesStatus = false;
      if (statusFilter === 'ARQUIVADO' && s !== 'ARQUIVADO') matchesStatus = false;
    }

    let matchesCompany = true;
    if (companyFilter !== 'ALL') {
      // Mocking exact match
      if (p.empresa !== companyFilter) matchesCompany = false;
    }

    return matchesSearch && matchesStatus && matchesCompany;
  }), [mappedProducts, searchQuery, statusFilter, companyFilter]);

  const timelineItems = useMemo(() => {
    return filteredProducts.map(prod => {
      let startDate = '';
      let endDate = '';
      
      const tags = prod.tags && Array.isArray(prod.tags) ? prod.tags : [];
      const startTag = tags.find((t: string) => t.startsWith('start:'));
      const endTag = tags.find((t: string) => t.startsWith('end:'));
      
      if (startTag) startDate = startTag.replace('start:', '');
      if (endTag) endDate = endTag.replace('end:', '');
      
      if (!startDate) {
        const today = new Date();
        startDate = today.toISOString().split('T')[0];
        const nextMonth = new Date();
        nextMonth.setDate(today.getDate() + 30);
        endDate = nextMonth.toISOString().split('T')[0];
      }
      
      if (!endDate) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + 30);
        endDate = d.toISOString().split('T')[0];
      }

      return {
        id: prod.id,
        name: prod.name,
        startDate,
        endDate,
        status: prod.status || 'PLANEJAMENTO',
        statusLabel: prod.status || 'Planejamento',
        priority: 'Média',
        assignee: prod.empresa || '-',
        progress: prod.projectsCount ? Math.min(100, prod.projectsCount * 25) : 30,
        dependencies: [],
        rawItem: prod
      } as TimelineItem;
    });
  }, [filteredProducts]);

  const kanbanItems: KanbanItem[] = useMemo(() => {
    return filteredProducts.map(i => {
      const mappedStatus = i.status?.toUpperCase() === 'EM DESENVOLVIMENTO' ? 'Em Desenvolvimento' : i.status;
      return {
        id: i.id,
        title: i.name,
        subtitle: i.empresa || 'Empresa',
        owner: i.empresa || '-',
        priority: 'Média',
        progress: i.projectsCount ? Math.min(100, i.projectsCount * 25) : 30,
        status: mappedStatus,
        raw: i
      };
    });
  }, [filteredProducts]);

  const handleDropKanban = async (e: React.DragEvent, colId: string) => {
    const prodId = e.dataTransfer.getData('itemId');
    if (!prodId) return;

    const reverseStatusMap: Record<string, string> = {
      'Planejamento': 'Planejamento',
      'Em Desenvolvimento': 'Em Desenvolvimento',
      'Beta': 'Beta',
      'Produção': 'Produção'
    };

    const newStatus = reverseStatusMap[colId] || colId;

    // Optimistic Update
    setProducts(prev => prev.map(i => i.id === prodId ? { ...i, status: newStatus } : i));

    try {
      await fetchWithAuth(`/api/products/${prodId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch(err) {
      console.error(err);
      fetchData(); // Revert
    }
  };

  const handleUpdateProduct = async (updated: any) => {
    try {
       const res = await fetchWithAuth(`/api/products/${updated.id}`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ name: updated.name, description: updated.desc, status: updated.status, companyId: updated.companyId })
       });
       if(res.ok) fetchData();
    } catch(e) { console.error(e) }
    setSelectedProduct(null);
  };

  const handleAddProduct = async (newProd: any) => {
    try {
      const res = await fetchWithAuth(`/api/products`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ name: newProd.name, description: newProd.desc, status: newProd.status, companyId: newProd.companyId })
      });
      if(res.ok) fetchData();
    } catch(e) { console.error(e) }
    setIsNewModalOpen(false);
  };

  const activeCount = products.filter(p => p.status === 'Produção').length;
  const devCount = products.filter(p => p.status === 'Em Desenvolvimento' || p.status === 'Desenvolvimento').length;

  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  if (isProductsLoading) {
    return <SkeletonKanban />;
  }

  return (
    <div className="w-full mx-auto pb-12 flex flex-col gap-10 animate-in fade-in duration-500 relative px-4 sm:px-6 lg:px-10">
      <StandardHeader 
        title="Produtos"
        subtitle="Gerencie o portfólio de softwares, plataformas e soluções digitais do ecossistema."
        actions={[
          {
            label: 'Novo Produto',
            icon: Plus,
            onClick: () => setIsNewModalOpen(true),
            variant: 'primary'
          }
        ]}
      />
      
      <ProductStats 
        totalProducts={products.length}
        activeProducts={activeCount}
        devProducts={devCount}
        totalProjects={projectsList.length}
      />

      <main className="grid grid-cols-1 xl:grid-cols-5 gap-6 sm:gap-8 items-start">
        <section className="xl:col-span-4 flex flex-col gap-5">
          <BoardToolbar 
            innerSearch={searchQuery}
            setInnerSearch={setSearchQuery}
            viewMode={viewMode as any}
            setViewMode={setViewMode as any}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            clientFilter={companyFilter}
            setClientFilter={setCompanyFilter}
            clients={companies}
          />
          
          <div className="w-full overflow-hidden">
            {viewMode === 'kanban' && (
              <BoardKanban 
                columns={PRODUTOS_COLUMNS}
                items={kanbanItems}
                onDrop={handleDropKanban}
                onItemClick={setSelectedProduct}
                onAddClick={() => setIsNewModalOpen(true)}
                emptyMessage="Nenhum produto nesta etapa."
              />
            )}

            {viewMode === 'list' && (
              <BoardList 
                columns={[
                  { key: 'title', label: 'Produto' },
                  { key: 'empresa', label: 'Cliente' },
                  { key: 'status', label: 'Status' },
                  { key: 'progress', label: 'Progresso' }
                ]}
                items={filteredProducts}
                onItemClick={setSelectedProduct}
                renderCell={(item, colKey) => {
                  if (colKey === 'title') return <div className="font-bold text-neutral-900">{item.name}</div>;
                  if (colKey === 'empresa') return <div className="text-slate-600 font-semibold">{item.empresa || '-'}</div>;
                  if (colKey === 'status') {
                    const mappedStatus = item.status?.toUpperCase() === 'EM DESENVOLVIMENTO' ? 'Em Desenvolvimento' : item.status;
                    const col = PRODUTOS_COLUMNS.find(c => c.id === mappedStatus);
                    return <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${col?.badge || 'bg-slate-100 text-slate-600'}`}>{col?.label || item.status}</span>;
                  }
                  if (colKey === 'progress') {
                     const progress = item.projectsCount ? Math.min(100, item.projectsCount * 25) : 30;
                     return <span className="text-slate-500">{progress}%</span>;
                  }
                  return null;
                }}
              />
            )}

            {(viewMode === 'timeline' || viewMode === 'gantt') && (
              <div className="w-full bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
                <TimelineView 
                  items={timelineItems}
                  onUpdateItemDates={handleUpdateProductDates}
                  onItemClick={(rawItem) => setSelectedProduct(rawItem)}
                  onDeleteItem={(productId) => {
                    setProducts(prev => prev.filter(p => p.id !== productId));
                  }}
                  title="Linha do Tempo dos Produtos"
                  emptyMessage="Nenhum produto cadastrado para exibir na linha do tempo."
                />
              </div>
            )}
          </div>
        </section>
        
        <section className="flex flex-col gap-6 text-left xl:col-span-1">
          <ProductActivity />
          <ProductEvents />
        </section>
      </main>

      <ProductActionBar selectedCount={selectedIds.length} onClear={() => setSelectedIds([])} />

      <ProductDetailsModal 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        onSave={handleUpdateProduct}
        onDelete={() => setSelectedProduct(null)}
        companies={companies}
      />
      
      <NewProductModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSave={handleAddProduct}
        companies={companies}
      />
    </div>
  );
}
