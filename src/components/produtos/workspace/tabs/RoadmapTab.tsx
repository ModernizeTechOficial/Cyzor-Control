import { useState, useEffect } from 'react';
import { Target, CheckCircle2, Clock, GitCommit } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';

export default function RoadmapTab({ product }: any) {
  const { token } = useAuth();
  const [roadmap, setRoadmap] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!product?.id || !token) return;

    const fetchRoadmap = async () => {
      try {
        setLoading(true);
        // First get projects for this product
        const projRes = await fetch(`/api/projects`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const projects = await projRes.json();
        if (!Array.isArray(projects)) throw new Error("Invalid projects data");
        const productProjectIds = projects.filter(p => p.productId === product.id).map(p => p.id);

        // Then get milestones
        const milRes = await fetch(`/api/milestones`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const milestones = await milRes.json();
        
        if (Array.isArray(milestones)) {
          const productMilestones = milestones
            .filter(m => productProjectIds.includes(m.projectId))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(m => ({
              id: m.id,
              title: m.name,
              status: m.status === 'CONCLUIDO' ? 'done' : m.status === 'EM ANDAMENTO' ? 'active' : 'planned',
              date: m.date ? new Date(m.date).toLocaleDateString() : 'Não definida',
              desc: m.description || ''
            }));
          setRoadmap(productMilestones);
        }
      } catch (error) {
        console.error("Error fetching roadmap:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [product?.id, token]);

  if (loading) {
    return <div className="p-8 text-center text-[#64748B] text-sm font-medium">Carregando roadmap...</div>;
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-[#111111]">Roadmap</h2>
      </div>

      <div className="bg-white border border-[#0F172A0F] rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        {roadmap.length === 0 ? (
          <div className="text-center text-[#64748B] text-sm font-medium py-8">
            Nenhum marco (milestone) encontrado para os projetos deste produto.
          </div>
        ) : (
          <div className="flex flex-col relative before:absolute before:inset-y-4 before:left-[19px] before:w-0.5 before:bg-[#0F172A0F]">
            
            {roadmap.map((item, i) => (
              <div key={item.id} className="flex gap-6 relative z-10 pb-10 last:pb-0 group">
                <div className={`w-10 h-10 rounded-full border-4 border-white flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 ${
                  item.status === 'done' ? 'bg-emerald-500 text-white' : 
                  item.status === 'active' ? 'bg-blue-500 text-white animate-pulse' : 
                  'bg-[#FAFAFA] border-[#0F172A0F] text-[#64748B]'
                }`}>
                  {item.status === 'done' ? <CheckCircle2 size={16} /> : 
                   item.status === 'active' ? <GitCommit size={16} /> : 
                   <Clock size={16} />}
                </div>
                
                <div className={`flex-1 pt-1 ${item.status === 'planned' ? 'opacity-60' : ''}`}>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className={`text-lg font-bold ${item.status === 'active' ? 'text-blue-600' : 'text-[#111111]'}`}>{item.title}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] bg-[#FAFAFA] px-2 py-0.5 rounded-md">
                      {item.date}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[#64748B]">{item.desc}</p>
                </div>
              </div>
            ))}

          </div>
        )}
      </div>
      
    </div>
  );
}
