import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Settings, RefreshCw, CreditCard, Clock, Activity, FileText } from 'lucide-react';

export function BillingAdminView() {
  const { user, fetchWithAuth, refreshBranding } = useAuth();
  const [activeTab, setActiveTab] = useState<'config' | 'plans' | 'subscriptions' | 'payments' | 'webhooks'>('config');
  
  // Config
  const [testPublishableKey, setTestPublishableKey] = useState('');
  const [testSecretKey, setTestSecretKey] = useState('');
  const [testWebhookSecret, setTestWebhookSecret] = useState('');
  const [livePublishableKey, setLivePublishableKey] = useState('');
  const [liveSecretKey, setLiveSecretKey] = useState('');
  const [liveWebhookSecret, setLiveWebhookSecret] = useState('');
  const [environment, setEnvironment] = useState('sandbox');
  
  // Global Branding
  const [globalLogoUrl, setGlobalLogoUrl] = useState('');
  const [globalIconUrl, setGlobalIconUrl] = useState('');
  const [globalLogoSize, setGlobalLogoSize] = useState('40');
  const [globalIconSize, setGlobalIconSize] = useState('20');
  const [globalAppName, setGlobalAppName] = useState('CYZOR');
  
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
          setGlobalLogoUrl(data.globalLogoUrl || '');
          setGlobalIconUrl(data.globalIconUrl || '');
          setGlobalLogoSize(data.globalLogoSize || '40');
          setGlobalIconSize(data.globalIconSize || '20');
          setGlobalAppName(data.globalAppName || 'CYZOR');
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
          environment,
          globalLogoUrl, globalIconUrl, globalLogoSize, globalIconSize, globalAppName
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Billing Center (Stripe)</h1>
          <p className="text-gray-400 mt-1">Gerencie a integração com o Stripe, planos sincronizados e assinaturas.</p>
        </div>
      </div>

      <div className="flex space-x-1 border-b border-gray-800">
        <button onClick={() => setActiveTab('config')} className={`px-4 py-3 text-sm font-medium ${activeTab === 'config' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}>Configuração</button>
        <button onClick={() => setActiveTab('plans')} className={`px-4 py-3 text-sm font-medium ${activeTab === 'plans' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}>Sincronização de Planos</button>
        <button onClick={() => setActiveTab('subscriptions')} className={`px-4 py-3 text-sm font-medium ${activeTab === 'subscriptions' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}>Assinaturas</button>
        <button onClick={() => setActiveTab('payments')} className={`px-4 py-3 text-sm font-medium ${activeTab === 'payments' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}>Pagamentos</button>
        <button onClick={() => setActiveTab('webhooks')} className={`px-4 py-3 text-sm font-medium ${activeTab === 'webhooks' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}>Logs Webhook</button>
      </div>

      {activeTab === 'config' && (
        <form onSubmit={saveConfig} className="max-w-4xl space-y-6">
          {/* Active Environment Toggle */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Ambiente Ativo</h3>
                <p className="text-sm text-gray-400">Escolha qual ambiente o sistema deve usar para transações.</p>
              </div>
              <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-700">
                <button
                  type="button"
                  onClick={() => setEnvironment('sandbox')}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${environment === 'sandbox' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                  Sandbox
                </button>
                <button
                  type="button"
                  onClick={() => setEnvironment('production')}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${environment === 'production' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                  Production
                </button>
              </div>
            </div>
          </div>

          {/* Global Branding Section */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-6">
            <div className="border-b border-gray-700 pb-4">
              <h3 className="text-lg font-bold text-white">Identidade Visual Global</h3>
              <p className="text-sm text-gray-400">Branding padrão do sistema para todos os workspaces que não possuem White Label (Pro).</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Nome do App Global</label>
                  <input type="text" value={globalAppName} onChange={e => setGlobalAppName(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded px-3 py-2 text-sm" placeholder="CYZOR CONTROL" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Tamanho Logo</label>
                    <input type="text" value={globalLogoSize} onChange={e => setGlobalLogoSize(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded px-3 py-2 text-sm" placeholder="40" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Tamanho Ícone</label>
                    <input type="text" value={globalIconSize} onChange={e => setGlobalIconSize(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded px-3 py-2 text-sm" placeholder="20" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">URL do Logo Global</label>
                  <div className="flex gap-2">
                    <input type="text" value={globalLogoUrl} onChange={e => setGlobalLogoUrl(e.target.value)} className="flex-1 bg-gray-900 border border-gray-700 text-white rounded px-3 py-2 text-sm" placeholder="https://..." />
                    {globalLogoUrl && <img src={globalLogoUrl} alt="Preview" className="h-10 w-10 object-contain bg-white rounded p-1" />}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">URL do Ícone Global</label>
                  <div className="flex gap-2">
                    <input type="text" value={globalIconUrl} onChange={e => setGlobalIconUrl(e.target.value)} className="flex-1 bg-gray-900 border border-gray-700 text-white rounded px-3 py-2 text-sm" placeholder="https://..." />
                    {globalIconUrl && <img src={globalIconUrl} alt="Preview" className="h-10 w-10 object-contain bg-white rounded p-1" />}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sandbox Config */}
            <div className={`bg-gray-800 border rounded-lg p-6 space-y-4 transition-all ${environment === 'sandbox' ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-gray-700 opacity-60'}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <h3 className="font-bold text-white">Configuração Sandbox (Test)</h3>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Publishable Key</label>
                <input type="text" value={testPublishableKey} onChange={e => setTestPublishableKey(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded px-3 py-2 text-sm" placeholder="pk_test_..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Secret Key</label>
                <input type="password" value={testSecretKey} onChange={e => setTestSecretKey(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded px-3 py-2 text-sm" placeholder="sk_test_..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Webhook Secret</label>
                <input type="password" value={testWebhookSecret} onChange={e => setTestWebhookSecret(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded px-3 py-2 text-sm" placeholder="whsec_..." />
                {environment === 'sandbox' && (
                  <button type="button" onClick={provisionWebhook} disabled={loading} className="mt-2 text-[10px] bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-600/30 px-2 py-1 rounded font-bold flex items-center gap-1 transition-all">
                    <RefreshCw size={10} /> Auto-Provisionar Sandbox
                  </button>
                )}
              </div>
            </div>

            {/* Production Config */}
            <div className={`bg-gray-800 border rounded-lg p-6 space-y-4 transition-all ${environment === 'production' ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-gray-700 opacity-60'}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <h3 className="font-bold text-white">Configuração Production (Live)</h3>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Publishable Key</label>
                <input type="text" value={livePublishableKey} onChange={e => setLivePublishableKey(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded px-3 py-2 text-sm" placeholder="pk_live_..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Secret Key</label>
                <input type="password" value={liveSecretKey} onChange={e => setLiveSecretKey(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded px-3 py-2 text-sm" placeholder="sk_live_..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Webhook Secret</label>
                <input type="password" value={liveWebhookSecret} onChange={e => setLiveWebhookSecret(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded px-3 py-2 text-sm" placeholder="whsec_..." />
                {environment === 'production' && (
                  <button type="button" onClick={provisionWebhook} disabled={loading} className="mt-2 text-[10px] bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-600/30 px-2 py-1 rounded font-bold flex items-center gap-1 transition-all">
                    <RefreshCw size={10} /> Auto-Provisionar Production
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2">
              {loading ? <RefreshCw className="animate-spin" size={18} /> : <Settings size={18} />}
              Salvar Configurações Gerais
            </button>
          </div>
        </form>
      )}

      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-xl">
            <div>
              <h3 className="text-lg font-bold text-white">Sincronização em Massa</h3>
              <p className="text-sm text-gray-400">Garanta que todos os planos existam no Stripe para o ambiente atual: 
                <span className={`ml-2 font-bold ${environment === 'production' ? 'text-green-500' : 'text-blue-500'}`}>
                  {environment === 'production' ? 'PRODUÇÃO (LIVE)' : 'SANDBOX (TEST)'}
                </span>
              </p>
            </div>
            <button 
              onClick={syncAllPlans} 
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${environment === 'production' ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/20' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'}`}
            >
              {loading ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />}
              Sincronizar Todos os Planos
            </button>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-gray-800 text-gray-300">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Plano</th>
                <th className="px-4 py-3">Preço</th>
                <th className="px-4 py-3">Intervalo</th>
                <th className="px-4 py-3">Stripe Test (ID)</th>
                <th className="px-4 py-3">Stripe Live (ID)</th>
                <th className="px-4 py-3 rounded-tr-lg">Ação</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(p => (
                <tr key={p.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-white">{p.name}</td>
                  <td className="px-4 py-3">{p.currency} {p.price}</td>
                  <td className="px-4 py-3">{p.billingPeriod}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-500 uppercase tracking-tighter font-bold">Sandbox (Test)</span>
                      <span className={`text-[10px] bg-gray-900 px-2 py-0.5 rounded font-mono ${p.testStripePriceId ? 'text-blue-400' : 'text-gray-600'}`}>
                        {p.testStripePriceId || 'Não sincronizado'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-500 uppercase tracking-tighter font-bold">Production (Live)</span>
                      <span className={`text-[10px] bg-gray-900 px-2 py-0.5 rounded font-mono ${p.liveStripePriceId ? 'text-green-400' : 'text-gray-600'}`}>
                        {p.liveStripePriceId || 'Não sincronizado'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => syncPlan(p.id)} disabled={loading} className={`text-xs font-bold border px-3 py-1.5 rounded transition-all ${environment === 'production' ? 'text-green-500 border-green-500/30 hover:bg-green-500/10' : 'text-blue-500 border-blue-500/30 hover:bg-blue-500/10'}`}>
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
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-gray-900/50 text-gray-300">
              <tr>
                <th className="px-4 py-3">Tenant ID</th>
                <th className="px-4 py-3">Plan ID</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Stripe Sub ID</th>
                <th className="px-4 py-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map(s => (
                <tr key={s.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="px-4 py-3 text-xs font-mono">{s.tenantId}</td>
                  <td className="px-4 py-3">{s.planId}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${s.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{s.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono">{s.stripeSubscriptionId}</td>
                  <td className="px-4 py-3">{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-gray-900/50 text-gray-300">
              <tr>
                <th className="px-4 py-3">Tenant ID</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Invoice ID</th>
                <th className="px-4 py-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="px-4 py-3 text-xs font-mono">{p.tenantId}</td>
                  <td className="px-4 py-3 text-white">{p.currency.toUpperCase()} {p.amount}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${p.status === 'succeeded' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono">{p.stripeInvoiceId}</td>
                  <td className="px-4 py-3">{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'webhooks' && (
        <div className="space-y-4">
          {webhooks.map(w => (
            <div key={w.id} className="bg-gray-800 border border-gray-700 rounded p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-xs text-blue-400 font-bold">{w.type}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${w.status === 'processed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{w.status}</span>
              </div>
              <div className="text-xs text-gray-500 mb-2">Event ID: {w.stripeEventId} | Data: {new Date(w.createdAt).toLocaleString()}</div>
              {w.error && <div className="text-xs text-red-400 mb-2 bg-red-950 p-2 rounded">{w.error}</div>}
              <pre className="text-[10px] text-gray-400 bg-gray-900 p-3 rounded overflow-x-auto max-h-40">
                {JSON.stringify(w.payload, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
