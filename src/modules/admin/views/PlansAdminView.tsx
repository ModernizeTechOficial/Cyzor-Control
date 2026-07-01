import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface Plan {
  id: number;
  name: string;
  price: string;
  currency: string;
  billingPeriod: string;
  maxUsers: number;
  maxWorkspaces: number;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function PlansAdminView() {
  const { user, fetchWithAuth } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('0.00');
  const [currency, setCurrency] = useState('BRL');
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [maxUsers, setMaxUsers] = useState(1);
  const [maxWorkspaces, setMaxWorkspaces] = useState(1);
  const [features, setFeatures] = useState(''); // Comma separated for simplicity in form
  const [isPopular, setIsPopular] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, [user]);

  const fetchPlans = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetchWithAuth('/api/admin/plans');
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (error) {
      console.error('Failed to fetch plans', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      setName(plan.name);
      setPrice(plan.price);
      setCurrency(plan.currency);
      setBillingPeriod(plan.billingPeriod);
      setMaxUsers(plan.maxUsers || 1);
      setMaxWorkspaces(plan.maxWorkspaces || 1);
      setFeatures(plan.features?.join(', ') || '');
      setIsPopular(plan.isPopular);
      setIsActive(plan.isActive);
    } else {
      setEditingPlan(null);
      setName('');
      setPrice('0.00');
      setCurrency('BRL');
      setBillingPeriod('monthly');
      setMaxUsers(1);
      setMaxWorkspaces(1);
      setFeatures('');
      setIsPopular(false);
      setIsActive(true);
    }
    setIsModalOpen(true);
  };

  const savePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const payload = {
        name,
        price,
        currency,
        billingPeriod,
        maxUsers,
        maxWorkspaces,
        features: features.split(',').map(f => f.trim()).filter(Boolean),
        isPopular,
        isActive
      };

      if (editingPlan) {
        await fetchWithAuth(`/api/admin/plans/${editingPlan.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetchWithAuth('/api/admin/plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (error) {
      console.error('Error saving plan', error);
      alert('Erro ao salvar plano.');
    }
  };

  const deletePlan = async (id: number) => {
    if (!user || !confirm('Tem certeza que deseja excluir este plano?')) return;
    try {
      await fetchWithAuth(`/api/admin/plans/${id}`, {
        method: 'DELETE'
      });
      fetchPlans();
    } catch (error) {
      console.error('Error deleting plan', error);
      alert('Erro ao excluir plano.');
    }
  };

  if (loading) {
    return <div className="p-8 text-white">Carregando planos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Planos da Plataforma</h1>
          <p className="text-gray-400 mt-1">Gerencie os planos de assinatura, preços e limites.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Plano
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex flex-col relative overflow-hidden">
            {plan.isPopular && (
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                Popular
              </div>
            )}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center">
                  {plan.name}
                  {plan.isActive ? (
                    <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 ml-2" />
                  )}
                </h3>
                <p className="text-gray-400 text-sm mt-1">{plan.currency} {plan.price} / {plan.billingPeriod}</p>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => openModal(plan)} className="p-1 text-gray-400 hover:text-white transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => deletePlan(plan.id)} className="p-1 text-gray-400 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-6 flex-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Usuários:</span>
                <span className="text-white font-medium">{plan.maxUsers}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Workspaces:</span>
                <span className="text-white font-medium">{plan.maxWorkspaces}</span>
              </div>
              
              <div className="mt-4">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Features</span>
                <ul className="space-y-1">
                  {plan.features?.map((f, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
              <h2 className="text-lg font-bold text-white">
                {editingPlan ? 'Editar Plano' : 'Novo Plano'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="plan-form" onSubmit={savePlan} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nome do Plano</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Ex: Pro"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Preço</label>
                    <div className="flex">
                      <select 
                        value={currency} 
                        onChange={e => setCurrency(e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-gray-300 rounded-l px-3 py-2 focus:outline-none"
                      >
                        <option value="BRL">R$</option>
                        <option value="USD">U$</option>
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        className="flex-1 bg-gray-800 border border-gray-700 border-l-0 text-white rounded-r px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Período de Faturamento</label>
                    <select
                      value={billingPeriod}
                      onChange={e => setBillingPeriod(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="monthly">Mensal</option>
                      <option value="yearly">Anual</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Max Usuários</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={maxUsers}
                        onChange={e => setMaxUsers(parseInt(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Max Workspaces</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={maxWorkspaces}
                        onChange={e => setMaxWorkspaces(parseInt(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Features (separadas por vírgula)</label>
                  <textarea
                    rows={3}
                    value={features}
                    onChange={e => setFeatures(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Ex: Suporte 24/7, Acesso total a API, Relatórios avançados"
                  />
                </div>

                <div className="flex items-center space-x-6 pt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPopular}
                      onChange={e => setIsPopular(e.target.checked)}
                      className="form-checkbox h-4 w-4 text-blue-500 rounded border-gray-700 bg-gray-800 focus:ring-blue-500 focus:ring-offset-gray-900"
                    />
                    <span className="text-sm text-gray-300">Marcar como Popular</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={e => setIsActive(e.target.checked)}
                      className="form-checkbox h-4 w-4 text-blue-500 rounded border-gray-700 bg-gray-800 focus:ring-blue-500 focus:ring-offset-gray-900"
                    />
                    <span className="text-sm text-gray-300">Plano Ativo</span>
                  </label>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-800 bg-gray-800/50 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="plan-form"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
