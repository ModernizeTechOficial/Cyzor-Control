import { useState, useEffect, useMemo } from 'react';
import { 
  Mail, 
  Send, 
  Trash2, 
  Clock, 
  AlertCircle,
  RefreshCcw,
  XCircle,
  UserPlus,
  Copy,
  Search,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ConvitesTab() {
  const { fetchWithAuth } = useAuth();
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newInvite, setNewInvite] = useState({ email: '', role: 'MEMBER', teamName: '', department: '', cargo: '', permissions: [] as string[] });
  const [inviteMode, setInviteMode] = useState<'email' | 'link'>('email');
  const [createdInvite, setCreatedInvite] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'ACCEPTED' | 'CANCELLED'>('all');

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

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Link copiado para a área de transferência!');
    } catch (err) {
      console.error('Falha ao copiar o link:', err);
      alert('Não foi possível copiar o link. Tente novamente.');
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteMode === 'email' && !newInvite.email.trim()) return;

    try {
      setSending(true);
      const payload: any = {
        role: newInvite.role,
        email: newInvite.email.trim(),
        teamName: newInvite.teamName.trim(),
        department: newInvite.department.trim(),
        cargo: newInvite.cargo.trim(),
        permissions: newInvite.permissions || []
      };

      const res = await fetchWithAuth('/api/workspace/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setCreatedInvite(data);

        if (inviteMode === 'email') {
          setShowInviteModal(false);
          setNewInvite({ email: '', role: 'MEMBER', teamName: '', department: '', cargo: '', permissions: [] });
          fetchInvitations();
        }
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao criar convite');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao criar convite. Tente novamente.');
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

  const metrics = useMemo(() => {
    const pending = invitations.filter((inv) => inv.status === 'PENDING').length;
    const accepted = invitations.filter((inv) => inv.status === 'ACCEPTED').length;
    const cancelled = invitations.filter((inv) => inv.status === 'CANCELLED').length;
    const approvalRate = invitations.length ? Math.round((accepted / invitations.length) * 100) : 0;

    return { pending, accepted, cancelled, approvalRate };
  }, [invitations]);

  const filteredInvitations = invitations.filter((inv) => {
    const matchesSearch = !search || (inv.email || 'Convite por link').toLowerCase().includes(search.toLowerCase()) || (inv.role || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Pendentes', value: metrics.pending, tone: 'bg-amber-50 text-amber-700' },
          { label: 'Aceitos', value: metrics.accepted, tone: 'bg-emerald-50 text-emerald-700' },
          { label: 'Cancelados', value: metrics.cancelled, tone: 'bg-rose-50 text-rose-700' },
          { label: 'Taxa de aceitação', value: `${metrics.approvalRate}%`, tone: 'bg-slate-100 text-slate-800' },
        ].map((card) => (
          <div key={card.label} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">{card.label}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900">{card.value}</span>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${card.tone}`}>{card.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#0F172A0A] rounded-[24px] p-4 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
          <input
            type="text"
            placeholder="Buscar por e-mail ou papel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FAFAFB] border-none rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-black/5 transition-all outline-none text-[#111111]"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'PENDING' | 'ACCEPTED' | 'CANCELLED')}
            className="rounded-xl bg-[#FAFAFB] border border-[#0F172A0A] px-3 py-2 text-sm font-bold text-slate-700"
          >
            <option value="all">Todos</option>
            <option value="PENDING">Pendentes</option>
            <option value="ACCEPTED">Aceitos</option>
            <option value="CANCELLED">Cancelados</option>
          </select>
          <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">
            <ShieldCheck size={14} /> Governança ativa
          </div>
        </div>
      </div>

      {/* Invitations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-sm text-[#64748B] font-medium">Carregando convites...</div>
        ) : filteredInvitations.length === 0 ? (
          <div className="col-span-full py-24 bg-white border border-[#0F172A0A] rounded-[32px] flex flex-col items-center justify-center gap-4 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
            <div className="w-16 h-16 rounded-3xl bg-[#F8FAFC] flex items-center justify-center text-[#94A3B8]">
              <Mail size={32} />
            </div>
            <div className="text-center">
              <h4 className="text-lg font-bold text-[#111111] tracking-tight">Nenhum convite encontrado</h4>
              <p className="text-sm text-[#64748B] font-medium">Ajuste os filtros ou envie um novo convite para o seu time</p>
            </div>
            <button 
              onClick={() => setShowInviteModal(true)}
              className="mt-2 text-sm font-bold text-[#111111] hover:underline"
            >
              Enviar convite agora
            </button>
          </div>
        ) : filteredInvitations.map((inv) => (
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
              <h4 className="text-base font-bold text-[#111111] truncate" title={inv.email || 'Convite por link'}>{inv.email || 'Convite por link'}</h4>
              <p className="text-xs text-[#64748B] font-medium flex items-center gap-1.5 uppercase tracking-wider">
                Papel: <span className="text-[#111111] font-bold">{inv.role}</span>
              </p>
              {(inv.teamName || inv.department || inv.cargo) && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 text-[11px] text-[#64748B] uppercase tracking-[0.16em] font-bold">
                  {inv.teamName ? <span>Equipe: <strong className="text-[#111111] font-semibold normal-case">{inv.teamName}</strong></span> : null}
                  {inv.department ? <span>Departamento: <strong className="text-[#111111] font-semibold normal-case">{inv.department}</strong></span> : null}
                  {inv.cargo ? <span>Cargo: <strong className="text-[#111111] font-semibold normal-case">{inv.cargo}</strong></span> : null}
                </div>
              )}
              {inv.permissions?.length > 0 && (
                <p className="mt-2 text-[11px] text-[#111111] font-semibold">Permissões: {Array.isArray(inv.permissions) ? inv.permissions.join(', ') : inv.permissions}</p>
              )}
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
              {inv.inviteLink && (
                <div className="flex items-center justify-between gap-3 text-xs font-medium py-2 px-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="truncate text-[#111111]">{inv.inviteLink}</div>
                  <button
                    onClick={() => handleCopyToClipboard(inv.inviteLink)}
                    className="inline-flex items-center gap-1 text-[#111111] font-bold hover:text-black"
                    title="Copiar link"
                  >
                    <Copy size={14} /> Copiar
                  </button>
                </div>
              )}
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
                    onClick={() => alert(`Convite para ${inv.email || 'link de convite'} reenviado!`)}
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
                <p className="text-sm text-[#64748B] font-medium">
                  {inviteMode === 'email'
                    ? 'O novo membro receberá um e-mail com o link de acesso.'
                    : 'Gerar um link de convite que pode ser compartilhado diretamente.'
                  }
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { setInviteMode('email'); setCreatedInvite(null); }}
                  className={`py-3 rounded-2xl text-sm font-bold transition-all ${inviteMode === 'email' ? 'bg-black text-white' : 'bg-[#F8FAFC] text-[#111111] hover:bg-[#E2E8F0]'}`}
                >
                  Por e-mail
                </button>
                <button
                  type="button"
                  onClick={() => { setInviteMode('link'); setCreatedInvite(null); }}
                  className={`py-3 rounded-2xl text-sm font-bold transition-all ${inviteMode === 'link' ? 'bg-black text-white' : 'bg-[#F8FAFC] text-[#111111] hover:bg-[#E2E8F0]'}`}
                >
                  Por link
                </button>
              </div>

                  <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest px-1">E-mail do Convidado</label>
                <input 
                  type="email" 
                  required={inviteMode === 'email'}
                  placeholder={inviteMode === 'email' ? 'exemplo@email.com' : 'exemplo@email.com (opcional)'}
                  value={newInvite.email}
                  onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                  className="w-full bg-[#FAFAFB] border border-[#0F172A0A] rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-black/5 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest px-1">Equipe</label>
                  <input
                    type="text"
                    value={newInvite.teamName}
                    onChange={(e) => setNewInvite({ ...newInvite, teamName: e.target.value })}
                    placeholder="Backend, Comercial, Produto"
                    className="w-full bg-[#FAFAFB] border border-[#0F172A0A] rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-black/5 outline-none transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest px-1">Departamento</label>
                  <input
                    type="text"
                    value={newInvite.department}
                    onChange={(e) => setNewInvite({ ...newInvite, department: e.target.value })}
                    placeholder="Tecnologia, Financeiro, Comercial"
                    className="w-full bg-[#FAFAFB] border border-[#0F172A0A] rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-black/5 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest px-1">Cargo</label>
                  <input
                    type="text"
                    value={newInvite.cargo}
                    onChange={(e) => setNewInvite({ ...newInvite, cargo: e.target.value })}
                    placeholder="Backend Developer, Analista Financeiro"
                    className="w-full bg-[#FAFAFB] border border-[#0F172A0A] rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-black/5 outline-none transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest px-1">Permissões</label>
                  <select
                    value={newInvite.permissions.join(',')}
                    onChange={(e) => setNewInvite({ ...newInvite, permissions: e.target.value.split(',').filter(Boolean) })}
                    className="w-full bg-[#FAFAFB] border border-[#0F172A0A] rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-black/5 outline-none transition-all"
                  >
                    <option value="VIEW">VIEW</option>
                    <option value="VIEW,EDIT">VIEW,EDIT</option>
                    <option value="VIEW,EDIT,MANAGE">VIEW,EDIT,MANAGE</option>
                  </select>
                </div>
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

              <div className="bg-amber-50 rounded-2xl p-4 flex gap-3 border border-amber-100/50">
                <AlertCircle className="text-amber-600 flex-shrink-0" size={18} />
                <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                  O convite expira automaticamente em 7 dias. O usuário poderá criar uma conta caso ainda não possua uma.
                </p>
              </div>

              {createdInvite?.inviteLink ? (
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-3xl p-5 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-[#111111]">Link de convite criado</p>
                      <p className="text-xs text-[#64748B]">Compartilhe este endereço com quem você deseja convidar.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyToClipboard(createdInvite.inviteLink)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-2 text-xs font-bold text-[#111111] hover:bg-[#F1F5F9]"
                    >
                      <Copy size={14} /> Copiar link
                    </button>
                  </div>
                  <div className="rounded-2xl bg-white border border-[#E2E8F0] p-4 text-xs text-[#111111] break-all">
                    {createdInvite.inviteLink}
                  </div>
                </div>
              ) : null}

              <button 
                type="submit"
                disabled={sending}
                className="w-full py-4 rounded-2xl bg-black text-white text-sm font-bold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-black/10"
              >
                {sending ? 'Enviando...' : inviteMode === 'email' ? 'Enviar Convite' : 'Gerar Link de Convite'}
                {!sending && <Send size={16} />}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
