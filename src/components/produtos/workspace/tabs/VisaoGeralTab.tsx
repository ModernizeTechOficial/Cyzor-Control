import { useState } from 'react';
import { Edit3, Tag, Calendar, User, Building2, Save } from 'lucide-react';

export default function VisaoGeralTab({ product, onSave, companies = [] }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(product);

  const handleSave = () => {
    if(onSave) onSave(formData);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-[#111111]">Visão Geral</h2>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm font-bold text-[#111111] bg-[#FAFAFA] hover:bg-gray-100 px-4 py-2 rounded-xl transition-colors">
            <Edit3 size={16} /> Editar Informações
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button onClick={() => setIsEditing(false)} className="text-sm font-bold text-[#64748B] hover:text-[#111111] transition-colors">Cancelar</button>
            <button onClick={handleSave} className="flex items-center gap-2 bg-[#111111] text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md hover:bg-black transition-all">
              <Save size={16} /> Salvar Alterações
            </button>
          </div>
        )}
      </div>

      {!isEditing ? (
        <div className="flex flex-col gap-8">
          <div className="prose prose-slate max-w-none">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#64748B] mb-3">Descrição</h3>
            <p className="text-[#111111] font-medium leading-relaxed text-base">
              {product.desc || 'Nenhuma descrição detalhada fornecida para este produto.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-3 p-6 rounded-2xl bg-[#FAFAFA] border border-[#0F172A0F]">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#64748B] flex items-center gap-2">
                <Building2 size={16} /> Detalhes Organizacionais
              </h3>
              <div className="flex flex-col gap-4 mt-2">
                <DetailRow label="Empresa" value={product.empresa || 'Interno'} />
                <DetailRow label="Categoria" value={product.categoria || 'SaaS'} />
                <DetailRow label="Responsável" value="João Developer" />
              </div>
            </div>

            <div className="flex flex-col gap-3 p-6 rounded-2xl bg-[#FAFAFA] border border-[#0F172A0F]">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#64748B] flex items-center gap-2">
                <Calendar size={16} /> Ciclo de Vida
              </h3>
              <div className="flex flex-col gap-4 mt-2">
                <DetailRow label="Criado em" value={product.created_at || '10 Jan 2024'} />
                <DetailRow label="Última atualização" value={product.updated || 'Hoje, 10:45'} />
                <DetailRow label="Próxima Release" value="15 Jul 2024" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#64748B] mb-4 flex items-center gap-2">
              <Tag size={16} /> Tags & Classificações
            </h3>
            <div className="flex flex-wrap gap-2">
              {['B2B', 'Fintech', 'Assinatura', 'Cloud Native'].map(tag => (
                <span key={tag} className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 bg-[#FAFAFA] border border-[#0F172A0F] rounded-[24px] p-8">
           <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748B]">Nome do Produto</label>
              <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-white border border-[#0F172A0F] rounded-xl px-4 py-3 text-sm font-bold text-[#111111] outline-none focus:border-[#111111]/30 transition-colors" />
           </div>
           
           <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748B]">Descrição</label>
              <textarea value={formData.desc || ''} onChange={e => setFormData({...formData, desc: e.target.value})} className="bg-white border border-[#0F172A0F] rounded-xl px-4 py-3 text-sm font-medium text-[#111111] outline-none focus:border-[#111111]/30 transition-colors min-h-[120px] resize-y" />
           </div>

           <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748B]">Empresa / Cliente</label>
                <select value={formData.companyId || ''} onChange={e => setFormData({...formData, companyId: e.target.value})} className="bg-white border border-[#0F172A0F] rounded-xl px-4 py-3 text-sm font-bold text-[#111111] outline-none focus:border-[#111111]/30 transition-colors">
                  <option value="">Interno / Nenhuma</option>
                  {companies.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-[#64748B]">Status</label>
                <select value={formData.status || ''} onChange={e => setFormData({...formData, status: e.target.value})} className="bg-white border border-[#0F172A0F] rounded-xl px-4 py-3 text-sm font-bold text-[#111111] outline-none focus:border-[#111111]/30 transition-colors">
                  <option value="Planejamento">Planejamento</option>
                  <option value="Desenvolvimento">Desenvolvimento</option>
                  <option value="Beta">Beta</option>
                  <option value="Produção">Produção</option>
                </select>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}

function DetailRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center border-b border-[#0F172A05] pb-2 last:border-0 last:pb-0">
      <span className="text-sm text-[#64748B] font-medium">{label}</span>
      <span className="text-sm font-bold text-[#111111]">{value}</span>
    </div>
  );
}
