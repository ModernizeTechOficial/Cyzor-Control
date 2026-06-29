import { useState, useEffect } from 'react';
import { Plus, GitBranch, MoreHorizontal, Globe } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';

export default function ProjetosTab({ product }: any) {
  const { token } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!product?.id || !token) return;

    fetch(`/api/projects`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Filter projects by this product's ID
          setProjects(data.filter(p => p.productId === product.id));
        }
      })
      .catch(err => console.error("Error fetching projects for product:", err))
      .finally(() => setLoading(false));
  }, [product?.id, token]);

  if (loading) {
    return <div className="p-8 text-center text-[#64748B] text-sm font-medium">Carregando projetos...</div>;
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-[#111111]">Projetos Vinculados</h2>
        <button className="flex items-center gap-2 bg-[#111111] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-black transition-all">
          <Plus size={16} /> Novo Projeto
        </button>
      </div>

      <div className="bg-white border border-[#0F172A0F] rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-[#0F172A0F] text-[11px] font-bold uppercase text-[#64748B] tracking-widest">
                <th className="py-4 px-6">Nome</th>
                <th className="py-4 px-6">Cliente / Empresa</th>
                <th className="py-4 px-6">Progresso</th>
                <th className="py-4 px-6">Responsável</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Data de Entrega</th>
                <th className="py-4 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0F172A05]">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#64748B] font-medium text-sm">
                    Nenhum projeto vinculado a este produto.
                  </td>
                </tr>
              ) : (
                projects.map((p: any) => (
                  <tr key={p.id} className="hover:bg-[#FAFAFA]/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#FAFAFA] border border-[#0F172A0F] flex items-center justify-center text-[#111111]">
                          <GitBranch size={14} />
                        </div>
                        <span className="font-bold text-sm text-[#111111] group-hover:text-blue-600 transition-colors">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-[#111111]">{p.companyName || 'Interno'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 rounded-full bg-[#0F172A0F] overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${p.progress || 0}%` }} />
                        </div>
                        <span className="text-xs font-bold text-[#64748B]">{p.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xs font-bold bg-[#FAFAFA] border border-[#0F172A0F] px-2 py-1 rounded-md text-[#111111]">
                        {p.owner || 'Sem dono'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${p.status === 'Concluído' ? 'bg-emerald-500' : p.status === 'Em Andamento' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                        <span className="text-sm font-semibold text-[#111111]">{p.status}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-[#64748B]">{p.dueDate ? new Date(p.dueDate).toLocaleDateString() : 'Não definida'}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="p-2 text-[#64748B] hover:text-[#111111] hover:bg-[#FAFAFA] rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <MoreHorizontal size={16} />
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
