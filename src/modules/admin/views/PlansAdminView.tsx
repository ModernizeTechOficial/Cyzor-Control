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
    return <div className="p-8 text-gray-500 font-medium">Carregando planos...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 mb-4">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 tracking-tight">Planos da Plataforma</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie os planos de assinatura, preços e limites.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-lg font-semibold flex items-center transition-all shadow-sm text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Plano
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 flex flex-col relative overflow-hidden transition-all hover:shadow-md">
            {plan.isPopular && (
              <div className="absolute top-0 right-0 bg-gray-900 text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-bl-xl shadow-sm">
                Popular
              </div>
            )}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center tracking-tight">
                  {plan.name}
                  {plan.isActive ? (
                    <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 ml-2" />
                  )}
                </h3>
                <p className="text-gray-500 font-medium text-sm mt-1">{plan.currency} {plan.price} / {plan.billingPeriod}</p>
              </div>
              <div className="flex space-x-1">
                <button onClick={() => openModal(plan)} className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => deletePlan(plan.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-6 flex-1">
              <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Usuários:</span>
                <span className="text-gray-900 font-semibold">{plan.maxUsers}</span>
              </div>
              <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Workspaces:</span>
                <span className="text-gray-900 font-semibold">{plan.maxWorkspaces}</span>
              </div>
              
              <div className="mt-4 pt-2">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-3">Features</span>
                <ul className="space-y-2">
                  {plan.features?.map((f, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start font-medium">
                      <CheckCircle className="w-4 h-4 text-gray-300 mr-2 shrink-0 mt-0.5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-200 rounded-xl w-full max-w-2xl overflow-hidden shadow-xl flex flex-col max-h-[90vh] animate-in scale-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="text-sm font-semibold text-gray-900 tracking-tight uppercase tracking-widest">
                {editingPlan ? 'Editar Plano' : 'Novo Plano'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="plan-form" onSubmit={savePlan} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Nome do Plano</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-gray-900 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all font-medium"
                      placeholder="Ex: Pro"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Preço</label>
                    <div className="flex">
                      <select 
                        value={currency} 
                        onChange={e => setCurrency(e.target.value)}
                        className="bg-gray-50 border border-gray-200 border-r-0 text-gray-700 font-semibold rounded-l-lg px-3 py-2.5 text-sm focus:outline-none"
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
                        className="flex-1 bg-white border border-gray-200 text-gray-900 rounded-r-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all font-medium"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Período de Faturamento</label>
                    <select
                      value={billingPeriod}
                      onChange={e => setBillingPeriod(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-gray-900 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all font-medium"
                    >
                      <option value="monthly">Mensal</option>
                      <option value="yearly">Anual</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Max Usuários</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={maxUsers}
                        onChange={e => setMaxUsers(parseInt(e.target.value))}
                        className="w-full bg-white border border-gray-200 text-gray-900 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Max Workspaces</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={maxWorkspaces}
                        onChange={e => setMaxWorkspaces(parseInt(e.target.value))}
                        className="w-full bg-white border border-gray-200 text-gray-900 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Features (separadas por vírgula)</label>
                  <textarea
                    rows={3}
                    value={features}
                    onChange={e => setFeatures(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-gray-900 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all font-medium"
                    placeholder="Ex: Suporte 24/7, Acesso total a API, Relatórios avançados"
                  />
                </div>

                <div className="flex items-center space-x-6 pt-4 border-t border-gray-100">
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isPopular}
                      onChange={e => setIsPopular(e.target.checked)}
                      className="form-checkbox h-4 w-4 text-gray-900 rounded border-gray-300 bg-white focus:ring-gray-900"
                    />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Marcar como Popular</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={e => setIsActive(e.target.checked)}
                      className="form-checkbox h-4 w-4 text-gray-900 rounded border-gray-300 bg-white focus:ring-gray-900"
                    />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Plano Ativo</span>
                  </label>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all shadow-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="plan-form"
                className="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-lg text-xs font-semibold transition-all shadow-sm"
              >
                Salvar Plano
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
