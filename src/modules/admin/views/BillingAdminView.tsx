import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Settings, RefreshCw, CreditCard, Clock, Activity, FileText } from 'lucide-react';

export function BillingAdminView() {
  const { user, fetchWithAuth } = useAuth();
  const [activeTab, setActiveTab] = useState<'config' | 'plans' | 'subscriptions' | 'payments' | 'webhooks'>('config');
  
  // Config
  const [publishableKey, setPublishableKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
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
          setPublishableKey(data.publishableKey || '');
          setSecretKey(data.secretKey || '');
          setWebhookSecret(data.webhookSecret || '');
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
        body: JSON.stringify({ publishableKey, secretKey, webhookSecret, environment })
      });
      if (res.ok) {
        alert('Configurações salvas!');
      }
    } catch (e) {
      alert('Erro ao salvar');
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
        <form onSubmit={saveConfig} className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-2xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Stripe Publishable Key</label>
            <input type="text" value={publishableKey} onChange={e => setPublishableKey(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Stripe Secret Key</label>
            <input type="password" value={secretKey} onChange={e => setSecretKey(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Webhook Secret (Signing Secret)</label>
            <input type="password" value={webhookSecret} onChange={e => setWebhookSecret(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Ambiente</label>
            <select value={environment} onChange={e => setEnvironment(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded px-3 py-2">
              <option value="sandbox">Sandbox (Test Mode)</option>
              <option value="production">Production (Live Mode)</option>
            </select>
          </div>
          <div className="pt-4">
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium">
              {loading ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'plans' && (
        <div className="space-y-4">
          <div className="bg-yellow-900/30 border border-yellow-700/50 p-4 rounded text-sm text-yellow-200">
            <strong>Atenção:</strong> Sincronize os planos para gerar Product e Price no Stripe. O Stripe não é a fonte da verdade, apenas processa os pagamentos baseados nestes IDs.
          </div>
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-gray-800 text-gray-300">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Plano</th>
                <th className="px-4 py-3">Preço</th>
                <th className="px-4 py-3">Intervalo</th>
                <th className="px-4 py-3">Stripe Product ID</th>
                <th className="px-4 py-3">Stripe Price ID</th>
                <th className="px-4 py-3 rounded-tr-lg">Ação</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(p => (
                <tr key={p.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-white">{p.name}</td>
                  <td className="px-4 py-3">{p.currency} {p.price}</td>
                  <td className="px-4 py-3">{p.billingPeriod}</td>
                  <td className="px-4 py-3"><span className="text-xs bg-gray-900 px-2 py-1 rounded font-mono">{p.stripeProductId || 'Não sincronizado'}</span></td>
                  <td className="px-4 py-3"><span className="text-xs bg-gray-900 px-2 py-1 rounded font-mono">{p.stripePriceId || 'Não sincronizado'}</span></td>
                  <td className="px-4 py-3">
                    <button onClick={() => syncPlan(p.id)} disabled={loading} className="text-blue-500 hover:text-blue-400 text-xs font-bold border border-blue-500/30 px-3 py-1.5 rounded">
                      Sincronizar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
