import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.tsx';
import { getProfessionalEvolutionInfo } from '../utils/professionalEvolutionCalculator.ts';
import { Trophy, Sparkles, Award, TrendingUp, ListChecks, Star, ShieldCheck, ArrowUpRight, Bolt, Zap } from 'lucide-react';

interface ProfessionalProfileResponse {
  profile: {
    title: string;
    level: number;
    xpTotal: number;
    xpMonth: number;
    xpWeek: number;
    xpToday: number;
    nextLevelXp: number;
    competencies: Record<string, number>;
    achievements: string[];
    statistics: Record<string, any>;
    updatedAt: string;
  };
  recentEvents: Array<{
    id: number;
    eventType: string;
    xpDelta: number;
    achievementKeys: string[];
    createdAt: string;
    payload: Record<string, any>;
  }>;
}

interface CareerLeaderboardResponse {
  leaderboard: Array<{
    userUid: string;
    level: number;
    xpTotal: number;
    title: string;
    competencies: Record<string, number>;
  }>;
}

interface CareerGoal {
  id: number;
  title: string;
  description?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETE';
  targetDate?: string;
  progress: number;
}

interface CareerCertification {
  id: number;
  name: string;
  issuer?: string;
  obtainedAt?: string;
  expiresAt?: string;
  credentialUrl?: string;
  notes?: string;
}

