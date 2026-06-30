import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext.tsx';
import { Building2, Users, CreditCard, Activity, ArrowUpRight, Server, Globe2, ShieldCheck } from 'lucide-react';

export default function PlatformAdminDashboard() {
  const { fetchWithAuth } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await fetchWithAuth('/api/admin/metrics');
        if (res.ok) {
          const data = await res.json();
          setMetrics(data.metrics);
        }
      } catch (error) {
        console.error("Failed to load admin metrics", error);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, [fetchWithAuth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Tenants', value: metrics?.totalTenants || 0, icon: Building2, trend: '+12%', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Total Users', value: metrics?.totalUsers || 0, icon: Users, trend: '+5%', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Companies', value: metrics?.totalCompanies || 0, icon: Globe2, trend: '+8%', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Projects', value: metrics?.totalProjects || 0, icon: Server, trend: '+24%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Platform HQ</h1>
        <p className="text-sm text-gray-500 font-medium">Visão global da infraestrutura e negócios.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-${stat.bg.split('-')[1]}-100 opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-full`} />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-xs font-bold">
                <ArrowUpRight size={14} />
                {stat.trend}
              </div>
            </div>
            <div className="space-y-1 relative z-10">
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</h3>
              <p className="text-sm font-semibold text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">MRR Growth</h2>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View Details</button>
          </div>
          <div className="h-64 flex items-center justify-center border border-dashed border-gray-200 rounded-xl bg-gray-50">
            <Activity className="w-8 h-8 text-gray-300" />
            <span className="ml-2 text-gray-400 font-medium">Gráfico de Receita em Construção</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">System Status</h2>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <ShieldCheck size={14} />
              All Systems Operational
            </div>
          </div>
          <div className="space-y-4">
            {['API Servers', 'Database Clusters', 'Edge Network', 'Background Workers'].map((sys, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-gray-50 bg-gray-50/50">
                <span className="text-sm font-semibold text-gray-700">{sys}</span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-gray-500">99.9%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
