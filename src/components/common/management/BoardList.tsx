import React from 'react';

interface ListColumn {
  key: string;
  label: string;
}

interface BoardListProps {
  columns: ListColumn[];
  items: any[];
  onItemClick: (item: any) => void;
  renderCell: (item: any, columnKey: string) => React.ReactNode;
  emptyMessage?: string;
}

export default function BoardList({
  columns,
  items,
  onItemClick,
  renderCell,
  emptyMessage = "Nenhum item encontrado."
}: BoardListProps) {
  return (
    <div className="bg-white rounded-[20px] border border-[#0F172A0F] overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-[#0F172A0F] text-[9px] font-extrabold text-[#64748B] uppercase tracking-wider">
              {columns.map(col => (
                <th key={col.key} className="py-3 px-4">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0F172A05]">
            {items.map((item, idx) => (
              <tr 
                key={item.id || idx} 
                onClick={() => onItemClick(item)}
                className="hover:bg-slate-50/50 cursor-pointer text-[11px] font-semibold text-[#111111] transition-colors"
              >
                {columns.map(col => (
                  <td key={col.key} className="py-3 px-4">
                    {renderCell(item, col.key)}
                  </td>
                ))}
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-slate-400 font-bold text-xs">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
