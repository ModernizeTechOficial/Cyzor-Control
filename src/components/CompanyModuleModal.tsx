import { useState, useEffect } from 'react';
import { X, Package, FolderGit2, DollarSign, FileText, Building2, ArrowUpRight, ArrowDownRight, Calendar, Download, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CompanyModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: any;
  moduleType: string;
}

export default function CompanyModuleModal({ isOpen, onClose, company, moduleType }: CompanyModuleModalProps) {
  const { fetchWithAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [financeSummary, setFinanceSummary] = useState({ receitas: 0, despesas: 0, saldo: 0 });

  useEffect(() => {
    if (!isOpen || !company) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        let endpoint = '';
        switch (moduleType) {
          case 'Produtos':
            endpoint = '/api/products';
            break;
          case 'Projetos':
            endpoint = '/api/projects';
            break;
          case 'Financeiro':
            endpoint = '/api/finance';
            break;
          case 'Documentação':
            endpoint = '/api/documents';
            break;
          default:
            setLoading(false);
            return;
        }

        const res = await fetchWithAuth(endpoint);
        if (res.ok) {
          const allData = await res.json();
          // Filter by companyId
          const filtered = allData.filter((item: any) => item.companyId === company.id);
          
          if (moduleType === 'Financeiro') {
            const receitas = filtered.filter((f: any) => f.type === 'RECEITA').reduce((acc: number, f: any) => acc + Number(f.amount), 0);
            const despesas = filtered.filter((f: any) => f.type === 'DESPESA').reduce((acc: number, f: any) => acc + Number(f.amount), 0);
            setFinanceSummary({ receitas, despesas, saldo: receitas - despesas });
          }
          
          setData(filtered);
        }
      } catch (err) {
        console.error("Failed to fetch module data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, company, moduleType]);

  if (!isOpen) return null;

  const formatCurrency = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const renderContent = () => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-[#64748B]">
                <Loader2 size={32} className="animate-spin mb-4" />
                <p className="text-sm font-medium">Carregando dados da empresa...</p>
            </div>
        );
    }

    switch (moduleType) {
      case 'Produtos':
        if (data.length === 0) {
          return (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-[#FAFAFA] border border-[#0F172A0F] rounded-[24px]">
              <Package size={40} className="text-[#64748B] opacity-50 mb-3" />
              <p className="text-sm font-semibold text-[#111111]">Nenhum produto cadastrado</p>
              <p className="text-xs text-[#64748B] mt-1">Esta empresa ainda não possui produtos ativos matriculados.</p>
            </div>
          );
        }
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.map((p, idx) => (
              <div key={p.id || idx} className="bg-[#FFFFFF] border border-[#0F172A0F] p-5 rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.03)] hover:border-[#111111]/10 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-[#FAFAFA] border border-[#0F172A0F] rounded text-[#64748B]">
                      v1.0.0
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${
                      p.status === 'Ativo' || p.status === 'ACTIVE' ? 'bg-[#22C55E10] border-[#22C55E20] text-[#16A34A]' : 'bg-[#E2E8F0] border-transparent text-[#64748B]'
                    }`}>
                      {p.status || 'Ativo'}
                    </span>
                  </div>
                  <h4 className="font-display font-semibold text-lg text-[#111111]">{p.name}</h4>
                  <p className="text-xs text-[#64748B] mt-2 line-clamp-2">{p.description}</p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-[#0F172A0F]/50 flex justify-between items-center">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Membros</span>
                    <span className="text-sm font-bold text-[#111111]">0 ativos</span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Preço</span>
                    <span className="text-sm font-bold text-[#111111]">{formatCurrency(Number(p.price || 0))}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'Projetos':
        if (data.length === 0) {
          return (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-[#FAFAFA] border border-[#0F172A0F] rounded-[24px]">
              <FolderGit2 size={40} className="text-[#64748B] opacity-50 mb-3" />
              <p className="text-sm font-semibold text-[#111111]">Nenhum projeto em andamento</p>
            </div>
          );
        }
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.map((proj, idx) => (
              <div key={proj.id || idx} className="bg-[#FFFFFF] border border-[#0F172A0F] p-5 rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.03)] hover:border-[#111111]/10 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#111111] text-white flex items-center justify-center text-[10px] font-bold">
                        {proj.owner?.charAt(0) || 'U'}
                      </div>
                      <span className="text-xs font-semibold text-[#111111]">{proj.owner || 'Sem dono'}</span>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border ${
                      proj.status === 'producao' || proj.status === 'COMPLETED' ? 'bg-[#22C55E10] border-[#22C55E20] text-[#16A34A]' :
                      proj.status === 'desenvolvimento' ? 'bg-[#F9731610] border-[#F9731620] text-[#EA580C]' : 'bg-[#E2E8F0] border-transparent text-[#64748B]'
                    }`}>
                      {proj.status}
                    </span>
                  </div>
                  <h4 className="font-display font-semibold text-base text-[#111111] mt-2">{proj.name}</h4>
                </div>

                <div className="mt-4 pt-3 border-t border-[#0F172A0F]/50 flex justify-between items-center text-[11px] font-bold text-[#64748B]">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} strokeWidth={2.5} /> Prazo
                  </span>
                  <span className="text-[#111111]">{proj.dueDate ? new Date(proj.dueDate).toLocaleDateString() : 'Não definido'}</span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'Financeiro':
        return (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#FFFFFF] border border-[#22C55E1A] p-5 rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.01)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#16A34A]" />
                <p className="text-[10px] font-bold text-[#16A34A] tracking-widest uppercase mb-1">Receitas Totais</p>
                <p className="text-2xl font-display font-bold text-[#111111]">{formatCurrency(financeSummary.receitas)}</p>
              </div>
              <div className="bg-[#FFFFFF] border border-[#EF44441A] p-5 rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.01)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#DC2626]" />
                <p className="text-[10px] font-bold text-[#DC2626] tracking-widest uppercase mb-1">Despesas Totais</p>
                <p className="text-2xl font-display font-bold text-[#111111]">{formatCurrency(financeSummary.despesas)}</p>
              </div>
              <div className="bg-[#FFFFFF] border border-[#0F172A0F] p-5 rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.01)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#111111]" />
                <p className="text-[10px] font-bold text-[#64748B] tracking-widest uppercase mb-1">Saldo Líquido</p>
                <p className="text-2xl font-display font-bold text-[#111111]">{formatCurrency(financeSummary.saldo)}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold text-[#64748B] tracking-widest uppercase px-1">Histórico de Lançamentos</h3>
              <div className="border border-[#0F172A0F] rounded-[20px] overflow-hidden bg-[#FFFFFF] shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse table-auto">
                    <thead>
                      <tr className="bg-[#FAFAFA] border-b border-[#0F172A0F]">
                        <th className="py-4 px-5 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Descrição</th>
                        <th className="py-4 px-5 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Tipo</th>
                        <th className="py-4 px-5 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Valor</th>
                        <th className="py-4 px-5 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Data</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#0F172A0F]/50">
                      {data.map((l, idx) => (
                        <tr key={l.id || idx} className="hover:bg-[#FAFAFA]/40 transition-colors">
                          <td className="py-3.5 px-5 text-sm font-semibold text-[#111111]">{l.description}</td>
                          <td className="py-3.5 px-5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                              l.type === 'RECEITA' ? 'bg-[#22C55E10] text-[#16A34A]' : 'bg-[#EF444410] text-[#DC2626]'
                            }`}>
                              {l.type === 'RECEITA' ? <ArrowUpRight size={12} strokeWidth={2.5} /> : <ArrowDownRight size={12} strokeWidth={2.5} />}
                              {l.type}
                            </span>
                          </td>
                          <td className={`py-3.5 px-5 text-sm font-bold ${l.type === 'RECEITA' ? 'text-[#16A34A]' : 'text-[#111111]'}`}>{formatCurrency(Number(l.amount))}</td>
                          <td className="py-3.5 px-5 text-xs text-[#64748B] font-semibold">{new Date(l.date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Documentação':
        if (data.length === 0) {
          return (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-[#FAFAFA] border border-[#0F172A0F] rounded-[24px]">
              <FileText size={40} className="text-[#64748B] opacity-50 mb-3" />
              <p className="text-sm font-semibold text-[#111111]">Nenhum documento registrado</p>
            </div>
          );
        }
        return (
          <div className="flex flex-col gap-3">
            {data.map((doc, idx) => (
              <div key={doc.id || idx} className="flex items-center justify-between p-5 bg-[#FFFFFF] border border-[#0F172A0F] rounded-[20px] hover:border-[#111111]/20 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.03)] transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#FAFAFA] border border-[#0F172A0F] rounded-[16px] text-[#64748B] font-bold text-xs uppercase tracking-widest select-none font-mono min-w-[55px] text-center shadow-inner">
                    {doc.type}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h4 className="font-bold text-sm text-[#111111]">{doc.title}</h4>
                    <p className="text-xs text-[#64748B] font-medium">
                      {doc.folder || 'Geral'} • {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-[#FAFAFA] border border-[#0F172A0F] rounded-[14px] text-xs font-bold text-[#111111] transition-colors shadow-sm cursor-pointer">
                  <Download size={14} strokeWidth={2.5} /> Baixar
                </button>
              </div>
            ))}
          </div>
        );

      case 'Equipe':
        return (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-[#FAFAFA] border border-[#0F172A0F] rounded-[24px]">
              <Building2 size={40} className="text-[#64748B] opacity-50 mb-3" />
              <p className="text-sm font-semibold text-[#111111]">Dados de equipe não disponíveis via API</p>
              <p className="text-xs text-[#64748B] mt-1">Este módulo ainda depende de dados customizados do workspace.</p>
          </div>
        );

      default:
        return null;
    }
  };

  const getIcon = () => {
    switch (moduleType) {
      case 'Produtos': return <Package size={22} />;
      case 'Projetos': return <FolderGit2 size={22} />;
      case 'Financeiro': return <DollarSign size={22} />;
      case 'Documentação': return <FileText size={22} />;
      case 'Equipe': return <Building2 size={22} />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/25 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] w-full max-w-4xl rounded-[30px] border border-[#0F172A0F] shadow-[0_20px_60px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#0F172A0F] flex items-center justify-between bg-[#FFFFFF] relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#111111]/10 to-transparent"></div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[16px] bg-[#111111] flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.15)] text-white">
              {getIcon()}
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-[#111111] tracking-tight">{moduleType}</h2>
              <p className="text-sm font-medium text-[#64748B]">{company.name} • Detalhes Consolidados</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-[14px] flex items-center justify-center hover:bg-[#FAFAFA] border border-transparent hover:border-[#0F172A0F] text-[#64748B] transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-8 max-h-[70vh] overflow-y-auto bg-[#FAFAFA]/40 custom-scrollbar flex flex-col gap-6">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-[#0F172A0F] bg-[#FAFAFA] flex justify-end gap-3 rounded-b-[30px]">
          <button 
            onClick={onClose}
            className="px-6 py-3 rounded-[14px] text-sm font-bold text-[#111111] border border-[#0F172A0F] bg-[#FFFFFF] hover:bg-[#FAFAFA] transition-colors cursor-pointer"
          >
            Fechar Janela
          </button>
        </div>

      </div>
    </div>
  );
}
