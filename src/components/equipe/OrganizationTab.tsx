import { Building2, Users, Workflow } from 'lucide-react';

const orgNodes = [
  { label: 'Empresa', depth: 0 },
  { label: 'Tecnologia', depth: 1 },
  { label: 'Financeiro', depth: 1 },
  { label: 'Vendas', depth: 1 },
  { label: 'Backend', depth: 2 },
  { label: 'Frontend', depth: 2 },
  { label: 'Compliance', depth: 2 },
  { label: 'Gestão', depth: 2 },
];

export default function OrganizationTab() {
  return (
    <div className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Organograma</p>
          <h3 className="mt-2 text-xl font-black text-slate-900">Estrutura da organização</h3>
        </div>
        <Workflow className="text-slate-400" size={20} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {orgNodes.map((node) => (
          <div key={node.label} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white border border-slate-200 p-2">
                {node.depth === 0 ? <Building2 size={16} /> : node.depth === 1 ? <Users size={16} /> : <Workflow size={16} />}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Nível {node.depth}</p>
                <p className="mt-1 text-sm font-black text-slate-900">{node.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
