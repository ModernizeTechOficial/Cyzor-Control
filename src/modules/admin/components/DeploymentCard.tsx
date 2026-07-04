import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

export default function DeploymentCard({ metrics }: { metrics?: any }) {
  const transactions = metrics?.recentTransactions || [];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm w-full">
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 tracking-tight">
          Transações Recentes
        </h3>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-xs font-medium text-gray-600">Este Mês</span>
          <ChevronDown size={14} className="text-gray-400" />
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              <th className="px-5 py-4 font-medium">Descrição</th>
              <th className="px-5 py-4 font-medium">Data</th>
              <th className="px-5 py-4 font-medium">Tipo</th>
              <th className="px-5 py-4 font-medium">Valor</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-gray-500 font-medium text-xs">
                  Nenhuma transação recente.
                </td>
              </tr>
            ) : (
              transactions.map((tx: any) => (
                <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xs">
                        {tx.paymentMethod?.substring(0, 3)?.toUpperCase() || 'STR'}
                      </div>
                      <span className="font-semibold text-gray-900 text-sm tracking-tight">{tx.stripeInvoiceId || 'Pagamento Stripe'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500 font-medium text-xs">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                      tx.status === 'succeeded' 
                        ? 'bg-[#eefcf3] text-[#22c55e]' 
                        : 'bg-[#fef2f2] text-[#ef4444]'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-semibold text-gray-900 text-sm">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: tx.currency?.toUpperCase() || 'BRL' }).format(Number(tx.amount))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
