import { useState, useEffect, useMemo } from 'react';
import MetricCard from './MetricCard';
import ProductDetailsModal from './ProductDetailsModal';
import NewProductModal from './NewProductModal';
import { useAuth } from '../context/AuthContext';
import { Package, Search, Filter, Plus, ArrowDownToLine, CheckCircle2, FlaskConical, DollarSign, Clock, LayoutGrid, CalendarDays } from 'lucide-react';

export default function ProdutosView() {
  const [products, setProducts] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
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
        companyName: company ? company.name : 'N/A', // fallback
        desc: p.description,
        projectsCount: linkedProjects.length,
        revenue: 'R$ 0,00', // As revenue is not explicitly tied to product, we simplify to 0 or require complex join later
        logo: p.name ? p.name.charAt(0).toUpperCase() : 'P',
        updated: new Date(p.updatedAt || p.createdAt || Date.now()).toLocaleDateString()
      };
    });
  }, [products, companies, projectsList]);

  const filteredProducts = mappedProducts.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.empresa?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

    return (
      <div className="flex flex-col gap-6 md:gap-10 text-left">
        {/* Header */}
        <section className="relative flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#111111] mb-2 tracking-tight">Produtos</h1>
            <p className="text-[#64748B] text-base sm:text-lg font-medium tracking-wide">Gerencie todos os produtos, plataformas e soluções do ecossistema.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button className="bg-[#FFFFFF] text-[#111111] px-5 py-3 rounded-[14px] font-bold text-sm tracking-wide border border-[#0F172A0F] hover:bg-[#FAFAFA] transition-all flex items-center justify-center gap-2">
              <ArrowDownToLine size={18} />
              Importar Produto
            </button>
            <button onClick={() => setIsNewModalOpen(true)} className="bg-[#111111] text-white px-6 py-3 rounded-[14px] font-bold text-sm tracking-wide shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:bg-black transition-all flex items-center justify-center gap-2">
              <Plus size={18} />
              Novo Produto
            </button>
          </div>
        </section>

      {/* Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard title="Total de Produtos" value={products.length.toString()} icon={Package} />
        <MetricCard title="Produtos Ativos" value={activeCount.toString()} icon={CheckCircle2} />
        <MetricCard title="Em Desenvolvimento" value={devCount.toString()} icon={FlaskConical} />
        <MetricCard title="Receita Consolidada" value="R$ 0,00" sub="Mensal" icon={DollarSign} />
      </section>

      {/* Filters & Search */}
      <section className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative group flex-1 w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#111111] transition-colors" size={20} />
          <input 
              type="text"
              placeholder="Pesquisar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#0F172A0F] rounded-[16px] py-3.5 pl-12 pr-4 outline-none focus:border-[#111111]/30 hover:border-[#0F172A0F]-dark transition-all text-[#111111] font-medium placeholder:text-[#64748B]/50 shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
          />
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <FilterButton label="Empresa" />
          <FilterButton label="Status" />
          <FilterButton label="Categoria" />
        </div>
      </section>

      {/* Products Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} onClick={() => setSelectedProduct(product)} />
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-10 text-center text-[#64748B]">Nenhum produto encontrado.</div>
        )}
      </section>

      {/* Product Details Modal */}
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

function FilterButton({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-2 px-4 py-2.5 bg-[#FFFFFF] border border-[#0F172A0F] rounded-[12px] text-xs font-bold text-[#64748B] hover:bg-[#FAFAFA] hover:text-[#111111] transition-colors shadow-sm">
      {label}
      <Filter size={14} />
    </button>
  );
}

function ProductCard({ product, onClick }: { product: any, onClick: () => void }) {
  const getStatusColor = (status: string) => {
    if(!status) return 'bg-[#FAFAFA] border-[#0F172A0F] text-[#64748B]';
    switch (status.toLowerCase()) {
      case 'produção': return 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20';
      case 'em desenvolvimento':
      case 'desenvolvimento': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'beta': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'planejamento': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      default: return 'bg-[#FAFAFA] border-[#0F172A0F] text-[#64748B]';
    }
  };

  return (
    <div 
      onClick={onClick}
      className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[24px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-all cursor-pointer group flex flex-col gap-4 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#111111]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-[16px] bg-[#111111] text-white flex items-center justify-center font-display font-bold text-xl shadow-md">
            {product.logo}
          </div>
          <div>
            <h3 className="font-bold text-[#111111] text-lg group-hover:text-black transition-colors line-clamp-1">{product.name}</h3>
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">{product.empresa}</span>
          </div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${getStatusColor(product.status)}`}>
          {product.status || 'N/A'}
        </span>
      </div>

      <p className="text-sm text-[#475569] leading-relaxed line-clamp-2 min-h-[40px]">
        {product.desc || '-'}
      </p>

      <div className="grid grid-cols-2 gap-3 mt-2 border-t border-[#0F172A0F] pt-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-widest flex items-center gap-1"><LayoutGrid size={12} /> Projetos</span>
          <span className="text-sm font-semibold text-[#111111]">{product.projectsCount || 0} Vinculados</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-widest flex items-center gap-1"><DollarSign size={12} /> Receita (Mês)</span>
          <span className="text-sm font-semibold text-[#111111]">{product.revenue}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 text-[10px] font-bold text-[#64748B] mt-2 bg-[#FAFAFA] border border-[#0F172A0F] w-fit px-2 py-1 rounded-md">
        <Clock size={12} /> Atualizado: {product.updated}
      </div>
    </div>
  );
}
