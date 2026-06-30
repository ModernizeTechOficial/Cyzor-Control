import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import BottomBar from './components/BottomBar';
import DashboardView from './components/DashboardView';
import EmpresasView from './components/EmpresasView';
import ClientesView from './components/ClientesView';
import ProdutosView from './components/ProdutosView';
import ProjetosView from './components/ProjetosView';
import IdeiasView from './components/IdeiasView';
import FinanceiroView from './components/FinanceiroView';
import DocumentacaoView from './components/DocumentacaoView';
import IAView from './components/IAView';
import ConfiguracoesView from './components/ConfiguracoesView';
import LoginView from './components/LoginView';
import PrivacyView from './components/PrivacyView';
import TermsView from './components/TermsView';
import LandingView from './components/LandingView';
import AgendaPage from './agenda/pages/AgendaPage';
import GoogleKeepView from './components/GoogleKeepView';
import VisualSystemsStudioView from './modules/VisualSystemsStudio/VisualSystemsStudioView';
import AdminLayout from './modules/admin/AdminLayout';
import { View } from './types';
import { useAuth } from './context/AuthContext.tsx';
import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import HomeIntelligence from './components/home/HomeIntelligence';

export default function App() {
  const { user, dbUser, loading } = useAuth();
  const [currentView, setCurrentView] = useState<View | 'admin'>('landing');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (currentView === 'landing' || currentView === 'login' || currentView === 'privacy' || currentView === 'terms') {
          if (dbUser?.isPlatformAdmin) {
            setCurrentView('admin');
          } else {
            setCurrentView('dashboard');
          }
        }
      } else {
        if (currentView !== 'landing' && currentView !== 'login' && currentView !== 'privacy' && currentView !== 'terms') {
          setCurrentView('landing');
        }
      }
    }
  }, [user, dbUser, loading, currentView]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#111111]/20 border-t-[#111111] rounded-full animate-spin" />
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Carregando segurança...</span>
        </div>
      </div>
    );
  }

  if (currentView === 'landing') {
    return <LandingView onNavigate={(view) => setCurrentView(view)} />;
  }

  if (currentView === 'login') {
    return <LoginView onLogin={() => setCurrentView('dashboard')} onNavigate={(view) => setCurrentView(view)} />;
  }

  if (currentView === 'privacy') {
    return <PrivacyView onBack={() => setCurrentView('login')} />;
  }

  if (currentView === 'terms') {
    return <TermsView onBack={() => setCurrentView('login')} />;
  }

  if (currentView.startsWith('admin')) {
    return <AdminLayout currentView={currentView} setCurrentView={setCurrentView} />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans relative overflow-x-hidden">
      {/* Premium Background Details */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]" />
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-50/20 to-transparent" />
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-blue-100/10 blur-[120px] rounded-full" />
      </div>

      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} currentView={currentView} setCurrentView={setCurrentView} />
      
      <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-[88px]' : 'lg:ml-[280px]'} flex-1 min-w-0`}>
        <Topbar isSidebarCollapsed={isSidebarCollapsed} toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        <main className="pt-24 lg:pt-28 px-4 sm:px-6 md:px-8 pb-28 lg:pb-12 flex flex-col gap-6 md:gap-10 w-full xl:max-w-none min-h-screen">
          {currentView === 'dashboard' && <DashboardView setCurrentView={setCurrentView} />}
          {currentView === 'empresas' && <EmpresasView />}
          {currentView === 'clientes' && <ClientesView />}
          {currentView === 'produtos' && <ProdutosView />}
          {currentView === 'projetos' && <ProjetosView />}
          {currentView === 'ideias' && <IdeiasView />}
          {currentView === 'financeiro' && <FinanceiroView />}
          {currentView === 'documentacao' && <DocumentacaoView />}
          {currentView === 'ia' && <IAView />}
          {currentView === 'agenda' && <AgendaPage />}
          {currentView === 'keep' && <GoogleKeepView />}
          {currentView === 'flow-builder' && <VisualSystemsStudioView />}
          {currentView === 'configuracoes' && <ConfiguracoesView />}
        </main>
      </div>
      <BottomBar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Floating Copilot Widget */}
      <div className="fixed bottom-24 lg:bottom-8 right-6 lg:right-8 z-50 flex flex-col items-end gap-4 pointer-events-none">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-[calc(100vw-48px)] sm:w-[380px] md:w-[420px] pointer-events-auto"
            >
              <HomeIntelligence onClose={() => setIsChatOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 bg-black hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl border border-white/10 relative group pointer-events-auto"
          aria-label="Cyzor Intelligence Chat"
        >
          {/* Subtle pulse ring around the button */}
          <span className="absolute inset-0 rounded-full bg-black/10 animate-ping group-hover:bg-blue-600/10 pointer-events-none" />
          {isChatOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <Sparkles size={22} className="animate-pulse" />
          )}
        </motion.button>
      </div>
    </div>
  );
}
