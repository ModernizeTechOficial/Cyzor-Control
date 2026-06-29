import { useState, useEffect } from 'react';
import { Server, Activity, Clock, Terminal, GitBranch, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function WorkspaceSidebar({ product }: { product: any }) {
  const { token } = useAuth();
  const [recentDeploys, setRecentDeploys] = useState<any[]>([]);

  useEffect(() => {
    if (!product?.id || !token) return;

    fetch(`/api/deploys?productId=${product.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRecentDeploys(data.slice(0, 3)); // just top 3
        }
      })
      .catch(err => console.error("Error fetching deploys:", err));
  }, [product?.id, token]);

  return (
    <div className="flex flex-col gap-6 w-full animate-in slide-in-from-right-8 duration-500">
      
      {/* Environment Status */}
      <div className="bg-white border border-[#0F172A0F] rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#64748B] mb-5 flex items-center gap-2">
          <Server size={14} /> Ambientes
        </h3>
        
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100/50">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-sm text-emerald-900">Produção</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">Online</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-100/50">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="font-bold text-sm text-blue-900">Homologação</span>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-md">Online</span>
          </div>
        </div>
      </div>

      {/* Últimas Atividades */}
      <div className="bg-white border border-[#0F172A0F] rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#64748B] mb-5 flex items-center gap-2">
          <Clock size={14} /> Histórico Rápido
        </h3>
        
        <div className="flex flex-col gap-4 relative before:absolute before:inset-y-2 before:left-[15px] before:w-0.5 before:bg-[#FAFAFA]">
          
          {recentDeploys.length === 0 ? (
            <div className="text-xs text-[#64748B]">Nenhuma atividade recente.</div>
          ) : (
            recentDeploys.map(dep => (
              <div key={dep.id} className="flex gap-4 relative z-10">
                <div className={`w-8 h-8 rounded-full bg-white border-2 flex items-center justify-center shrink-0 ${dep.status === 'success' ? 'border-emerald-500' : 'border-red-500'}`}>
                  {dep.status === 'success' ? <CheckCircle2 size={12} className="text-emerald-500" /> : <AlertCircle size={12} className="text-red-500" />}
                </div>
                <div className="pt-1.5">
                  <p className="text-sm font-bold text-[#111111] leading-none">Deploy {dep.status === 'success' ? 'Concluído' : 'Falhou'}</p>
                  <p className="text-xs text-[#64748B] font-medium mt-1">{dep.version}</p>
                  <span className="text-[10px] font-bold text-[#64748B] mt-1.5 block">{new Date(dep.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}

        </div>
      </div>

    </div>
  );
}
