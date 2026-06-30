import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext.tsx';
import { Users, Search, Filter, MoreVertical, ShieldCheck } from 'lucide-react';

export default function UsersAdminView() {
  const { fetchWithAuth } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetchWithAuth('/api/admin/users');
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (error) {
        console.error("Failed to load users", error);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, [fetchWithAuth]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Usuários Globais</h1>
          <p className="text-sm text-gray-500 font-medium">Gestão de todos os usuários da plataforma.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar usuários..." 
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
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status Admin</th>
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">Nenhum usuário encontrado.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={u.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`} alt={u.displayName} className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 shrink-0" />
                        <span className="font-semibold text-gray-900">{u.displayName || 'Sem nome'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                        {u.role || 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.isPlatformAdmin ? (
                        <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-xs bg-indigo-50 px-2.5 py-1 rounded-full w-max border border-indigo-100">
                          <ShieldCheck size={14} />
                          Admin
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs font-medium">Não</span>
                      )}
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
