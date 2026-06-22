import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { CreditCard, Sparkles, Check, Plus, Download, Loader2 } from 'lucide-react';
import { Toast } from './SettingsHelpers';

export default function SecAssinatura({ currentPlan, onUpgrade }: { currentPlan: string, onUpgrade: (plan: string) => void }) {
  const { fetchWithAuth } = useAuth();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Dynamic system counts
  const [loading, setLoading] = useState(true);
  const [systemStats, setSystemStats] = useState({ companies: 0, projects: 0, products: 0, members: 1 });

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        setLoading(true);
        const res = await fetchWithAuth('/api/workspace-settings');
        if (res.ok) {
          const sData = await res.json();
          setSystemStats(sData.stats);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsage();
  }, [currentPlan]);

  const handleSelectPlan = (plan: string) => {
    onUpgrade(plan);
    setToast({ message: `Plano alterado com sucesso para ${plan}!`, type: 'success' });
  };

  // Limits layout calculations
  const compileLimits = () => {
    const caps = {
      Starter: { maxCompanies: 3, maxUsers: 1, maxIa: 100, labelCompanies: '3', labelUsers: '1', labelIa: '100' },
      Pro: { maxCompanies: 10, maxUsers: 15, maxIa: 5000, labelCompanies: '10', labelUsers: '15', labelIa: '5.000' },
      Enterprise: { maxCompanies: 9999, maxUsers: 9999, maxIa: 999999, labelCompanies: 'Ilimitado', labelUsers: 'Ilimitado', labelIa: 'Ilimitado' }
    }[currentPlan as 'Starter' | 'Pro' | 'Enterprise'] || { maxCompanies: 10, maxUsers: 15, maxIa: 5000, labelCompanies: '10', labelUsers: '15', labelIa: '5.000' };

    const compUsage = systemStats.companies;
    const membUsage = systemStats.members;

    const compPercent = Math.min((compUsage / caps.maxCompanies) * 100, 100);
    const membPercent = Math.min((membUsage / caps.maxUsers) * 100, 100);
    const iaPercent = currentPlan === 'Starter' ? 95 : currentPlan === 'Pro' ? 12 : 1; // logical mock for ia tokens quota usage

    return {
      companiesText: `${compUsage} / ${caps.labelCompanies}`,
      usersText: `${membUsage} / ${caps.labelUsers}`,
      iaText: currentPlan === 'Starter' ? '95 / 100' : currentPlan === 'Pro' ? '612 / 5.000' : '2.450 / Ilimitado',
      compPercent,
      membPercent,
      iaPercent
    };
  };

  const limits = compileLimits();

  // Dynamic invoice lists
  const invoices = [
    { code: '#CY-092', due: 'Hoje', amount: currentPlan === 'Starter' ? '$0.00' : currentPlan === 'Pro' ? '$49.00' : '$149.00', status: 'Pago' },
    { code: '#CY-081', due: '20 Mai 2026', amount: currentPlan === 'Starter' ? '$0.00' : currentPlan === 'Pro' ? '$49.00' : '$149.00', status: 'Pago' },
    { code: '#CY-070', due: '20 Abr 2026', amount: currentPlan === 'Starter' ? '$0.00' : currentPlan === 'Pro' ? '$49.00' : '$149.00', status: 'Pago' }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-[#111111]" size={36} />
        <span className="text-[#64748B] font-bold text-sm">Calculando franquias financeiras...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-300 relative">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-display font-bold text-[#111111]">Faturamento e Assinatura</h2>
        <p className="text-sm text-[#64748B] leading-relaxed">Gerencie seu plano SaaS, consulte o consumo de recursos e faça upgrade do seu limite operacional.</p>
      </div>

      {/* Dynamic Resource consumption limits */}
      <div className="flex flex-col gap-6">
        <h3 className="text-sm font-bold uppercase text-[#111111] tracking-widest border-b border-[#0F172A0F] pb-3">Consumo de Recursos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Companies */}
          <div className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-[20px] p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">Empresas</span>
              <span className="text-xs font-bold text-[#111111]">{limits.companiesText}</span>
            </div>
            <div className="w-full bg-[#0F172A0F] h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${limits.compPercent >= 100 ? 'bg-red-500' : 'bg-[#111111]'}`}
                style={{ width: `${limits.compPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold text-[#64748B]">Sua cota limite de empresas cadastradas.</span>
          </div>

          {/* Members */}
          <div className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-[20px] p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">Usuários da Equipe</span>
              <span className="text-xs font-bold text-[#111111]">{limits.usersText}</span>
            </div>
            <div className="w-full bg-[#0F172A0F] h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${limits.membPercent >= 100 ? 'bg-red-500' : 'bg-[#111111]'}`}
                style={{ width: `${limits.membPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold text-[#64748B]">Assentos de colaboradores disponíveis.</span>
          </div>

          {/* AI uses tokens */}
          <div className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-[20px] p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">Uso da IA (Tokens)</span>
              <span className="text-xs font-bold text-[#111111]">{limits.iaText}</span>
            </div>
            <div className="w-full bg-[#0F172A0F] h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${limits.iaPercent >= 100 ? 'bg-red-500' : 'bg-[#111111]'}`}
                style={{ width: `${limits.iaPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold text-[#64748B]">Requisições de IA e análises do mês.</span>
          </div>
        </div>
      </div>

      {/* Plans layout */}
      <div className="flex flex-col gap-6">
        <h3 className="text-sm font-bold uppercase text-[#111111] tracking-widest border-b border-[#0F172A0F] pb-3">Planos SaaS Disponíveis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Starter */}
          <div className={`border rounded-[24px] p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${currentPlan === 'Starter' ? 'bg-[#FAFAFA]/50 border-[#111111]/60 shadow-md ring-1 ring-[#111111]/20' : 'bg-[#FFFFFF] border-[#0F172A0F] hover:shadow-sm'}`}>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold uppercase tracking-widest text-[#64748B]">Starter</span>
                {currentPlan === 'Starter' && <span className="text-[9px] font-bold bg-[#111111] text-white uppercase px-2 py-0.5 rounded tracking-wider flex items-center gap-1"><Check size={10} /> ATIVO</span>}
              </div>
              <div>
                <h4 className="text-3xl font-display font-bold text-[#111111]">$0 <span className="text-xs font-medium text-[#64748B]">/mês</span></h4>
                <p className="text-xs text-[#64748B] mt-1.5 font-medium leading-relaxed">Perfeito para desenvolvedores e ideias isoladas em validação inicial.</p>
              </div>
              <ul className="flex flex-col gap-2 pt-2 border-t border-[#0F172A0F]">
                <li className="flex items-center gap-2 text-xs font-bold text-[#111111]"><Check size={14} className="text-[#10B981]" /> 1 Workspace isolado</li>
                <li className="flex items-center gap-2 text-xs font-bold text-[#111111]"><Check size={14} className="text-[#10B981]" /> Até 3 empresas</li>
                <li className="flex items-center gap-2 text-xs font-bold text-[#111111]"><Check size={14} className="text-[#10B981]" /> 1 Assento de usuário</li>
                <li className="flex items-center gap-2 text-xs font-bold text-[#64748B]/60"><Plus size={14} /> IA Limitada (100 tok)</li>
              </ul>
            </div>
            <button 
              onClick={() => handleSelectPlan('Starter')}
              disabled={currentPlan === 'Starter'}
              className={`w-full text-center py-3 rounded-[12px] text-xs font-bold mt-6 transition-all border ${currentPlan === 'Starter' ? 'bg-[#FAFAFA] border-[#0F172A0F] text-[#64748B] cursor-not-allowed' : 'bg-[#111111] text-white hover:bg-black'}`}
            >
              {currentPlan === 'Starter' ? 'Plano Selecionado' : 'Mudar para Free'}
            </button>
          </div>

          {/* Pro */}
          <div className={`border rounded-[24px] p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${currentPlan === 'Pro' ? 'bg-[#FAFAFA]/50 border-[#111111]/60 shadow-md ring-1 ring-[#111111]/20' : 'bg-[#FFFFFF] border-[#0F172A0F] hover:shadow-sm'}`}>
            <div className="absolute top-0 right-0 bg-[#111111] text-white text-[9px] font-bold px-3 py-1 rounded-bl uppercase tracking-widest flex items-center gap-1">
              <Sparkles size={10} className="fill-white" /> Recomendado
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start mt-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#111111]">Profissional (Pro)</span>
                {currentPlan === 'Pro' && <span className="text-[9px] font-bold bg-[#111111] text-white uppercase px-2 py-0.5 rounded tracking-wider flex items-center gap-1"><Check size={10} /> ATIVO</span>}
              </div>
              <div>
                <h4 className="text-3xl font-display font-bold text-[#111111]">$49 <span className="text-xs font-medium text-[#64748B]">/mês</span></h4>
                <p className="text-xs text-[#64748B] mt-1.5 font-medium leading-relaxed">Excelente para pequenas agências e estúdios digitais em expansão.</p>
              </div>
              <ul className="flex flex-col gap-2 pt-2 border-t border-[#0F172A0F]">
                <li className="flex items-center gap-2 text-xs font-bold text-[#111111]"><Check size={14} className="text-[#10B981]" /> 5 Workspaces integrados</li>
                <li className="flex items-center gap-2 text-xs font-bold text-[#111111]"><Check size={14} className="text-[#10B981]" /> Até 10 empresas</li>
                <li className="flex items-center gap-2 text-xs font-bold text-[#111111]"><Check size={14} className="text-[#10B981]" /> 15 Colaboradores</li>
                <li className="flex items-center gap-2 text-xs font-bold text-[#111111]"><Check size={14} className="text-[#10B981]" /> IA Pro (5.000 tokens)</li>
              </ul>
            </div>
            <button 
              onClick={() => handleSelectPlan('Pro')}
              disabled={currentPlan === 'Pro'}
              className={`w-full text-center py-3 rounded-[12px] text-xs font-bold mt-6 transition-all border ${currentPlan === 'Pro' ? 'bg-[#FAFAFA] border-[#0F172A0F] text-[#64748B] cursor-not-allowed' : 'bg-[#111111] text-white hover:bg-black'}`}
            >
              {currentPlan === 'Pro' ? 'Plano Selecionado' : 'Mudar para Pro'}
            </button>
          </div>

          {/* Enterprise */}
          <div className={`border rounded-[24px] p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${currentPlan === 'Enterprise' ? 'bg-[#FAFAFA]/50 border-[#111111]/60 shadow-md ring-1 ring-[#111111]/20' : 'bg-[#FFFFFF] border-[#0F172A0F] hover:shadow-sm'}`}>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold uppercase tracking-widest text-[#64748B]">Enterprise</span>
                {currentPlan === 'Enterprise' && <span className="text-[9px] font-bold bg-[#111111] text-white uppercase px-2 py-0.5 rounded tracking-wider flex items-center gap-1"><Check size={10} /> ATIVO</span>}
              </div>
              <div>
                <h4 className="text-3xl font-display font-bold text-[#111111]">$149 <span className="text-xs font-medium text-[#64748B]">/mês</span></h4>
                <p className="text-xs text-[#64748B] mt-1.5 font-medium leading-relaxed">Conexões avançadas e estrutura robusta para controle sem barreiras.</p>
              </div>
              <ul className="flex flex-col gap-2 pt-2 border-t border-[#0F172A0F]">
                <li className="flex items-center gap-2 text-xs font-bold text-[#111111]"><Check size={14} className="text-[#10B981]" /> Workspaces Ilimitados</li>
                <li className="flex items-center gap-2 text-xs font-bold text-[#111111]"><Check size={14} className="text-[#10B981]" /> Empresas Ilimitadas</li>
                <li className="flex items-center gap-2 text-xs font-bold text-[#111111]"><Check size={14} className="text-[#10B981]" /> Membros Ilimitados</li>
                <li className="flex items-center gap-2 text-xs font-bold text-[#111111]"><Check size={14} className="text-[#10B981]" /> IA Enterprise sem limites</li>
              </ul>
            </div>
            <button 
              onClick={() => handleSelectPlan('Enterprise')}
              disabled={currentPlan === 'Enterprise'}
              className={`w-full text-center py-3 rounded-[12px] text-xs font-bold mt-6 transition-all border ${currentPlan === 'Enterprise' ? 'bg-[#FAFAFA] border-[#0F172A0F] text-[#64748B] cursor-not-allowed' : 'bg-[#111111] text-white hover:bg-black'}`}
            >
              {currentPlan === 'Enterprise' ? 'Plano Selecionado' : 'Mudar para Enterprise'}
            </button>
          </div>

        </div>
      </div>

      {/* Invoice list */}
      <div className="flex flex-col gap-6">
        <h3 className="text-sm font-bold uppercase text-[#111111] tracking-widest border-b border-[#0F172A0F] pb-3">Histórico de Faturas</h3>
        <div className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[24px] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-[#0F172A0F]">
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-[#64748B] tracking-widest">Código</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-[#64748B] tracking-widest">Vencimento</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-[#64748B] tracking-widest">Valor</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-[#64748B] tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-[#64748B] tracking-widest flex justify-end">Recibo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0F172A0F]">
              {invoices.map((f, idx) => (
                <tr key={idx} className="hover:bg-[#F8FAFC]">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-[#111111]">{f.code}</td>
                  <td className="px-6 py-4 text-xs font-bold text-[#64748B]">{f.due}</td>
                  <td className="px-6 py-4 text-xs font-bold text-[#111111]">{f.amount}</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold px-2 py-1 bg-[#10B981]/10 text-[#10B981] rounded-md border border-[#10B981]/20">{f.status}</span>
                  </td>
                  <td className="px-6 py-4 flex justify-end">
                    <button className="flex items-center gap-1.5 p-2 bg-[#FAFAFA] hover:bg-[#F1F5F9] rounded-xl text-xs font-bold text-[#111111] border border-[#0F172A0F] transition-all">
                      <Download size={14} /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
