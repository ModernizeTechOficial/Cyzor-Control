import { useState, useEffect } from 'react';
import { Key, Plus, CheckCircle2, XCircle, Clock, MoreHorizontal, ExternalLink } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';

export default function LicencasTab({ product }: any) {
  const { fetchWithAuth } = useAuth();
  const [licenses, setLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  
  const [newLicense, setNewLicense] = useState({
    companyId: '',
    type: 'Comercial',
    expiresAt: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [licRes, compRes] = await Promise.all([
        fetchWithAuth(`/api/products/${product.id}/licenses`),
        fetchWithAuth('/api/companies')
      ]);
      
      if (licRes.ok) setLicenses(await licRes.json());
      if (compRes.ok) setCompanies(await compRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (product?.id) fetchData();
  }, [product?.id]);

  const handleAddLicense = async () => {
    try {
      const res = await fetchWithAuth(`/api/products/${product.id}/licenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLicense)
      });
      if (res.ok) {
        fetchData();
        setIsAdding(false);
        setNewLicense({ companyId: '', type: 'Comercial', expiresAt: '' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center text-[#64748B] text-sm font-medium">Carregando licenças...</div>;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-[#111111]">Licenças de Uso</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-[#111111] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-black transition-all"
        >
          <Plus size={16} /> {isAdding ? 'Cancelar' : 'Nova Licença'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-2xl p-6 flex flex-col gap-4 animate-in slide-in-from-top-4 duration-300">
          <h3 className="font-bold text-[#111111] text-sm uppercase tracking-widest mb-2">Configurar Nova Licença</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Cliente / Empresa</label>
              <select 
                value={newLicense.companyId}
                onChange={e => setNewLicense({...newLicense, companyId: e.target.value})}
                className="w-full h-11 px-4 rounded-xl border border-[#0F172A0F] bg-white text-sm font-bold text-[#111111] focus:ring-2 focus:ring-[#111111] transition-all"
              >
                <option value="">Selecione um cliente</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Tipo</label>
              <select 
                value={newLicense.type}
                onChange={e => setNewLicense({...newLicense, type: e.target.value})}
                className="w-full h-11 px-4 rounded-xl border border-[#0F172A0F] bg-white text-sm font-bold text-[#111111] focus:ring-2 focus:ring-[#111111] transition-all"
              >
                <option value="Comercial">Comercial</option>
                <option value="Trial">Trial (Avaliação)</option>
                <option value="Demo">Demonstração</option>
                <option value="Educacional">Educacional</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Expiração</label>
              <input 
                type="date"
                value={newLicense.expiresAt}
                onChange={e => setNewLicense({...newLicense, expiresAt: e.target.value})}
                className="w-full h-11 px-4 rounded-xl border border-[#0F172A0F] bg-white text-sm font-bold text-[#111111] focus:ring-2 focus:ring-[#111111] transition-all"
              />
            </div>
          </div>
          <div className="flex justify-end mt-2">
            <button 
              onClick={handleAddLicense}
              className="bg-[#111111] text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-black transition-all"
            >
              Gerar Chave de Licença
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-[#0F172A0F] rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-[#0F172A0F] text-[11px] font-bold uppercase text-[#64748B] tracking-widest">
                <th className="py-4 px-6">Chave de Licença</th>
                <th className="py-4 px-6">Cliente</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Tipo</th>
                <th className="py-4 px-6">Expiração</th>
                <th className="py-4 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0F172A05]">
              {licenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#64748B] font-medium text-sm">
                    Nenhuma licença emitida para este produto.
                  </td>
                </tr>
              ) : (
                licenses.map((lic: any) => (
                  <tr key={lic.id} className="hover:bg-[#FAFAFA]/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                          <Key size={14} />
                        </div>
                        <span className="font-mono text-xs font-bold text-[#111111]">{lic.key}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-sm text-[#111111]">{lic.companyName || 'N/A'}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5">
                        {lic.status === 'Ativa' ? (
                          <div className="flex items-center gap-1.5 text-emerald-600">
                            <CheckCircle2 size={14} />
                            <span className="text-xs font-bold uppercase tracking-wider">Ativa</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-red-600">
                            <XCircle size={14} />
                            <span className="text-xs font-bold uppercase tracking-wider">{lic.status}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-[#FAFAFA] border border-[#0F172A0F] px-2 py-1 rounded-md text-[#64748B]">
                        {lic.type}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-[#64748B]">
                        <Clock size={14} />
                        <span className="text-sm font-medium">
                          {lic.expiresAt ? new Date(lic.expiresAt).toLocaleDateString() : 'Perpétua'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="p-2 text-[#64748B] hover:text-[#111111] hover:bg-[#FAFAFA] rounded-lg transition-colors">
                           <ExternalLink size={16} />
                         </button>
                         <button className="p-2 text-[#64748B] hover:text-[#111111] hover:bg-[#FAFAFA] rounded-lg transition-colors">
                           <MoreHorizontal size={16} />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
