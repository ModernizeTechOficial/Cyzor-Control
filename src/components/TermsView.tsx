import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsView({ onBack }: { onBack: () => void }) {
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
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-[#111111] tracking-tight">Termos de Serviço</h1>
            <p className="text-neutral-500 text-sm mt-1">Válidos a partir de: Junho de 2026</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none prose-h2:text-xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4 prose-p:text-neutral-600 prose-p:leading-relaxed prose-li:text-neutral-600">
          <p>
            Bem-vindo à Cyzor Systems. Estes Termos de Serviço governam o seu acesso e uso da plataforma Cyzor, 
            um sistema SaaS (Software as a Service) voltado à Gestão Estratégica Corporativa.
          </p>

          <h2>1. Aceitação dos Termos</h2>
          <p>
            Ao criar uma conta ou utilizar nossos serviços, você concorda em ficar vinculado a estes Termos. 
            Se você não concorda com qualquer parte destes termos, não deve acessar a plataforma.
          </p>

          <h2>2. Descrição dos Serviços</h2>
          <p>
            A Cyzor fornece ferramentas e fluxos de trabalho para gerenciar entidades corporativas, 
            projetos, documentações geradas por IA, registros financeiros e integração de calendário 
            (através do Google Workspace). O serviço pode evoluir, e as funcionalidades poderão ser 
            modificadas ou descontinuadas de acordo com as necessidades operacionais.
          </p>

          <h2>3. Contas de Usuários e Segurança</h2>
          <p>
            Você é responsável por manter a confidencialidade das credenciais de sua conta. 
            Nós não seremos responsáveis por qualquer perda ou dano decorrente do seu fracasso 
            em cumprir esta obrigação de segurança. Ao conectar-se com o Google Cloud, você também 
            está sujeito aos termos de autenticação do provedor de identidade.
          </p>

          <h2>4. Propriedade Intelectual</h2>
          <p>
            O código-fonte da plataforma, design visual (interface), lógicas de compilação 
            de documentos em PDF e infraestruturas associadas são de propriedade exclusiva 
            da Cyzor Systems. 
            <br/><br/>
            No entanto, <strong>você retém 100% dos direitos de propriedade intelectual</strong> 
            sobre todo o conteúdo, planejamento e dados corporativos que você inserir na plataforma.
          </p>

          <h2>5. Uso Aceitável</h2>
          <p>
            Você concorda em não usar o Serviço para fins ilícitos, abusivos ou em violação da 
            privacidade de terceiros. A Cyzor reserva-se o direito de suspender ou encerrar 
            contas atreladas a fraudes comerciais ou infrações contínuas da lei e destes termos.
          </p>

          <h2>6. Limitação de Responsabilidade</h2>
          <p>
            A plataforma é fornecida "como está" e "conforme disponível". Não oferecemos 
            garantias explícitas de que o serviço será contínuo ou livre de erros, particularmente 
            com relação aos modelos externos de IA (LLMs) utilizados. Em nenhum evento a 
            Cyzor Systems será responsável por perdas diretas ou indiretas de lucro e lucros 
            cessantes advindos do uso ou da falha técnica da aplicação.
          </p>

          <h2>7. Modificações dos Termos</h2>
          <p>
            Podemos modificar estes termos de tempos em tempos. Se as mudanças forem materiais, 
            forneceremos um aviso em nosso site ou por meio da plataforma antes que elas 
            entrem em vigor. O uso contínuo da aplicação indica sua adesão aos termos atualizados.
          </p>
        </div>

      </div>
    </div>
  );
}
