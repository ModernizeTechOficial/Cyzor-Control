import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Briefcase, Building2, CalendarRange, CheckCircle2, Clock3, Filter, Layers3, LockKeyhole, ShieldCheck, Sparkles, Users, X, Edit2, Check } from 'lucide-react';

const tabs = [
  { id: 'summary', label: 'Resumo' },
  { id: 'career', label: 'Career Hub' },
  { id: 'teams', label: 'Equipes' },
  { id: 'permissions', label: 'Permissões' },
  { id: 'activity', label: 'Atividade' },
  { id: 'onboarding', label: 'Onboarding' },
] as const;

type MemberDrawerTab = (typeof tabs)[number]['id'];

export default function MemberDetailsDrawer({
  member,
  isOpen,
  onClose,
  onUpdateMember,
  teams = [],
  departments = [],
  allMembers = [],
}: {
  member: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdateMember?: (id: number, updates: any) => Promise<void>;
  teams?: any[];
  departments?: any[];
  allMembers?: any[];
}) {
  const [activeTab, setActiveTab] = useState<MemberDrawerTab>('summary');
  const [isEditing, setIsEditing] = useState(false);
  const [cargo, setCargo] = useState(member?.cargo || '');
  const [teamName, setTeamName] = useState(member?.teamName || member?.team || '');
  const [department, setDepartment] = useState(member?.department || '');
  const [role, setRole] = useState(member?.role || 'MEMBER');
  const [saving, setSaving] = useState(false);

  const summaryCards = useMemo(() => [
    { label: 'Cargo', value: member?.cargo || 'Colaborador' },
    { label: 'Departamento', value: member?.department || 'Geral' },
    { label: 'Equipe', value: member?.teamName || member?.team || 'Sem equipe' },
    { label: 'Gestor', value: member?.managerName || member?.manager || 'A definir' },
    { label: 'Status', value: member?.status || 'Ativo' },
    { label: 'Nível Career', value: member?.careerLevel || 'Pleno' },
  ], [member]);

  const handleSave = async () => {
    if (!onUpdateMember || !member?.id) return;
    try {
      setSaving(true);
      await onUpdateMember(member.id, { cargo, teamName, department, role });
      setIsEditing(false);
    } catch (err) {
      alert('Erro ao atualizar informações do colaborador.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && member && (
        <div className="fixed inset-0 z-[90] flex justify-end">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

          <motion.aside
            initial={{ x: 420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 420, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 32 }}
            className="relative h-full w-full max-w-2xl overflow-y-auto bg-white border-l border-slate-200 shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  {member.userPhoto ? (
                    <img src={member.userPhoto} alt={member.userName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-black text-slate-800">
                      {member.userName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">{member.userName || 'Colaborador'}</p>
                  <p className="text-[11px] text-slate-500">{member.userEmail || 'sem-email@cyzor.io'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onUpdateMember && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="rounded-2xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                  >
                    <Edit2 size={14} /> {isEditing ? 'Cancelar' : 'Editar'}
                  </button>
                )}
                <button onClick={onClose} className="rounded-2xl border border-slate-200 p-2 text-slate-500 hover:text-slate-900">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="px-6 py-5">
              {isEditing && (
                <div className="mb-6 rounded-[24px] border border-indigo-200 bg-indigo-50/50 p-5 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">Alterar Dados do Colaborador</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cargo</label>
                      <input
                        type="text"
                        value={cargo}
                        onChange={(e) => setCargo(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Equipe</label>
                      <input
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="Nome da equipe"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Departamento</label>
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="Nome do departamento"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Role/Papel</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                      >
                        <option value="MEMBER">MEMBER</option>
                        <option value="DEVELOPER">DEVELOPER</option>
                        <option value="DESIGNER">DESIGNER</option>
                        <option value="FINANCE">FINANCE</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="OWNER">OWNER</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Check size={14} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-2 overflow-x-auto pb-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] ${activeTab === tab.id ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === 'summary' && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {summaryCards.map((card) => (
                    <div key={card.label} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">{card.label}</p>
                      <p className="mt-2 text-sm font-black text-slate-900">{card.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'career' && (
                <div className="mt-6 space-y-3">
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Career Hub</p>
                        <p className="mt-2 text-sm font-black text-slate-900">Nível atual: {member?.careerLevel || 'Pleno'}</p>
                      </div>
                      <Sparkles className="text-slate-400" size={18} />
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Competências</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {['Planejamento', 'Execução', 'Liderança', 'Produto'].map((skill) => (
                        <span key={skill} className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-700 border border-slate-200">{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'teams' && (
                <div className="mt-6 space-y-3">
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-3"><Users size={16} className="text-slate-500" /><span className="text-sm font-black text-slate-900">Equipes vinculadas</span></div>
                    <p className="mt-3 text-sm text-slate-600">{member?.teamName || member?.team || 'Sem equipe'}</p>
                  </div>
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-3"><Briefcase size={16} className="text-slate-500" /><span className="text-sm font-black text-slate-900">Projetos ativos</span></div>
                    <p className="mt-3 text-sm text-slate-600">Projetos em execução alocados</p>
                  </div>
                </div>
              )}

              {activeTab === 'permissions' && (
                <div className="mt-6 space-y-3">
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-3"><ShieldCheck size={16} className="text-slate-500" /><span className="text-sm font-black text-slate-900">Papel / Role</span></div>
                    <p className="mt-3 text-sm text-slate-600">{member?.role || 'MEMBER'}</p>
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="mt-6 space-y-3">
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-3"><Clock3 size={16} className="text-slate-500" /><span className="text-sm font-black text-slate-900">Atividade recente</span></div>
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      <div className="rounded-2xl bg-white p-3">Cargo atualizado para {member?.cargo || 'Colaborador'}</div>
                      <div className="rounded-2xl bg-white p-3">Equipe vinculada ao workspace atualizado</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'onboarding' && (
                <div className="mt-6 space-y-3">
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-3"><CalendarRange size={16} className="text-slate-500" /><span className="text-sm font-black text-slate-900">Employee Onboarding</span></div>
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" />Conta criada via convite</div>
                      <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" />Equipe e departamento atribuídos</div>
                      <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" />Conhecer workspace e prioridades</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
