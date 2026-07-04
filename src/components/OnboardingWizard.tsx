import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, ArrowRight, Lightbulb, Box, 
  CheckCircle2, Target, Calendar, User, Rocket,
  TrendingUp, BarChart3, HelpCircle, ArrowLeft,
  Building, CheckSquare, Layers, Users, ShieldCheck, HelpCircle as HelpIcon
} from 'lucide-react';
import { showSuccess, showError } from '../lib/alerts';

const BUSINESS_TYPES = [
  { id: 'SaaS', label: 'SaaS (Software as a Service)', desc: 'Sistemas de assinatura online e softwares recorrentes' },
  { id: 'Startup', label: 'Startup inovadora', desc: 'Negócios escaláveis em busca de Product-Market Fit' },
  { id: 'Agência', label: 'Agência Digital', desc: 'Serviços de marketing, design, conteúdo ou tráfego' },
  { id: 'Software House', label: 'Software House / Dev Shop', desc: 'Desenvolvimento de software sob demanda ou fábricas' },
  { id: 'Marketplace', label: 'Marketplace', desc: 'Plataformas que conectam compradores e vendedores' },
  { id: 'Plataforma Educacional', label: 'Plataforma Educacional / EdTech', desc: 'Infoprodutos, cursos online e plataformas de ensino' },
  { id: 'Aplicativo', label: 'Aplicativo Mobile', desc: 'Apps nativos iOS/Android ou utilitários para dispositivos' },
  { id: 'Consultoria', label: 'Consultoria / Mentorias', desc: 'Serviços especializados, assessorias e prestação de contas' },
  { id: 'E-commerce', label: 'E-commerce / D2C', desc: 'Venda de produtos físicos ou lojas virtuais' },
  { id: 'Outro', label: 'Outro Modelo Digital', desc: 'Ideias inovadoras e outros modelos de negócios digitais' }
];

const STAGES = [
  { id: 'Ideia', label: 'Tenho apenas uma ideia', desc: 'Ainda estou modelando e definindo o que será construído' },
  { id: 'Validação', label: 'Estou validando', desc: 'Estou conversando com potenciais clientes e desenhando a proposta de valor' },
  { id: 'Desenvolvimento', label: 'Já estou desenvolvendo', desc: 'Construindo o MVP ou a primeira versão operacional' },
  { id: 'Produto', label: 'Já possuo um produto', desc: 'O produto está pronto, mas ainda sem vendas constantes' },
  { id: 'Clientes', label: 'Já tenho clientes ativos', desc: 'Faturamento inicial, testando canais de vendas e crescimento' },
  { id: 'Gestão', label: 'Minha empresa já está operando', desc: 'Operação estruturada, buscando otimizar margens e escalar processos' }
];

interface OnboardingWizardProps {
  onComplete: () => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { activeWorkspace, fetchWithAuth, updateSaaSBackend } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form State
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('SaaS');
  const [businessStage, setBusinessStage] = useState('Ideia');
  const [ideaDescription, setIdeaDescription] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    if (currentStep === 1 && !businessName.trim()) {
      showError('Por favor, informe o nome da sua futura empresa.');
      return;
    }
    if (currentStep === 4 && !ideaDescription.trim()) {
      showError('Por favor, descreva brevemente a sua ideia.');
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleFinish = async () => {
    if (!businessName || !ideaDescription) return;
    setIsSubmitting(true);
    try {
      // 1. Update Workspace settings via PUT
      const updateRes = await fetchWithAuth(`/api/workspaces/${activeWorkspace.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: businessName,
          settings: {
            onboardingCompleted: true,
            businessType,
            stage: businessStage,
            initialIdeaDescription: ideaDescription,
            journeyCompleted: false
          }
        })
      });

      if (!updateRes.ok) {
        throw new Error('Falha ao atualizar o Workspace');
      }

      // 2. Create Company
      const companyRes = await fetchWithAuth('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${businessName} Matriz`,
          industry: businessType,
          size: '1-5 colaboradores',
          status: 'Ativo'
        })
      });

      let companyId: number | null = null;
      if (companyRes.ok) {
        const company = await companyRes.json();
        companyId = company.id;
      }

