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
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [realInvoices, setRealInvoices] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [res, planRes, invRes] = await Promise.all([
          fetchWithAuth('/api/workspace-settings'),
          fetchWithAuth('/api/plans'),
          fetchWithAuth('/api/stripe/invoices')
        ]);
        
        if (res.ok) {
          const sData = await res.json();
          setSystemStats(sData.stats);
        }
        if (planRes.ok) {
          const pData = await planRes.json();
          setAvailablePlans(pData);
        }
        if (invRes.ok) {
          const iData = await invRes.json();
          setRealInvoices(iData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPlan, fetchWithAuth]);

  const handleSelectPlan = async (plan: string) => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/api/stripe/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan })
      });
      
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url; // Redirect to Stripe
      } else {
        setToast({ message: data.error || 'Erro ao iniciar checkout', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Erro na conexão com o Stripe', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/api/stripe/portal-session', {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setToast({ message: data.error || 'Erro ao acessar portal de faturamento', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Erro na conexão com o Stripe', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Limits layout calculations
  const compileLimits = () => {
    // Find limits based on DB plans if available, else fallback
    const activeDbPlan = availablePlans.find(p => p.name === currentPlan);
    
    let caps = { maxCompanies: 10, maxUsers: 15, maxIa: 5000, labelCompanies: '10', labelUsers: '15', labelIa: '5.000' };
    
    if (activeDbPlan) {
      caps = {
        maxCompanies: activeDbPlan.maxWorkspaces * 3, // mock logic for companies
        maxUsers: activeDbPlan.maxUsers,
        maxIa: activeDbPlan.name === 'Starter' ? 100 : activeDbPlan.name === 'Enterprise' ? 999999 : 5000,
        labelCompanies: activeDbPlan.maxWorkspaces > 100 ? 'Ilimitado' : String(activeDbPlan.maxWorkspaces * 3),
        labelUsers: activeDbPlan.maxUsers > 1000 ? 'Ilimitado' : String(activeDbPlan.maxUsers),
        labelIa: activeDbPlan.name === 'Starter' ? '100' : activeDbPlan.name === 'Enterprise' ? 'Ilimitado' : '5.000'
      };
    } else {
      caps = {
        Starter: { maxCompanies: 3, maxUsers: 1, maxIa: 100, labelCompanies: '3', labelUsers: '1', labelIa: '100' },
        Pro: { maxCompanies: 10, maxUsers: 15, maxIa: 5000, labelCompanies: '10', labelUsers: '15', labelIa: '5.000' },
        Enterprise: { maxCompanies: 9999, maxUsers: 9999, maxIa: 999999, labelCompanies: 'Ilimitado', labelUsers: 'Ilimitado', labelIa: 'Ilimitado' }
      }[currentPlan as 'Starter' | 'Pro' | 'Enterprise'] || caps;
    }

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

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-display font-bold text-[#111111]">Faturamento e Assinatura</h2>
          <p className="text-sm text-[#64748B] leading-relaxed">Gerencie seu plano SaaS, consulte o consumo de recursos e faça upgrade do seu limite operacional.</p>
        </div>
        <button 
          onClick={handleManageBilling}
          disabled={loading}
          className="flex items-center gap-2 bg-[#111111] text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-black transition-all shadow-sm"
        >
          <CreditCard size={14} />
          Gerenciar Pagamento
        </button>
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
          
          {availablePlans.length > 0 ? availablePlans.map(plan => {
            const isActivePlan = currentPlan === plan.name;
            return (
              <div key={plan.id} className={`border rounded-[24px] p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${isActivePlan ? 'bg-[#FAFAFA]/50 border-[#111111]/60 shadow-md ring-1 ring-[#111111]/20' : 'bg-[#FFFFFF] border-[#0F172A0F] hover:shadow-sm'}`}>
                {plan.isPopular && (
                  <div className="absolute top-0 right-0 bg-[#111111] text-white text-[9px] font-bold px-3 py-1 rounded-bl uppercase tracking-widest flex items-center gap-1">
                    <Sparkles size={10} className="fill-white" /> Recomendado
                  </div>
                )}
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-start mt-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#111111]">{plan.name}</span>
                    {isActivePlan && <span className="text-[9px] font-bold bg-[#111111] text-white uppercase px-2 py-0.5 rounded tracking-wider flex items-center gap-1"><Check size={10} /> ATIVO</span>}
                  </div>
                  <div>
                    <h4 className="text-3xl font-display font-bold text-[#111111]">{plan.currency === 'BRL' ? 'R$' : '$'}{plan.price} <span className="text-xs font-medium text-[#64748B]">/{plan.billingPeriod === 'monthly' ? 'mês' : 'ano'}</span></h4>
                    <p className="text-xs text-[#64748B] mt-1.5 font-medium leading-relaxed">Plano {plan.name} com limites expandidos.</p>
                  </div>
                  <ul className="flex flex-col gap-2 pt-2 border-t border-[#0F172A0F]">
                    <li className="flex items-center gap-2 text-xs font-bold text-[#111111]">
                      <Check size={14} className="text-[#10B981]" /> 
                      {plan.maxWorkspaces > 100 ? 'Workspaces Ilimitados' : `${plan.maxWorkspaces} Workspaces`}
                    </li>
                    <li className="flex items-center gap-2 text-xs font-bold text-[#111111]">
                      <Check size={14} className="text-[#10B981]" /> 
                      {plan.maxUsers > 1000 ? 'Membros Ilimitados' : `${plan.maxUsers} Membros`}
                    </li>
                    {plan.features?.map((f: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-xs font-bold text-[#111111]">
                        <Check size={14} className="text-[#10B981]" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <button 
                  onClick={() => handleSelectPlan(plan.name)}
                  disabled={isActivePlan}
                  className={`w-full text-center py-3 rounded-[12px] text-xs font-bold mt-6 transition-all border ${isActivePlan ? 'bg-[#FAFAFA] border-[#0F172A0F] text-[#64748B] cursor-not-allowed' : 'bg-[#111111] text-white hover:bg-black'}`}
                >
                  {isActivePlan ? 'Plano Selecionado' : `Mudar para ${plan.name}`}
                </button>
              </div>
            );
          }) : (
            <div className="col-span-1 md:col-span-3 text-center py-10 text-gray-400">Nenhum plano cadastrado no sistema.</div>
          )}

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
              {realInvoices.length > 0 ? realInvoices.map((f, idx) => (
                <tr key={idx} className="hover:bg-[#F8FAFC]">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-[#111111]">{f.stripeInvoiceId || `#CY-${f.id}`}</td>
                  <td className="px-6 py-4 text-xs font-bold text-[#64748B]">{new Date(f.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-xs font-bold text-[#111111]">{f.currency?.toUpperCase()} {f.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${f.status === 'succeeded' ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>{f.status}</span>
                  </td>
                  <td className="px-6 py-4 flex justify-end">
                    <button className="flex items-center gap-1.5 p-2 bg-[#FAFAFA] hover:bg-[#F1F5F9] rounded-xl text-xs font-bold text-[#111111] border border-[#0F172A0F] transition-all">
                      <Download size={14} /> PDF
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-xs text-gray-400">Nenhuma fatura encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
