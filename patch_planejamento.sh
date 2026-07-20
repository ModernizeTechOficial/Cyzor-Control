#!/bin/bash
cat << 'INNEREOF' > src/components/PlanejamentoEstrategicoView.tsx
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { 
  useIdeas, useProjects, useProducts, useTasks, useFinance 
} from '../hooks/useCyzorQueries';
import { View } from '../types';
import { 
  Sparkles, CheckCircle2, 
  ArrowRight,
  Info, ChevronDown, Check, TrendingUp, Download, Play, ShieldAlert, Zap, Clock, Box
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { showSuccess, showError } from '../lib/alerts';
import ReactMarkdown from 'react-markdown';
import { calculateStrategicPriority } from '../utils/strategicPrioritizer';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const STAGES = [
  { id: 'Ideia', label: 'Ideia', description: 'Estruturação da ideia de negócio e modelagem conceitual inicial.', progress: 10, next: 'Validação' },
  { id: 'Validação', label: 'Validação', description: 'Pesquisa com clientes ideais e validação empírica do problema.', progress: 20, next: 'MVP' },
  { id: 'MVP', label: 'MVP', description: 'Desenho de escopo, especificação e estruturação do cronograma do MVP.', progress: 35, next: 'Operação' },
  { id: 'Operação', label: 'Operação', description: 'Construção focada das primeiras funcionalidades funcionais do produto.', progress: 50, next: 'Escala' },
  { id: 'Escala', label: 'Escala', description: 'Otimização de canais de marketing e vendas focando em escala e canais de ROI.', progress: 70, next: 'Empresa' },
  { id: 'Empresa', label: 'Empresa', description: 'Consolidação de gestão, processos, liderança corporativa.', progress: 85, next: 'Ecossistema' },
  { id: 'Ecossistema', label: 'Ecossistema', description: 'Dominância de mercado, parcerias globais e M&A.', progress: 100, next: 'Concluído!' }
];

const RadarCustomTick = (props: any) => {
  const { payload, x, y, textAnchor } = props;
  const [label, percent] = payload.value.split('|');
  
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={-8} dy={0} textAnchor={textAnchor} fill="#0F172A" fontSize={11} fontWeight={700}>
        {label}
      </text>
      <text x={0} y={8} dy={0} textAnchor={textAnchor} fill="#2563EB" fontSize={11} fontWeight={700}>
        {percent}
      </text>
    </g>
  );
};