      // 3. Create Idea
      const ideaRes = await fetchWithAuth('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Ideia de Negócio: ${businessName}`,
          description: ideaDescription,
          status: businessStage === 'Ideia' ? 'capturadas' : 'avaliacao',
          priority: 'Alta'
        })
      });

      let ideaId: number | null = null;
      if (ideaRes.ok) {
        const idea = await ideaRes.json();
        ideaId = idea.id;
      }

      // 4. Create Initial Project if past the Idea stage
      if (businessStage !== 'Ideia') {
        const projectRes = await fetchWithAuth('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `Implantação do ${businessName}`,
            description: `Projeto operacional de estruturação do negócio criado automaticamente durante o onboarding.\n\nFase informada: ${businessStage}\n\nDescrição da ideia:\n${ideaDescription}`,
            status: 'Planejamento',
            priority: 'Alta',
            companyId,
            budget: '5000'
          })
        });

        if (projectRes.ok) {
          const project = await projectRes.json();
          
          // Add some default tasks for the project
          await fetchWithAuth('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: 'Mapear requisitos da Proposta de Valor',
              projectId: project.id,
              priority: 'Alta',
              status: 'A Fazer',
              description: 'Detalhamento do problema resolvido e do público alvo.'
            })
          });

          await fetchWithAuth('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: 'Definir plano de precificação e custos básicos',
              projectId: project.id,
              priority: 'Média',
              status: 'A Fazer',
              description: 'Simular despesas de infraestrutura e custos operacionais.'
            })
          });
        }
      }

      // 5. Create basic folders or welcome docs
      await fetchWithAuth('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '01 - Visão Estratégica do Negócio',
          content: `# Planejamento Inicial da Empresa: ${businessName}\n\nEste documento serve como diretriz estratégica de negócios para a nossa empresa, gerado automaticamente no Onboarding da Cyzor Control.\n\n## 1. O Modelo de Negócio\n- **Tipo**: ${businessType}\n- **Estágio Atual**: ${businessStage}\n\n## 2. A Oportunidade\n${ideaDescription}\n\n## 3. Próximos Passos Sugeridos\n1. Validar a viabilidade econômica do modelo de monetização.\n2. Iniciar o desenvolvimento de um escopo mínimo viável (MVP).\n3. Registrar contatos de potenciais clientes interessados.`,
          folder: 'Estratégia'
        })
      });

      showSuccess('Workspace configurado com absoluto sucesso!');
      
      // Update local state and trigger refresh
      await updateSaaSBackend(undefined, activeWorkspace.id);
      
      onComplete();
    } catch (err: any) {
      console.error(err);
      showError(err.message || 'Houve um erro ao inicializar o Workspace.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepProgress = () => {
    return (currentStep / 4) * 100;
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-4xl bg-white border border-[#0F172A0C] shadow-[0_30px_80px_rgba(0,0,0,0.06)] rounded-[32px] overflow-hidden flex flex-col md:flex-row min-h-[580px] animate-in fade-in zoom-in-95 duration-500">
        
        {/* Left Informative Panel */}
        <div className="md:w-[35%] bg-slate-900 p-8 md:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Decorative subtle abstract elements */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col gap-8 z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
                <Sparkles size={16} className="text-white animate-pulse" />
              </div>
              <span className="text-sm font-black tracking-wider uppercase font-mono text-indigo-400">Cyzor Onboarding</span>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-black tracking-tight leading-tight">
                Construindo sua Empresa Digital
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                A Cyzor Control não é um ERP estático de formulários vazios. Criamos uma jornada que acompanha seu negócio desde a ideia embrionária até a escala operacional e financeira.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 mt-8 md:mt-0 z-10 border-t border-slate-800 pt-6">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold flex items-center justify-center">1</div>
              <span className="text-[11px] font-bold text-slate-300">Identidade do Negócio</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold flex items-center justify-center">2</div>
              <span className="text-[11px] font-bold text-slate-300">Modelo Estrutural</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold flex items-center justify-center">3</div>
              <span className="text-[11px] font-bold text-slate-300">Momento de Evolução</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold flex items-center justify-center">4</div>
              <span className="text-[11px] font-bold text-slate-300">Detalhamento da Visão</span>
            </div>
          </div>
        </div>

        {/* Right Active Form Area */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-between bg-[#FCFCFD]">
          
          {/* Top Step & Progress Bar */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest font-mono">Etapa {currentStep} de 4</span>
              <span className="text-xs font-bold text-indigo-600 font-mono">{Math.round(getStepProgress())}% concluído</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-indigo-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${getStepProgress()}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Core Wizard Steps (Animated Content) */}
          <div className="flex-1 py-10 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="flex flex-col gap-6 text-left"
                >
                  <div className="flex flex-col gap-2">
                    <span className="text-2xl font-black text-slate-900 tracking-tight">Seja bem-vindo à Cyzor Control</span>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      Vamos dar os primeiros passos para construir e gerenciar seu império digital. Como devemos chamar sua empresa ou projeto principal?
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 mt-2">
                    <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Nome Comercial / Visão</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Acme SaaS, InovaTech, My Agency..."
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-5 py-4 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl outline-none text-base font-medium shadow-sm transition-all"
                    />
                    <p className="text-[11px] text-slate-400 font-medium">
                      Não se preocupe, você poderá alterar o nome ou adicionar novas divisões a qualquer momento.
                    </p>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="flex flex-col gap-5 text-left"
                >
                  <div className="flex flex-col gap-1.5">
                    <span className="text-2xl font-black text-slate-900 tracking-tight">O que você deseja construir?</span>
                    <p className="text-xs text-slate-500 font-medium">
                      Selecione o modelo operacional que melhor descreve o negócio que você está operando ou modelando.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {BUSINESS_TYPES.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setBusinessType(type.id)}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          businessType === type.id 
                            ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600' 
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/30'
                        }`}
                      >
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-slate-900">{type.label}</span>
                          <span className="text-[10px] text-slate-400 font-medium leading-normal">{type.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="flex flex-col gap-5 text-left"
                >
                  <div className="flex flex-col gap-1.5">
                    <span className="text-2xl font-black text-slate-900 tracking-tight">Em que fase está o negócio?</span>
                    <p className="text-xs text-slate-500 font-medium">
                      O estágio selecionado personalizará as etapas recomendadas e as prioridades do seu Dashboard.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {STAGES.map((stage) => (
                      <button
                        key={stage.id}
                        type="button"
                        onClick={() => setBusinessStage(stage.id)}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          businessStage === stage.id 
                            ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600' 
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/30'
                        }`}
                      >
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-slate-900">{stage.label}</span>
                          <span className="text-[10px] text-slate-400 font-medium leading-normal">{stage.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="flex flex-col gap-4 text-left"
                >
                  <div className="flex flex-col gap-2">
                    <span className="text-2xl font-black text-slate-900 tracking-tight">Conte-nos sobre sua ideia</span>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      Descreva resumidamente o problema que você resolve, o produto e a sua visão de sucesso. A Cyzor IA analisará esse texto para gerar insights, roadmaps e estruturar seu Workspace.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 mt-2">
                    <textarea 
                      required
                      rows={5}
                      placeholder="Ex: Queremos construir um SaaS de agendamento automatizado para médicos que reduz o absenteísmo usando lembretes do WhatsApp e cobrança prévia via Pix..."
                      value={ideaDescription}
                      onChange={(e) => setIdeaDescription(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl outline-none text-sm font-medium shadow-sm transition-all resize-none"
                    />
                    <div className="flex items-center gap-2 text-slate-400">
                      <HelpIcon size={12} />
                      <span className="text-[10px] font-medium leading-none">Você pode digitar livremente. Aceitamos texto em qualquer formato.</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-6">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-2"
                >
                  <ArrowLeft size={14} />
                  <span>Voltar</span>
                </button>
              )}
            </div>

            <div>
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-black shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Continuar</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting || !businessName.trim() || !ideaDescription.trim()}
                  onClick={handleFinish}
                  className="px-8 py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Estruturando Workspace...</span>
                  ) : (
                    <>
                      <span>Construir Meu Workspace</span>
                      <Sparkles size={14} className="animate-pulse" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
