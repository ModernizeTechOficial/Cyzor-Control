import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext.tsx';
import { Building2, Search, Filter, MoreVertical } from 'lucide-react';

export default function TenantsAdminView() {
  const { fetchWithAuth } = useAuth();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTenants() {
      try {
        const res = await fetchWithAuth('/api/admin/tenants');
        if (res.ok) {
          const data = await res.json();
          setTenants(data);
        }
      } catch (error) {
        console.error("Failed to load tenants", error);
      } finally {
        setLoading(false);
      }
    }
    loadTenants();
  }, [fetchWithAuth]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Empresas (Tenants)</h1>
          <p className="text-sm text-gray-500 font-medium">Gerencie todas as empresas da plataforma.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-semibold text-sm shadow-sm transition-colors flex items-center gap-2">
          <Building2 size={16} />
          Nova Empresa
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar empresas..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            />
          </div>
          <button className="p-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 flex items-center gap-2 font-medium text-sm transition-colors bg-white">
            <Filter size={16} />
            Filtros
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100 font-bold">
              <tr>
                <th className="px-6 py-4">Tenant / Empresa</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Plano</th>
                <th className="px-6 py-4">Criado em</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                  </td>
                </tr>
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">Nenhuma empresa encontrada.</td>
                </tr>
              ) : (
                tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold uppercase shrink-0 border border-indigo-100">
                          {tenant.name?.charAt(0) || 'E'}
                        </div>
                        <span className="font-semibold text-gray-900">{tenant.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{tenant.slug}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100">
                        {tenant.plan || 'Free'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical size={16} />
                      </button>
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
