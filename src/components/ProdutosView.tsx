import { useState, useEffect, useMemo } from 'react';
import ProductDetailsModal from './ProductDetailsModal';
import NewProductModal from './NewProductModal';
import { useAuth } from '../context/AuthContext';

import StandardHeader from './layout/StandardHeader';
import { Plus } from 'lucide-react';
import ProductStats from './produtos/ProductStats';
import ProductFilters from './produtos/ProductFilters';
import ProductGrid from './produtos/ProductGrid';
import ProductTable from './produtos/ProductTable';
import ProductKanban from './produtos/ProductKanban';
import ProductActivity from './produtos/ProductActivity';
import ProductEvents from './produtos/ProductEvents';
import ProductActionBar from './produtos/ProductActionBar';
import TimelineView, { TimelineItem } from './common/TimelineView';

export default function ProdutosView() {
  const [products, setProducts] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'kanban' | 'timeline'>('grid');
  
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

  const filteredProducts = mappedProducts.filter(p => {
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
  });

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

      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          <ProductFilters 
            searchTerm={searchQuery} setSearchTerm={setSearchQuery}
            statusFilter={statusFilter} setStatusFilter={setStatusFilter}
            companyFilter={companyFilter} setCompanyFilter={setCompanyFilter}
            viewMode={viewMode} setViewMode={setViewMode}
            companies={companies}
          />
          
          {viewMode === 'grid' && (
            <ProductGrid 
              products={filteredProducts} 
              onSelect={(p) => setSelectedProduct(p)} 
              onEdit={(p, e) => { e.stopPropagation(); setSelectedProduct(p); }}
              selectedIds={selectedIds}
              toggleSelection={toggleSelection}
            />
          )}

          {viewMode === 'table' && (
            <ProductTable 
              products={filteredProducts} 
              onSelect={(p) => setSelectedProduct(p)} 
              onEdit={(p, e) => { e.stopPropagation(); setSelectedProduct(p); }}
              selectedIds={selectedIds}
              toggleSelection={toggleSelection}
            />
          )}

          {viewMode === 'kanban' && (
            <ProductKanban 
              products={filteredProducts} 
              onSelect={(p) => setSelectedProduct(p)} 
              onRefresh={fetchData}
              setProducts={setProducts}
            />
          )}

          {viewMode === 'timeline' && (
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
        
        <div className="w-full xl:w-[380px] shrink-0 flex flex-col gap-8">
          <ProductActivity />
          <ProductEvents />
        </div>
      </div>

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
