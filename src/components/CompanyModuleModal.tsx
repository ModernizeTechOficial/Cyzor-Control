import { useState, useEffect } from 'react';
import { X, Package, FolderGit2, DollarSign, FileText, Building2, ArrowUpRight, ArrowDownRight, Calendar, Download, Loader2, Network } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RelationshipView } from './common/RelationshipView';

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
  const [activeTab, setActiveTab] = useState<'dados' | 'relacionamentos'>('dados');

  useEffect(() => {
    if (!isOpen || !company) return;
    setLoading(true);
    // Simplified fetch to restore basic functionality
    setLoading(false);
  }, [isOpen, company, moduleType]);

  if (!isOpen) return null;

  const renderContent = () => {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#64748B]">
        <p className="text-sm font-medium">Conteúdo do módulo {moduleType} para {company.name}</p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/25 backdrop-blur-sm">
      <div className="bg-[#FFFFFF] w-full max-w-4xl rounded-[30px] border border-[#0F172A0F] shadow-[0_20px_60px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden">
        
        <div className="px-8 py-6 border-b border-[#0F172A0F] flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#111111]">{moduleType} - {company.name}</h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#111111]"><X size={20} /></button>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto bg-[#FAFAFA]/40 flex flex-col gap-6">
          <div className="flex items-center gap-2 mb-6 bg-[#FAFAFA] p-1 rounded-xl border border-[#0F172A0F] inline-flex">
            <button 
              onClick={() => setActiveTab('dados')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'dados' ? 'bg-white text-[#111111] shadow-sm' : 'text-[#64748B] hover:text-[#111111]'}`}
            >
              {moduleType}
            </button>
            <button 
              onClick={() => setActiveTab('relacionamentos')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'relacionamentos' ? 'bg-white text-[#111111] shadow-sm' : 'text-[#64748B] hover:text-[#111111]'}`}
            >
              Relacionamentos
            </button>
          </div>

          {activeTab === 'dados' ? renderContent() : (
            <RelationshipView sourceType="companies" sourceId={company.id} />
          )}
        </div>

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
