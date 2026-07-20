import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { BarChart, RotateCw, Save, AlertTriangle } from 'lucide-react';
import { showSuccess, showError } from '../../../lib/alerts';
import { BES_THRESHOLDS, ACTIONS } from '../../../utils/besCalculator';
import StandardHeader from '../../../components/layout/StandardHeader';

export default function AdminBESView() {
  const { fetchWithAuth } = useAuth();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [besConfig, setBesConfig] = useState<{thresholds: any, actions: any} | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<number | string | null>(null);

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const [resWs, resConfig] = await Promise.all([
        fetchWithAuth('/api/workspaces'),
        fetchWithAuth('/api/admin/bes-config')
      ]);
      if (resWs.ok) {
        const data = await resWs.json();
        setWorkspaces(Array.isArray(data) ? data : []);
      }
      if (resConfig.ok) {
        const data = await resConfig.json();
        // Handle migration if old flat structure or empty
        setBesConfig(data.thresholds ? data : { thresholds: BES_THRESHOLDS, actions: ACTIONS });
      } else {
        setBesConfig({ thresholds: BES_THRESHOLDS, actions: ACTIONS });
      }
    } catch (err) {
      console.error(err);
      showError("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const saveConfig = async () => {
    setSaving('config');
    try {
      const res = await fetchWithAuth('/api/admin/bes-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: besConfig })
      });
      if (res.ok) {
        showSuccess("Configurações salvas!");
      } else {
        showError("Falha ao salvar.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(null);
    }
  };

  const updateWorkspaceBES = async (wsId: number, newBes: number) => {
    setSaving(wsId);
    try {
      const res = await fetchWithAuth(`/api/workspaces/${wsId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            besScore: newBes,
            besMaturity: Math.min(100, (newBes / 15000) * 100)
          }
        })
      });
      if (res.ok) {
        showSuccess("Score atualizado!");
        fetchWorkspaces();
      } else {
        showError("Falha ao atualizar score.");
      }
    } catch (err) {
      console.error(err);
      showError("Erro de rede.");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div id="admin-bes-module" className="w-full mx-auto pb-12 flex flex-col gap-10 animate-in fade-in duration-500 relative px-4 sm:px-6 lg:px-10">
      
      <StandardHeader 
        title="Gerenciamento Global BES"
        subtitle="Ajuste manual e monitoramento do Business Evolution Score dos clientes."
        actions={[
          {
            label: 'Recarregar',
            icon: RotateCw,
            onClick: fetchWorkspaces,
            variant: 'secondary'
          }
        ]}
      />
      
      {/* Configuration Section */}
      {besConfig && (
        <div className="bg-white border rounded-[24px] shadow-sm p-6 space-y-8">
          <h3 className="font-display font-black text-sm text-zinc-900">Configuração Global BES</h3>
          
          <div className="space-y-4">
            <h4 className="text-xs font-display font-black text-zinc-500 uppercase">Limiares de Maturidade</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(besConfig.thresholds).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                        <label className="text-[10px] font-display font-bold text-zinc-500 uppercase">{key}</label>
                        <input 
                          type="number" 
                          value={value as number}
                          onChange={(e) => setBesConfig({...besConfig, thresholds: {...besConfig.thresholds, [key]: parseInt(e.target.value)}})}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl outline-none text-xs font-mono transition"
                        />
                    </div>
                ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-display font-black text-zinc-500 uppercase">Pontuação por Ação</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Object.entries(besConfig.actions).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                        <label className="text-[10px] font-display font-bold text-zinc-500 uppercase">{key}</label>
                        <input 
                          type="number" 
                          value={value as number}
                          onChange={(e) => setBesConfig({...besConfig, actions: {...besConfig.actions, [key]: parseInt(e.target.value)}})}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl outline-none text-xs font-mono transition"
                        />
                    </div>
                ))}
            </div>
          </div>

          <button 
            onClick={saveConfig}
            disabled={saving === 'config'}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-zinc-800 text-white rounded-xl transition text-xs font-display font-bold shadow-sm cursor-pointer"
          >
            {saving === 'config' ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Salvar Configurações
          </button>
        </div>
      )}

      {/* Workspaces List */}
      <div className="bg-white border rounded-[24px] shadow-sm overflow-hidden p-2">
        <table className="w-full text-xs">
          <thead className="bg-zinc-50 border-b">
            <tr>
              <th className="text-left px-6 py-4 font-display font-black text-zinc-500 uppercase">Workspace</th>
              <th className="text-right px-6 py-4 font-display font-black text-zinc-500 uppercase">BES Atual</th>
              <th className="text-right px-6 py-4 font-display font-black text-zinc-500 uppercase">Ajuste Manual</th>
              <th className="text-right px-6 py-4 font-display font-black text-zinc-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody>
            {workspaces.map((ws) => (
              <tr key={ws.id} className="border-b hover:bg-zinc-50/50">
                <td className="px-6 py-4 font-display font-bold">{ws.name}</td>
                <td className="px-6 py-4 text-right font-mono font-bold">{(ws.settings?.besScore || 0).toLocaleString()}</td>
                <td className="px-6 py-4 text-right">
                  <input
                    type="number"
                    id={`bes-${ws.id}`}
                    defaultValue={ws.settings?.besScore || 0}
                    className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl outline-none text-right text-xs font-mono transition"
                  />
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => {
                        const input = document.getElementById(`bes-${ws.id}`) as HTMLInputElement;
                        updateWorkspaceBES(ws.id, parseInt(input.value));
                    }}
                    disabled={saving === ws.id}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-zinc-800 text-white rounded-xl transition text-xs font-display font-bold shadow-sm cursor-pointer"
                  >
                    {saving === ws.id ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Salvar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
