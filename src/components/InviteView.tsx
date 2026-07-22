import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Mail, ShieldCheck, AlertCircle, ArrowRight, Lock, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

function getInviteTokenFromUrl() {
  const path = window.location.pathname.split('/').filter(Boolean);
  if (path[0] === 'invite' && path[1]) {
    return path[1];
  }
  const search = new URLSearchParams(window.location.search);
  return search.get('inviteToken') || undefined;
}

export default function InviteView() {
  const { user, fetchWithAuth, syncSaaSState } = useAuth();
  const [inviteToken] = useState<string | undefined>(() => getInviteTokenFromUrl());
  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const canAccept = Boolean(user && invite && invite.status === 'PENDING');

  useEffect(() => {
    const loadInvite = async () => {
      if (!inviteToken) {
        setError('Token de convite inválido. Verifique o link e tente novamente.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/invite/${inviteToken}`);
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          setError(body.error || 'Não foi possível carregar o convite.');
          return;
        }

        const data = await response.json();
        setInvite(data);
      } catch (err) {
        console.error('Error loading invite preview:', err);
        setError('Falha ao carregar o convite. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    loadInvite();
  }, [inviteToken]);

  const handleAcceptInvite = async () => {
    if (!inviteToken) return;
    if (!user) {
      window.location.href = `/login?inviteToken=${encodeURIComponent(inviteToken)}`;
      return;
    }

    try {
      setAccepting(true);
      const response = await fetchWithAuth(`/api/invite/${inviteToken}/accept`, { method: 'POST' });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'Não foi possível aceitar o convite.');
      }

      setAccepted(true);
      await syncSaaSState();
      window.location.href = '/workspace';
    } catch (err: any) {
      console.error('Error accepting invite:', err);
      setError(err.message || 'Erro ao aceitar o convite.');
    } finally {
      setAccepting(false);
    }
  };

  const loginRoute = useMemo(() => `/login?inviteToken=${encodeURIComponent(inviteToken || '')}`, [inviteToken]);
  const signupRoute = useMemo(() => `/login?inviteToken=${encodeURIComponent(inviteToken || '')}&mode=signup`, [inviteToken]);

  return (
    <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center px-4 py-10">
      <div className="max-w-4xl w-full bg-white rounded-[40px] border border-slate-100 shadow-[0_30px_80px_rgba(15,23,42,0.08)] overflow-hidden">
        <div className="grid lg:grid-cols-[380px_1fr] gap-0 lg:gap-10">
          <div className="bg-gradient-to-b from-slate-950 to-slate-800 text-white p-10 lg:p-12 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-3 rounded-3xl bg-white/10 px-4 py-2 mb-8 text-xs uppercase tracking-[0.25em] font-bold text-slate-200">
                Convite seguro
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight leading-tight">Junte-se à equipe existente</h1>
              <p className="mt-5 text-sm text-slate-300 leading-7">
                Este link permite que você entre em um workspace já criado, sem passar pelo onboarding empresarial.
                Use sua conta para acessar diretamente a organização convidada.
              </p>
            </div>

            <div className="space-y-4 mt-10 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-1" size={18} />
                <div>
                  <p className="font-semibold text-white">Fluxo separado</p>
                  <p>O convite é exclusivo e funciona apenas para o workspace convidado.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-1" size={18} />
                <div>
                  <p className="font-semibold text-white">E-mail do convite</p>
                  <p>{invite?.email || 'Link de convite aberto'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ArrowRight className="mt-1" size={18} />
                <div>
                  <p className="font-semibold text-white">Acesso direto</p>
                  <p>Ao aceitar, você ingressa diretamente na equipe existente. Sem criação de empresa.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 lg:p-12">
            <div className="flex items-center justify-between gap-3 mb-8">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-slate-500 font-semibold">Convite</p>
                <h2 className="text-3xl font-extrabold text-slate-950">{invite?.workspaceName || 'Detalhes do convite'}</h2>
              </div>
              {invite?.status && (
                <div className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] ${invite.status === 'PENDING' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {invite.status === 'PENDING' ? 'Pendente' : invite.status}
                </div>
              )}
            </div>

            {loading ? (
              <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-10 text-center text-slate-500">Carregando informações do convite...</div>
            ) : error ? (
              <div className="rounded-[32px] border border-rose-100 bg-rose-50 p-10 text-center text-rose-800">
                <AlertCircle size={24} className="mx-auto mb-4" />
                <p className="font-bold text-lg">Problema com o convite</p>
                <p className="mt-2 text-sm">{error}</p>
                <button
                  type="button"
                  onClick={() => window.location.href = '/login'}
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 transition-all"
                >
                  Voltar ao login
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid gap-4">
                  <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-6">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500 font-bold">Workspace</p>
                    <p className="mt-3 text-xl font-semibold text-slate-950">{invite.workspaceName}</p>
                    <p className="mt-2 text-sm text-slate-600">ID do workspace: {invite.workspaceId}</p>
                  </div>

                  <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-6">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500 font-bold">Função convidada</p>
                    <p className="mt-3 text-lg font-semibold text-slate-950">{invite.role || 'Membro'}</p>
                    {invite.teamName && <p className="mt-2 text-sm text-slate-600">Equipe: {invite.teamName}</p>}
                    {invite.department && <p className="mt-1 text-sm text-slate-600">Departamento: {invite.department}</p>}
                    {invite.cargo && <p className="mt-1 text-sm text-slate-600">Cargo: {invite.cargo}</p>}
                    {invite.permissions?.length > 0 && <p className="mt-1 text-sm text-slate-600">Permissões: {Array.isArray(invite.permissions) ? invite.permissions.join(', ') : invite.permissions}</p>}
                  </div>
                </div>

                <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-6">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500 font-bold">Validade</p>
                  <p className="mt-3 text-lg font-semibold text-slate-950">{new Date(invite.expiresAt).toLocaleDateString()}</p>
                  <p className="mt-2 text-sm text-slate-600">O convite expira automaticamente e não cria uma nova empresa.</p>
                </div>

                {user ? (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-700">Você está conectado como <strong>{user.email}</strong>.</p>
                    <button
                      onClick={handleAcceptInvite}
                      disabled={!canAccept || accepting}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-slate-950 px-6 py-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {accepting ? 'Aceitando...' : 'Aceitar Convite e Entrar'}
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                      <p className="text-sm text-slate-700 mb-4">Para entrar no workspace convidado, faça login ou crie uma conta com seu e-mail.</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <button
                          onClick={() => window.location.href = loginRoute}
                          className="inline-flex items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
                        >
                          <Lock size={16} /> Entrar
                        </button>
                        <button
                          onClick={() => window.location.href = signupRoute}
                          className="inline-flex items-center justify-center gap-2 rounded-3xl bg-slate-950 px-5 py-4 text-sm font-bold text-white transition hover:bg-slate-800"
                        >
                          <UserPlus size={16} /> Criar conta
                        </button>
                      </div>
                    </div>

                    <div className="rounded-[32px] border border-amber-100 bg-amber-50 p-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="text-amber-700 mt-1" size={18} />
                        <div>
                          <p className="text-sm font-semibold text-amber-900">Importante</p>
                          <p className="mt-2 text-sm text-amber-900">Ao aceitar este convite, você ingressa na organização existente e evita o onboarding empresarial.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
