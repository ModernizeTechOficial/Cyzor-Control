import { useMemo, useState } from 'react';
import { Mail, Lock, User, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext.tsx';
import { useBranding } from '../hooks/useBranding.ts';

export default function LoginView({ onLogin, onNavigate }: { onLogin: () => void, onNavigate?: (view: any) => void }) {
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const { iconUrl, iconSize, appName, loginHeroUrl } = useBranding();
  const inviteToken = useMemo(() => new URLSearchParams(window.location.search).get('inviteToken') || undefined, []);
  
  const [isSignUp, setIsSignUp] = useState(() => {
    const search = new URLSearchParams(window.location.search);
    return search.get('mode') === 'signup';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name || !email || !password) {
          throw new Error('Preencha todos os campos obrigatórios.');
        }
        await registerWithEmail(email, password, name);
      } else {
        if (!email || !password) {
          throw new Error('Preencha email e senha.');
        }
        await loginWithEmail(email, password);
      }
      // Redirect handled by App.tsx observer
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Ocorreu um erro ao processar sua solicitação.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSign = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await loginWithGoogle();
      // Redirect handled by App.tsx observer
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Falha no login com Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAFAFA] font-sans">
      {/* Left Side - Application Info */}
      <div className="hidden md:flex md:w-1/2 bg-[#111111] text-white p-12 lg:p-20 flex-col justify-between relative overflow-hidden">
        {/* Background Image with Premium Filter */}
        <div className="absolute inset-0 z-0">
          <img 
            src={loginHeroUrl} 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-20 grayscale brightness-50 contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#111111] via-[#111111]/70 to-transparent"></div>
        </div>

        <div className="relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-8 backdrop-blur-sm border border-white/10 overflow-hidden">
            {iconUrl ? (
              <img 
                src={iconUrl} 
                alt="Logo" 
                width={iconSize} 
                height={iconSize} 
                className="object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const placeholder = document.createElement('div');
                    placeholder.className = "text-white font-bold text-xl";
                    placeholder.innerText = appName.charAt(0);
                    parent.appendChild(placeholder);
                  }
                }}
              />
            ) : (
              <div className="text-white font-bold text-xl uppercase">
                {appName.charAt(0)}
              </div>
            )}
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold font-display tracking-tight leading-[1.1] mb-6">
            Central de Operações Executivas Integrada
          </h1>
          
          <p className="text-lg text-gray-400 mb-10 max-w-lg leading-relaxed">
            O {appName} é um ERP moderno e seguro para gerenciar empresas, projetos, produtos e finanças corporativas. 
            Uma plataforma unificada projetada para simplificar decisões executivas.
          </p>

          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Gestão Estratégica Corporativa</h3>
                <p className="text-gray-400 text-sm">Controle seus projetos, empresas e finanças em uma visão unificada.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Sparkles size={20} className="text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Automação com Inteligência Artificial</h3>
                <p className="text-gray-400 text-sm">Aproveite IA para estruturar ideias, planos de negócios e documentos.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-20">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            © {new Date().getFullYear()} {appName.toUpperCase()} SYSTEMS
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#FAFAFA]">
        <div className="bg-[#FFFFFF] p-10 rounded-[30px] border border-[#0F172A0F] shadow-[0_8px_40px_rgba(0,0,0,0.04)] w-full max-w-[440px] flex flex-col items-center relative overflow-hidden min-h-[620px]">
          
          {/* Subtle Tech Pattern */}
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-[#111111]/20 to-transparent"></div>

          <div className="md:hidden w-14 h-14 rounded-2xl bg-[#111111] flex items-center justify-center mb-6 shadow-[0_4px_12px_rgba(0,0,0,0.15)] overflow-hidden">
            {iconUrl ? (
              <img 
                src={iconUrl} 
                alt="Logo" 
                width={iconSize} 
                height={iconSize} 
                className="object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const placeholder = document.createElement('div');
                    placeholder.className = "text-white font-bold text-xl";
                    placeholder.innerText = appName.charAt(0);
                    parent.appendChild(placeholder);
                  }
                }}
              />
            ) : (
              <div className="text-white font-bold text-xl uppercase">
                {appName.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="text-center mb-8 w-full relative overflow-hidden h-[80px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={isSignUp ? 'signup-title' : 'login-title'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="w-full absolute inset-0 flex flex-col items-center justify-center"
              >
                <h2 className="text-3xl font-display font-bold text-[#111111] tracking-tight mb-1 whitespace-nowrap">
                  {isSignUp ? 'Criar nova conta' : 'Bem-vindo de volta'}
                </h2>
                <p className="text-[#64748B] text-sm max-w-[280px] leading-tight">
                  {isSignUp ? 'Cadastre sua credencial corporativa na nuvem.' : 'Acesse sua central de operações executivas.'}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="w-full relative min-h-[380px]">
            {inviteToken && (
              <div className="mb-6 rounded-[20px] border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-900">
                Convite de workspace detectado. Após entrar ou criar sua conta, você poderá retornar ao convite automaticamente.
              </div>
            )}
            <AnimatePresence mode="wait">
              <motion.div
                key={isSignUp ? 'signup-form' : 'login-form'}
                initial={{ opacity: 0, x: isSignUp ? 30 : -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isSignUp ? -30 : 30 }}
                transition={{ 
                  type: 'spring',
                  stiffness: 300,
                  damping: 30
                }}
                className="w-full"
              >
                {errorMsg && (
                  <div className="w-full bg-red-50 border border-red-100 text-red-600 text-xs font-bold px-4 py-3.5 rounded-[16px] mb-6">
                    {errorMsg}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                  {isSignUp && (
                    <div className="flex flex-col gap-2 w-full">
                      <label className="text-[11px] font-bold tracking-widest uppercase text-[#64748B] px-1">NOME INTEGRAL</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#111111] transition-colors" size={18} strokeWidth={2.5} />
                        <input 
                          type="text"
                          placeholder="Seu nome completo"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-[#FFFFFF] border border-[#0F172A0F] rounded-[16px] py-3.5 pl-12 pr-4 outline-none focus:border-[#111111]/30 hover:border-[#0F172A0F]-dark transition-all text-[#111111] font-medium placeholder:text-[#64748B]/55 shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 w-full">
                    <label className="text-[11px] font-bold tracking-widest uppercase text-[#64748B] px-1">EMAIL CORPORATIVO</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#111111] transition-colors" size={18} strokeWidth={2.5} />
                      <input 
                        type="email"
                        placeholder="nome@cyzor.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#FFFFFF] border border-[#0F172A0F] rounded-[16px] py-3.5 pl-12 pr-4 outline-none focus:border-[#111111]/30 hover:border-[#0F172A0F]-dark transition-all text-[#111111] font-medium placeholder:text-[#64748B]/55 shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[11px] font-bold tracking-widest uppercase text-[#64748B]">SENHA</label>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#111111] transition-colors" size={18} strokeWidth={2.5} />
                      <input 
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#FFFFFF] border border-[#0F172A0F] rounded-[16px] py-3.5 pl-12 pr-4 outline-none focus:border-[#111111]/30 hover:border-[#0F172A0F]-dark transition-all text-[#111111] font-medium placeholder:text-[#64748B]/55 shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
                      />
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-[#111111] text-[#FFFFFF] py-4 rounded-[16px] font-bold mt-2 hover:bg-black transition-all shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] flex items-center justify-center gap-2 disabled:bg-[#111111]/60"
                  >
                    {loading ? 'Aguardando...' : isSignUp ? 'Criar Conta' : 'Entrar'}
                  </button>
                </form>

                <div className="w-full flex items-center my-6 gap-3">
                  <div className="flex-1 h-[1px] bg-[#0F172A0F]"></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">OU</span>
                  <div className="flex-1 h-[1px] bg-[#0F172A0F]"></div>
                </div>

                <button 
                  onClick={handleGoogleSign}
                  disabled={loading}
                  type="button" 
                  className="w-full bg-white hover:bg-[#FAFAFA] text-[#111111] border border-[#0F172A0F] py-3.5 rounded-[16px] font-bold flex items-center justify-center gap-2.5 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google Cloud Secure Login
                </button>
              </motion.div>
            </AnimatePresence>
          </div>

          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs font-bold text-[#64748B] hover:text-[#111111] mt-8 hover:underline transition-colors block relative z-10"
          >
            {isSignUp ? 'Já possui conta? Inicie sessão' : 'Criar uma conta Saas Corporativa'}
          </button>

          <div className="mt-8 flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400 relative z-10">
            <button onClick={() => onNavigate && onNavigate('privacy')} className="hover:text-neutral-800 transition-colors">
              Privacidade
            </button>
            <span>•</span>
            <button onClick={() => onNavigate && onNavigate('terms')} className="hover:text-neutral-800 transition-colors">
              Termos
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
