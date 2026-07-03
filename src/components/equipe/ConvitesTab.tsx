import { useState, useEffect } from 'react';
import { 
  Mail, 
  Plus, 
  Send, 
  Trash2, 
  Clock, 
  AlertCircle,
  XCircle,
  RefreshCcw,
  CheckCircle2,
  Calendar,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ConvitesTab() {
  const { fetchWithAuth } = useAuth();
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newInvite, setNewInvite] = useState({ email: '', role: 'MEMBER' });
  const [sending, setSending] = useState(false);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/api/workspace/invitations');
      if (res.ok) {
        const data = await res.json();
        setInvitations(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvite.email) return;
    try {
      setSending(true);
      const res = await fetchWithAuth('/api/workspace/invitations', {
        method: 'POST',
        body: JSON.stringify(newInvite)
      });
      if (res.ok) {
        setShowInviteModal(false);
        setNewInvite({ email: '', role: 'MEMBER' });
        fetchInvitations();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleCancelInvite = async (invId: number) => {
    if (!confirm('Tem certeza que deseja cancelar este convite?')) return;
    try {
      const res = await fetchWithAuth(`/api/workspace/invitations/${invId}`, {
        method: 'DELETE'
      });
      if (res.ok) fetchInvitations();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full relative">
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#111111] tracking-tight">Convites Pendentes</h3>
          <p className="text-sm text-[#64748B] font-medium">Gerencie os convites enviados para novos membros</p>
        </div>
        <button 
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-neutral-800 transition-all shadow-sm"
        >
          <UserPlus size={16} /> Novo Convite
        </button>
      </div>

      {/* Invitations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-sm text-[#64748B] font-medium">Carregando convites...</div>
        ) : invitations.length === 0 ? (
          <div className="col-span-full py-24 bg-white border border-[#0F172A0A] rounded-[32px] flex flex-col items-center justify-center gap-4 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
            <div className="w-16 h-16 rounded-3xl bg-[#F8FAFC] flex items-center justify-center text-[#94A3B8]">
              <Mail size={32} />
            </div>
            <div className="text-center">
              <h4 className="text-lg font-bold text-[#111111] tracking-tight">Nenhum convite pendente</h4>
              <p className="text-sm text-[#64748B] font-medium">Comece convidando membros para o seu time</p>
            </div>
            <button 
              onClick={() => setShowInviteModal(true)}
              className="mt-2 text-sm font-bold text-[#111111] hover:underline"
            >
              Enviar convite agora
            </button>
          </div>
        ) : invitations.map((inv) => (
          <div key={inv.id} className="bg-white border border-[#0F172A0A] rounded-[28px] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)] transition-all group relative">
            <div className="flex items-center justify-between mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                inv.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                inv.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                'bg-rose-50 text-rose-600 border-rose-100'
              }`}>
                <Mail size={22} strokeWidth={2.5} />
              </div>
              <div className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest ${
                inv.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 
                inv.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' :
                'bg-rose-100 text-rose-700'
              }`}>
                {inv.status === 'PENDING' ? 'Pendente' : inv.status === 'ACCEPTED' ? 'Aceito' : 'Cancelado'}
              </div>
            </div>

            <div className="flex flex-col gap-1 mb-6">
              <h4 className="text-base font-bold text-[#111111] truncate" title={inv.email}>{inv.email}</h4>
              <p className="text-xs text-[#64748B] font-medium flex items-center gap-1.5 uppercase tracking-wider">
                Papel: <span className="text-[#111111] font-bold">{inv.role}</span>
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#0F172A05]">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-[#64748B]">Enviado por:</span>
                <span className="text-[#111111] font-bold">{inv.inviterName || 'Administrador'}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-[#64748B]">Expira em:</span>
                <span className="text-amber-600 font-bold flex items-center gap-1">
                  <Clock size={12} /> {new Date(inv.expiresAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2">
              {inv.status === 'PENDING' && (
                <>
                  <button 
                    onClick={() => handleCancelInvite(inv.id)}
                    className="flex-1 py-2.5 rounded-xl border border-[#F1F5F9] text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={14} /> Cancelar
                  </button>
                  <button 
                    onClick={() => alert(`Convite para ${inv.email} reenviado!`)}
                    className="flex-1 py-2.5 rounded-xl bg-[#FAFAFA] text-xs font-bold text-[#111111] hover:bg-[#F1F5F9] transition-all flex items-center justify-center gap-1.5"
                  >
                    <RefreshCcw size={14} /> Reenviar
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.15)] animate-in zoom-in duration-200">
            <div className="p-8 pb-0 flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-white shadow-lg">
                <Send size={24} />
              </div>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors text-[#64748B]"
              >
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="p-8 pt-6 flex flex-col gap-6">
              <div>
                <h3 className="text-xl font-bold text-[#111111] tracking-tight">Convidar para a Equipe</h3>
                <p className="text-sm text-[#64748B] font-medium">O novo membro receberá um e-mail com o link de acesso</p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest px-1">E-mail do Convidado</label>
                  <input 
                    type="email" 
                    required
                    placeholder="exemplo@email.com"
                    value={newInvite.email}
                    onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                    className="w-full bg-[#FAFAFB] border border-[#0F172A0A] rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-black/5 outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest px-1">Papel / Permissões</label>
                  <select 
                    value={newInvite.role}
                    onChange={(e) => setNewInvite({ ...newInvite, role: e.target.value })}
                    className="w-full bg-[#FAFAFB] border border-[#0F172A0A] rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-black/5 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="MEMBER">Membro Padrão</option>
                    <option value="ADMIN">Administrador</option>
                    <option value="MANAGER">Gerente de Projeto</option>
                    <option value="DEVELOPER">Desenvolvedor</option>
                    <option value="DESIGNER">Designer</option>
                    <option value="FINANCE">Financeiro</option>
                    <option value="VIEWER">Apenas Leitura</option>
                  </select>
                </div>
              </div>

              <div className="bg-amber-50 rounded-2xl p-4 flex gap-3 border border-amber-100/50">
                <AlertCircle className="text-amber-600 flex-shrink-0" size={18} />
                <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                  O convite expira automaticamente em 7 dias. O usuário poderá criar uma conta caso ainda não possua uma.
                </p>
              </div>

              <button 
                type="submit"
                disabled={sending}
                className="w-full py-4 rounded-2xl bg-black text-white text-sm font-bold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-black/10"
              >
                {sending ? 'Enviando...' : 'Enviar Convite'}
                {!sending && <Send size={16} />}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
