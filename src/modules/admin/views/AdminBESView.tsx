import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { BarChart, RotateCw, Save, AlertTriangle } from 'lucide-react';
import { showSuccess, showError } from '../../../lib/alerts';
import { PROFESSIONAL_STAGES, ACTIONS } from '../../../utils/professionalEvolutionCalculator';
import StandardHeader from '../../../components/layout/StandardHeader';

export default function AdminBESView() {
  const { fetchWithAuth } = useAuth();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [evolutionConfig, setEvolutionConfig] = useState<{actions: any} | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<number | string | null>(null);

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const [resWs, resConfig] = await Promise.all([
        fetchWithAuth('/api/workspaces'),
        fetchWithAuth('/api/admin/evolution-config')
      ]);

      if (resWs.ok) {
        const data = await resWs.json();
        setWorkspaces(Array.isArray(data) ? data : []);
      }

      if (resConfig.ok) {
        const data = await resConfig.json();
        setEvolutionConfig(data.actions ? data : { actions: ACTIONS });
      } else {
        setEvolutionConfig({ actions: ACTIONS });
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
      const res = await fetchWithAuth('/api/admin/evolution-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: evolutionConfig })
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

  return (
    <div id="admin-bes-module" className="w-full mx-auto pb-12 flex flex-col gap-10 animate-in fade-in duration-500 relative px-4 sm:px-6 lg:px-10">
      
      <StandardHeader 
        title="Configuração Global de Evolução"
        subtitle="Ajuste os pesos dos eventos que compõem o algoritmo de Evolução Profissional."
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
      {evolutionConfig && (
        <div className="bg-white border rounded-[24px] shadow-sm p-6 space-y-8">
          <h3 className="font-display font-black text-sm text-zinc-900">Pesos do Algoritmo (Pontuação por Ação)</h3>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Configure os pesos para cada evento gerado automaticamente pela plataforma. Os níveis (Ideia, MVP, Operação, Escala, etc) não são editáveis e são calculados através do acúmulo desses eventos.
          </p>
          
          <div className="space-y-4 mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Object.entries(evolutionConfig.actions).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                        <label className="text-[10px] font-display font-bold text-zinc-500 uppercase">{key}</label>
                        <input 
                          type="number" 
                          value={value as number}
                          onChange={(e) => setEvolutionConfig({ ...evolutionConfig, actions: { ...evolutionConfig.actions, [key]: parseInt(e.target.value, 10) } })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl outline-none text-xs font-mono transition"
                        />
                    </div>
                ))}
            </div>
          </div>

          <button 
            onClick={saveConfig}
            disabled={saving === 'config'}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-zinc-800 text-white rounded-xl transition text-xs font-display font-bold shadow-sm cursor-pointer mt-4"
          >
            {saving === 'config' ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Salvar Configurações
          </button>
        </div>
      )}

      {/* Workspaces List */}
      <div className="bg-white border rounded-[24px] shadow-sm overflow-hidden p-2">
        <div className="p-6 pb-2 border-b border-slate-100 flex flex-col gap-1">
          <h3 className="font-display font-black text-sm text-zinc-900">Monitoramento de Evolução Profissional (Leitura)</h3>
          <p className="text-xs text-slate-500">O Score não pode ser alterado manualmente. Esta visão é apenas para monitoramento de auditoria.</p>
        </div>
        <table className="w-full text-xs">
          <thead className="bg-zinc-50 border-b">
            <tr>
              <th className="text-left px-6 py-4 font-display font-black text-zinc-500 uppercase">Workspace</th>
              <th className="text-right px-6 py-4 font-display font-black text-zinc-500 uppercase">Score Atual (XP)</th>
              <th className="text-right px-6 py-4 font-display font-black text-zinc-500 uppercase">Nível Derivado</th>
            </tr>
          </thead>
          <tbody>
            {workspaces.map((ws) => {
              const evolutionXp = ws.settings?.professionalEvolution?.xpTotal || ws.settings?.besScore || 0;
              const currentStage = PROFESSIONAL_STAGES.find(s => evolutionXp >= s.min && evolutionXp <= s.max) || PROFESSIONAL_STAGES[0];
              return (
                <tr key={ws.id} className="border-b hover:bg-zinc-50/50">
                  <td className="px-6 py-4 font-display font-bold">{ws.name}</td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-blue-600">{evolutionXp.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-display font-bold text-slate-600">
                    <span className="bg-slate-100 px-2 py-1 rounded uppercase tracking-wider text-[10px]">
                      {currentStage.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