const CHART_DATA = [
  { name: '400', value: 380 },
  { name: '420', value: 420 },
  { name: '450', value: 440 },
  { name: '480', value: 470 },
  { name: '500', value: 500 },
  { name: '540', value: 540 },
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
    // try to match with STAGES or fallback to Validação to match the image visually
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
    <div className="w-full max-w-[1600px] mx-auto pb-16 flex flex-col gap-6 animate-in fade-in duration-300 relative px-4 sm:px-6 lg:px-8">
      
      {/* Dynamic Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#111111] tracking-tight flex items-center gap-2">
            Business Event Score (BES)
            <Info className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" />
          </h1>
          <p className="text-sm text-[#64748B] font-medium mt-1">
            Acompanhe a evolução e maturidade da sua empresa em tempo real
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Level Selector */}
          <div className="relative">
            <button
              onClick={() => setShowStageSelector(!showStageSelector)}
              className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm"
            >
              <Box className="w-4 h-4 text-slate-400" />
              Nível: {currentStage}
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            <AnimatePresence>
              {showStageSelector && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 max-h-80 overflow-y-auto"
                >
                  <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 mb-1">
                    Selecione o nível de maturidade
                  </div>
                  {STAGES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleStageChange(s.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex justify-between items-center transition-colors ${currentStage === s.id ? 'bg-[#111111] text-white' : 'hover:bg-slate-50 text-slate-700 font-bold'}`}
                    >
                      {s.label}
                      {currentStage === s.id && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm">
            <Download className="w-4 h-4 text-slate-400" />
            Exportar Relatório
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Grid Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full">
        
        {/* Card 1: Seu Score Atual */}
        <div className="bg-white border border-[#0F172A0F] rounded-[24px] p-6 shadow-sm flex flex-col justify-between h-full">
          <div>
            <h3 className="text-sm font-black text-[#111111] mb-6">Seu Score Atual</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-6xl font-black text-blue-600 tracking-tight">{besScore}</span>
              <span className="text-sm font-bold text-[#64748B]">/ 1000</span>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Maturidade: 
              </span>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">
                {currentStage.toUpperCase()}
              </span>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <p className="text-[13px] text-slate-500 font-medium leading-relaxed mb-6">
              Você está no caminho certo! Continue executando ações estratégicas para evoluir para o próximo nível.
            </p>

            <div className="flex items-center justify-between gap-2 mb-6">
              <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] font-bold text-emerald-700">+32 pts</span>
                <span className="text-[10px] text-emerald-600/70">esta semana</span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-md">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] font-bold text-emerald-700">+8%</span>
                <span className="text-[10px] text-emerald-600/70">últimos 30 dias</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] font-bold text-slate-600">Top 21%</span>
                <span className="text-[10px] text-slate-500">entre empresas</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: '42%' }} />
            </div>
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-500">Progresso geral</span>
              <span className="text-blue-600">42%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Radar de Maturidade */}
        <div className="bg-white border border-[#0F172A0F] rounded-[24px] p-6 shadow-sm flex flex-col items-center relative h-full">
          <div className="w-full text-left mb-2">
            <h3 className="text-sm font-black text-[#111111]">Radar de Maturidade</h3>
          </div>
          
          <div className="flex-1 w-full flex items-center justify-center min-h-[200px]">
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={[
                { subject: 'Mercado|60%', A: 60, fullMark: 100 },
                { subject: 'Cliente|30%', A: 30, fullMark: 100 },
                { subject: 'Execução|50%', A: 50, fullMark: 100 },
                { subject: 'Time|55%', A: 55, fullMark: 100 },
                { subject: 'Financeiro|45%', A: 45, fullMark: 100 },
                { subject: 'Produto|40%', A: 40, fullMark: 100 },
              ]}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" tick={<RadarCustomTick />} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Score" dataKey="A" stroke="#2563EB" strokeWidth={2} fill="#3B82F6" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <button className="text-blue-600 font-bold text-xs flex items-center justify-center gap-1 mt-4 hover:underline">
            Ver detalhes por pilar <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 3: Jornada Empresarial */}
        <div className="bg-white border border-[#0F172A0F] rounded-[24px] p-6 shadow-sm flex flex-col justify-between h-full">
          <div>
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-sm font-black text-[#111111]">Jornada Empresarial</h3>
              <button className="text-blue-600 font-bold text-xs hover:underline">Ver todas as etapas</button>
            </div>
            <p className="text-[12px] text-slate-500 font-medium mb-6">Entenda em qual estágio sua empresa está</p>

            {/* Stepper Visual */}
            <div className="relative flex justify-between items-center mb-8 px-2">
              <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-slate-100 z-0" />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 h-0.5 bg-blue-500 z-0" style={{ width: '25%' }} />
              
              {STAGES.slice(0,7).map((s, idx) => {
                const isActive = currentStage === s.id;
                const isPast = idx < activeStageIndex;
                return (
                  <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all bg-white
                      ${isActive ? 'border-blue-600 shadow-[0_0_0_4px_rgba(37,99,235,0.1)]' : isPast ? 'border-emerald-500 text-emerald-500' : 'border-slate-200 text-slate-300'}
                    `}>
                      {isPast ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : 
                       isActive ? <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" /> :
                       <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />}
                    </div>
                    {isActive && (
                      <div className="absolute top-10 flex flex-col items-center">
                        <span className="text-[10px] font-black text-blue-600 whitespace-nowrap">{s.label}</span>
                        <span className="text-[9px] font-bold text-white bg-blue-600 px-2 py-0.5 rounded-full mt-1">Atual</span>
                      </div>
                    )}
                    {!isActive && (
                      <div className="absolute top-10 flex flex-col items-center">
                        <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">{s.label}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            
            {/* Current Stage details */}
            <div className="mt-14 mb-4">
              <h4 className="text-sm font-black text-[#111111]">{currentStage}</h4>
              <p className="text-xs text-slate-500 font-medium">35% concluído</p>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed mb-4 font-medium">
              Confirme se existe um mercado e valide seu modelo de negócio inicial.
            </p>
            
            <div className="space-y-1 mb-4">
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '42%' }} />
              </div>
              <p className="text-[10px] text-slate-400 font-bold">3 de 7 critérios atendidos</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
             <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0" />
                  <span className="text-[11px] text-slate-600 font-medium">Criar Landing Page</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0" />
                  <span className="text-[11px] text-slate-600 font-medium">Realizar entrevistas com usuários</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0" />
                  <span className="text-[11px] text-slate-600 font-medium">Gerar primeiros leads</span>
                </div>
             </div>
             <button className="text-blue-600 font-bold text-xs flex items-center justify-center gap-1 mt-2 hover:underline w-full p-2 bg-blue-50/50 rounded-xl">
               Ver detalhes da etapa <ArrowRight className="w-3 h-3" />
             </button>
          </div>
        </div>

        {/* Card 4: Recomendações da IA */}
        <div className="bg-white border border-[#0F172A0F] rounded-[24px] p-6 shadow-sm flex flex-col justify-between h-full">
          <div>
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-sm font-black text-[#111111]">Recomendações da IA</h3>
            </div>
            <p className="text-[12px] text-slate-500 font-medium mb-4">Baseado nos dados do seu negócio</p>

            <div className="space-y-4">
              {/* High Priority */}
              <div className="border border-rose-100 bg-rose-50/30 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-2">
                  <Zap className="w-3.5 h-3.5" fill="currentColor" /> Prioridade Alta
                </div>
                <h4 className="text-xs font-black text-[#111111] mb-1">Crie uma Landing Page</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                  Empresas que possuem landing page têm 3x mais chances de validar seu produto.
                </p>
                <div className="text-[11px] font-medium text-slate-500">
                  Impacto esperado <br/>
                  <span className="text-emerald-600 font-black text-sm">+15 BES</span>
                </div>
              </div>

              {/* Opportunity */}
              <div className="border border-blue-100 bg-blue-50/30 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> Oportunidade
                </div>
                <h4 className="text-xs font-black text-[#111111] mb-1">Ative o CRM</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                  Organize seus leads e aumente suas chances de conversão.
                </p>
                <div className="text-[11px] font-medium text-slate-500">
                  Impacto esperado <br/>
                  <span className="text-emerald-600 font-black text-sm">+18 BES</span>
                </div>
              </div>
            </div>
          </div>

          <button className="text-blue-600 font-bold text-xs flex items-center justify-center gap-1 mt-4 hover:underline">
            Ver todas recomendações <ArrowRight className="w-3 h-3" />
          </button>
        </div>

      </div>

      {/* Grid Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        
        {/* Card 5: Plano de Evolução Inteligente */}
        <div className="bg-white border border-[#0F172A0F] rounded-[24px] p-6 shadow-sm flex flex-col justify-between h-full">
          <div>
            <h3 className="text-sm font-black text-[#111111]">Plano de Evolução Inteligente</h3>
            <p className="text-[12px] text-slate-500 font-medium mb-6">Ações recomendadas para aumentar seu BES</p>
            
            <div className="w-full overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                    <th className="pb-3 pt-2 px-2 font-bold">Ação Recomendada</th>
                    <th className="pb-3 pt-2 px-2 font-bold">Impacto</th>
                    <th className="pb-3 pt-2 px-2 font-bold">Esforço</th>
                    <th className="pb-3 pt-2 px-2 font-bold">Prioridade</th>
                    <th className="pb-3 pt-2 px-2 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-2 flex items-center gap-2 text-slate-700 font-medium">
                      <div className="w-5 h-5 rounded flex items-center justify-center bg-slate-100 text-slate-500"><Info className="w-3 h-3" /></div>
                      Cadastrar 10 clientes
                    </td>
                    <td className="py-3 px-2 font-black text-emerald-600">+25 BES</td>
                    <td className="py-3 px-2 text-slate-500 font-medium">Médio</td>
                    <td className="py-3 px-2 text-blue-600">★★★★★</td>
                    <td className="py-3 px-2 text-right"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-bold text-[10px]">Pendente</span></td>
                  </tr>
                  <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-2 flex items-center gap-2 text-slate-700 font-medium">
                      <div className="w-5 h-5 rounded flex items-center justify-center bg-slate-100 text-slate-500"><Box className="w-3 h-3" /></div>
                      Criar Landing Page
                    </td>
                    <td className="py-3 px-2 font-black text-emerald-600">+15 BES</td>
                    <td className="py-3 px-2 text-slate-500 font-medium">Baixo</td>
                    <td className="py-3 px-2 text-blue-600">★★★★<span className="text-slate-200">★</span></td>
                    <td className="py-3 px-2 text-right"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-bold text-[10px]">Pendente</span></td>
                  </tr>
                  <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-2 flex items-center gap-2 text-slate-700 font-medium">
                      <div className="w-5 h-5 rounded flex items-center justify-center bg-slate-100 text-slate-500"><Box className="w-3 h-3" /></div>
                      Publicar MVP
                    </td>
                    <td className="py-3 px-2 font-black text-emerald-600">+30 BES</td>
                    <td className="py-3 px-2 text-slate-500 font-medium">Alto</td>
                    <td className="py-3 px-2 text-blue-600">★★★★★</td>
                    <td className="py-3 px-2 text-right"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-bold text-[10px]">Pendente</span></td>
                  </tr>
                  <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-2 flex items-center gap-2 text-slate-700 font-medium">
                      <div className="w-5 h-5 rounded flex items-center justify-center bg-slate-100 text-slate-500"><CheckCircle2 className="w-3 h-3" /></div>
                      Organizar financeiro
                    </td>
                    <td className="py-3 px-2 font-black text-emerald-600">+12 BES</td>
                    <td className="py-3 px-2 text-slate-500 font-medium">Médio</td>
                    <td className="py-3 px-2 text-blue-600">★★★★<span className="text-slate-200">★</span></td>
                    <td className="py-3 px-2 text-right"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-bold text-[10px]">Pendente</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-2 flex items-center gap-2 text-slate-700 font-medium">
                      <div className="w-5 h-5 rounded flex items-center justify-center bg-slate-100 text-slate-500"><Info className="w-3 h-3" /></div>
                      Configurar automações
                    </td>
                    <td className="py-3 px-2 font-black text-emerald-600">+18 BES</td>
                    <td className="py-3 px-2 text-slate-500 font-medium">Médio</td>
                    <td className="py-3 px-2 text-blue-600">★★★<span className="text-slate-200">★★</span></td>
                    <td className="py-3 px-2 text-right"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-bold text-[10px]">Pendente</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <button className="text-blue-600 font-bold text-xs flex items-center justify-start gap-1 mt-6 hover:underline">
            Ver plano completo <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 6: Impacto das Ações */}
        <div className="bg-white border border-[#0F172A0F] rounded-[24px] p-6 shadow-sm flex flex-col justify-between h-full relative">
          <div>
            <h3 className="text-sm font-black text-[#111111]">Impacto das Ações</h3>
            <p className="text-[12px] text-slate-500 font-medium mb-6">Simulação de evolução do seu score</p>
            
            <div className="flex justify-between items-start mb-2 px-2">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Score atual</p>
                <span className="text-2xl font-black text-blue-600">420</span>
              </div>
              <div className="text-center">
                <span className="text-emerald-600 font-black text-lg">+120 BES</span>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ganhos potenciais</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Score projetado</p>
                <span className="text-2xl font-black text-blue-600">540</span>
              </div>
            </div>

            <div className="w-full h-[180px] -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CHART_DATA} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" hide />
                  <YAxis hide domain={['dataMin - 50', 'dataMax + 50']} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <button className="text-blue-600 font-bold text-xs flex items-center justify-center gap-1 mt-4 hover:underline bg-blue-50/50 py-2.5 rounded-xl w-full mx-auto">
            Simular diferentes cenários <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 7: Atividade Recente */}
        <div className="bg-white border border-[#0F172A0F] rounded-[24px] p-6 shadow-sm flex flex-col justify-between h-full">
          <div>
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-sm font-black text-[#111111]">Atividade Recente</h3>
              <button className="text-blue-600 font-bold text-xs hover:underline">Ver histórico</button>
            </div>
            <p className="text-[12px] text-slate-500 font-medium mb-6">Últimos eventos que impactaram seu score</p>
            
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-700">Contrato assinado com NexHealth</h4>
                    <p className="text-[10px] text-slate-400 font-medium">Hoje, 09:45</p>
                  </div>
                </div>
                <span className="font-black text-emerald-600 text-sm">+30</span>
              </div>
              
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-700">Cliente cadastrado: Clínica Bem Viver</h4>
                    <p className="text-[10px] text-slate-400 font-medium">Hoje, 08:20</p>
                  </div>
                </div>
                <span className="font-black text-emerald-600 text-sm">+5</span>
              </div>

              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200">
                    <Box className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-700">Projeto "Sistema Web" criado</h4>
                    <p className="text-[10px] text-slate-400 font-medium">Hoje, 08:15</p>
                  </div>
                </div>
                <span className="font-black text-emerald-600 text-sm">+5</span>
              </div>

              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-700">Tarefa concluída: Configurar servidor</h4>
                    <p className="text-[10px] text-slate-400 font-medium">Ontem, 18:30</p>
                  </div>
                </div>
                <span className="font-black text-emerald-600 text-sm">+2</span>
              </div>

              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-700">Projeto atrasado: App Mobile</h4>
                    <p className="text-[10px] text-slate-400 font-medium">Ontem, 16:10</p>
                  </div>
                </div>
                <span className="font-black text-rose-600 text-sm">-5</span>
              </div>
            </div>
          </div>
          
          <button className="text-blue-600 font-bold text-xs flex items-center justify-center gap-1 mt-6 hover:underline bg-blue-50/50 py-2.5 rounded-xl w-full mx-auto">
            Ver todos eventos <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Row 3: Insights Banner */}
      <div className="w-full bg-white border border-[#0F172A0F] rounded-[24px] p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-blue-50/50 rounded-l-[24px] -z-10" />

        <div className="flex items-center gap-6 z-10 flex-1">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 relative">
            <div className="absolute inset-0 bg-blue-400/20 rounded-2xl blur-xl" />
            <Box className="w-8 h-8 text-blue-600 relative z-10" fill="currentColor" />
          </div>
          <div>
            <h3 className="text-sm font-black text-blue-800 mb-1">Insights do Consultor Executivo IA</h3>
            <p className="text-[13px] text-slate-700 font-medium leading-relaxed max-w-3xl">
              Sua empresa demonstra excelente capacidade de execução, mas possui oportunidades significativas em aquisição de clientes. <br/>
              <span className="text-slate-500">Empresas no estágio de Validação com foco em mercado crescem 2.5x mais rápido.</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8 z-10">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Foco Recomendado</span>
            <span className="text-xs font-black text-[#111111]">Mercado e Clientes</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Impacto Estimado</span>
            <span className="text-xs font-black text-emerald-600">+58 BES</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tempo Estimado</span>
            <span className="text-xs font-black text-[#111111]">26 dias</span>
          </div>
          <button className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-5 py-3 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 ml-4">
            Conversar com IA <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
    </div>
  );
}
INNEREOF
