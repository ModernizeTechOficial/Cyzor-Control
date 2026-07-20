import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import StandardHeader from './layout/StandardHeader';
import { 
  useIdeas, useProjects, useProducts, useTasks, useFinance 
} from '../hooks/useCyzorQueries';
import { View } from '../types';
import { 
  Sparkles, CheckCircle2, ArrowRight, Info, ChevronDown, Check, 
  TrendingUp, Download, ShieldAlert, Zap, Box, HelpCircle, Trophy,
  ClipboardList, Lightbulb, FlaskConical, Rocket, Settings, BarChart2, 
  Building2, Network, Target, Flame, Star, MessageSquare, Plus, FolderPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { showSuccess, showError } from '../lib/alerts';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const STAGES = [
  { id: 'Ideia', label: 'Ideia', icon: Lightbulb, description: 'Estruturação da ideia de negócio e modelagem conceitual inicial.', progress: 10, next: 'Validação' },
  { id: 'Validação', label: 'Validação', icon: FlaskConical, description: 'Pesquisa com clientes ideais e validação empírica do problema.', progress: 20, next: 'MVP' },
  { id: 'MVP', label: 'MVP', icon: Rocket, description: 'Desenho de escopo, especificação e estruturação do cronograma do MVP.', progress: 35, next: 'Operação' },
  { id: 'Operação', label: 'Operação', icon: Settings, description: 'Construção focada das primeiras funcionalidades funcionais do produto.', progress: 50, next: 'Escala' },
  { id: 'Escala', label: 'Escala', icon: BarChart2, description: 'Otimização de canais de marketing e vendas focando em escala e canais de ROI.', progress: 70, next: 'Empresa' },
  { id: 'Empresa', label: 'Empresa', icon: Building2, description: 'Consolidação de gestão, processos, liderança corporativa.', progress: 85, next: 'Ecossistema' },
  { id: 'Ecossistema', label: 'Ecossistema', icon: Network, description: 'Dominância de mercado, parcerias globais e M&A.', progress: 100, next: 'Concluído!' }
];

const STAGE_CRITERIA: Record<string, { text: string; completed: boolean }[]> = {
  'Ideia': [
    { text: 'Mapear proposta de valor inicial', completed: true },
    { text: 'Pesquisar concorrentes e mercado', completed: false },
    { text: 'Definir perfil de cliente ideal (ICP)', completed: false }
  ],
  'Validação': [
    { text: 'Criar Landing Page de validação', completed: true },
    { text: 'Realizar entrevistas com usuários', completed: false },
    { text: 'Gerar primeiros leads qualificados', completed: false }
  ],
  'MVP': [
    { text: 'Definir escopo enxuto do MVP', completed: true },
    { text: 'Mapear fluxos principais do usuário', completed: false },
    { text: 'Iniciar desenvolvimento do protótipo', completed: false }
  ],
  'Operação': [
    { text: 'Lançar primeira versão funcional', completed: true },
    { text: 'Configurar rotas de suporte básico', completed: false },
    { text: 'Adquirir o primeiro cliente pago', completed: false }
  ],
  'Escala': [
    { text: 'Escalar funil de marketing e vendas', completed: true },
    { text: 'Acompanhar métricas de retenção (LTV/CAC)', completed: false },
    { text: 'Alcançar break-even operacional', completed: false }
  ],
  'Empresa': [
    { text: 'Consolidar processos de governança', completed: true },
    { text: 'Expandir time de engenharia e suporte', completed: false },
    { text: 'Estabelecer planejamento anual formal', completed: false }
  ],
  'Ecossistema': [
    { text: 'Avaliar oportunidades de M&A e expansão', completed: true },
    { text: 'Lançar canais globais e parcerias estratégicas', completed: false },
    { text: 'Liderar participação em grandes eventos do setor', completed: false }
  ]
};

const RadarCustomTick = (props: any) => {
  const { payload, x, y, textAnchor } = props;
  const [label, percent] = payload.value.split('|');
  
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={-4} dy={0} textAnchor={textAnchor} fill="#1E293B" fontSize={11} fontWeight={800} className="font-sans">
        {label}
      </text>
      <text x={0} y={10} dy={0} textAnchor={textAnchor} fill="#2563EB" fontSize={11} fontWeight={800} className="font-sans">
        {percent}
      </text>
    </g>
  );
};

