import { useState } from 'react';
import { 
  Building2, 
  Save, 
  Trash2, 
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Lock,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function WorkspaceSettingsTab() {
  const { activeWorkspace } = useAuth();
  const [formData, setFormData] = useState({
    name: activeWorkspace?.name || '',
    description: (activeWorkspace?.settings as any)?.description || '',
    slug: activeWorkspace?.name?.toLowerCase().replace(/\s+/g, '-') || 'workspace-slug',
    isPublic: false
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      alert('Configurações do Workspace atualizadas com sucesso!');
    }, 800);
  };

  return (
    <div className="flex flex-col gap-8 h-full max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#111111] tracking-tight">Configurações do Workspace</h3>
          <p className="text-sm text-[#64748B] font-medium">Gerencie a identidade e visibilidade da sua organização</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* Identity Section */}
        <div className="bg-white border border-[#0F172A0A] rounded-[40px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-[#111111]">
              <Building2 size={20} />
            </div>
            <h4 className="text-lg font-bold text-[#111111] tracking-tight">Identidade Visual</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Logo Upload Simulation */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-[32px] bg-[#F8FAFC] border-2 border-dashed border-[#0F172A1A] flex flex-col items-center justify-center text-[#94A3B8] group cursor-pointer hover:border-black/20 transition-all overflow-hidden relative">
                <ImageIcon size={32} />
                <span className="text-[10px] font-bold uppercase tracking-widest mt-2">Alterar Logo</span>
                {activeWorkspace?.name && (
                   <div className="absolute inset-0 bg-black flex items-center justify-center text-white text-3xl font-display font-bold opacity-0 group-hover:opacity-10 transition-opacity">
                     {activeWorkspace.name.charAt(0)}
                   </div>
                )}
              </div>
              <p className="text-[10px] text-[#64748B] font-medium text-center uppercase tracking-widest leading-relaxed">
                Recomendado: 512x512px<br/>PNG ou SVG
              </p>
            </div>

            <div className="md:col-span-2 flex flex-col gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest px-1">Nome do Workspace</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-[#FAFAFB] border border-[#0F172A0A] rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-black/5 outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest px-1">Descrição Curta</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-[#FAFAFB] border border-[#0F172A0A] rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-black/5 outline-none transition-all resize-none"
                  placeholder="Descreva o propósito deste workspace..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Visibility & Custom URL */}
        <div className="bg-white border border-[#0F172A0A] rounded-[40px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-[#111111]">
              <Globe size={20} />
            </div>
            <h4 className="text-lg font-bold text-[#111111] tracking-tight">Visibilidade & URL</h4>
          </div>

          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest px-1">Identificador Único (Slug)</label>
              <div className="flex items-center">
                <div className="bg-[#F1F5F9] border border-[#0F172A0A] border-r-0 rounded-l-2xl p-4 text-xs font-bold text-[#64748B]">
                  cyzor.io/control/
                </div>
                <input 
                  type="text" 
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="flex-1 bg-[#FAFAFB] border border-[#0F172A0A] rounded-r-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-black/5 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-6 bg-[#FAFAFB] rounded-3xl border border-[#0F172A05]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#0F172A0A] flex items-center justify-center text-[#111111]">
                  <Lock size={18} />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-[#111111] tracking-tight">Privacidade do Workspace</h5>
                  <p className="text-xs text-[#64748B] font-medium">Apenas membros convidados podem visualizar os recursos.</p>
                </div>
              </div>
              <div className="bg-neutral-800 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Privado</div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white border border-[#0F172A0A] rounded-[40px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border-rose-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertTriangle size={20} />
            </div>
            <h4 className="text-lg font-bold text-[#111111] tracking-tight">Zona de Perigo</h4>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-rose-50/50 rounded-3xl border border-rose-100">
            <div>
              <h5 className="text-sm font-bold text-rose-900 tracking-tight">Excluir este Workspace</h5>
              <p className="text-xs text-rose-800/70 font-medium leading-relaxed">
                Isso removerá permanentemente todos os projetos, produtos e dados associados a este workspace. Esta ação não pode ser desfeita.
              </p>
            </div>
            <button type="button" className="bg-rose-600 text-white px-6 py-3 rounded-2xl text-xs font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/10 whitespace-nowrap">
              Excluir Workspace
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4 mt-4">
          <button type="button" className="px-8 py-4 rounded-2xl text-sm font-bold text-[#64748B] hover:text-[#111111] transition-all">
            Descartar Alterações
          </button>
          <button 
            type="submit" 
            disabled={saving}
            className="bg-black text-white px-10 py-4 rounded-2xl text-sm font-bold hover:bg-neutral-800 transition-all shadow-xl shadow-black/10 flex items-center gap-2"
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
            {!saving && <Save size={18} />}
          </button>
        </div>
      </form>
    </div>
  );
}