export default function CareerHubView() {
  const { fetchWithAuth, activeWorkspace } = useAuth();
  const [profileData, setProfileData] = useState<ProfessionalProfileResponse | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<CareerLeaderboardResponse | null>(null);
  const [goals, setGoals] = useState<CareerGoal[]>([]);
  const [certifications, setCertifications] = useState<CareerCertification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCareerData = async () => {
      if (!activeWorkspace) return;
      setLoading(true);
      setError(null);

      try {
        const [profileRes, leaderboardRes, goalsRes, certificationsRes] = await Promise.all([
          fetchWithAuth('/api/career/profile'),
          fetchWithAuth('/api/career/leaderboard'),
          fetchWithAuth('/api/career/goals'),
          fetchWithAuth('/api/career/certifications')
        ]);

        if (!profileRes.ok) {
          const text = await profileRes.text();
          throw new Error(`Failed to load career profile: ${profileRes.status} ${text}`);
        }

        if (!leaderboardRes.ok) {
          const text = await leaderboardRes.text();
          throw new Error(`Failed to load career leaderboard: ${leaderboardRes.status} ${text}`);
        }

        if (!goalsRes.ok) {
          const text = await goalsRes.text();
          throw new Error(`Failed to load career goals: ${goalsRes.status} ${text}`);
        }

        if (!certificationsRes.ok) {
          const text = await certificationsRes.text();
          throw new Error(`Failed to load certifications: ${certificationsRes.status} ${text}`);
        }

        const profileJson = await profileRes.json();
        const leaderboardJson = await leaderboardRes.json();
        const goalsJson = await goalsRes.json();
        const certificationsJson = await certificationsRes.json();
        setProfileData(profileJson);
        setLeaderboardData(leaderboardJson);
        setGoals(goalsJson.goals || []);
        setCertifications(certificationsJson.certifications || []);
      } catch (err: any) {
        console.error('CareerHubView load error:', err);
        setError(err.message || 'Erro ao carregar dados de carreira.');
      } finally {
        setLoading(false);
      }
    };

    loadCareerData();
  }, [activeWorkspace, fetchWithAuth]);

  const evolutionSummary = useMemo(() => {
    if (!profileData) return null;
    return getProfessionalEvolutionInfo(profileData.profile.xpTotal);
  }, [profileData]);

  const stage = evolutionSummary?.currentStage;
  const nextStage = evolutionSummary?.nextStage;
  const progress = evolutionSummary?.progress ?? 0;
  const totalCompetencies = Object.keys(profileData?.profile.competencies || {}).length;
  const profileUpdatedAt = profileData?.profile.updatedAt ? new Date(profileData.profile.updatedAt).toLocaleDateString('pt-BR') : '--';

  return (
    <div id="career-hub-view" className="w-full mx-auto pb-16 flex flex-col gap-8 px-4 sm:px-6 lg:px-10">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-[32px] bg-slate-950 text-white shadow-[0_35px_120px_-40px_rgba(15,23,42,0.9)]"
      >
        <div className="absolute left-0 top-0 h-64 w-64 -translate-x-1/3 -translate-y-1/3 rounded-full bg-gradient-to-br from-sky-500/25 to-indigo-500/10 blur-3xl" />
        <div className="absolute right-0 top-28 h-56 w-56 translate-x-1/4 -translate-y-1/4 rounded-full bg-gradient-to-br from-emerald-400/15 to-cyan-300/10 blur-3xl" />
        <div className="relative grid gap-8 p-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-xs uppercase tracking-[0.35em] text-sky-300">
              <Star size={16} /> Career Intelligence
            </div>
            <div className="max-w-2xl space-y-4">
              <p className="text-sm uppercase tracking-[0.35em] text-sky-300">Jornada Profissional</p>
              <h1 className="text-4xl font-extrabold leading-tight text-white">Transforme sua evolução em performance real.</h1>
              <p className="max-w-xl text-base leading-7 text-slate-300">Explore um dashboard de carreira com dados de XP, competências, conquistas e metas criadas para transmitir poder e profissionalismo.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] border border-slate-800 bg-slate-900/90 p-5">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Estágio atual</p>
                <p className="mt-3 text-2xl font-bold text-white">{stage?.label ?? 'Onboarding'}</p>
                <p className="mt-2 text-sm text-slate-400">Nível: {profileData?.profile.level ?? '--'}</p>
              </div>
              <div className="rounded-[28px] border border-slate-800 bg-slate-900/90 p-5">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">XP acumulado</p>
                <p className="mt-3 text-2xl font-bold text-white">{profileData?.profile.xpTotal?.toLocaleString() ?? '0'}</p>
                <p className="mt-2 text-sm text-slate-400">Até o próximo estágio: {evolutionSummary?.xpToNext?.toLocaleString() ?? '0'} XP</p>
              </div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.15 }}
            className="rounded-[32px] border border-slate-800 bg-slate-900/85 p-6"
          >
            <div className="flex flex-col gap-6">
              <div className="rounded-[28px] bg-gradient-to-r from-slate-800/90 to-slate-900/90 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Progresso de carreira</p>
                <div className="mt-4 flex items-end justify-between gap-6">
                  <div>
                    <p className="text-4xl font-bold text-white">{progress}%</p>
                    <p className="mt-2 text-sm text-slate-400">Caminho até {nextStage?.label ?? 'o próximo estágio'}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-800/80 p-4 text-center text-white">
                    <Bolt size={28} className="mx-auto text-sky-400" />
                    <p className="mt-2 text-xs uppercase tracking-[0.35em] text-slate-400">Ritmo de XP</p>
                    <p className="mt-1 text-lg font-semibold text-white">{profileData?.profile.xpMonth.toLocaleString() ?? '0'} / mês</p>
                  </div>
                </div>
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[28px] bg-slate-900/90 p-5 text-center text-white">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Metas abertas</p>
                  <p className="mt-3 text-3xl font-semibold">{goals.length}</p>
                </div>
                <div className="rounded-[28px] bg-slate-900/90 p-5 text-center text-white">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Certificações</p>
                  <p className="mt-3 text-3xl font-semibold">{certifications.length}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {loading ? (
        <div className="flex items-center justify-center min-h-[240px] rounded-[32px] border border-dashed border-slate-200 bg-white text-slate-500">
          Carregando dados de carreira...
        </div>
      ) : error ? (
        <div className="rounded-[32px] border border-rose-200 bg-rose-50 p-8 text-rose-700">
          <p className="font-bold">Erro</p>
          <p className="mt-2 text-sm leading-relaxed">{error}</p>
        </div>
      ) : !profileData ? (
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 text-slate-700">
          <p className="font-display text-lg font-bold">Perfil profissional não encontrado.</p>
          <p className="mt-2 text-sm text-slate-500">Certifique-se de que seu usuário já tenha interagido com eventos de evolução na workspace.</p>
        </div>
      ) : (<>
        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Sumário de Evolução</h2>
                  <p className="mt-1 text-sm text-slate-500">Entenda seu progresso em XP, competências e próximos marcos.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-3xl bg-blue-50 px-4 py-2 text-blue-700 text-sm font-semibold">
                  <Sparkles size={16} /> {evolutionSummary?.currentStage.label}
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Próximo estágio</p>
                  <p className="mt-2 text-sm font-bold text-slate-900">{evolutionSummary?.nextStage?.label ?? 'Meta'}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Progresso</p>
                  <p className="mt-2 text-sm font-bold text-slate-900">{evolutionSummary?.progress ?? 0}%</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">XP para o próximo</p>
                  <p className="mt-2 text-sm font-bold text-slate-900">{evolutionSummary?.xpToNext?.toLocaleString() ?? '--'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Competências</h2>
                  <p className="mt-1 text-sm text-slate-500">Veja quais habilidades estão crescendo e onde colocar atenção.</p>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-slate-600">{Object.keys(profileData.profile.competencies || {}).length} itens</div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(profileData.profile.competencies || {}).map(([skill, value]) => (
                  <div key={skill} className="rounded-3xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">{skill}</p>
                      <span className="text-xs font-bold text-slate-500">{value}%</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Conquistas recentes</h2>
                  <p className="mt-1 text-sm text-slate-500">Novos marcos e recompensas por ações valorizadas.</p>
                </div>
                <Award className="text-slate-400" size={24} />
              </div>

              <div className="mt-6 space-y-3">
                {profileData.profile.achievements.length > 0 ? (
                  profileData.profile.achievements.map((achievement) => (
                    <div key={achievement} className="rounded-3xl bg-slate-50 p-4 flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-600 text-white">
                        <Trophy size={16} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{achievement}</p>
                        <p className="text-xs text-slate-500">Evolução registrada</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-slate-500 text-sm">
                    Nenhuma conquista encontrada ainda. Continue acumulando XP com entregas de valor.
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Sparkles size={18} className="text-blue-600" />
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Atuação</p>
                  <h3 className="text-lg font-bold text-slate-900">Posição atual</h3>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Título profissional</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">{profileData.profile.title}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">XP este mês</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">{profileData.profile.xpMonth.toLocaleString()}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">XP hoje</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">{profileData.profile.xpToday.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <TrendingUp size={18} className="text-emerald-600" />
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Indicadores</p>
                  <h3 className="text-lg font-bold text-slate-900">Últimos eventos</h3>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {profileData.recentEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="rounded-3xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{event.eventType.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-slate-500">+{event.xpDelta} XP</p>
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{new Date(event.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                ))}
                {!profileData.recentEvents.length && (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    Ainda não há eventos de evolução registrados.
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Metas de Carreira</h2>
              <p className="mt-1 text-sm text-slate-500">Objetivos de desenvolvimento pessoal vinculados ao seu perfil profissional.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-2 text-xs uppercase tracking-[0.25em] text-slate-600">{goals.length} metas</span>
          </div>

          <div className="mt-6 grid gap-4">
            {goals.length > 0 ? goals.map((goal) => (
              <div key={goal.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{goal.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{goal.description || 'Sem descrição adicional.'}</p>
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{goal.status.replace('_', ' ')}</div>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, Math.max(0, goal.progress))}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">{goal.progress}%</span>
                </div>
              </div>
            )) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-slate-500 text-sm">
                Nenhuma meta cadastrada ainda. Crie metas para acompanhar sua evolução com clareza.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Certificações</h2>
              <p className="mt-1 text-sm text-slate-500">Registros de cursos, treinamentos e credenciais formalmente obtidas.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-2 text-xs uppercase tracking-[0.25em] text-slate-600">{certifications.length} registros</span>
          </div>

          <div className="mt-6 grid gap-4">
            {certifications.length > 0 ? certifications.map((cert) => (
              <div key={cert.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{cert.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{cert.issuer || 'Fornecedor não informado'}</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{cert.obtainedAt ? new Date(cert.obtainedAt).toLocaleDateString('pt-BR') : 'Sem data'}</span>
                </div>
                {cert.expiresAt && (
                  <p className="mt-3 text-xs text-slate-500">Válida até {new Date(cert.expiresAt).toLocaleDateString('pt-BR')}</p>
                )}
              </div>
            )) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-slate-500 text-sm">
                Nenhuma certificação registrada ainda. Registre suas conquistas para manter seu histórico atualizado.
              </div>
            )}
          </div>
        </div>
      </>)}

      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Leaderboard de Evolução</h2>
            <p className="mt-1 text-sm text-slate-500">Os 10 colaboradores mais avançados em XP no workspace.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs uppercase tracking-[0.25em] text-slate-600">
            <ListChecks size={16} /> Ranking</div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[32px] border border-slate-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-[0.25em]">
              <tr>
                <th className="px-5 py-4">Usuário</th>
                <th className="px-5 py-4 text-right">Nivel</th>
                <th className="px-5 py-4 text-right">XP</th>
                <th className="px-5 py-4 text-right">Título</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData?.leaderboard.map((row, index) => (
                <tr key={`${row.userUid}-${index}`} className="border-t border-slate-100 odd:bg-white even:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-900">{row.userUid}</td>
                  <td className="px-5 py-4 text-right text-slate-700">{row.level}</td>
                  <td className="px-5 py-4 text-right font-mono text-slate-900">{row.xpTotal.toLocaleString()}</td>
                  <td className="px-5 py-4 text-right text-slate-700">{row.title}</td>
                </tr>
              ))}
              {!leaderboardData?.leaderboard.length && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-500">Nenhum ranking disponível ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
