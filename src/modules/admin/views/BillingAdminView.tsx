import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Settings, RefreshCw, CreditCard, Clock, Activity, FileText } from 'lucide-react';

export function BillingAdminView() {
  const { fetchWithAuth, refreshBranding } = useAuth();
  const [activeTab, setActiveTab] = useState<'config' | 'plans' | 'subscriptions' | 'payments' | 'webhooks'>('config');
  
  // Config
  const [testPublishableKey, setTestPublishableKey] = useState('');
  const [testSecretKey, setTestSecretKey] = useState('');
  const [testWebhookSecret, setTestWebhookSecret] = useState('');
  const [livePublishableKey, setLivePublishableKey] = useState('');
  const [liveSecretKey, setLiveSecretKey] = useState('');
  const [liveWebhookSecret, setLiveWebhookSecret] = useState('');
  const [environment, setEnvironment] = useState('sandbox');
  
  // Data
  const [plans, setPlans] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    if (activeTab === 'plans') loadPlans();
    if (activeTab === 'subscriptions') loadSubscriptions();
    if (activeTab === 'payments') loadPayments();
    if (activeTab === 'webhooks') loadWebhooks();
  }, [activeTab]);

  const loadConfig = async () => {
    try {
      const res = await fetchWithAuth('/api/admin/stripe/config');
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setTestPublishableKey(data.testPublishableKey || '');
          setTestSecretKey(data.testSecretKey || '');
          setTestWebhookSecret(data.testWebhookSecret || '');
          setLivePublishableKey(data.livePublishableKey || '');
          setLiveSecretKey(data.liveSecretKey || '');
          setLiveWebhookSecret(data.liveWebhookSecret || '');
          setEnvironment(data.environment || 'sandbox');
        }
      }
    } catch (e) { console.error(e); }
  };

  const saveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetchWithAuth('/api/admin/stripe/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          testPublishableKey, testSecretKey, testWebhookSecret,
          livePublishableKey, liveSecretKey, liveWebhookSecret,
          environment
        })
      });
      if (res.ok) {
        alert('Configurações salvas!');
        await refreshBranding();
      }
    } catch (e) {
      alert('Erro ao salvar');
    }
    setLoading(false);
  };

  const provisionWebhook = async () => {
    setLoading(true);
    try {
      const url = `${window.location.origin}/api/webhooks/stripe`;
      const res = await fetchWithAuth('/api/admin/stripe/provision-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      if (res.ok) {
        alert('Webhook provisionado com sucesso e Secret atualizado!');
        loadConfig();
      } else {
        const data = await res.json();
        alert(`Erro: ${data.error || 'Falha ao provisionar webhook'}`);
      }
    } catch (e) {
      alert('Erro ao provisionar');
    }
    setLoading(false);
  };

  const syncAllPlans = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/api/admin/stripe/sync-all-plans', {
        method: 'POST'
      });
      if (res.ok) {
        alert('Todos os planos foram sincronizados com sucesso!');
        loadPlans();
      } else {
        const data = await res.json();
        alert(`Erro: ${data.error || 'Falha ao sincronizar planos'}`);
      }
    } catch (e) {
      alert('Erro ao sincronizar');
    }
    setLoading(false);
  };

  const loadPlans = async () => {
    try {
      const res = await fetchWithAuth('/api/admin/plans');
      if (res.ok) setPlans(await res.json());
    } catch (e) { console.error(e); }
  };

  const syncPlan = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`/api/admin/stripe/sync-plan/${id}`, { method: 'POST' });
      if (res.ok) {
        alert('Sincronizado!');
        loadPlans();
      } else {
        alert('Erro ao sincronizar');
      }
    } catch (e) {
      alert('Erro');
    }
    setLoading(false);
  };

  const loadSubscriptions = async () => {
    try {
      const res = await fetchWithAuth('/api/admin/stripe/subscriptions');
      if (res.ok) setSubscriptions(await res.json());
    } catch (e) { console.error(e); }
  };

  const loadPayments = async () => {
    try {
      const res = await fetchWithAuth('/api/admin/stripe/payments');
      if (res.ok) setPayments(await res.json());
    } catch (e) { console.error(e); }
  };

  const loadWebhooks = async () => {
    try {
      const res = await fetchWithAuth('/api/admin/stripe/webhooks');
      if (res.ok) setWebhooks(await res.json());
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 mb-4">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 tracking-tight">Billing Center (Stripe)</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie a integração com o Stripe, planos sincronizados e assinaturas.</p>
        </div>
      </div>

      <div className="flex space-x-1 border-b border-gray-100">
        <button onClick={() => setActiveTab('config')} className={`px-4 py-3 text-sm font-medium ${activeTab === 'config' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Configuração Stripe</button>
        <button onClick={() => setActiveTab('plans')} className={`px-4 py-3 text-sm font-medium ${activeTab === 'plans' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Sincronização de Planos</button>
        <button onClick={() => setActiveTab('subscriptions')} className={`px-4 py-3 text-sm font-medium ${activeTab === 'subscriptions' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Assinaturas</button>
        <button onClick={() => setActiveTab('payments')} className={`px-4 py-3 text-sm font-medium ${activeTab === 'payments' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Pagamentos</button>
        <button onClick={() => setActiveTab('webhooks')} className={`px-4 py-3 text-sm font-medium ${activeTab === 'webhooks' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Logs Webhook</button>
      </div>

      {activeTab === 'config' && (
        <form onSubmit={saveConfig} className="max-w-4xl space-y-6 mt-4">
          {/* Active Environment Toggle */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-tight">Ambiente Ativo</h3>
                <p className="text-sm text-gray-500">Escolha qual ambiente o sistema deve usar para transações.</p>
              </div>
              <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
                <button
                  type="button"
                  onClick={() => setEnvironment('sandbox')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${environment === 'sandbox' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Sandbox
                </button>
                <button
                  type="button"
                  onClick={() => setEnvironment('production')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${environment === 'production' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Production
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sandbox Config */}
            <div className={`bg-white border rounded-xl p-6 space-y-4 shadow-sm transition-all ${environment === 'sandbox' ? 'border-gray-300 shadow-md ring-1 ring-gray-200' : 'border-gray-200 opacity-70'}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-tight">Configuração Sandbox (Test)</h3>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Publishable Key</label>
                <input type="text" value={testPublishableKey} onChange={e => setTestPublishableKey(e.target.value)} className="w-full bg-white border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-200 transition-all font-medium" placeholder="pk_test_..." />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Secret Key</label>
                <input type="password" value={testSecretKey} onChange={e => setTestSecretKey(e.target.value)} className="w-full bg-white border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-200 transition-all font-medium" placeholder="sk_test_..." />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Webhook Secret</label>
                <input type="password" value={testWebhookSecret} onChange={e => setTestWebhookSecret(e.target.value)} className="w-full bg-white border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-200 transition-all font-medium" placeholder="whsec_..." />
                {environment === 'sandbox' && (
                  <button type="button" onClick={provisionWebhook} disabled={loading} className="mt-2 text-[10px] bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all">
                    <RefreshCw size={12} /> Auto-Provisionar Sandbox
                  </button>
                )}
              </div>
            </div>

            {/* Production Config */}
            <div className={`bg-white border rounded-xl p-6 space-y-4 shadow-sm transition-all ${environment === 'production' ? 'border-gray-300 shadow-md ring-1 ring-gray-200' : 'border-gray-200 opacity-70'}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-tight">Configuração Production (Live)</h3>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Publishable Key</label>
                <input type="text" value={livePublishableKey} onChange={e => setLivePublishableKey(e.target.value)} className="w-full bg-white border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-200 transition-all font-medium" placeholder="pk_live_..." />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Secret Key</label>
                <input type="password" value={liveSecretKey} onChange={e => setLiveSecretKey(e.target.value)} className="w-full bg-white border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-200 transition-all font-medium" placeholder="sk_live_..." />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Webhook Secret</label>
                <input type="password" value={liveWebhookSecret} onChange={e => setLiveWebhookSecret(e.target.value)} className="w-full bg-white border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-200 transition-all font-medium" placeholder="whsec_..." />
                {environment === 'production' && (
                  <button type="button" onClick={provisionWebhook} disabled={loading} className="mt-2 text-[10px] bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all">
                    <RefreshCw size={12} /> Auto-Provisionar Production
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={loading} className="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-lg font-semibold shadow-sm transition-all flex items-center gap-2 text-sm">
              {loading ? <RefreshCw className="animate-spin" size={16} /> : <Settings size={16} />}
              Salvar Configurações Gerais
            </button>
          </div>
        </form>
      )}

      {activeTab === 'plans' && (
        <div className="space-y-6 mt-4">
          <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-tight">Sincronização em Massa</h3>
              <p className="text-sm text-gray-500 mt-1">Garanta que todos os planos existam no Stripe para o ambiente atual: 
                <span className={`ml-2 font-semibold ${environment === 'production' ? 'text-green-600' : 'text-gray-700'}`}>
                  {environment === 'production' ? 'PRODUÇÃO (LIVE)' : 'SANDBOX (TEST)'}
                </span>
              </p>
            </div>
            <button 
              onClick={syncAllPlans} 
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm bg-gray-900 hover:bg-black text-white"
            >
              {loading ? <RefreshCw className="animate-spin" size={16} /> : <RefreshCw size={16} />}
              Sincronizar Todos
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 text-[11px] text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
              <tr>
                <th className="px-5 py-4 font-medium">Plano</th>
                <th className="px-5 py-4 font-medium">Preço</th>
                <th className="px-5 py-4 font-medium">Intervalo</th>
                <th className="px-5 py-4 font-medium">Stripe Test (ID)</th>
                <th className="px-5 py-4 font-medium">Stripe Live (ID)</th>
                <th className="px-5 py-4 font-medium">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {plans.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 text-gray-900 font-semibold">{p.name}</td>
                  <td className="px-5 py-3 font-medium">{p.currency} {p.price}</td>
                  <td className="px-5 py-3">{p.billingPeriod}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Sandbox (Test)</span>
                      <span className={`text-[10px] bg-gray-50 px-2 py-1 rounded font-mono border border-gray-100 ${p.testStripePriceId ? 'text-gray-700' : 'text-gray-400'}`}>
                        {p.testStripePriceId || 'Não sincronizado'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Production (Live)</span>
                      <span className={`text-[10px] bg-gray-50 px-2 py-1 rounded font-mono border border-gray-100 ${p.liveStripePriceId ? 'text-green-700' : 'text-gray-400'}`}>
                        {p.liveStripePriceId || 'Não sincronizado'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => syncPlan(p.id)} disabled={loading} className="text-xs font-semibold border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg transition-all shadow-sm">
                      Sincronizar {environment === 'production' ? 'Live' : 'Test'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

      {activeTab === 'subscriptions' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mt-4">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 text-[11px] text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
              <tr>
                <th className="px-5 py-4 font-medium">Tenant ID</th>
                <th className="px-5 py-4 font-medium">Plan ID</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Stripe Sub ID</th>
                <th className="px-5 py-4 font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {subscriptions.map(s => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 text-xs font-mono">{s.tenantId}</td>
                  <td className="px-5 py-3">{s.planId}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${s.status === 'active' ? 'bg-[#eefcf3] text-[#22c55e]' : 'bg-[#fff7ed] text-[#f97316]'}`}>{s.status}</span>
                  </td>
                  <td className="px-5 py-3 text-xs font-mono">{s.stripeSubscriptionId}</td>
                  <td className="px-5 py-3 text-xs">{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mt-4">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 text-[11px] text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
              <tr>
                <th className="px-5 py-4 font-medium">Tenant ID</th>
                <th className="px-5 py-4 font-medium">Valor</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Invoice ID</th>
                <th className="px-5 py-4 font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 text-xs font-mono">{p.tenantId}</td>
                  <td className="px-5 py-3 text-gray-900 font-semibold">{p.currency.toUpperCase()} {p.amount}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${p.status === 'succeeded' ? 'bg-[#eefcf3] text-[#22c55e]' : 'bg-[#fef2f2] text-[#ef4444]'}`}>{p.status}</span>
                  </td>
                  <td className="px-5 py-3 text-xs font-mono">{p.stripeInvoiceId}</td>
                  <td className="px-5 py-3 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'webhooks' && (
        <div className="space-y-4 mt-4">
          {webhooks.map(w => (
            <div key={w.id} className="bg-white border border-gray-200 shadow-sm rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-xs text-gray-800 font-bold">{w.type}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${w.status === 'processed' ? 'bg-[#eefcf3] text-[#22c55e]' : 'bg-[#fef2f2] text-[#ef4444]'}`}>{w.status}</span>
              </div>
              <div className="text-xs text-gray-500 mb-2">Event ID: <span className="font-mono">{w.stripeEventId}</span> | Data: {new Date(w.createdAt).toLocaleString()}</div>
              {w.error && <div className="text-xs text-red-600 mb-2 bg-red-50 border border-red-100 p-2 rounded-lg">{w.error}</div>}
              <pre className="text-[10px] text-gray-600 bg-gray-50 border border-gray-100 p-3 rounded-lg overflow-x-auto max-h-40">
                {JSON.stringify(w.payload, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
