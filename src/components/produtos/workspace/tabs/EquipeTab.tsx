import { useState, useEffect } from 'react';
import { User, Mail, Shield, MoreHorizontal, UserPlus, Github, Linkedin, Slack } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';

export default function EquipeTab({ product }: any) {
  const { fetchWithAuth } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        // For now, let's fetch workspace members and mock allocation to product
        const res = await fetchWithAuth('/api/workspace/members');
        if (res.ok) {
          const data = await res.json();
          // Adding mock roles/last active for visual flair
          setMembers(data.map((m: any) => ({
            ...m,
            role: m.role === 'OWNER' ? 'Product Owner' : (Math.random() > 0.5 ? 'Developer' : 'Designer'),
            lastActive: 'Ativo agora',
            allocation: '100%'
          })));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  if (loading) return <div className="p-8 text-center text-[#64748B] text-sm font-medium">Carregando equipe...</div>;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-[#111111]">Equipe de Produto</h2>
        <button className="flex items-center gap-2 bg-[#111111] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-black transition-all">
          <UserPlus size={16} /> Convidar Membro
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <div key={member.id} className="bg-white border border-[#0F172A0F] rounded-[24px] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all group relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-[#0F172A05] flex items-center justify-center overflow-hidden relative">
                   {member.userAvatar ? (
                     <img src={member.userAvatar} alt="" className="w-full h-full object-cover" />
                   ) : (
                     <User size={24} className="text-[#64748B]" />
                   )}
                   <div className="absolute bottom-1 right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-bold text-[#111111] group-hover:text-blue-600 transition-colors">{member.userName || 'Membro'}</h3>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#64748B] uppercase tracking-wider">
                     <Shield size={12} /> {member.role}
                  </div>
                </div>
              </div>
              <button className="p-2 text-[#64748B] hover:text-[#111111] transition-colors">
                <MoreHorizontal size={18} />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-5">
               <div className="flex-1">
                  <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Alocação</div>
                  <div className="h-1.5 w-full bg-[#FAFAFA] rounded-full overflow-hidden">
                     <div className="h-full bg-[#111111] rounded-full" style={{ width: member.allocation }}></div>
                  </div>
               </div>
               <span className="text-xs font-bold text-[#111111] mt-4">{member.allocation}</span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#0F172A05]">
               <div className="flex items-center gap-2">
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:text-[#111111] hover:bg-[#FAFAFA] transition-all">
                    <Github size={14} />
                  </button>
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:text-[#111111] hover:bg-[#FAFAFA] transition-all">
                    <Linkedin size={14} />
                  </button>
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:text-[#111111] hover:bg-[#FAFAFA] transition-all">
                    <Slack size={14} />
                  </button>
               </div>
               <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">{member.lastActive}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
