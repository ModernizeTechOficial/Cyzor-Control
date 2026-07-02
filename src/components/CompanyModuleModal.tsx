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
    setActiveTab('dados');
// ...
// ...
// ...
          
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
