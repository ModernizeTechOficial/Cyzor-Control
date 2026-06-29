import { useState, useEffect, useMemo } from 'react';
import ProductDetailsModal from './ProductDetailsModal';
import NewProductModal from './NewProductModal';
import { useAuth } from '../context/AuthContext';

import ProductHeader from './produtos/ProductHeader';
import ProductStats from './produtos/ProductStats';
import ProductFilters from './produtos/ProductFilters';
import ProductGrid from './produtos/ProductGrid';
import ProductTable from './produtos/ProductTable';
import ProductKanban from './produtos/ProductKanban';
import ProductAnalytics from './produtos/ProductAnalytics';
import ProductActivity from './produtos/ProductActivity';
import ProductEvents from './produtos/ProductEvents';
import ProductMetrics from './produtos/ProductMetrics';
import ProductActionBar from './produtos/ProductActionBar';

export default function ProdutosView() {
  const [products, setProducts] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'kanban'>('grid');
  
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const { fetchWithAuth, activeWorkspace } = useAuth();

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
        empresa: company ? company.name : 'N/A',
        companyName: company ? company.name : 'N/A',
        desc: p.description,
        projectsCount: linkedProjects.length,
        revenue: 'R$ 0,00',
        logo: p.name ? p.name.charAt(0).toUpperCase() : 'P',
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
    <div className="w-full max-w-[1400px] mx-auto pb-12 flex flex-col gap-8 animate-in fade-in duration-500 relative">
      <ProductHeader onNewProduct={() => setIsNewModalOpen(true)} />
      
      <ProductStats 
        totalProducts={products.length}
        activeProducts={activeCount}
        devProducts={devCount}
        totalProjects={projectsList.length}
      />

      <ProductAnalytics />

      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1 flex flex-col gap-6">
          <ProductFilters 
            searchTerm={searchQuery} setSearchTerm={setSearchQuery}
            statusFilter={statusFilter} setStatusFilter={setStatusFilter}
            companyFilter={companyFilter} setCompanyFilter={setCompanyFilter}
            viewMode={viewMode} setViewMode={setViewMode}
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
            />
          )}
        </div>
        
        <div className="w-full xl:w-[380px] shrink-0 flex flex-col gap-8">
          <ProductMetrics />
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