const CHART_DATA = [
  { name: 'Jan', value: 300 },
  { name: 'Fev', value: 340 },
  { name: 'Mar', value: 420 },
  { name: 'Abr', value: 460 },
  { name: 'Mai', value: 490 },
  { name: 'Jun', value: 540 },
];

export default function PlanejamentoEstrategicoView({ setCurrentView }: { setCurrentView: (view: View) => void }) {
  const { activeWorkspace, fetchWithAuth, syncSaaSState } = useAuth();
  const { setGlobalFilters } = useNavigation();

  // Queries using React Query
  const { data: ideas = [], refetch: refetchIdeas } = useIdeas();
  const { data: projects = [], refetch: refetchProjects } = useProjects();
  const { data: products = [], refetch: refetchProducts } = useProducts();
  const { data: tasks = [], refetch: refetchTasks } = useTasks();
  const { data: finance = [], refetch: refetchFinance } = useFinance();

  const [clients, setClients] = useState<any[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);

  const fetchClients = async () => {
    if (!activeWorkspace) return;
    setLoadingClients(true);
    try {
      const res = await fetchWithAuth('/api/clients');
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingClients(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [activeWorkspace]);

  const [showStageSelector, setShowStageSelector] = useState(false);

  const currentStage = useMemo(() => {
    const saved = activeWorkspace?.settings?.stage;
    return STAGES.some(s => s.id === saved) ? saved : 'Validação';
  }, [activeWorkspace]);

  const besScore = activeWorkspace?.settings?.besScore || 420;

  const handleStageChange = async (stageId: string) => {
    if (!activeWorkspace) return;
    try {
      const res = await fetchWithAuth(`/api/workspaces/${activeWorkspace.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            stage: stageId
          }
        })
      });
      if (res.ok) {
        showSuccess(`Nível de maturidade alterado para: ${stageId}`);
        setShowStageSelector(false);
        await syncSaaSState();
      } else {
        showError("Falha ao atualizar o nível de maturidade.");
      }
    } catch (err) {
      console.error(err);
      showError("Erro de conexão.");
    }
  };

  const activeStageIndex = STAGES.findIndex(s => s.id === currentStage);
  
  return (
    <div className="w-full mx-auto pb-12 flex flex-col gap-10 animate-in fade-in duration-500 relative px-4 sm:px-6 lg:px-10">
      
      <StandardHeader 
        title="Business Event Score (BES)"
        subtitle="Acompanhe a evolução e maturidade da sua empresa em tempo real."
        breadcrumb={[{ label: 'Maturidade Corporativa' }]}
        actions={[
          {
            label: 'Exportar Relatório',
            icon: Download,
            onClick: () => {},
            variant: 'secondary'
          }
        ]}
      >
        {/* Seletor de Nível */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowStageSelector(!showStageSelector)}
            className="flex items-center justify-center gap-2 bg-white hover:bg-[#FAFAFA] border border-[#0F172A0F] text-[#111111] px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer"
          >
            <ClipboardList className="w-4 h-4 text-slate-400" />
            <span>Nível: {currentStage}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
          
          <AnimatePresence>
            {showStageSelector && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-64 bg-white border border-[#0F172A0F] rounded-2xl shadow-xl z-50 p-2 max-h-80 overflow-y-auto text-left"
              >
                <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                  Selecione o nível de maturidade
                </div>
                {STAGES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleStageChange(s.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex justify-between items-center transition-colors cursor-pointer ${currentStage === s.id ? 'bg-[#111111] text-white font-bold' : 'hover:bg-slate-50 text-slate-700 font-bold'}`}
                  >
                    <span>{s.label}</span>
                    {currentStage === s.id && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </StandardHeader>

      {/* Grid Row 1: Primeiro Bloco de Cards Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 w-full">
        
        {/* Card 1: Seu Score Atual */}
        <div className="lg:col-span-1 bg-white border border-slate-100 rounded-[24px] p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.03),0_1px_2px_0_rgba(15,23,42,0.02)] flex flex-col justify-between h-full">
          <div>
            <h3 className="text-sm font-display font-black text-[#0F172A] mb-4">Seu Score Atual</h3>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-6xl font-display font-black text-blue-600 tracking-tight">{besScore}</span>
              <span className="text-sm font-display font-bold text-slate-400">/ 1000</span>
            </div>
            
            <div className="flex items-center gap-1.5 mb-5">
              <span className="text-[10px] font-display font-black text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-md">
                Maturidade: {currentStage.toUpperCase()}
              </span>
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
            </div>

            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
              Você está no caminho certo! Continue executando ações estratégicas para evoluir para o próximo nível.
            </p>

            {/* Três Estatísticas Inline com Design Original */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="flex flex-col items-start bg-emerald-50/50 p-2 rounded-xl border border-emerald-50">
                <div className="flex items-center gap-1 text-emerald-600 font-display font-black text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  +32 pts
                </div>
                <span className="text-[9px] text-slate-400 font-display font-bold mt-1">esta semana</span>
              </div>
              <div className="flex flex-col items-start bg-emerald-50/50 p-2 rounded-xl border border-emerald-50">
                <div className="flex items-center gap-1 text-emerald-600 font-display font-black text-xs">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +8%
                </div>
                <span className="text-[9px] text-slate-400 font-display font-bold mt-1">últimos 30d</span>
              </div>
              <div className="flex flex-col items-start bg-slate-50 p-2 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1 text-slate-600 font-display font-black text-xs">
                  <Trophy className="w-3.5 h-3.5 text-slate-400" />
                  Top 21%
                </div>
                <span className="text-[9px] text-slate-400 font-display font-bold mt-1">empresas</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-50">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: '42%' }} />
            </div>
            <div className="flex justify-between items-center text-[11px] font-display font-bold">
              <span className="text-slate-400">Progresso geral</span>
              <span className="text-blue-600">42%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Radar de Maturidade */}
        <div className="lg:col-span-1 bg-white border border-slate-100 rounded-[24px] p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.03),0_1px_2px_0_rgba(15,23,42,0.02)] flex flex-col items-center justify-between h-full">
          <div className="w-full text-left">
            <h3 className="text-sm font-display font-black text-[#0F172A] mb-1">Radar de Maturidade</h3>
          </div>
          
          <div className="w-full flex items-center justify-center min-h-[220px]">
            <ResponsiveContainer width="100%" height={230}>
              <RadarChart cx="50%" cy="50%" outerRadius="62%" data={[
                { subject: 'Mercado|60%', A: 60, fullMark: 100 },
                { subject: 'Cliente|30%', A: 30, fullMark: 100 },
                { subject: 'Execução|50%', A: 50, fullMark: 100 },
                { subject: 'Time|55%', A: 55, fullMark: 100 },
                { subject: 'Financeiro|45%', A: 45, fullMark: 100 },
                { subject: 'Produto|40%', A: 40, fullMark: 100 },
              ]}>
                <PolarGrid stroke="#F1F5F9" />
                <PolarAngleAxis dataKey="subject" tick={<RadarCustomTick />} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Score" dataKey="A" stroke="#2563EB" strokeWidth={2} fill="#3B82F6" fillOpacity={0.12} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <button className="text-blue-600 font-display font-bold text-xs flex items-center justify-center gap-1 hover:underline pt-2">
            Ver detalhes por pilar <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Jornada Empresarial com Stepper com Ícones e Duas Colunas */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[24px] p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.03),0_1px_2px_0_rgba(15,23,42,0.02)] flex flex-col justify-between h-full">
          <div>
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-[#0F172A] font-display font-black text-sm">Jornada Empresarial</h3>
              <button className="text-[#2563EB] font-display font-bold text-xs hover:underline">Ver todas as etapas</button>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mb-6">Entenda em qual estágio sua empresa está</p>

            {/* Stepper Visual Horizontal com Ícones */}
            <div className="relative flex justify-between items-start mb-4 px-2 mt-4">
              {/* Linha de conexão cinza ao fundo */}
              <div className="absolute left-[8%] right-[8%] top-[22px] h-[1px] bg-slate-100 z-0" />
              {/* Linha de progresso verde */}
              <div 
                className="absolute left-[8%] top-[22px] h-[1px] bg-[#10B981] z-0 transition-all duration-500" 
                style={{ width: `${(activeStageIndex / 6) * 84}%` }} 
              />
              
              {STAGES.map((s, idx) => {
                const isActive = currentStage === s.id;
                const isPast = idx < activeStageIndex;
                const IconComponent = s.icon;
                
                return (
                  <div key={s.id} className="relative z-10 flex flex-col items-center flex-1">
                    {/* Círculo Principal do Ícone */}
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-300 bg-white
                      ${isActive 
                        ? 'border-[#2563EB] text-[#2563EB] shadow-[0_0_0_6px_rgba(37,99,235,0.12)] ring-1 ring-[#3B82F6]/30' 
                        : isPast 
                          ? 'border-[#D1FAE5] bg-[#ECFDF5] text-[#10B981]' 
                          : 'border-slate-100 text-[#94A3B8]'
                      }
                    `}>
                      <IconComponent className="w-4.5 h-4.5" />
                    </div>
                    
                    {/* Conexão Vertical e Marcador Inferior */}
                    <div className="flex flex-col items-center mt-2 min-h-[76px]">
                      {/* Linha vertical tracejada */}
                      <div className={`w-[1px] h-3.5 border-l border-dashed ${isActive ? 'border-blue-400' : isPast ? 'border-emerald-300' : 'border-slate-100'}`} />
                      
                      {/* Marcador/Badge circular de status */}
                      <div className="h-5 flex items-center justify-center mt-1">
                        {isPast ? (
                          <div className="w-4 h-4 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-sm">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        ) : isActive ? (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-[#1E3A8A] bg-white flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                          </div>
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        )}
                      </div>

                      {/* Nome da Etapa */}
                      <span className={`text-[10px] font-display font-bold whitespace-nowrap mt-1.5 ${isActive ? 'text-[#2563EB] font-extrabold' : 'text-[#64748B]'}`}>
                        {s.label}
                      </span>

                      {/* Badge "Atual" */}
                      {isActive && (
                        <span className="text-[9px] font-display font-black text-white bg-[#2563EB] px-2.5 py-0.5 rounded-md mt-1 uppercase tracking-wide">
                          Atual
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Detalhes do Nível em 2 Colunas dentro de um container com borda */}
            <div className="border border-slate-100 rounded-[20px] p-5 mt-6 bg-white grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 gap-4">
              {/* Coluna Esquerda: Informações */}
              <div className="pr-2 flex flex-col justify-between">
                <div>
                  <h4 className="text-[#2563EB] font-display font-black text-sm">{currentStage}</h4>
                  <p className="text-slate-700 font-display font-bold text-xs mt-1">
                    {STAGES.find(s => s.id === currentStage)?.progress || 20}% concluído
                  </p>
                  <p className="text-slate-500 text-xs leading-relaxed font-normal mt-3 mb-4">
                    {STAGES.find(s => s.id === currentStage)?.description || "Acompanhe e atenda os critérios para avançar na jornada empresarial."}
                  </p>
                </div>
                <div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-1.5">
                    <div className="bg-[#2563EB] h-full rounded-full" style={{ width: `${STAGES.find(s => s.id === currentStage)?.progress || 20}%` }} />
                  </div>
                  <p className="text-slate-400 font-display text-[10px] font-bold">
                    {STAGE_CRITERIA[currentStage]?.filter(c => c.completed).length || 1} de {STAGE_CRITERIA[currentStage]?.length || 3} critérios atendidos
                  </p>
                </div>
              </div>

              {/* Coluna Direita: Próximos Critérios */}
              <div className="pl-0 md:pl-6 pt-4 md:pt-0 flex flex-col justify-between">
                <div>
                  <h5 className="text-[#0F172A] font-display font-extrabold text-xs mb-3">Próximos critérios</h5>
                  <div className="space-y-3">
                    {(STAGE_CRITERIA[currentStage] || STAGE_CRITERIA['Validação']).map((criterion, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 bg-white ${criterion.completed ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300'}`}>
                          {criterion.completed && <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[3]" />}
                        </div>
                        <span className={`text-xs leading-tight font-semibold ${criterion.completed ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                          {criterion.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <button className="text-[#2563EB] bg-[#EFF6FF] hover:bg-blue-100/70 transition-all font-display font-bold text-[11px] px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                    Ver detalhes da etapa <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Recomendações da IA */}
        <div className="lg:col-span-1 bg-white border border-slate-100 rounded-[24px] p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.03),0_1px_2px_0_rgba(15,23,42,0.02)] flex flex-col justify-between h-full">
          <div>
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-sm font-display font-black text-[#0F172A]">Recomendações da IA</h3>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mb-4">Baseado nos dados do seu negócio</p>

            <div className="space-y-3.5">
              {/* Prioridade Alta */}
              <div className="border border-rose-100 bg-rose-50/20 rounded-2xl p-4 transition-all hover:bg-rose-50/30">
                <div className="flex items-center gap-1.5 text-[9px] font-display font-black text-rose-600 uppercase tracking-wider mb-2">
                  <Flame className="w-3.5 h-3.5 text-rose-500" fill="currentColor" /> Prioridade Alta
                </div>
                <h4 className="text-xs font-display font-black text-[#0F172A] mb-1">Crie uma Landing Page</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                  Empresas que possuem landing page têm 3x mais chances de validar seu produto.
                </p>
                <div className="flex items-center justify-between text-[11px] font-display font-bold text-slate-400">
                  <span>Impacto esperado</span>
                  <span className="text-emerald-600 font-display font-black">+15 BES</span>
                </div>
              </div>

              {/* Oportunidade */}
              <div className="border border-blue-100 bg-blue-50/20 rounded-2xl p-4 transition-all hover:bg-blue-50/30">
                <div className="flex items-center gap-1.5 text-[9px] font-display font-black text-blue-600 uppercase tracking-wider mb-2">
                  <Target className="w-3.5 h-3.5 text-blue-500" /> Oportunidade
                </div>
                <h4 className="text-xs font-display font-black text-[#0F172A] mb-1">Ative o CRM</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                  Organize seus leads e aumente suas chances de conversão.
                </p>
                <div className="flex items-center justify-between text-[11px] font-display font-bold text-slate-400">
                  <span>Impacto esperado</span>
                  <span className="text-emerald-600 font-display font-black">+18 BES</span>
                </div>
              </div>
            </div>
          </div>

          <button className="text-blue-600 font-display font-bold text-xs flex items-center justify-center gap-1 mt-4 hover:underline">
            Ver todas recomendações <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Grid Row 2: Segundo Bloco de Cards e Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        
        {/* Card 5: Plano de Evolução Inteligente */}
        <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.03),0_1px_2px_0_rgba(15,23,42,0.02)] flex flex-col justify-between h-full">
          <div>
            <h3 className="text-sm font-display font-black text-[#0F172A]">Plano de Evolução Inteligente</h3>
            <p className="text-[11px] text-slate-400 font-medium mb-5">Ações recomendadas para aumentar seu BES</p>
            
            <div className="w-full overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[9px] uppercase text-slate-400 font-black tracking-wider">
                    <th className="pb-3 pt-1 font-bold">Ação Recomendada</th>
                    <th className="pb-3 pt-1 font-bold">Impacto</th>
                    <th className="pb-3 pt-1 font-bold">Esforço</th>
                    <th className="pb-3 pt-1 font-bold">Prioridade</th>
                    <th className="pb-3 pt-1 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="text-[11px]">
                  <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 flex items-center gap-2 text-[#0F172A] font-semibold">
                      <div className="w-5 h-5 rounded flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-400">
                        <Plus className="w-3 h-3" />
                      </div>
                      Cadastrar 10 clientes
                    </td>
                    <td className="py-3 font-display font-black text-emerald-600">+25 BES</td>
                    <td className="py-3 text-slate-400 font-bold">Médio</td>
                    <td className="py-3 text-amber-500 font-medium tracking-tight">★★★★★</td>
                    <td className="py-3 text-right"><span className="bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 rounded-md font-bold text-[9px]">Pendente</span></td>
                  </tr>
                  <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 flex items-center gap-2 text-[#0F172A] font-semibold">
                      <div className="w-5 h-5 rounded flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-400">
                        <FolderPlus className="w-3 h-3" />
                      </div>
                      Criar Landing Page
                    </td>
                    <td className="py-3 font-display font-black text-emerald-600">+15 BES</td>
                    <td className="py-3 text-slate-400 font-bold">Baixo</td>
                    <td className="py-3 text-amber-500 font-medium tracking-tight">★★★★<span className="text-slate-200">★</span></td>
                    <td className="py-3 text-right"><span className="bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 rounded-md font-bold text-[9px]">Pendente</span></td>
                  </tr>
                  <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 flex items-center gap-2 text-[#0F172A] font-semibold">
                      <div className="w-5 h-5 rounded flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-400">
                        <Rocket className="w-3 h-3" />
                      </div>
                      Publicar MVP
                    </td>
                    <td className="py-3 font-display font-black text-emerald-600">+30 BES</td>
                    <td className="py-3 text-slate-400 font-bold">Alto</td>
                    <td className="py-3 text-amber-500 font-medium tracking-tight">★★★★★</td>
                    <td className="py-3 text-right"><span className="bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 rounded-md font-bold text-[9px]">Pendente</span></td>
                  </tr>
                  <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 flex items-center gap-2 text-[#0F172A] font-semibold">
                      <div className="w-5 h-5 rounded flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-400">
                        <Box className="w-3 h-3" />
                      </div>
                      Organizar financeiro
                    </td>
                    <td className="py-3 font-display font-black text-emerald-600">+12 BES</td>
                    <td className="py-3 text-slate-400 font-bold">Médio</td>
                    <td className="py-3 text-amber-500 font-medium tracking-tight">★★★★<span className="text-slate-200">★</span></td>
                    <td className="py-3 text-right"><span className="bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 rounded-md font-bold text-[9px]">Pendente</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 flex items-center gap-2 text-[#0F172A] font-semibold">
                      <div className="w-5 h-5 rounded flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-400">
                        <Settings className="w-3 h-3" />
                      </div>
                      Configurar automações
                    </td>
                    <td className="py-3 font-display font-black text-emerald-600">+18 BES</td>
                    <td className="py-3 text-slate-400 font-bold">Médio</td>
                    <td className="py-3 text-amber-500 font-medium tracking-tight">★★★<span className="text-slate-200">★★</span></td>
                    <td className="py-3 text-right"><span className="bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 rounded-md font-bold text-[9px]">Pendente</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <button className="text-blue-600 font-display font-bold text-xs flex items-center justify-start gap-1 mt-6 hover:underline">
            Ver plano completo <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 6: Impacto das Ações */}
        <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.03),0_1px_2px_0_rgba(15,23,42,0.02)] flex flex-col justify-between h-full relative">
          <div>
            <h3 className="text-sm font-display font-black text-[#0F172A] mb-1">Impacto das Ações</h3>
            <p className="text-[11px] text-slate-400 font-medium mb-6">Simulação de evolução do seu score</p>
            
            <div className="flex justify-between items-center mb-4 px-2">
              <div>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider mb-1">Score atual</p>
                <span className="text-2xl font-display font-black text-[#0F172A]">420</span>
              </div>
              <div className="text-center">
                <span className="text-emerald-600 font-display font-black text-base bg-emerald-50 px-2.5 py-1 rounded-full">+120 BES</span>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider mt-1.5">Ganhos potenciais</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider mb-1">Score projetado</p>
                <span className="text-2xl font-display font-black text-blue-600">540</span>
              </div>
            </div>

            <div className="w-full h-[180px] -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CHART_DATA} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity="0.25"/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" hide />
                  <YAxis hide domain={['dataMin - 50', 'dataMax + 50']} />
                  <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <button className="text-blue-600 font-display font-bold text-xs flex items-center justify-center gap-1 mt-4 hover:underline bg-blue-50/50 py-2.5 rounded-xl w-full">
            Simular diferentes cenários <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 7: Atividade Recente */}
        <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.03),0_1px_2px_0_rgba(15,23,42,0.02)] flex flex-col justify-between h-full">
          <div>
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-sm font-display font-black text-[#0F172A]">Atividade Recente</h3>
              <button className="text-blue-600 font-display font-bold text-xs hover:underline">Ver histórico</button>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mb-6">Últimos eventos que impactaram seu score</p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-display font-bold text-[#0F172A]">Contrato assinado com NexHealth</h4>
                    <p className="text-[9px] text-slate-400 font-medium">Hoje, 09:45</p>
                  </div>
                </div>
                <span className="font-display font-black text-emerald-600 text-xs bg-emerald-50 px-2 py-0.5 rounded-md">+30</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-display font-bold text-[#0F172A]">Cliente cadastrado: Clínica Bem Viver</h4>
                    <p className="text-[9px] text-slate-400 font-medium">Hoje, 08:20</p>
                  </div>
                </div>
                <span className="font-display font-black text-emerald-600 text-xs bg-emerald-50 px-2 py-0.5 rounded-md">+5</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 border border-slate-100">
                    <Box className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-display font-bold text-[#0F172A]">Projeto "Sistema Web" criado</h4>
                    <p className="text-[9px] text-slate-400 font-medium">Hoje, 08:15</p>
                  </div>
                </div>
                <span className="font-display font-black text-emerald-600 text-xs bg-emerald-50 px-2 py-0.5 rounded-md">+5</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-display font-bold text-[#0F172A]">Tarefa concluída: Configurar servidor</h4>
                    <p className="text-[9px] text-slate-400 font-medium">Ontem, 18:30</p>
                  </div>
                </div>
                <span className="font-display font-black text-emerald-600 text-xs bg-emerald-50 px-2 py-0.5 rounded-md">+2</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-display font-bold text-[#0F172A]">Projeto atrasado: App Mobile</h4>
                    <p className="text-[9px] text-slate-400 font-medium">Ontem, 16:10</p>
                  </div>
                </div>
                <span className="font-display font-black text-rose-600 text-xs bg-rose-50 px-2 py-0.5 rounded-md">-5</span>
              </div>
            </div>
          </div>
          
          <button className="text-blue-600 font-display font-bold text-xs flex items-center justify-center gap-1 mt-6 hover:underline bg-blue-50/50 py-2.5 rounded-xl w-full">
            Ver todos eventos <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Row 3: Insights Banner com Layout Idêntico e Visual Polido */}
      <div className="w-full bg-white border border-slate-100 rounded-[24px] p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.03),0_1px_2px_0_rgba(15,23,42,0.02)] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Efeito Glow Traseiro no Ícone */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-blue-50/20 rounded-l-[24px] -z-10" />

        <div className="flex items-center gap-6 z-10 flex-1">
          {/* Hexágono com Estilo 3D/Profundidade */}
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 relative shadow-inner">
            <div className="absolute inset-0 bg-blue-400/10 rounded-2xl blur-lg animate-pulse" />
            <Box className="w-8 h-8 text-blue-600 relative z-10" fill="currentColor" />
          </div>
          <div>
            <h3 className="text-sm font-display font-black text-blue-800 mb-1">Insights do Consultor Executivo IA</h3>
            <p className="text-[12px] text-slate-600 font-medium leading-relaxed max-w-3xl">
              Sua empresa demonstra excelente capacidade de execução, mas possui oportunidades significativas em aquisição de clientes. <br/>
              <span className="text-slate-400">Empresas no estágio de Validação com foco em mercado crescem 2.5x mais rápido.</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8 z-10">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-display font-black text-slate-400 uppercase tracking-wider">Foco Recomendado</span>
            <span className="text-xs font-display font-black text-[#0F172A]">Mercado e Clientes</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-display font-black text-slate-400 uppercase tracking-wider">Impacto Estimado</span>
            <span className="text-xs font-display font-black text-emerald-600">+58 BES</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-display font-black text-slate-400 uppercase tracking-wider">Tempo Estimado</span>
            <span className="text-xs font-display font-black text-[#0F172A]">26 dias</span>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-display font-bold text-xs transition-all flex items-center gap-1.5 ml-4 shadow-sm shadow-blue-200">
            Conversar com IA <MessageSquare className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
    </div>
  );
}
