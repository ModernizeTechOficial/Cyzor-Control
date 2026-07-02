import { useState, useEffect } from 'react';
import { 
  Users, 
  MoreHorizontal, 
  Shield, 
  Trash2, 
  UserPlus, 
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function MembrosTab() {
  const { fetchWithAuth } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/api/workspace/members');
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleUpdateRole = async (memberId: number, newRole: string) => {
    try {
      const res = await fetchWithAuth(`/api/workspace/members/${memberId}`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) fetchMembers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!confirm('Tem certeza que deseja remover este membro?')) return;
    try {
      const res = await fetchWithAuth(`/api/workspace/members/${memberId}`, {
        method: 'DELETE'
      });
      if (res.ok) fetchMembers();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMembers = members.filter(m => 
    m.userName?.toLowerCase().includes(search.toLowerCase()) || 
    m.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
    m.cargo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Table Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#0F172A0A] rounded-[24px] p-4 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
          <input 
            type="text" 
            placeholder="Buscar por nome, e-mail ou cargo..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FAFAFB] border-none rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-black/5 transition-all outline-none text-[#111111]"
          />
        </div>
        <button className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-neutral-800 transition-all shadow-sm">
          <UserPlus size={16} /> Convidar Membro
        </button>
      </div>

      {/* Members List */}
      <div className="bg-white border border-[#0F172A0A] rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAFAFB] border-b border-[#0F172A0A]">
                <th className="px-8 py-5 text-[11px] font-bold text-[#64748B] uppercase tracking-widest">Membro</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#64748B] uppercase tracking-widest">Cargo / Função</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#64748B] uppercase tracking-widest">Papel</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#64748B] uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#64748B] uppercase tracking-widest">Acesso</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#64748B] uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0F172A08]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-sm text-[#64748B] font-medium">Carregando membros...</td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-sm text-[#64748B] font-medium">Nenhum membro encontrado.</td>
                </tr>
              ) : filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-[#FAFAFB]/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#FAFAFB] border border-[#0F172A0A] overflow-hidden flex items-center justify-center text-[#111111] font-bold text-sm shadow-sm flex-shrink-0">
                        {member.userPhoto ? (
                          <img src={member.userPhoto} alt={member.userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          member.userName?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-[#111111] truncate">{member.userName}</span>
                        <span className="text-xs text-[#64748B] font-medium truncate">{member.userEmail}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-bold text-[#111111]">{member.cargo || 'Colaborador'}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <Shield size={14} className={member.role === 'OWNER' ? 'text-indigo-500' : member.role === 'ADMIN' ? 'text-amber-500' : 'text-[#94A3B8]'} />
                      <select 
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                        disabled={member.role === 'OWNER'}
                        className="bg-transparent border-none text-sm font-bold text-[#111111] focus:ring-0 cursor-pointer p-0 pr-8"
                      >
                        <option value="OWNER">Proprietário</option>
                        <option value="ADMIN">Administrador</option>
                        <option value="MANAGER">Gerente</option>
                        <option value="DEVELOPER">Desenvolvedor</option>
                        <option value="DESIGNER">Designer</option>
                        <option value="FINANCE">Financeiro</option>
                        <option value="VIEWER">Visualizador</option>
                        <option value="MEMBER">Membro</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      member.status === 'Ativo' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {member.status === 'Ativo' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {member.status}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-xs font-medium text-[#64748B]">
                      <Clock size={14} className="text-[#94A3B8]" />
                      {new Date(member.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={member.role === 'OWNER'}
                        className="p-2 rounded-lg text-[#64748B] hover:text-rose-600 hover:bg-rose-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Remover Membro"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="p-2 rounded-lg text-[#64748B] hover:text-[#111111] hover:bg-[#F1F5F9] transition-all">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
