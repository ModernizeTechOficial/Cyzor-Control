import { useState, useEffect } from 'react';
import { Users, Mail, Phone, Building2, ExternalLink, Search, Filter } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';

export default function ClientesTab({ product }: any) {
  const { fetchWithAuth } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!product?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        // Get all clients and companies to filter
        const [cliRes, compRes] = await Promise.all([
          fetchWithAuth('/api/clients'),
          fetchWithAuth('/api/companies')
        ]);
        
        if (cliRes.ok && compRes.ok) {
          const allClients = await cliRes.json();
          const allCompanies = await compRes.json();
          
          // Filter companies that have this product
          // (In a real system we'd have a many-to-many or specific linking)
          // For now, let's filter by product.companyId or companies that have projects of this product
          const projRes = await fetchWithAuth('/api/projects');
          const allProjects = await projRes.json();
          const productCompanyIds = [
            product.companyId,
            ...allProjects.filter((p: any) => p.productId === product.id).map((p: any) => p.companyId)
          ].filter(Boolean);

          const uniqueCompanyIds = [...new Set(productCompanyIds)];
          
          setClients(allClients.filter((c: any) => uniqueCompanyIds.includes(c.companyId)));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [product?.id]);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-[#64748B] text-sm font-medium">Carregando clientes...</div>;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-display font-bold text-[#111111]">Stakeholders & Clientes</h2>
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={16} />
            <input 
              type="text" 
              placeholder="Buscar stakeholders..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#0F172A0F] bg-white text-sm font-medium focus:ring-2 focus:ring-[#111111] transition-all"
            />
          </div>
          <button className="h-11 w-11 rounded-xl border border-[#0F172A0F] bg-white flex items-center justify-center text-[#64748B] hover:text-[#111111] transition-all">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.length === 0 ? (
          <div className="col-span-full py-20 bg-white border border-dashed border-[#0F172A1F] rounded-[32px] flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#FAFAFA] flex items-center justify-center text-[#64748B] mb-4">
              <Users size={32} />
            </div>
            <h3 className="font-bold text-[#111111]">Nenhum cliente encontrado</h3>
            <p className="text-sm text-[#64748B] max-w-xs mt-1">Clientes vinculados às empresas que utilizam este produto aparecerão aqui.</p>
          </div>
        ) : (
          filteredClients.map((client) => (
            <div key={client.id} className="bg-white border border-[#0F172A0F] rounded-[24px] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all group relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-[#0F172A05] flex items-center justify-center text-[#111111] font-display font-bold text-lg">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#111111] group-hover:text-blue-600 transition-colors">{client.name}</h3>
                    <p className="text-xs font-semibold text-[#64748B] flex items-center gap-1">
                      <Building2 size={12} /> {client.companyName}
                    </p>
                  </div>
                </div>
                <button className="p-2 text-[#64748B] hover:text-[#111111] transition-colors">
                  <ExternalLink size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm text-[#64748B] font-medium">
                  <Mail size={14} />
                  <span className="truncate">{client.email || 'Não informado'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#64748B] font-medium">
                  <Phone size={14} />
                  <span>{client.phone || 'Não informado'}</span>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-[#0F172A05] flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${
                  client.status === 'Ativo' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {client.status}
                </span>
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">{client.role || 'Stakeholder'}</span>
              </div>
            </div>
          ))
        )}
      </div>
      
    </div>
  );
}
