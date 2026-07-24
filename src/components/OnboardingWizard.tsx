import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, ArrowRight, Lightbulb, Box, 
  CheckCircle2, Target, Building, Rocket
} from 'lucide-react';
import { showSuccess, showError } from '../lib/alerts';
import { onboardingService, BusinessSegment } from '../services/OnboardingService';

const SEGMENTS = [
  { id: 'saas', label: 'SaaS', desc: 'Software as a Service' },
  { id: 'services', label: 'Serviços', desc: 'Agência, Consultoria, Dev Shop' },
  { id: 'ecommerce', label: 'E-commerce', desc: 'Loja virtual / D2C' },
  { id: 'general', label: 'Outro', desc: 'Outro segmento' },
] as const;

const COUNTRIES = [
  { code: 'BR', name: 'Brasil' },
  { code: 'PT', name: 'Portugal' },
  { code: 'US', name: 'United States' },
  { code: 'ES', name: 'España' },
];

const LANGUAGES = [
  { code: 'pt-BR', name: 'Português (Brasil)' },
  { code: 'pt-PT', name: 'Português (Portugal)' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
];

interface OnboardingWizardProps {
  onComplete: () => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { activeWorkspace, fetchWithAuth, updateSaaSBackend } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [companyName, setCompanyName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [country, setCountry] = useState('BR');
  const [language, setLanguage] = useState('pt-BR');
  const [segment, setSegment] = useState<BusinessSegment>('general');
  const [logoUrl, setLogoUrl] = useState('');

  const totalSteps = 3;

  const canNext = () => {
    if (currentStep === 1) return companyName.trim().length > 0;
    if (currentStep === 2) return country.length > 0 && language.length > 0;
    if (currentStep === 3) return segment.length > 0;
    return true;
  };

  const handleFinish = async () => {
    if (!activeWorkspace) return;
    setIsSubmitting(true);

    try {
      const result = await onboardingService.ensureAccount(
        {
          uid: '',
          email: '',
          displayName: companyName,
        },
        {
          name: companyName,
          cnpj: cnpj || undefined,
          country,
          language,
          segment,
          logoUrl: logoUrl || undefined,
        }
      );

      await onboardingService.completeSetup(result.workspaceId, result.userId, {
        businessType: segment,
        stage: 'growth',
      });

      await updateSaaSBackend();

      showSuccess('Empresa configurada com sucesso!');
      onComplete();
    } catch (error: any) {
      console.error('Onboarding error:', error);
      showError(error?.message || 'Falha ao concluir onboarding');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Bem-vindo ao CYZOR</h2>
              <p className="text-sm text-gray-500">Vamos configurar sua empresa em poucos passos</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-8">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div key={idx} className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                <motion.div
                  className="h-full bg-gray-900"
                  initial={{ width: 0 }}
                  animate={{ width: idx < currentStep - 1 ? '100%' : idx === currentStep - 1 ? '50%' : '0%' }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Nome da empresa</h3>
                <p className="text-sm text-gray-500">Como sua empresa será identificada no sistema?</p>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ex: Minha Empresa"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition"
                />
                <input
                  type="text"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  placeholder="CNPJ (opcional)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition"
                />
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Localização e idioma</h3>
                <p className="text-sm text-gray-500">Onde sua empresa está localizada?</p>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Segmento de atuação</h3>
                <p className="text-sm text-gray-500">Qual o segmento principal da sua empresa?</p>
                <div className="grid grid-cols-2 gap-3">
                  {SEGMENTS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSegment(s.id)}
                      className={`p-4 rounded-xl border-2 text-left transition ${
                        segment === s.id ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-sm text-gray-900">{s.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40 transition"
            >
              Voltar
            </button>

            <div className="flex items-center gap-3">
              {currentStep < totalSteps ? (
                <button
                  onClick={handleNext}
                  disabled={!canNext() || isSubmitting}
                  className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-40 transition flex items-center gap-2"
                >
                  Próximo
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  disabled={!canNext() || isSubmitting}
                  className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-40 transition flex items-center gap-2"
                >
                  {isSubmitting ? 'Configurando...' : 'Concluir'}
                  <Rocket className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
