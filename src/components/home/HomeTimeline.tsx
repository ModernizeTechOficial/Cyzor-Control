import { 
  Shield, 
  GitBranch, 
  Terminal, 
  CheckCircle2, 
  ChevronRight, 
  Layers, 
  Briefcase, 
  DollarSign, 
  Calendar 
} from 'lucide-react';
import { motion } from 'motion/react';

interface Activity {
  id: string;
  action: string;
  time: string;
  timestamp: number;
  type: 'deploy' | 'security' | 'git' | 'system' | 'task' | 'project' | 'finance' | 'agenda';
  user: string;
  hash?: string;
}

export default function HomeTimeline({ 
  deploys = [], 
  tasks = [], 
  projects = [], 
  finance = [], 
  agendaEvents = [] 
}: { 
  deploys?: any[]; 
  tasks?: any[]; 
  projects?: any[]; 
  finance?: any[]; 
  agendaEvents?: any[]; 
}) {
  
  // Format dates/timestamps into relative/clean readable text
  const formatActivityTime = (timestamp: number) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Breve';
    
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    if (isToday) {
      return `Hoje às ${timeStr}`;
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month} às ${timeStr}`;
  };

  const allActivities: Activity[] = [];

  // 1. Process real database deploys
  deploys.forEach((dep: any) => {
    const t = dep.createdAt ? new Date(dep.createdAt).getTime() : Date.now();
    allActivities.push({
      id: `deploy-${dep.id}`,
      action: `Deploy v${dep.version} finalizado com ${dep.status === 'SUCCESS' || dep.status === 'success' ? 'sucesso' : 'status ' + dep.status}`,
      time: formatActivityTime(t),
      timestamp: t,
      type: 'deploy',
      user: dep.userName || 'Cyzor Pipeline',
      hash: dep.id ? `dep-${dep.id}` : undefined
    });
  });

  // 2. Process real database tasks
  tasks.forEach((task: any) => {
    const t = task.createdAt ? new Date(task.createdAt).getTime() : Date.now();
    allActivities.push({
      id: `task-${task.id}`,
      action: `Tarefa criada: "${task.title}"`,
      time: formatActivityTime(t),
      timestamp: t - 1, // small offset to sort nicely
      type: 'task',
      user: task.assigneeUid ? 'Atribuída' : 'Sem responsável',
      hash: task.status ? `Status: ${task.status}` : undefined
    });
  });

  // 3. Process real database projects
  projects.forEach((proj: any) => {
    const t = proj.createdAt ? new Date(proj.createdAt).getTime() : Date.now();
    allActivities.push({
      id: `project-${proj.id}`,
      action: `Novo projeto iniciado: "${proj.name}"`,
      time: formatActivityTime(t),
      timestamp: t - 2,
      type: 'project',
      user: 'Gestor de Projetos',
      hash: proj.status ? `Status: ${proj.status}` : undefined
    });
  });

  // 4. Process real database finance entries
  finance.forEach((fin: any) => {
    const t = fin.createdAt ? new Date(fin.createdAt).getTime() : (fin.date ? new Date(fin.date).getTime() : Date.now());
    const valStr = Number(fin.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    allActivities.push({
      id: `finance-${fin.id}`,
      action: `Lançamento de ${fin.type === 'RECEITA' ? 'Receita' : 'Despesa'}: R$ ${valStr}`,
      time: formatActivityTime(t),
      timestamp: t - 3,
      type: 'finance',
      user: fin.description || fin.category || 'Financeiro',
      hash: fin.status ? `Status: ${fin.status}` : undefined
    });
  });

  // 5. Process real database agenda events
  agendaEvents.forEach((evt: any) => {
    // agenda date is YYYY-MM-DD, startTime is HH:MM
    let t = Date.now();
    if (evt.date && evt.startTime) {
      const parsed = new Date(`${evt.date}T${evt.startTime}`);
      if (!isNaN(parsed.getTime())) {
        t = parsed.getTime();
      }
    }
    allActivities.push({
      id: `agenda-${evt.id}`,
      action: `Compromisso agendado: "${evt.title}"`,
      time: formatActivityTime(t),
      timestamp: t - 4,
      type: 'agenda',
      user: evt.owner || 'Organizador',
      hash: evt.category || evt.type || undefined
    });
  });

  // Sort all merged database activities descending (newest first)
  allActivities.sort((a, b) => b.timestamp - a.timestamp);

  // Take the 5 most recent activities
  const displayActivities = allActivities.slice(0, 5);

  const getIcon = (type: string) => {
    switch (type) {
      case 'deploy':
        return <CheckCircle2 size={13} className="text-emerald-500" />;
      case 'task':
        return <Layers size={13} className="text-amber-500" />;
      case 'project':
        return <Briefcase size={13} className="text-indigo-500" />;
      case 'finance':
        return <DollarSign size={13} className="text-emerald-500" />;
      case 'agenda':
        return <Calendar size={13} className="text-blue-500" />;
      default:
        return <Terminal size={13} className="text-slate-500" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'deploy':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100/50';
      case 'task':
        return 'bg-amber-50 text-amber-700 border-amber-100/50';
      case 'project':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100/50';
      case 'finance':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100/50';
      case 'agenda':
        return 'bg-blue-50 text-blue-700 border-blue-100/50';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100/50';
    }
  };

  return (
    <div className="bg-white border border-[#0F172A08] rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Feed de Operações Globais</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100/40 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Tempo Real
          </span>
        </div>

        {displayActivities.length > 0 ? (
          <div className="relative border-l border-slate-100 pl-4 ml-2.5 space-y-6">
            {displayActivities.map((act) => (
              <div key={act.id} className="relative group">
                {/* Timeline Icon Node */}
                <div className="absolute -left-[23px] top-1.5 w-[16px] h-[16px] rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:border-slate-400 transition-colors">
                  {getIcon(act.type)}
                </div>

                {/* Activity Info */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#111111] leading-snug tracking-tight group-hover:text-blue-600 transition-colors">
                      {act.action}
                    </span>
                    <span className="text-[10px] font-mono text-[#94A3B8] font-semibold flex-shrink-0">
                      {act.time}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getBadgeColor(act.type)}`}>
                      {act.type.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-[#64748B] font-semibold">
                      {act.user}
                    </span>
                    {act.hash && (
                      <>
                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                        <span className="text-[9px] font-mono text-[#94A3B8] font-bold">
                          {act.hash}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 bg-slate-50 border border-[#0F172A05] rounded-full flex items-center justify-center mb-3">
              <Terminal size={18} className="text-slate-400" />
            </div>
            <p className="text-xs font-bold text-slate-700">Sem atividades registradas</p>
            <p className="text-[11px] text-[#64748B] max-w-[200px] mt-1">
              Crie compromissos, lance receitas/despesas ou adicione projetos para alimentar o feed operacional.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
