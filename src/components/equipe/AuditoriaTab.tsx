import { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Database, 
  ArrowRight,
  ChevronDown,
  Clock,
  CheckCircle2,
  Settings,
  Shield,
  Zap,
  Box,
  FileText,
  DollarSign,
  XCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuditoriaTab() {
  const { fetchWithAuth } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/api/workspace/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionIcon = (action: string, table: string) => {
    if (action === 'CREATE') return <Zap size={14} className="text-emerald-500" />;
    if (action === 'DELETE') return <XCircle size={14} className="text-rose-500" />;
    if (action === 'INVITE') return <User size={14} className="text-blue-500" />;
    if (table === 'finance_entries') return <DollarSign size={14} className="text-green-500" />;
    if (table === 'projects') return <Box size={14} className="text-indigo-500" />;
    if (table === 'documents') return <FileText size={14} className="text-amber-500" />;
    return <Settings size={14} className="text-slate-500" />;
  };

  const getTableLabel = (table: string) => {
    const map: any = {
      'workspaces': 'Workspace',
      'workspace_members': 'Membro',
      'workspace_invitations': 'Convite',
      'projects': 'Projeto',
      'products': 'Produto',
      'finance_entries': 'Financeiro',
      'tasks': 'Tarefa',
      'documents': 'Documento',
      'companies': 'Empresa',
      'clients': 'Cliente'
    };
    return map[table] || table;
  };

  const filteredLogs = logs.filter(log => 
    log.userName?.toLowerCase().includes(search.toLowerCase()) || 
    log.action?.toLowerCase().includes(search.toLowerCase()) ||
    log.tableName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#0F172A0A] rounded-[24px] p-4 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
          <input 
            type="text" 
            placeholder="Filtrar por usuário, ação ou recurso..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FAFAFB] border-none rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-black/5 transition-all outline-none text-[#111111]"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-[#FAFAFB] border border-[#0F172A0A] text-[#64748B] px-4 py-2.5 rounded-xl text-sm font-bold hover:text-[#111111] transition-all">
            <Calendar size={16} /> Este Mês <ChevronDown size={14} />
          </button>
          <button className="flex items-center gap-2 bg-[#FAFAFB] border border-[#0F172A0A] text-[#64748B] px-4 py-2.5 rounded-xl text-sm font-bold hover:text-[#111111] transition-all">
            <Filter size={16} /> Filtros <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* Timeline List */}
      <div className="bg-white border border-[#0F172A0A] rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex-1 overflow-y-auto no-scrollbar">
        <div className="flex flex-col gap-8 relative">
          {/* Vertical Line */}
          <div className="absolute left-[23px] top-4 bottom-4 w-px bg-gradient-to-b from-[#0F172A0A] via-[#0F172A0A] to-transparent" />

          {loading ? (
            <div className="text-center py-12 text-sm text-[#64748B] font-medium">Carregando auditoria...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-sm text-[#64748B] font-medium">Nenhum registro encontrado.</div>
          ) : filteredLogs.map((log) => (
            <div key={log.id} className="flex gap-6 relative group">
              {/* Dot Icon */}
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#0F172A0A] flex items-center justify-center text-[#111111] z-10 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all">
                {getActionIcon(log.action, log.tableName)}
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col gap-2 pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#111111]">{log.userName || 'Sistema'}</span>
                    <span className="text-[10px] font-bold text-[#64748B] bg-[#FAFAFB] border border-[#0F172A05] px-2 py-0.5 rounded-md uppercase tracking-widest">{log.action}</span>
                    <ArrowRight size={12} className="text-[#94A3B8]" />
                    <span className="text-sm font-bold text-[#111111]">{getTableLabel(log.tableName)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-[#94A3B8]">
                    <Clock size={12} />
                    {new Date(log.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                   <p className="text-[13px] text-[#64748B] font-medium leading-relaxed">
                     Ação realizada no registro <span className="text-[#111111] font-bold">#{log.recordId}</span> da tabela <span className="font-bold">{log.tableName}</span>.
                   </p>
                </div>

                {/* Optional Metadata Tag */}
                <div className="flex items-center gap-2">
                   <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50/50 border border-emerald-100/50 text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                     <CheckCircle2 size={10} /> Sucesso
                   </div>
                   <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#FAFAFB] border border-[#0F172A05] text-[10px] font-bold text-[#64748B] uppercase tracking-widest">
                     <Shield size={10} /> Verificado
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function XCircleIcon(props: any) {
  return <History {...props} />;
}
