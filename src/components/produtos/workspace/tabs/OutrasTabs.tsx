import { Construction, Trash2, Shield, UserPlus } from 'lucide-react';

export default function OutrasTabs({ activeTab, product, onDelete }: { activeTab: string, product: any, onDelete?: (id: any) => void }) {
  
  if (activeTab === 'configuracoes') {
    return (
      <div className="flex flex-col gap-8 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-2xl font-display font-bold text-[#111111]">Configurações</h2>
        
        <div className="bg-white border border-[#0F172A0F] rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#64748B] mb-6">Chaves de API</h3>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-xl border border-[#0F172A05]">
              <div>
                <p className="font-bold text-sm text-[#111111]">Chave de Produção</p>
                <p className="text-xs text-[#64748B] font-mono mt-1">pk_live_*************************</p>
              </div>
              <button className="text-xs font-bold text-[#111111] bg-white border border-[#0F172A0F] px-3 py-1.5 rounded-lg">Revelar</button>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-xl border border-[#0F172A05]">
              <div>
                <p className="font-bold text-sm text-[#111111]">Chave de Teste</p>
                <p className="text-xs text-[#64748B] font-mono mt-1">pk_test_12345abcdefgxyz</p>
              </div>
              <button className="text-xs font-bold text-[#111111] bg-white border border-[#0F172A0F] px-3 py-1.5 rounded-lg">Copiar</button>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-[24px] p-8">
          <h3 className="text-sm font-bold uppercase tracking-widest text-red-600 mb-2 flex items-center gap-2">
            <Shield size={16} /> Zona de Perigo
          </h3>
          <p className="text-sm text-red-800 mb-6">Ações destrutivas não podem ser desfeitas. Tenha cuidado.</p>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-red-900">Excluir Produto</p>
              <p className="text-xs text-red-700 mt-1">Remove todos os dados, deploys e configurações associadas.</p>
            </div>
            <button onClick={() => onDelete?.(product.id)} className="flex items-center gap-2 bg-white border border-red-200 text-red-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors">
              <Trash2 size={16} /> Excluir
            </button>
          </div>
        </div>

      </div>
    );
  }

  // Placeholder for other tabs
  const tabNames: any = {
    clientes: 'Clientes',
    licencas: 'Licenças',
    documentacao: 'Documentação',
    equipe: 'Equipe',
    logs: 'Histórico e Logs',
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-display font-bold text-[#111111] capitalize">{tabNames[activeTab] || activeTab}</h2>
      <div className="bg-white border border-[#0F172A0F] rounded-[32px] p-12 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-16 h-16 bg-[#FAFAFA] rounded-2xl flex items-center justify-center text-[#64748B] mb-4">
          <Construction size={32} />
        </div>
        <h3 className="text-xl font-display font-bold text-[#111111] mb-2">Módulo em Construção</h3>
        <p className="text-[#64748B] text-sm max-w-sm">Esta visão está sendo redesenhada para o novo padrão de Workspace do Produto.</p>
      </div>
    </div>
  );
}
