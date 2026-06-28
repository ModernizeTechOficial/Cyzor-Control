import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyView({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col items-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-3xl bg-white rounded-[30px] border border-[#0F172A0F] shadow-[0_8px_40px_rgba(0,0,0,0.04)] p-8 sm:p-12 relative overflow-hidden text-left">
        
        {/* Subtle Tech Pattern */}
        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent left-0"></div>

        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-neutral-900 transition-colors mb-10"
        >
          <ArrowLeft size={16} />
          VOLTAR PARA LOGIN
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 text-indigo-600">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-[#111111] tracking-tight">Política de Privacidade</h1>
            <p className="text-neutral-500 text-sm mt-1">Última atualização: Junho de 2026</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none prose-h2:text-xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4 prose-p:text-neutral-600 prose-p:leading-relaxed prose-li:text-neutral-600">
          <p>
            Na Cyzor Systems, levamos a privacidade e a segurança dos dados corporativos a sério. 
            Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações 
            quando você usa nossa plataforma Central de Operações Executivas.
          </p>

          <h2>1. Informações que Coletamos</h2>
          <p>
            Coletamos informações que você nos fornece diretamente ao criar uma conta, 
            configurar seu perfil corporativo, integrar com serviços de terceiros (como o Google Workspace) 
            ou usar nossos serviços para criar projetos e documentos. Isso inclui:
          </p>
          <ul>
            <li><strong>Dados de Identificação:</strong> Nome, endereço de e-mail corporativo e credenciais de login.</li>
            <li><strong>Dados de Integração:</strong> Tokens OAuth (Google Calendar, Drive, Docs) mediante sua autorização explícita.</li>
            <li><strong>Dados Operacionais:</strong> Informações de empresas, produtos, planejamento financeiro e documentações criadas por você na plataforma.</li>
          </ul>

          <h2>2. Como Usamos as Informações</h2>
          <p>
            Utilizamos as informações coletadas para as seguintes finalidades operacionais e de melhoria:
          </p>
          <ul>
            <li>Fornecer, manter e melhorar a Plataforma Cyzor.</li>
            <li>Sincronizar seus dados com suas contas conectadas (Google Drive/Calendar), conforme solicitado por você.</li>
            <li>Processar transações e gerar relatórios executivos solicitados.</li>
            <li>Prevenir atividades fraudulentas ou não autorizadas e garantir a segurança do sistema.</li>
          </ul>

          <h2>3. Serviços de Terceiros e APIs do Google</h2>
          <p>
            O uso das informações recebidas pelas APIs do Google por parte da Cyzor e a transferência 
            dessas informações para qualquer outro aplicativo obedecerão à <strong>Google API Services User Data Policy</strong>, 
            incluindo os requisitos de Uso Limitado. A Cyzor acessará e processará seus dados do Google (como Drive, Keep e Calendar)
            estritamente para fornecer recursos visuais de produtividade dentro da plataforma, e não venderá ou compartilhará 
            esses dados para publicidade de terceiros.
          </p>

          <h2>4. Segurança e Armazenamento</h2>
          <p>
            A Cyzor emprega infraestrutura local com SQLite para armazenar 
            seus dados com criptografia em repouso e em trânsito. O acesso é restrito a sessões autenticadas 
            com protocolos avançados de autorização.
          </p>

          <h2>5. Retenção de Dados e Direitos</h2>
          <p>
            Mantemos suas informações ativas apenas enquanto sua conta corporativa for válida. 
            Você pode solicitar a exclusão integral de sua conta e de todos os metadados associados a qualquer 
            momento por meio do painel de Configurações, onde uma rotina de exclusão em cascata será ativada.
          </p>

          <h2>6. Contato</h2>
          <p>
            Se você tiver dúvidas sobre nossa Política de Privacidade, entre em contato conosco em: 
            <strong> privacy@cyzor.com</strong>.
          </p>
        </div>

      </div>
    </div>
  );
}
