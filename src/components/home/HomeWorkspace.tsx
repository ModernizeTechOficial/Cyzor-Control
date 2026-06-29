import { AlertCircle, Clock } from 'lucide-react';

interface Project {
  id: number;
  name: string;
  status: string;
}

interface Props {
  projects: Project[];
}

export default function HomeWorkspace({ projects }: Props) {
  return (
    <div className="bg-white border border-slate-100 rounded-[24px] p-8 shadow-sm">
      <h2 className="text-lg font-bold text-[#111111] mb-6">Workspace</h2>
      <div className="space-y-4">
        {projects.map(project => (
            <div key={project.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                    <h3 className="text-sm font-bold text-[#111111]">{project.name}</h3>
                    <p className="text-xs text-slate-500">{project.status}</p>
                </div>
                <button className="text-[10px] font-bold uppercase tracking-wider bg-white px-3 py-1 rounded-lg border border-slate-200">Abrir</button>
            </div>
        ))}
        {projects.length === 0 && <p className="text-sm text-slate-500">Nenhum projeto prioritário.</p>}
      </div>
    </div>
  );
}
