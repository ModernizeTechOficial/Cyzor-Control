import { Target, CheckCircle2, Check, ArrowRight, ShieldAlert, Sparkles, Building2, ChevronDown, Rocket, TrendingUp, AlertTriangle, MessageSquare, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import StandardHeader from './layout/StandardHeader';
import { 
  useIdeas, useProjects, useProducts, useTasks, useFinance, useCompanies 
} from '../hooks/useCyzorQueries';
import { View } from '../types';
import { useState, useMemo } from 'react';
import { getProfessionalEvolutionInfo, generateProfessionalInsights, PROFESSIONAL_STAGES } from '../utils/professionalEvolutionCalculator';

export default function PlanejamentoEstrategicoView({ setCurrentView }: { setCurrentView: (view: View) => void }) {
  const { activeWorkspace } = useAuth();
  const { setGlobalFilters } = useNavigation();

  // Queries using React Query
  const { data: companies = [] } = useCompanies();
  const { data: projects = [] } = useProjects();
  const { data: products = [] } = useProducts();
  const { data: tasks = [] } = useTasks();
  const { data: financeEntries = [] } = useFinance();

  const [showEntitySelector, setShowEntitySelector] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<string>('global');

  const entitiesCount = useMemo(() => {
    return {
      companies: companies.length,
      projects: projects.length,
      products: products.length,
      tasks: tasks.length,
      financeEntries: financeEntries.length,
      clients: 0 // Mocking for now, we'd need useClients if it exists
    };
  }, [companies, projects, products, tasks, financeEntries]);

  // For the specific entity or global, we compute the professional evolution XP.
  // In a real scenario, each entity would have its own score computed.
  // Here we use the workspace evolution XP for simplicity on the frontend,
  // or fall back to the legacy BES value while the migration stabilizes.
  const evolutionXp = activeWorkspace?.settings?.professionalEvolution?.xpTotal || activeWorkspace?.settings?.besScore || 3250; 
  
  const { currentStage, nextStage, progress, xpToNext } = getProfessionalEvolutionInfo(evolutionXp);
  const { diagnostics, recommendations, reasons } = generateProfessionalInsights(evolutionXp, entitiesCount);

  return (
    <div className="w-full mx-auto pb-12 flex flex-col gap-6 animate-in fade-in duration-500 relative px-4 sm:px-6 lg:px-10">
      
      <StandardHeader 
        title="Evolução Profissional"
        subtitle={selectedEntity === 'global' ? "Maturidade inteligente do seu Workspace baseada em eventos de evolução." : `Maturidade específica de: ${[...companies, ...projects, ...products].find(e => e.id === selectedEntity)?.name || selectedEntity}`}
        breadcrumb={[{ label: 'Maturidade Corporativa' }]}
        actions={[
          {
            label: 'Ver Relatório Completo',
            icon: Target,
            onClick: () => {},
            variant: 'primary'
          }
        ]}
      >
        {/* Seletor de Contexto (Global vs Específico) */}
        <div className="relative shrink-0 hidden sm:block">
          <button
            onClick={() => setShowEntitySelector(!showEntitySelector)}
            className="flex items-center justify-center gap-2 bg-white hover:bg-[#FAFAFA] border border-[#0F172A0F] text-[#111111] px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>
              {selectedEntity === 'global' 
                ? 'Global (Workspace)' 
                : [...companies, ...projects, ...products].find(e => e.id === selectedEntity)?.name || 'Específico'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
          
          <AnimatePresence>
            {showEntitySelector && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-72 bg-white border border-[#0F172A0F] rounded-2xl shadow-xl z-50 p-2 max-h-96 overflow-y-auto text-left"
              >
                <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                  Visão Global
                </div>
                <button
                  onClick={() => { setSelectedEntity('global'); setShowEntitySelector(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex justify-between items-center transition-colors cursor-pointer ${selectedEntity === 'global' ? 'bg-[#111111] text-white font-bold' : 'hover:bg-slate-50 text-slate-700 font-bold'}`}
                >
                  <span>Workspace Global</span>
                  {selectedEntity === 'global' && <Check className="w-4 h-4 text-white" />}
                </button>

                {companies.length > 0 && (
                  <>
                    <div className="px-3 py-2 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                      Empresas
                    </div>
                    {companies.map((c: any) => (
                      <button
                        key={c.id}
                        onClick={() => { setSelectedEntity(c.id); setShowEntitySelector(false); }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex justify-between items-center transition-colors cursor-pointer ${selectedEntity === c.id ? 'bg-[#111111] text-white font-bold' : 'hover:bg-slate-50 text-slate-700 font-bold'}`}
                      >
                        <span className="truncate">{c.name}</span>
                        {selectedEntity === c.id && <Check className="w-4 h-4 shrink-0 text-white" />}
                      </button>
                    ))}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </StandardHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Maturidade e Score */}
        <div className="lg:col-span-1 bg-white border border-slate-100 rounded-[24px] p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.03),0_1px_2px_0_rgba(15,23,42,0.02)] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-display font-black text-[#0F172A] mb-1">Maturidade Operacional</h3>
            <p className="text-[11px] text-slate-400 font-medium mb-6">Calculada via Eventos de Evolução</p>
            
            <div className="flex flex-col items-center justify-center gap-2 mb-6">
              <span className="text-xs font-display font-black text-slate-500 uppercase tracking-wider">{currentStage.label}</span>
              <span className="text-7xl font-display font-black text-[#0F172A] tracking-tighter">{progress}%</span>
              <span className="text-xs font-bold bg-slate-50 text-slate-600 px-3 py-1 rounded-full">{evolutionXp.toLocaleString()} XP</span>
            </div>
            
            {nextStage && (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <TrendingUp className="w-16 h-16" />
                </div>
                <span className="text-[10px] font-display font-black text-slate-400 uppercase tracking-wider">Próximo Estágio</span>
                <span className="text-lg font-display font-black text-[#0F172A]">{nextStage.label}</span>
                <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-[#111111] rounded-full" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-[10px] font-bold text-slate-500 mt-1">Faltam <strong className="text-[#0F172A]">{xpToNext.toLocaleString()} pontos</strong> de evolução.</p>
              </div>
            )}
          </div>
        </div>

        {/* Diagnóstico da IA */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[24px] p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.03),0_1px_2px_0_rgba(15,23,42,0.02)] relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <Sparkles className="w-32 h-32" />
          </div>
          
          <div className="flex items-center gap-2 mb-6 relative z-10">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
               <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-display font-black text-[#0F172A]">Diagnóstico Cyzor AI</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Consultor Executivo</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-6 relative z-10">
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              {diagnostics}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4">
                 <h4 className="flex items-center gap-1.5 text-xs font-display font-black text-rose-700 uppercase tracking-wider mb-3">
                   <AlertTriangle className="w-3.5 h-3.5" /> Porque você está em {currentStage.label}
                 </h4>
                 <ul className="space-y-2">
                   {reasons.map((reason, idx) => (
                     <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-700 font-medium">
                       <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                       Ainda não possui {reason.toLowerCase()}
                     </li>
                   ))}
                 </ul>
              </div>

              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4">
                 <h4 className="flex items-center gap-1.5 text-xs font-display font-black text-emerald-700 uppercase tracking-wider mb-3">
                   <Rocket className="w-3.5 h-3.5" /> Como avançar para {nextStage?.label || 'o topo'}
                 </h4>
                 <ul className="space-y-3">
                   {recommendations.map((rec: any, idx: number) => (
                     <li key={idx} className="flex flex-col gap-1">
                       <div className="flex items-start gap-2 text-[11px] text-slate-700 font-bold">
                         <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                         {rec.title}
                       </div>
                       <span className="pl-5 text-[10px] font-display font-black text-emerald-600 tracking-wide">{rec.impact}</span>
                     </li>
                   ))}
                 </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between relative z-10">
            <span className="text-[11px] font-bold text-slate-400">Algoritmo atualizado em tempo real</span>
            <button className="text-blue-600 font-display font-bold text-xs flex items-center gap-1.5 hover:underline">
              Conversar sobre estratégia <MessageSquare className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabela de Níveis (Informativa) */}
      <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.03),0_1px_2px_0_rgba(15,23,42,0.02)]">
        <h3 className="text-sm font-display font-black text-[#0F172A] mb-1">Mapa de Evolução</h3>
        <p className="text-[11px] text-slate-400 font-medium mb-6">Acompanhe a trilha de maturidade da plataforma.</p>
        
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[600px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-[20%]">Estágio</th>
                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-[20%]">Pontuação de Evolução</th>
                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-[30%]">Foco Operacional</th>
                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-[30%]">Status</th>
              </tr>
            </thead>
            <tbody>
              {PROFESSIONAL_STAGES.map((stage) => {
                const isCurrent = stage.id === currentStage.id;
                const isPast = stage.max < evolutionXp;
                
                return (
                  <tr key={stage.id} className={`border-b border-slate-50 last:border-0 ${isCurrent ? 'bg-slate-50' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.2)]' : isPast ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                        <span className={`font-display font-black text-xs ${isCurrent ? 'text-[#0F172A]' : 'text-slate-600'}`}>{stage.label}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] font-bold text-slate-500">
                      {stage.min.toLocaleString()} - {stage.max === Infinity ? '∞' : stage.max.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-[11px] font-medium text-slate-600">
                      {stage.role}
                    </td>
                    <td className="py-3 px-4">
                      {isCurrent ? (
                        <span className="text-[10px] font-display font-black text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md">Atual</span>
                      ) : isPast ? (
                        <span className="text-[10px] font-display font-black text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md">Concluído</span>
                      ) : (
                        <span className="text-[10px] font-display font-black text-slate-400 uppercase tracking-wider">Bloqueado</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Eventos Recentes */}
      <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.03),0_1px_2px_0_rgba(15,23,42,0.02)]">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-sm font-display font-black text-[#0F172A] mb-1">Últimos Eventos (Timeline de Evolução)</h3>
            <p className="text-[11px] text-slate-400 font-medium">Ações que impactaram sua pontuação recentemente.</p>
          </div>
          <button className="text-blue-600 font-display font-bold text-xs hover:underline">Ver tudo</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-display font-black text-[#0F172A] truncate">Contrato Assinado</h4>
              <p className="text-[10px] text-slate-500 font-medium">Hoje, 09:45</p>
            </div>
            <span className="font-display font-black text-emerald-600 text-xs bg-emerald-100/50 px-2.5 py-1 rounded-lg">+30</span>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-display font-black text-[#0F172A] truncate">Novo Projeto Iniciado</h4>
              <p className="text-[10px] text-slate-500 font-medium">Hoje, 08:20</p>
            </div>
            <span className="font-display font-black text-emerald-600 text-xs bg-emerald-100/50 px-2.5 py-1 rounded-lg">+15</span>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-display font-black text-[#0F172A] truncate">Projeto Atrasado</h4>
              <p className="text-[10px] text-slate-500 font-medium">Ontem, 16:10</p>
            </div>
            <span className="font-display font-black text-rose-600 text-xs bg-rose-100/50 px-2.5 py-1 rounded-lg">-10</span>
          </div>
        </div>
      </div>

    </div>
  );
}
