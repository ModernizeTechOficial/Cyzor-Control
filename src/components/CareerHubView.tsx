import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { getProfessionalEvolutionInfo } from '../utils/professionalEvolutionCalculator.ts';
import { Trophy, Sparkles, Award, TrendingUp, ListChecks } from 'lucide-react';

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

  return (
    <div id="career-hub-view" className="w-full mx-auto pb-16 flex flex-col gap-8 px-4 sm:px-6 lg:px-10">
      <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Career Hub</p>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Sua jornada profissional</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Visão interna de evolução, competências e posicionamento do usuário dentro do workspace.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 w-full lg:w-auto">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Nível</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{profileData?.profile.level ?? '--'}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">XP Total</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{profileData?.profile.xpTotal?.toLocaleString() ?? '--'}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Título</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{profileData?.profile.title ?? '--'}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Atualizado</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{profileData?.profile.updatedAt ? new Date(profileData.profile.updatedAt).toLocaleDateString('pt-BR') : '--'}</p>
            </div>
          </div>
        </div>
      </div>

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
