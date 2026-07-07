import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { tourSteps, TourStep } from './tourSteps';
import { useAuth } from '../../context/AuthContext';

interface ProductTourProps {
  onComplete?: () => void;
  onSkip?: () => void;
  forceStart?: boolean;
}

export default function ProductTour({ onComplete, onSkip, forceStart = false }: ProductTourProps) {
  const { tourCompleted, setTourCompleted, fetchWithAuth, activeWorkspace } = useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const currentStep = currentStepIndex >= 0 ? tourSteps[currentStepIndex] : null;
  const isOnboardingCompleted = activeWorkspace?.settings?.onboardingCompleted === true;

  useEffect(() => {
    // Only start automatically if:
    // 1. It's a forced start (from finished onboarding callback)
    // 2. OR tour is not completed AND onboarding IS completed
    if (forceStart || (!tourCompleted && isOnboardingCompleted)) {
      // Small delay to ensure layout is ready
      const timer = setTimeout(() => {
        setIsVisible(true);
        setCurrentStepIndex(0);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [tourCompleted, forceStart, isOnboardingCompleted]);

  useEffect(() => {
    if (currentStepIndex >= 0 && isVisible) {
      updateTargetRect();
      window.addEventListener('resize', updateTargetRect);
      window.addEventListener('scroll', updateTargetRect, true);
      
      const interval = setInterval(updateTargetRect, 500); // Poll for layout shifts
      
      return () => {
        window.removeEventListener('resize', updateTargetRect);
        window.removeEventListener('scroll', updateTargetRect, true);
        clearInterval(interval);
      };
    }
  }, [currentStepIndex, isVisible]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;
      if (e.key === 'Escape') handleSkip();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handleBack();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, currentStepIndex]);

  const updateTargetRect = () => {
    if (currentStepIndex < 0) return;
    const step = tourSteps[currentStepIndex];
    if (step.selector === 'body') {
      setTargetRect(null);
      return;
    }

    const element = document.querySelector(step.selector);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);
      
      // Scroll into view if needed (only if not center placement)
      if (step.placement !== 'center' && (rect.top < 0 || rect.bottom > window.innerHeight)) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setTargetRect(null);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < tourSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    if (onSkip) onSkip();
    saveTourStatus();
  };

  const handleFinish = () => {
    setIsEnding(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
      saveTourStatus();
    }, 2000);
  };

  const saveTourStatus = async () => {
    setTourCompleted(true);
    localStorage.setItem('tourCompleted', 'true');
    try {
      const response = await fetchWithAuth('/api/user/complete-tour', { method: 'POST' });
      if (!response.ok) {
        console.error("[ProductTour] Failed to save tour status, status:", response.status);
      }
    } catch (e) {
      console.error("Failed to save tour status:", e);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
      {/* Dark Backdrop with Hole */}
      <div className="absolute inset-0 bg-black/60 pointer-events-auto backdrop-blur-[2px]">
        {targetRect && (
          <div 
            className="absolute bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] rounded-lg transition-all duration-300 ease-out border-2 border-white/50"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.6), 0 0 20px rgba(255,255,255,0.3)'
            }}
          />
        )}
      </div>

      {/* Tooltip / Modal */}
      <AnimatePresence mode="wait">
        {currentStep && (
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute pointer-events-auto"
            style={getTooltipStyle(targetRect, currentStep)}
          >
            <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 p-6 w-[320px] md:w-[400px]">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                    {currentStep.id === 'finish' ? <CheckCircle2 size={18} /> : <Sparkles size={18} />}
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full">
                    Passo {currentStepIndex + 1} de {tourSteps.length}
                  </span>
                </div>
                <button onClick={handleSkip} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
                {currentStep.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                {currentStep.description}
              </p>

              <div className="flex items-center justify-between gap-4">
                <button 
                  onClick={handleSkip}
                  className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Pular Tour
                </button>
                <div className="flex items-center gap-2">
                  {currentStepIndex > 0 && (
                    <button 
                      onClick={handleBack}
                      className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
                    >
                      <ChevronLeft size={20} />
                    </button>
                  )}
                  <button 
                    onClick={handleNext}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-[0_4px_12px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] transition-all transform active:scale-95"
                  >
                    {currentStepIndex === tourSteps.length - 1 ? 'Concluir' : 'Próximo'}
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Tooltip Arrow */}
            {targetRect && (
              <div 
                className={`absolute w-3 h-3 bg-white rotate-45 border-gray-100 ${getArrowStyle(currentStep.placement)}`}
                style={{
                  borderLeftWidth: currentStep.placement === 'right' || currentStep.placement === 'bottom' ? 1 : 0,
                  borderTopWidth: currentStep.placement === 'right' || currentStep.placement === 'bottom' ? 1 : 0,
                  borderRightWidth: currentStep.placement === 'left' || currentStep.placement === 'top' ? 1 : 0,
                  borderBottomWidth: currentStep.placement === 'left' || currentStep.placement === 'top' ? 1 : 0,
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Finishing Animation Overlay */}
      <AnimatePresence>
        {isEnding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[10000] bg-[#0F172A99] backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="bg-white rounded-[32px] p-12 shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-white/20 max-w-md w-full relative overflow-hidden"
            >
              {/* Decorative background elements */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />

              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', damping: 12 }}
                className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-8 mx-auto shadow-lg shadow-indigo-500/30"
              >
                <CheckCircle2 size={40} className="text-white" />
              </motion.div>

              <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
                Tudo configurado!
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Você concluiu o tour com sucesso. Agora você tem o controle total para gerenciar seu ecossistema com precisão e elegância.
              </p>

              <div className="flex flex-col gap-3">
                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.8, ease: "easeInOut" }}
                    className="h-full bg-indigo-600"
                  />
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Finalizando setup da experiência...
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getTooltipStyle(rect: DOMRect | null, step: TourStep): React.CSSProperties {
  if (!rect || step.placement === 'center') {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  }

  const offset = 20;
  const tooltipWidth = window.innerWidth < 768 ? 320 : 400;
  
  // Calculate raw positions
  let top: number | string = 'auto';
  let left: number | string = 'auto';
  let right: number | string = 'auto';
  let bottom: number | string = 'auto';
  let transform = 'none';

  switch (step.placement) {
    case 'bottom':
      top = rect.bottom + offset;
      left = rect.left + rect.width / 2;
      transform = 'translateX(-50%)';
      
      // Boundary check for right edge
      if (rect.left + rect.width / 2 + tooltipWidth / 2 > window.innerWidth - 20) {
        left = 'auto';
        right = 20;
        transform = 'none';
      }
      // Boundary check for left edge
      if (rect.left + rect.width / 2 - tooltipWidth / 2 < 20) {
        left = 20;
        transform = 'none';
      }
      break;

    case 'top':
      bottom = window.innerHeight - rect.top + offset;
      left = rect.left + rect.width / 2;
      transform = 'translateX(-50%)';

      if (rect.left + rect.width / 2 + tooltipWidth / 2 > window.innerWidth - 20) {
        left = 'auto';
        right = 20;
        transform = 'none';
      }
      if (rect.left + rect.width / 2 - tooltipWidth / 2 < 20) {
        left = 20;
        transform = 'none';
      }
      break;

    case 'left':
      top = rect.top + rect.height / 2;
      right = window.innerWidth - rect.left + offset;
      transform = 'translateY(-50%)';
      break;

    case 'right':
      top = rect.top + rect.height / 2;
      left = rect.right + offset;
      transform = 'translateY(-50%)';
      break;

    default:
      top = '50%';
      left = '50%';
      transform = 'translate(-50%, -50%)';
  }

  return { top, left, right, bottom, transform };
}

function getArrowStyle(placement: TourStep['placement']): string {
  switch (placement) {
    case 'bottom': return '-top-1.5 left-1/2 -translate-x-1/2';
    case 'top': return '-bottom-1.5 left-1/2 -translate-x-1/2';
    case 'left': return '-right-1.5 top-1/2 -translate-y-1/2';
    case 'right': return '-left-1.5 top-1/2 -translate-y-1/2';
    default: return 'hidden';
  }
}
