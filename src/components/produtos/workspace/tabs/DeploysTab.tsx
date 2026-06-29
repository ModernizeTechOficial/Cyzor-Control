import { useState, useEffect } from 'react';
import { Play, CheckCircle2, AlertCircle, Clock, Terminal } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';

export default function DeploysTab({ product }: any) {
  const { token } = useAuth();
  const [deploys, setDeploys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!product?.id || !token) return;

    fetch(`/api/deploys?productId=${product.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDeploys(data);
        }
      })
      .catch(err => console.error("Error fetching deploys:", err))
      .finally(() => setLoading(false));
  }, [product?.id, token]);

  const handleNewDeploy = async () => {
    const version = prompt("Digite a versão (ex: v2.5.0):");
    if (!version) return;

    try {
      const res = await fetch(`/api/deploys`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          productId: product.id,
          version,
          status: Math.random() > 0.2 ? 'success' : 'failed', // Simulate sometimes failing
          duration: `${Math.floor(Math.random() * 3) + 1}m ${Math.floor(Math.random() * 60)}s`,
          logs: 'Starting deployment...\nBuilding assets...\nDeploy successful!'
        })
      });
      const newDeploy = await res.json();
      setDeploys(prev => [newDeploy, ...prev]);
    } catch (err) {
      console.error("Error creating deploy:", err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[#64748B] text-sm font-medium">Carregando deploys...</div>;
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-[#111111]">Histórico de Deploys</h2>
          <p className="text-sm font-medium text-[#64748B] mt-1">Acompanhe as últimas atualizações do produto.</p>
        </div>
        <button onClick={handleNewDeploy} className="flex items-center gap-2 bg-[#111111] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-black transition-all">
          <Play size={16} className="fill-current" /> Novo Deploy
        </button>
      </div>

      <div className="flex flex-col gap-0 relative before:absolute before:inset-y-4 before:left-[27px] before:w-[2px] before:bg-[#0F172A05]">
        {deploys.length === 0 ? (
          <div className="text-center text-[#64748B] text-sm font-medium py-8 pl-12">
            Nenhum deploy encontrado para este produto.
          </div>
        ) : (
          deploys.map((dep, i) => {
            const dateStr = new Date(dep.createdAt).toLocaleString();
            const userName = dep.userName || dep.userUid || 'Sistema';
            const initials = userName.slice(0,2).toUpperCase();

            return (
              <div key={dep.id} className="flex gap-6 relative z-10 group pb-8 last:pb-0">
                <div className={`w-14 h-14 rounded-2xl bg-white border-4 border-[#FAFAFA] flex items-center justify-center shrink-0 shadow-sm ${dep.status === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {dep.status === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                </div>
                
                <div className="flex-1 bg-white border border-[#0F172A0F] rounded-[20px] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] group-hover:border-[#0F172A15] group-hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-[#111111] text-lg">{dep.version}</h3>
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${dep.status === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {dep.status === 'success' ? 'Sucesso' : 'Falhou'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold text-[#64748B]">
                      <span className="flex items-center gap-1.5"><Clock size={14} /> {dateStr}</span>
                      <span className="flex items-center gap-1.5"><Terminal size={14} /> {dep.duration || '0s'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-[#0F172A05] pt-4 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 border border-white flex items-center justify-center text-[8px] font-bold text-slate-500">{initials}</div>
                      <span className="text-xs font-semibold text-[#111111]">Por {userName}</span>
                    </div>
                    <button className="text-xs font-bold text-[#111111] bg-[#FAFAFA] hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors">
                      Ver Logs
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
    </div>
  );
}
