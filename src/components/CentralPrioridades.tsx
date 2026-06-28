import { useState, useEffect } from 'react';
import { AlertCircle, Target, CheckCircle2, Clock, Lightbulb, TriangleAlert, Calendar, Flag, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export default function CentralPrioridades() {
  const { fetchWithAuth, activeWorkspace } = useAuth();
  const [priorityProjects, setPriorityProjects] = useState<any[]>([]);
  const [featuredIdeas, setFeaturedIdeas] = useState<any[]>([]);
  const [pendingDecisions, setPendingDecisions] = useState<string[]>([]);
  const [strategicAlerts, setStrategicAlerts] = useState<any[]>([]);
  const [nextDeliveries, setNextDeliveries] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashData = async () => {
      if (!activeWorkspace) return;
      try {
        const [projRes, ideaRes, tasksRes] = await Promise.all([
          fetchWithAuth('/api/projects'),
          fetchWithAuth('/api/ideas'),
          fetchWithAuth('/api/tasks'),
        ]);

        const [projs, ideas, tasks] = await Promise.all([
          projRes.ok ? projRes.json() : [],
          ideaRes.ok ? ideaRes.json() : [],
          tasksRes.ok ? tasksRes.json() : []
        ]);

        setPriorityProjects(projs.slice(0, 3).map((p:any) => ({
          ...p,
          company: p.companyName || '-',
          status: p.status || 'Active',
          action: 'Revisar Status',
          deadline: p.dueDate ? new Date(p.dueDate).toLocaleDateString('pt-BR') : 'Em breve',
          statusColor: 'bg-blue-50 text-blue-600 border-blue-100'
        })));
        
        setFeaturedIdeas(ideas.slice(0, 2).map((i:any) => ({
          ...i,
          name: i.title,
          score: Math.floor(Math.random() * 40 + 60), // Proxy until added to schema
          potential: 'Alto',
          next: 'Revisar'
        })));

        // Basic mock logic matching real data to task status
        const upcomingTasks = tasks.filter((t: any) => t.status !== 'DONE').slice(0, 5);
        if (upcomingTasks.length > 0) {
          setNextDeliveries([
            { period: 'Próximas Tarefas', items: upcomingTasks.map((t: any) => t.title) }
          ]);
        } else {
          setNextDeliveries([{ period: 'Próximas Tarefas', items: ['Nenhuma tarefa pendente'] }]);
        }

        const alerts = [];
        const delayedProjs = projs.filter((p: any) => p.status === 'Atrasado' || (p.dueDate && new Date(p.dueDate) < new Date()));
        if (delayedProjs.length > 0) {
          alerts.push({ id: 1, text: `${delayedProjs.length} projetos atrasados detectados!`, type: 'error', icon: ShieldAlert, color: 'text-red-500' });
        }
        if (ideas.filter((i:any) => i.status === 'Nova').length > 5) {
          alerts.push({ id: 2, text: `Muitas ideias aguardando validação`, type: 'warning', icon: TriangleAlert, color: 'text-amber-500' });
        }
        setStrategicAlerts(alerts);

        const highPriority = tasks.filter((t: any) => t.priority === 'Critica' || t.priority === 'Alta');
        if (highPriority.length > 0) {
          setPendingDecisions(highPriority.slice(0, 4).map((t: any) => t.title));
        } else {
          setPendingDecisions(['Nenhuma decisão urgente pendente.']);
        }

      } catch (err) {
        console.error(err);
      }
    };
    fetchDashData();
  }, [fetchWithAuth, activeWorkspace]);
  return (
    <div className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[30px] p-6 lg:p-8 col-span-1 xl:col-span-3 shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-colors">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-display font-bold text-[#111111] tracking-tight flex items-center gap-3">
            <Target className="text-blue-500" size={28} />
            Central de Prioridades
          </h3>
          <p className="text-[#64748B] text-sm font-medium mt-1">Itens estratégicos que exigem sua atenção e decisão imediata.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* BLOCK 1: Projetos Prioritários */}
        <div className="lg:col-span-2 bg-[#FAFAFA] border border-[#0F172A0F] rounded-[24px] p-6">
          <div className="flex items-center gap-2 mb-6">
            <Flag size={18} className="text-[#111111]" />
            <h4 className="font-bold text-[#111111]">Projetos Exigindo Atenção</h4>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="text-[11px] uppercase tracking-widest text-[#64748B] border-b border-[#0F172A0F]">
                  <th className="pb-3 font-bold">Projeto / Empresa</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold">Próxima Ação</th>
                  <th className="pb-3 font-bold">Prazo</th>
                </tr>
              </thead>
              <tbody>
                {priorityProjects.map(proj => (
                  <tr key={proj.id} className="border-b border-[#0F172A0F] last:border-0 hover:bg-[#FFFFFF] transition-colors">
                    <td className="py-4 px-2 -mx-2 rounded-l-[12px]">
                      <div className="font-bold text-[#111111] text-sm">{proj.name}</div>
                      <div className="text-xs text-[#64748B] font-medium">{proj.company}</div>
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-[8px] text-[11px] font-bold border ${proj.statusColor}`}>
                        {proj.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="text-sm font-medium text-[#111111]">{proj.action}</div>
                    </td>
                    <td className="py-4 px-2 -mx-2 rounded-r-[12px]">
                      <div className="text-sm font-bold text-[#111111] flex items-center gap-1.5">
                        <Clock size={14} className="text-[#64748B]" />
                        {proj.deadline}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BLOCK 2: Ideias em Destaque */}
        <div className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-[24px] p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Lightbulb size={18} className="text-[#111111]" />
            <h4 className="font-bold text-[#111111]">Ideias em Destaque</h4>
          </div>
          <div className="flex flex-col gap-4 flex-1">
            {featuredIdeas.map(idea => (
              <div key={idea.id} className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[16px] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-bold text-sm text-[#111111] leading-tight">{idea.name}</h5>
                  <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold px-2 py-0.5 rounded-[6px] shrink-0 ml-2">Score: {idea.score}</span>
                </div>
                <div className="flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B] font-medium">Potencial:</span>
                    <span className="font-bold text-[#111111]">{idea.potential}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1 pt-2 border-t border-[#0F172A0F]">
                    <span className="text-[#64748B] font-medium">Próximo Passo:</span>
                    <span className="font-semibold text-blue-600 text-right">{idea.next}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BLOCK 3: Decisões Pendentes */}
        <div className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-[24px] p-6">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle size={18} className="text-[#111111]" />
            <h4 className="font-bold text-[#111111]">Decisões Pendentes</h4>
          </div>
          <div className="flex flex-col gap-3">
            {pendingDecisions.map((decision, idx) => (
              <label key={idx} className="flex items-start gap-3 p-3.5 bg-[#FFFFFF] border border-[#0F172A0F] hover:border-[#111111]/30 rounded-[16px] cursor-pointer group transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <div className="mt-0.5 w-4 h-4 shrink-0 rounded-[4px] border-2 border-[#CBD5E1] group-hover:border-blue-500 transition-colors flex items-center justify-center bg-white">
                   <span className="hidden">.</span>
                </div>
                <span className="text-sm font-semibold text-[#111111] leading-snug">{decision}</span>
              </label>
            ))}
          </div>
        </div>

        {/* BLOCK 4: Alertas Estratégicos */}
        <div className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-[24px] p-6">
          <div className="flex items-center gap-2 mb-6">
            <ShieldAlert size={18} className="text-[#111111]" />
            <h4 className="font-bold text-[#111111]">Alertas Estratégicos</h4>
          </div>
          <div className="flex flex-col gap-4">
            {strategicAlerts.map(alert => (
              <div key={alert.id} className="flex items-start gap-3 p-2 rounded-[12px] hover:bg-[#FFFFFF] transition-colors -mx-2 px-2">
                <div className="mt-0.5 p-1.5 bg-[#FFFFFF] rounded-[8px] border border-[#0F172A0F] shadow-[0_2px_8px_rgba(0,0,0,0.02)] shrink-0">
                  <alert.icon size={14} className={alert.color} />
                </div>
                <span className="text-sm font-medium text-[#111111] leading-snug">{alert.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* BLOCK 5: Próximas Entregas */}
        <div className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-[24px] p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calendar size={18} className="text-[#111111]" />
            <h4 className="font-bold text-[#111111]">Próximas Entregas</h4>
          </div>
          <div className="flex flex-col gap-4">
            {nextDeliveries.map((delivery, idx) => (
              <div key={idx} className="relative flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-[#FAFAFA] z-10 shrink-0"></div>
                  {idx !== nextDeliveries.length - 1 && <div className="w-px h-full bg-[#E2E8F0] absolute top-2.5"></div>}
                </div>
                <div className="pb-4">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#64748B] block mb-1.5">{delivery.period}</span>
                  <ul className="flex flex-col gap-2 list-none">
                    {delivery.items.map((item, i) => (
                      <li key={i} className="text-sm font-semibold text-[#111111] bg-[#FFFFFF] border border-[#0F172A0F] px-3 py-2 rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
