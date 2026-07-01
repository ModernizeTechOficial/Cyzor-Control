import { motion } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Layers, RefreshCw, Cpu, Database, Cloud, HardDrive, Mail, Calendar, Check, Play, ChevronRight, CheckCircle2, Shield, GitBranch, Terminal } from 'lucide-react';
import { useBranding } from '../hooks/useBranding.ts';

interface LandingViewProps {
  onNavigate: (view: any) => void;
}

export default function LandingView({ onNavigate }: LandingViewProps) {
  const { appName, logoUrl, logoSize } = useBranding();
  
  return (
    <div className="relative min-h-screen bg-[#fdf8f8] text-[#1c1b1b] font-sans overflow-x-hidden selection:bg-black selection:text-white pb-1">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(0,0,0,0.8) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />
        {/* Decorative blur elements for premium feel */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-100/15 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-blue-50/20 blur-[120px] rounded-full pointer-events-none" />
      </div>

      {/* Header Navigation */}
      <header className="fixed top-0 w-full z-50 bg-[#fdf8f8]/80 backdrop-blur-xl border-b border-[#1c1b1b]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3 group cursor-pointer">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" style={{ height: `${logoSize}px` }} className="object-contain" />
              ) : (
                <div className="w-10 h-10 bg-[#1c1b1b] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg transition-transform group-hover:scale-105">
                  {appName.charAt(0)}
                </div>
              )}
              <span className="font-extrabold text-2xl tracking-tighter text-[#1c1b1b]">
                {appName}
              </span>
            </div>
            
            <nav className="hidden md:flex space-x-10">
              <a className="text-[#1c1b1b]/70 hover:text-black font-semibold text-sm transition-colors" href="#produto">Produto</a>
              <a className="text-[#1c1b1b]/70 hover:text-black font-semibold text-sm transition-colors" href="#recursos">Recursos</a>
              <a className="text-[#1c1b1b]/70 hover:text-black font-semibold text-sm transition-colors flex items-center gap-1.5" href="#solucoes">
                Soluções 
                <ChevronRight size={14} className="opacity-50 rotate-90" />
              </a>
              <a className="text-[#1c1b1b]/70 hover:text-black font-semibold text-sm transition-colors" href="#precos">Preços</a>
            </nav>

            <div className="flex items-center space-x-6">
              <button 
                onClick={() => onNavigate('login')}
                className="text-[#1c1b1b]/80 font-semibold text-sm hover:text-black transition-colors"
              >
                Entrar
              </button>
              <button 
                onClick={() => onNavigate('login')}
                className="bg-black text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-md hover:scale-[1.03] active:scale-[0.98] transition-all"
              >
                Começar Grátis
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="produto" className="pt-36 pb-20 lg:pt-48 lg:pb-32 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Info Column */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 flex flex-col items-start text-left"
            >
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-100 border border-[#1c1b1b]/5 mb-10 shadow-sm">
                <span className="bg-black text-white text-[10px] font-black px-2 py-0.5 rounded-md tracking-widest">2.0</span>
                <span className="text-xs font-bold text-[#1c1b1b]/80 uppercase tracking-wider">A nova era da automação chegou</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold text-[#1c1b1b] leading-[0.95] mb-8 tracking-tight">
                Domine sua operação com <span className="text-[#1c1b1b]/40">IA Pura</span>
              </h1>
              
              <p className="text-lg lg:text-xl text-[#1c1b1b]/70 mb-10 leading-relaxed max-w-xl font-medium">
                Conecte seu ecossistema Google a agentes autônomos que executam fluxos complexos, reduzem custos e liberam sua equipe para o que importa.
              </p>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-12">
                <button 
                  onClick={() => onNavigate('login')}
                  className="bg-black text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                >
                  Teste Grátis por 14 dias
                  <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
                </button>
                <button 
                  onClick={() => onNavigate('login')}
                  className="px-8 py-4 rounded-full font-bold text-lg text-black hover:bg-slate-100 transition-all flex items-center justify-center gap-2 border border-[#1c1b1b]/10"
                >
                  Ver Demonstração
                  <Play size={16} fill="currentColor" className="opacity-60" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-8 text-xs text-[#1c1b1b]/60 font-bold uppercase tracking-widest">
                <span className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600" strokeWidth={3} /> Enterprise Ready
                </span>
                <span className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600" strokeWidth={3} /> GDPR Compliant
                </span>
              </div>
            </motion.div>

            {/* Right Mockup Column */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-6 relative"
            >
              <div className="absolute -inset-10 bg-black/5 blur-[120px] rounded-full pointer-events-none"></div>
              
              <div className="relative z-10 bg-white/70 backdrop-blur-md rounded-3xl overflow-hidden border border-black/10 shadow-2xl">
                {/* Mockup Header Bar */}
                <div className="h-12 bg-slate-50/50 border-b border-black/5 flex items-center px-5 gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-100"></div>
                  </div>
                  <div className="flex-1 max-w-xs mx-auto">
                    <div className="bg-white border border-black/5 h-7 rounded-lg text-[10px] text-slate-400 flex items-center px-3 font-mono">
                      app.cyzor.com/dashboard
                    </div>
                  </div>
                </div>

                {/* Mockup Interface Screen */}
                <div className="p-8">
                  <div className="grid grid-cols-12 gap-6">
                    {/* Mockup Sidebar */}
                    <div className="col-span-4 border-r border-black/5 pr-6 space-y-6">
                      <div className="h-4 w-2/3 bg-slate-100 rounded-full"></div>
                      <div className="space-y-3">
                        <div className="h-10 bg-black rounded-xl w-full flex items-center px-3 text-[10px] text-white font-bold">
                          Dashboard
                        </div>
                        <div className="h-10 bg-slate-100/70 rounded-xl w-full"></div>
                        <div className="h-10 bg-slate-100/70 rounded-xl w-full"></div>
                      </div>
                    </div>
                    {/* Mockup Screen Content */}
                    <div className="col-span-8 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-sm">
                          <div className="text-[10px] uppercase font-black text-slate-400 mb-1">Efficiency</div>
                          <div className="text-2xl font-black text-[#1c1b1b]">94.2%</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-sm">
                          <div className="text-[10px] uppercase font-black text-slate-400 mb-1">AI Uptime</div>
                          <div className="text-2xl font-black text-[#1c1b1b]">100%</div>
                        </div>
                      </div>
                      
                      <div className="h-32 bg-slate-50 rounded-2xl border border-black/5 overflow-hidden relative">
                        <svg className="absolute bottom-0 w-full" viewBox="0 0 400 100" fill="none">
                          <path d="M0 80 C 100 20, 200 100, 400 30 L 400 100 L 0 100 Z" fill="rgba(0,0,0,0.02)"></path>
                          <path d="M0 80 C 100 20, 200 100, 400 30" stroke="black" strokeWidth="2" strokeLinecap="round"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative floating badge */}
              <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white border border-black/10 rounded-[32px] flex items-center justify-center p-5 shadow-xl animate-bounce" style={{ animationDuration: '6s' }}>
                <div className="w-full h-full bg-black/5 rounded-2xl flex items-center justify-center">
                  <Zap size={28} className="text-black" />
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Enterprise Social Proof Marquee */}
      <section className="py-12 bg-white border-y border-black/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-6">
          <h2 className="text-[10px] font-black text-[#1c1b1b]/40 tracking-[0.3em] uppercase text-center">
            Trusted by Global Enterprise
          </h2>
        </div>
        <div className="relative flex overflow-x-hidden">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-20 py-2 text-2xl font-black text-black/20 tracking-tighter">
            <span>VOLTAIC.</span>
            <span className="font-bold italic">NEXUS_</span>
            <span className="font-light uppercase tracking-[0.4em]">Aether</span>
            <span>Strata</span>
            <span className="font-serif italic">Lumina</span>
            <span className="tracking-widest">KINETIC</span>
            <span className="font-bold">ORBITAL</span>
            
            {/* Repeat for seamless loop */}
            <span>VOLTAIC.</span>
            <span className="font-bold italic">NEXUS_</span>
            <span className="font-light uppercase tracking-[0.4em]">Aether</span>
            <span>Strata</span>
            <span className="font-serif italic">Lumina</span>
            <span className="tracking-widest">KINETIC</span>
            <span className="font-bold">ORBITAL</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="recursos" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-black text-[#1c1b1b] mb-6 tracking-tight">
              Capacidades de Próxima Geração
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium">
              Arquitetura modular desenhada para empresas que não aceitam limites.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <motion.div 
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white/70 backdrop-blur-md border border-black/5 p-8 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.01)] transition-all flex flex-col"
            >
              <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center mb-8 shadow-md">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#1c1b1b] mb-4">Inteligência Autônoma</h3>
              <p className="text-[#1c1b1b]/70 text-sm leading-relaxed">
                Nossos agentes aprendem seus processos e executam decisões complexas em milissegundos.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white/70 backdrop-blur-md border border-black/5 p-8 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.01)] transition-all flex flex-col"
            >
              <div className="w-14 h-14 bg-slate-100 text-black rounded-2xl flex items-center justify-center mb-8 border border-black/5">
                <RefreshCw size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#1c1b1b] mb-4">Integração Profunda</h3>
              <p className="text-[#1c1b1b]/70 text-sm leading-relaxed">
                API first. Conectividade nativa com centenas de ferramentas legadas e modernas.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white/70 backdrop-blur-md border border-black/5 p-8 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.01)] transition-all flex flex-col"
            >
              <div className="w-14 h-14 bg-slate-100 text-black rounded-2xl flex items-center justify-center mb-8 border border-black/5">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#1c1b1b] mb-4">Segurança Enterprise</h3>
              <p className="text-[#1c1b1b]/70 text-sm leading-relaxed">
                Criptografia de ponta a ponta e conformidade com as normas globais mais rigorosas.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div 
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white/70 backdrop-blur-md border border-black/5 p-8 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.01)] transition-all flex flex-col"
            >
              <div className="w-14 h-14 bg-slate-100 text-black rounded-2xl flex items-center justify-center mb-8 border border-black/5">
                <Layers size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#1c1b1b] mb-4">Escalabilidade Ilimitada</h3>
              <p className="text-[#1c1b1b]/70 text-sm leading-relaxed">
                Nossa infraestrutura escala automaticamente conforme sua demanda cresce.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Google integration showcase */}
      <section id="solucoes" className="py-24 bg-[#fdf8f8] border-y border-black/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-[10px] font-black uppercase tracking-widest mb-6 border border-black/5">
                Ecossistema Nativo
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-[#1c1b1b] mb-8 leading-[1.1]">
                Google Workspace, <span className="text-[#1c1b1b]/40">potencializado.</span>
              </h2>
              <p className="text-lg text-slate-600 mb-10 font-medium leading-relaxed">
                Transforme suas ferramentas diárias em uma central de comando automatizada. O Cyzor Control integra-se perfeitamente aos apps que você já ama.
              </p>
              
              <ul className="space-y-6">
                <li className="flex items-center gap-4 text-[#1c1b1b] font-semibold">
                  <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  Sincronização bidirecional em tempo real
                </li>
                <li className="flex items-center gap-4 text-[#1c1b1b] font-semibold">
                  <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  Automação de workflows baseada em gatilhos
                </li>
                <li className="flex items-center gap-4 text-[#1c1b1b] font-semibold">
                  <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  Segurança zero-trust nativa
                </li>
              </ul>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-white border border-black/5 p-10 rounded-[40px] flex flex-col items-center justify-center text-center aspect-square shadow-sm hover:-translate-y-2 transition-transform">
                    <div className="w-16 h-16 bg-blue-500/5 rounded-2xl flex items-center justify-center mb-6">
                      <Cloud size={32} className="text-blue-600" />
                    </div>
                    <span className="font-black text-[#1c1b1b]">Drive</span>
                  </div>
                  <div className="bg-white border border-black/5 p-10 rounded-[40px] flex flex-col items-center justify-center text-center aspect-square shadow-sm hover:-translate-y-2 transition-transform">
                    <div className="w-16 h-16 bg-red-500/5 rounded-2xl flex items-center justify-center mb-6">
                      <Mail size={32} className="text-red-600" />
                    </div>
                    <span className="font-black text-[#1c1b1b]">Gmail</span>
                  </div>
                </div>
                <div className="space-y-6 mt-12">
                  <div className="bg-white border border-black/5 p-10 rounded-[40px] flex flex-col items-center justify-center text-center aspect-square shadow-sm hover:-translate-y-2 transition-transform">
                    <div className="w-16 h-16 bg-green-500/5 rounded-2xl flex items-center justify-center mb-6">
                      <Database size={32} className="text-green-600" />
                    </div>
                    <span className="font-black text-[#1c1b1b]">Sheets</span>
                  </div>
                  <div className="bg-white border border-black/5 p-10 rounded-[40px] flex flex-col items-center justify-center text-center aspect-square shadow-sm hover:-translate-y-2 transition-transform">
                    <div className="w-16 h-16 bg-indigo-500/5 rounded-2xl flex items-center justify-center mb-6">
                      <Calendar size={32} className="text-indigo-600" />
                    </div>
                    <span className="font-black text-[#1c1b1b]">Calendar</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section id="precos" className="py-32 relative overflow-hidden bg-black text-white">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }}
          />
        </div>
        <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
          <h2 className="text-5xl lg:text-7xl font-extrabold text-white mb-8 tracking-tighter">
            Pronto para o futuro da <span className="text-white/40 italic font-light">gestão?</span>
          </h2>
          <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto font-medium">
            Junte-se a mais de 2.500 empresas que escalam suas operações com agentes inteligentes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button 
              onClick={() => onNavigate('login')}
              className="bg-white text-black px-12 py-6 rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl"
            >
              Começar Agora — É Grátis
            </button>
            <button 
              onClick={() => onNavigate('login')}
              className="border border-white/20 text-white px-12 py-6 rounded-full font-black text-xl hover:bg-white/5 transition-all"
            >
              Falar com Consultor
            </button>
          </div>
          <p className="mt-10 text-white/30 text-sm font-bold uppercase tracking-[0.2em]">
            Sem cartão de crédito • Setup em 5 minutos • 14 dias grátis
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-white border-t border-black/5 text-[#1c1b1b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-8">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" style={{ height: `${logoSize}px` }} className="object-contain" />
                ) : (
                  <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl">
                    {appName.charAt(0)}
                  </div>
                )}
                <span className="font-extrabold text-2xl tracking-tighter">
                  {appName}
                </span>
              </div>
              <p className="text-slate-500 max-w-sm font-medium">
                A plataforma de automação e gestão que define os padrões da próxima década tecnológica.
              </p>
            </div>
            <div>
              <h4 className="font-black uppercase text-[10px] tracking-widest text-black mb-6">Plataforma</h4>
              <ul className="space-y-4">
                <li><button onClick={() => onNavigate('login')} className="text-sm font-semibold text-slate-500 hover:text-black transition-colors">Recursos</button></li>
                <li><button onClick={() => onNavigate('login')} className="text-sm font-semibold text-slate-500 hover:text-black transition-colors">Integrações</button></li>
                <li><button onClick={() => onNavigate('login')} className="text-sm font-semibold text-slate-500 hover:text-black transition-colors">Segurança</button></li>
                <li><button onClick={() => onNavigate('login')} className="text-sm font-semibold text-slate-500 hover:text-black transition-colors">Enterprise</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black uppercase text-[10px] tracking-widest text-black mb-6">Suporte</h4>
              <ul className="space-y-4">
                <li><button onClick={() => onNavigate('login')} className="text-sm font-semibold text-slate-500 hover:text-black transition-colors">Documentação</button></li>
                <li><button onClick={() => onNavigate('login')} className="text-sm font-semibold text-slate-500 hover:text-black transition-colors">API Reference</button></li>
                <li><button onClick={() => onNavigate('login')} className="text-sm font-semibold text-slate-500 hover:text-black transition-colors">Status</button></li>
                <li><button onClick={() => onNavigate('login')} className="text-sm font-semibold text-slate-500 hover:text-black transition-colors">Contato</button></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              © 2026 Cyzor Control Inc. Todos os direitos reservados.
            </p>
            <div className="flex gap-8">
              <button onClick={() => onNavigate('privacy')} className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-black transition-colors">
                Privacidade
              </button>
              <button onClick={() => onNavigate('terms')} className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-black transition-colors">
                Termos
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
