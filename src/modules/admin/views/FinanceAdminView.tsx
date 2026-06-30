import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext.tsx';
import { CreditCard, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function FinanceAdminView() {
  const { fetchWithAuth } = useAuth();
  const [finance, setFinance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFinance() {
      try {
        const res = await fetchWithAuth('/api/admin/finance');
        if (res.ok) {
          const data = await res.json();
          setFinance(data);
        }
      } catch (error) {
        console.error("Failed to load finance", error);
      } finally {
        setLoading(false);
      }
    }
    loadFinance();
  }, [fetchWithAuth]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Financeiro Global</h1>
          <p className="text-sm text-gray-500 font-medium">Fluxo de caixa agregado de toda a plataforma.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100 font-bold">
              <tr>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                  </td>
                </tr>
              ) : finance.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium">Nenhum registro financeiro encontrado.</td>
                </tr>
              ) : (
                finance.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{entry.description}</td>
                    <td className="px-6 py-4">
                      {entry.type === 'RECEITA' ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-full w-max border border-emerald-100">
                          <ArrowUpRight size={14} /> Receita
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-red-600 font-bold text-xs bg-red-50 px-2 py-1 rounded-full w-max border border-red-100">
                          <ArrowDownRight size={14} /> Despesa
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-medium text-gray-900">
                      R$ {Number(entry.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(entry.date).toLocaleDateString()}
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
