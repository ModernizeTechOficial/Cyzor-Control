import { useState, useEffect } from 'react';
import { ProjectExtended } from '../../types/project';
import { User, Flag, Calendar, Building2, Layers, Briefcase, Users, Activity, CheckSquare, Clock } from 'lucide-react';
import { FormGroup, FormLabel, FormInput, FormTextarea, FormSelect } from '../ui/FormComponents';

interface AbaVisaoGeralProps {
  project: ProjectExtended;
  isEditing: boolean;
  onChange: (updated: any) => void;
  companies?: any[];
}

export default function AbaVisaoGeral({ project, isEditing, onChange, companies = [] }: AbaVisaoGeralProps) {
  const [formData, setFormData] = useState(project);

  useEffect(() => {
    setFormData(project);
  }, [project]);

  const handleChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  // Helper variables for metrics calculation
  const tasks = project.tasks || [];
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.column === 'done').length;
  const openTasks = tasks.filter(t => t.column !== 'done').length;
  const highPriorityTasks = tasks.filter(t => t.priority === 'Alta' && t.column !== 'done').length;
  const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="p-8 flex flex-col gap-10 w-full animate-in fade-in duration-200">
      
      {/* 4 Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm flex flex-col gap-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-widest">Progresso Geral</span>
            <Activity size={16} />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-display font-bold text-[#111111]">{progressPercent}%</span>
            <span className="text-xs font-semibold text-emerald-600">Completo</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-50 border border-slate-100 rounded-full overflow-hidden mt-3">
            <div 
              className="h-full bg-indigo-600 transition-all duration-500 rounded-full" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm flex flex-col gap-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-widest">Tarefas no Backlog</span>
            <CheckSquare size={16} />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-display font-bold text-[#111111]">{totalTasks}</span>
            <span className="text-xs text-slate-500 font-medium">alocadas</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-auto flex items-center gap-1">
            <span className="font-bold text-[#111111]">{doneTasks}</span> concluídas • <span className="font-bold text-[#111111]">{openTasks}</span> abertas
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm flex flex-col gap-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-widest">Atrasos & Riscos</span>
            <Clock size={16} className={highPriorityTasks > 0 ? "text-amber-500" : ""} />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-display font-bold text-[#111111]">{highPriorityTasks}</span>
            <span className="text-xs text-amber-600 font-bold">{highPriorityTasks > 0 ? 'Alta prioridade' : 'Sem risco crítico'}</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-auto">
            Tarefas urgentes sob acompanhamento
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm flex flex-col gap-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-widest">Membros</span>
            <Users size={16} />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-display font-bold text-[#111111]">{(project.team || []).length}</span>
            <span className="text-xs text-slate-500 font-medium">colaboradores</span>
          </div>
          <div className="flex -space-x-2 overflow-hidden mt-auto pt-1">
            {(project.team || []).slice(0, 4).map((member, i) => (
              <div 
                key={member.name} 
                className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-50 border border-slate-100 flex items-center justify-center text-[9px] font-bold text-[#111111] uppercase"
                title={`${member.name} (${member.role})`}
              >
                {member.avatar}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Details and Overview Narrative */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form / Info details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm flex flex-col gap-6">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#64748B] border-b border-slate-100 pb-3 flex items-center gap-2">
              <Layers size={14} /> Detalhes Gerais da Iniciativa
            </h3>

            {isEditing ? (
              <div className="flex flex-col gap-6">
                <FormGroup>
                  <FormLabel>Descrição do Projeto</FormLabel>
                  <FormTextarea 
                    value={formData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Descreva os objetivos, escopo e resultados esperados deste projeto..."
                    rows={6}
                  />
                </FormGroup>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormGroup>
                    <FormLabel>Cliente / Empresa</FormLabel>
                    <FormSelect
                      value={formData.companyId || ''}
                      onChange={(e) => {
                        const cid = Number(e.target.value);
                        const cname = companies.find(c => c.id === cid)?.name || 'Empresa não vinculada';
                        const updated = { ...formData, companyId: cid, company: cname };
                        setFormData(updated);
                        onChange(updated);
                      }}
                    >
                      <option value="">Selecionar Empresa</option>
                      {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </FormSelect>
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Prioridade</FormLabel>
                    <FormSelect
                      value={formData.priority}
                      onChange={(e) => handleChange('priority', e.target.value)}
                    >
                      <option value="Baixa">Baixa</option>
                      <option value="Média">Média</option>
                      <option value="Alta">Alta</option>
                      <option value="Crítica">Crítica</option>
                    </FormSelect>
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Prazo Final</FormLabel>
                    <FormInput
                      type="date"
                      value={formData.dueDate ? formData.dueDate.substring(0, 10) : ''}
                      onChange={(e) => handleChange('dueDate', e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Faturamento (R$)</FormLabel>
                    <FormInput
                      type="number"
                      value={formData.budget || '0'}
                      onChange={(e) => handleChange('budget', e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Coordenador / Owner</FormLabel>
                    <FormInput
                      type="text"
                      value={formData.owner || ''}
                      onChange={(e) => handleChange('owner', e.target.value)}
                    />
                  </FormGroup>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <p className="text-sm text-[#475569] leading-relaxed whitespace-pre-wrap">
                  {project.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 border-t border-slate-100 pt-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase text-[#64748B] tracking-wide flex items-center gap-1.5">
                      <Building2 size={12} /> Cliente / Empresa
                    </span>
                    <span className="text-sm font-semibold text-[#111111]">{project.company}</span>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase text-[#64748B] tracking-wide flex items-center gap-1.5">
                      <User size={12} /> Coordenador / Owner
                    </span>
                    <span className="text-sm font-semibold text-[#111111]">{project.owner}</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase text-[#64748B] tracking-wide flex items-center gap-1.5">
                      <Flag size={12} /> Prioridade
                    </span>
                    <span className="text-sm font-semibold text-[#111111]">{project.priority}</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase text-[#64748B] tracking-wide flex items-center gap-1.5">
                      <Calendar size={12} /> Prazo Final
                    </span>
                    <span className={`text-sm font-semibold ${project.deadline === 'Atrasado' ? 'text-red-600 font-bold' : 'text-[#111111]'}`}>
                      {project.dueDate ? new Date(project.dueDate).toLocaleDateString('pt-BR') : project.deadline}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase text-[#64748B] tracking-wide flex items-center gap-1.5">
                      <Activity size={12} /> Faturamento Previsto
                    </span>
                    <span className="text-sm font-semibold text-[#111111]">
                      R$ {Number(project.budget || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Mini-checklist criteria of Project execution */}
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm flex flex-col gap-6">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#64748B] border-b border-slate-100 pb-3 flex justify-between items-center">
              <span>Critérios de Sucesso</span>
              <span className="text-[#111111] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[10px]">
                {formData.criteria?.filter(c => c.completed).length || 0}/{formData.criteria?.length || 0}
              </span>
            </h3>

            <div className="flex flex-col gap-4">
              {formData.criteria?.map((item, index) => (
                <div key={item.id} className="flex items-start gap-3">
                  <input 
                    type="checkbox"
                    checked={item.completed}
                    onChange={(e) => {
                      const updatedCriteria = [...(formData.criteria || [])];
                      updatedCriteria[index] = { ...item, completed: e.target.checked };
                      handleChange('criteria', updatedCriteria);
                    }}
                    className="mt-0.5 h-4 w-4 text-[#111111] border-slate-200 rounded focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                  />
                  <span className={`text-xs font-semibold leading-tight ${item.completed ? 'text-slate-400 line-through' : 'text-[#111111]'}`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
