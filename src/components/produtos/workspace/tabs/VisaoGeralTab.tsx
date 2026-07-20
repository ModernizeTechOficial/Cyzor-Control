import { useState } from 'react';
import { Edit3, Tag, Calendar, User, Building2, Save } from 'lucide-react';
import { FormGroup, FormLabel, FormInput, FormTextarea, FormSelect } from '../../../ui/FormComponents';

export default function VisaoGeralTab({ product, onSave, companies = [] }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(product);

  const handleSave = () => {
    if(onSave) {
      onSave({
        ...formData,
        companyId: formData.companyId ? Number(formData.companyId) : null
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-[#111111]">VisÃ£o Geral</h2>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm font-bold text-[#111111] bg-[#FAFAFA] hover:bg-gray-100 px-4 py-2 rounded-xl transition-colors">
            <Edit3 size={16} /> Editar InformaÃ§Ãµes
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button onClick={() => setIsEditing(false)} className="text-sm font-bold text-[#64748B] hover:text-[#111111] transition-colors">Cancelar</button>
            <button onClick={handleSave} className="flex items-center gap-2 bg-[#111111] text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md hover:bg-black transition-all">
              <Save size={16} /> Salvar AlteraÃ§Ãµes
            </button>
          </div>
        )}
      </div>

      {!isEditing ? (
        <div className="flex flex-col gap-8">
          <div className="prose prose-slate max-w-none">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#64748B] mb-3">DescriÃ§Ã£o</h3>
            <p className="text-[#111111] font-medium leading-relaxed text-base">
              {product.desc || 'Nenhuma descriÃ§Ã£o detalhada fornecida para este produto.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-3 p-6 rounded-2xl bg-[#FAFAFA] border border-[#0F172A0F]">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#64748B] flex items-center gap-2">
                <Building2 size={16} /> Detalhes Organizacionais
              </h3>
              <div className="flex flex-col gap-4 mt-2">
                <DetailRow label="Empresa" value={product.empresa || 'Interno'} />
                <DetailRow label="Tipo de Produto" value={product.type || 'SaaS'} />
                <DetailRow label="Categoria" value={product.categoria || 'Software'} />
                <DetailRow label="ResponsÃ¡vel" value="JoÃ£o Developer" />
              </div>
            </div>

            <div className="flex flex-col gap-3 p-6 rounded-2xl bg-[#FAFAFA] border border-[#0F172A0F]">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#64748B] flex items-center gap-2">
                <Calendar size={16} /> Ciclo de Vida & Mercado
              </h3>
              <div className="flex flex-col gap-4 mt-2">
                <DetailRow label="Modelo de PreÃ§o" value={product.pricingModel || 'Sob consulta'} />
                <DetailRow label="PÃºblico Alvo" value={product.targetAudience || 'NÃ£o definido'} />
                <DetailRow label="Criado em" value={product.created_at || '10 Jan 2024'} />
                <DetailRow label="LanÃ§amento" value={product.launchDate ? new Date(product.launchDate).toLocaleDateString() : 'A definir'} />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#64748B] mb-4 flex items-center gap-2">
              <Tag size={16} /> Tags & ClassificaÃ§Ãµes
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
        <div className="flex flex-col gap-5 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
           <FormGroup>
              <FormLabel>Nome do Produto</FormLabel>
              <FormInput 
                value={formData.name || ''} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="Ex: Nome do Produto"
              />
           </FormGroup>
           
           <FormGroup>
              <FormLabel>DescriÃ§Ã£o</FormLabel>
              <FormTextarea 
                value={formData.desc || ''} 
                onChange={e => setFormData({...formData, desc: e.target.value})} 
                placeholder="Descreva as funcionalidades e objetivos deste produto..."
                rows={4}
              />
           </FormGroup>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormGroup>
                <FormLabel>Empresa / Cliente</FormLabel>
                <FormSelect 
                  value={formData.companyId || ''} 
                  onChange={e => setFormData({...formData, companyId: e.target.value})}
                >
                  <option value="">Interno / Nenhuma</option>
                  {companies.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </FormSelect>
              </FormGroup>
              <FormGroup>
                <FormLabel>Status</FormLabel>
                <FormSelect 
                  value={formData.status || ''} 
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Planejamento">Planejamento</option>
                  <option value="Desenvolvimento">Desenvolvimento</option>
                  <option value="Beta">Beta</option>
                  <option value="ProduÃ§Ã£o">ProduÃ§Ã£o</option>
                  <option value="Arquivado">Arquivado</option>
                </FormSelect>
              </FormGroup>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormGroup>
                <FormLabel>Tipo de Produto</FormLabel>
                <FormSelect 
                  value={formData.type || 'SaaS'} 
                  onChange={e => setFormData({...formData, type: e.target.value})}
                >
                  <option value="SaaS">SaaS</option>
                  <option value="Mobile App">Mobile App</option>
                  <option value="Desktop App">Desktop App</option>
                  <option value="API / SDK">API / SDK</option>
                  <option value="Plataforma">Plataforma</option>
                  <option value="ServiÃ§o Digital">ServiÃ§o Digital</option>
                </FormSelect>
              </FormGroup>
              <FormGroup>
                <FormLabel>Modelo de PrecificaÃ§Ã£o</FormLabel>
                <FormSelect 
                  value={formData.pricingModel || 'Assinatura'} 
                  onChange={e => setFormData({...formData, pricingModel: e.target.value})}
                >
                  <option value="Assinatura">Assinatura</option>
                  <option value="LicenÃ§a Ãšnica">LicenÃ§a Ãšnica</option>
                  <option value="Freemium">Freemium</option>
                  <option value="Gratuito">Gratuito</option>
                  <option value="Consumo / Pay-per-use">Consumo / Pay-per-use</option>
                </FormSelect>
              </FormGroup>
           </div>

           <FormGroup>
              <FormLabel>PÃºblico Alvo</FormLabel>
              <FormInput 
                value={formData.targetAudience || ''} 
                onChange={e => setFormData({...formData, targetAudience: e.target.value})} 
                placeholder="Ex: Empresas B2B de mÃ©dio porte, Desenvolvedores, etc."
              />
           </FormGroup>
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

