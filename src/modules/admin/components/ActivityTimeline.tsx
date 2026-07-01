import React, { useEffect, useState } from 'react';
import { Sparkles, Terminal, ShieldAlert, BadgeDollarSign, Database, GitBranch, Cpu, PlusCircle } from 'lucide-react';

interface ActivityItem {
  id: number;
  time: string;
  type: 'SAAS' | 'DEPLOY' | 'BILL' | 'BACKUP' | 'CLIENT' | 'PIPELINE';
  title: string;
  description: string;
  badge: string;
}

export default function ActivityTimeline() {
  const [activities, setActivities] = useState<ActivityItem[]>([
    { id: 1, time: '12:30', type: 'SAAS', title: 'Novo SaaS Criado', description: 'Workspace "Vanguard Corp" provisionado no DB Cluster regional - SP1', badge: 'vanguard-corp' },
    { id: 2, time: '12:15', type: 'DEPLOY', title: 'Deploy Concluído', description: 'Pipeline finalizado para o serviço Core API Gateway (f2c7a91)', badge: 'v1.4.2' },
    { id: 3, time: '11:58', type: 'BILL', title: 'Pagamento Aprovado', description: 'Assinatura Pro processada com sucesso no Stripe (R$ 499,00/mês)', badge: 'stripe' },
    { id: 4, time: '11:40', type: 'CLIENT', title: 'Novo Cliente Cadastrado', description: 'Empresa "Cyzor Hub" associada ao Workspace Enterprise', badge: 'cyzor-hub' },
    { id: 5, time: '11:00', type: 'BACKUP', title: 'Backup Realizado', description: 'Snapshot automático de 18 SaaS PostgreSQL databases replicados no S3', badge: 's3-backup' },
    { id: 6, time: '10:45', type: 'PIPELINE', title: 'Pipeline Executado', description: 'Linter e testes integrados executados com sucesso na branch staging', badge: 'github-actions' }
  ]);

  // Slower, elegant real-time simulation updates
  useEffect(() => {
    const stream = [
      { type: 'BILL', title: 'Recorrência de Assinatura Sucedida', description: 'Stripe processou faturamento anual para o Workspace ApexSoft', badge: 'stripe' },
      { type: 'SAAS', title: 'Workspace Ativado', description: 'SaaS "Inovação Labs" inicializou sua conexão de banco de dados', badge: 'inovacao-labs' },
      { type: 'DEPLOY', title: 'Compilação Efetuada', description: 'Frontend bundles compactados e distribuídos via Cloud CDN Edge', badge: 'cdn-deploy' },
      { type: 'BACKUP', title: 'Verificação de Integridade', description: 'Integridade referencial de todos os Tenants auditada e aprovada', badge: 'security' }
    ];

    const interval = setInterval(() => {
      const selected = stream[Math.floor(Math.random() * stream.length)];
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      const item: ActivityItem = {
        id: Date.now(),
        time: timeStr,
        type: selected.type as any,
        title: selected.title,
        description: selected.description,
        badge: selected.badge
      };

      setActivities(prev => [item, ...prev.slice(0, 5)]);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white border border-[#ECECEF] rounded-[24px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_25px_rgba(0,0,0,0.03)] transition-all duration-300">
      <div className="flex items-center justify-between pb-4 border-b border-[#ECECEF] mb-5">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 font-mono flex items-center gap-1.5">
            <Terminal size={14} className="text-zinc-600 animate-pulse" />
            Platform Activity Feed & Auditoria
          </h3>
          <p className="text-[10px] text-zinc-400 font-medium">Ações globais registradas no cluster de controle</p>
        </div>
        <span className="text-[8px] font-mono text-zinc-400 font-bold bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-md uppercase">
          Live stream active
        </span>
      </div>

      <div className="relative border-l border-zinc-200 pl-4 ml-2.5 space-y-6">
        {activities.map((act) => {
          let BulletIcon = PlusCircle;
          let bulletColor = 'bg-zinc-100 text-zinc-600 border-[#ECECEF]';
          if (act.type === 'SAAS') {
            BulletIcon = PlusCircle;
            bulletColor = 'bg-blue-50 text-blue-600 border-blue-100';
          } else if (act.type === 'DEPLOY') {
            BulletIcon = GitBranch;
            bulletColor = 'bg-purple-50 text-purple-600 border-purple-100';
          } else if (act.type === 'BILL') {
            BulletIcon = BadgeDollarSign;
            bulletColor = 'bg-emerald-50 text-emerald-600 border-emerald-100';
          } else if (act.type === 'BACKUP') {
            BulletIcon = Database;
            bulletColor = 'bg-cyan-50 text-cyan-600 border-cyan-100';
          } else if (act.type === 'PIPELINE') {
            BulletIcon = Cpu;
            bulletColor = 'bg-indigo-50 text-indigo-600 border-indigo-100';
          }

          return (
            <div key={act.id} className="relative group">
              {/* Pulsing indicator dot next to timeline bullet */}
              <div className="absolute -left-[27.5px] top-1.5 flex items-center justify-center">
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center bg-white group-hover:scale-110 transition-transform ${bulletColor}`}>
                  <BulletIcon size={11} />
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-zinc-950">{act.title}</span>
                  <span className="text-[8px] font-mono text-zinc-400">{act.time}</span>
                  <span className="text-[8px] font-mono bg-zinc-50 border border-zinc-200 px-1.5 py-0.2 rounded text-zinc-500 font-semibold uppercase tracking-wider shrink-0 ml-auto select-none">
                    {act.badge}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">{act.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
