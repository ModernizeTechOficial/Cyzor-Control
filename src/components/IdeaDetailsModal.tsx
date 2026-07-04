import { useEffect, useState } from 'react';
import { X, Lightbulb, Box, CheckCircle2, DollarSign, Target, Star, Building2, Pencil, Calendar, GitBranch, Sparkles } from 'lucide-react';
import { FormGroup, FormLabel, FormInput, FormTextarea, FormSelect } from './ui/FormComponents';
import { Vision360 } from './common/Vision360';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { showSuccess, showError } from '../lib/alerts';

export default function IdeaDetailsModal({ idea, isOpen, onClose, onSave }: { idea: any, isOpen: boolean, onClose: () => void, onSave: (i: any) => void }) {
  const { fetchWithAuth } = useAuth();
  const { setGlobalFilters } = useNavigation();

  const [isEditing, setIsEditing] = useState(false);
  const [editedIdea, setEditedIdea] = useState(idea);
  const [activeModalTab, setActiveModalTab] = useState<'detalhes' | 'visao_360'>('detalhes');

  // Evolution/Conversion state
  const [isConverting, setIsConverting] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [conversionData, setConversionData] = useState({
    projectName: '',
    companyId: '',
    budget: '',
    dueDate: '',
    priority: 'Média'
  });
  const [isSubmittingConversion, setIsSubmittingConversion] = useState(false);

  useEffect(() => {
    if (idea) {
      setEditedIdea({
        ...idea,
        problema: idea.problema || 'Nenhum problema definido.',
        solucao: idea.solucao || 'Nenhuma solução definida.',
        mercado: idea.mercado || 'Informações de mercado pendentes.',
        concorrentes: idea.concorrentes || 'Não mapeados.',
        mvp: idea.mvp || 'Escopo do MVP.',
        monetizacao: idea.monetizacao || 'Modelo Freemium.',
        observacoes: idea.observacoes || 'Sem observações.'
      });
      setIsEditing(false);
      setIsConverting(false);
      setActiveModalTab('detalhes');
      
      setConversionData({
        projectName: idea.name || idea.title || '',
        companyId: '',
        budget: '',
        dueDate: '',
        priority: idea.prioridade || idea.priority || 'Média'
      });
    }
  }, [idea]);

  useEffect(() => {
    if (isOpen) {
      const fetchCompanies = async () => {
        try {
          const res = await fetchWithAuth('/api/companies');
          if (res.ok) setCompanies(await res.json());
        } catch (e) {
          console.error(e);
        }
      };
      fetchCompanies();
    }
  }, [isOpen, fetchWithAuth]);

  if (!isOpen || !idea || !editedIdea) return null;

  const handleSave = () => {
    onSave(editedIdea);
    setIsEditing(false);
  };

  const handleGoToProject = () => {
    onClose();
    setTimeout(() => {
      window.history.pushState({}, '', '/workspace/projects');
      window.dispatchEvent(new Event('popstate'));
      setGlobalFilters({ projectId: editedIdea.convertedToProjectId });
    }, 150);
  };

  const handleEvolveToProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversionData.projectName) return;
    setIsSubmittingConversion(true);

    try {
      // 1. Create project
      const projectRes = await fetchWithAuth('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: conversionData.projectName,
          priority: conversionData.priority,
          dueDate: conversionData.dueDate ? new Date(conversionData.dueDate).toISOString() : null,
          budget: conversionData.budget || '0',
          owner: 'Sem dono',
          companyId: conversionData.companyId ? Number(conversionData.companyId) : null,
          status: 'Planejamento',
          description: `Projeto gerado a partir da evolução da Ideia "${editedIdea.name}".\n\nProblema: ${editedIdea.problema}\n\nSolução: ${editedIdea.solucao}`
        })
      });

      if (!projectRes.ok) {
        throw new Error('Falha ao criar projeto');
      }

      const newProject = await projectRes.json();

      // 2. Update idea with status and convertedToProjectId
      const ideaRes = await fetchWithAuth(`/api/ideas/${idea.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'convertida',
          convertedToProjectId: newProject.id
        })
      });

      if (!ideaRes.ok) {
        throw new Error('Falha ao atualizar ideia');
      }

      showSuccess('Ideia evoluída para Projeto com sucesso!');
      
      // Close modal and navigate
      onClose();
      
      // Update the main list
      onSave({ ...idea, column: 'convertida', convertedToProjectId: newProject.id });

      // Live redirect to the new project!
      setTimeout(() => {
        window.history.pushState({}, '', '/workspace/projects');
        window.dispatchEvent(new Event('popstate'));
        setGlobalFilters({ projectId: newProject.id });
      }, 300);

    } catch (err: any) {
      console.error(err);
      showError(err.message || 'Erro ao evoluir ideia.');
    } finally {
      setIsSubmittingConversion(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] w-full max-w-4xl rounded-[30px] border border-[#0F172A0F] shadow-[0_20px_60px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 h-[90vh] max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#0F172A0F] flex items-start justify-between bg-[#FAFAFA] relative shrink-0">
          <div className="flex gap-5 flex-1">
            <div className="w-14 h-14 rounded-[16px] bg-[#FFFFFF] border border-[#0F172A0F] flex items-center justify-center flex-shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.02)] mt-1">
               <Lightbulb size={24} className="text-[#111111]" />
            </div>
            <div className="flex flex-col w-full max-w-lg">
              <div className="flex items-center gap-3 mb-1.5 whitespace-nowrap">
                {isEditing ? (
                  <>
                    <FormSelect 
                      value={editedIdea.categoria} 
                      onChange={e => setEditedIdea({...editedIdea, categoria: e.target.value})}
                      className="!py-1.5 !px-2 !rounded-lg !text-[10px] w-32"
                    >
                      <option value="SaaS">SaaS</option>
                      <option value="Mobile">Mobile</option>
                      <option value="AI">AI</option>
                      <option value="Fintech">Fintech</option>
                    </FormSelect>
                    <FormSelect 
                      value={editedIdea.column} 
                      onChange={e => setEditedIdea({...editedIdea, column: e.target.value})}
                      className="!py-1.5 !px-2 !rounded-lg !text-[10px]"
                    >
                      <option value="capturadas">Capturadas</option>
                      <option value="avaliacao">Avaliação</option>
                      <option value="pesquisa">Pesquisa</option>
                      <option value="mvp">MVP</option>
                      <option value="lancadas">Lançadas</option>
                      <option value="arquivadas">Arquivadas</option>
                    </FormSelect>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-[#E2E8F0]/50 text-[#64748B]">{editedIdea.categoria}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-[#E2E8F0]/50 text-[#64748B]">{editedIdea.column}</span>
                  </>
                )}
              </div>
              
              {isEditing ? (
                <FormInput 
                  value={editedIdea.name}
                  onChange={e => setEditedIdea({...editedIdea, name: e.target.value})}
                  className="!text-3xl font-display font-bold !py-1"
                />
              ) : (
                <h2 className="text-3xl font-display font-bold text-[#111111] tracking-tight leading-tight mt-1">{editedIdea.name}</h2>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="w-10 h-10 rounded-[14px] flex items-center justify-center hover:bg-[#E2E8F0]/50 text-[#64748B] transition-colors border border-transparent">
                <Pencil size={20} />
              </button>
            ) : (
              <button title="Cancelar Edição" onClick={() => { setIsEditing(false); setEditedIdea(idea); }} className="w-10 h-10 rounded-[14px] flex items-center justify-center hover:bg-[#E2E8F0]/50 text-[#64748B] transition-colors border border-transparent">
                <X size={20} />
              </button>
            )}
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-[14px] flex items-center justify-center hover:bg-[#E2E8F0]/50 text-[#111111] transition-colors border border-transparent"
            >
              <X size={24} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Modal Level Tab Selector */}
        {!isConverting && (
          <div className="flex px-8 border-b border-[#0F172A0F] bg-[#FAFAFA]/50 gap-6 shrink-0">
            <button 
              onClick={() => setActiveModalTab('detalhes')}
              className={`py-4 px-1 border-b-2 text-xs font-bold transition-all ${
                activeModalTab === 'detalhes' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#64748B] hover:text-[#111111]'
              }`}
            >
              Detalhamento da Ideia
            </button>
            <button 
              onClick={() => setActiveModalTab('visao_360')}
              className={`py-4 px-1 border-b-2 text-xs font-bold transition-all ${
                activeModalTab === 'visao_360' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#64748B] hover:text-[#111111]'
              }`}
            >
              Visão 360°
            </button>
          </div>
        )}

        {/* Body (Scrollable) */}
        {isConverting ? (
          <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8">
            <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-4">
              <Sparkles className="text-indigo-600 mt-1 flex-shrink-0 animate-pulse" size={24} />
              <div className="flex flex-col gap-1 text-left">
                <span className="text-sm font-bold text-indigo-900">Evoluir para Projeto Operacional</span>
                <span className="text-xs text-indigo-700 leading-relaxed">
                  Transforme a ideia <strong>"{editedIdea.name}"</strong> em um projeto ativo no Workspace. Esta ação manterá o histórico e conectará as duas entidades no ciclo de vida da empresa.
                </span>
              </div>
            </div>

            <form onSubmit={handleEvolveToProject} className="flex flex-col gap-6 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormGroup>
                  <FormLabel required>Nome do Projeto</FormLabel>
                  <FormInput 
                    required
                    placeholder="Nome do projeto..."
                    value={conversionData.projectName}
                    onChange={(e) => setConversionData({ ...conversionData, projectName: e.target.value })}
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel>Empresa Relacionada</FormLabel>
                  <FormSelect 
                    value={conversionData.companyId}
                    onChange={(e) => setConversionData({ ...conversionData, companyId: e.target.value })}
                  >
                    <option value="">Nenhuma / Interno</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </FormSelect>
                </FormGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <FormGroup>
                  <FormLabel>Faturamento Pretendido (R$)</FormLabel>
                  <FormInput 
                    type="number"
                    placeholder="Ex: 50000.00"
                    value={conversionData.budget}
                    onChange={(e) => setConversionData({ ...conversionData, budget: e.target.value })}
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel>Data de Entrega / Prazo</FormLabel>
                  <FormInput 
                    type="date"
                    value={conversionData.dueDate}
                    onChange={(e) => setConversionData({ ...conversionData, dueDate: e.target.value })}
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel>Prioridade</FormLabel>
                  <FormSelect 
                    value={conversionData.priority}
                    onChange={(e) => setConversionData({ ...conversionData, priority: e.target.value })}
                  >
                    <option value="Alta">Alta</option>
                    <option value="Média">Média</option>
                    <option value="Baixa">Baixa</option>
                  </FormSelect>
                </FormGroup>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsConverting(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingConversion || !conversionData.projectName}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  {isSubmittingConversion ? 'Evoluindo...' : (
                    <>
                      <GitBranch size={14} />
                      <span>Confirmar e Criar Projeto</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : activeModalTab === 'visao_360' ? (
          <div className="flex-1 overflow-y-auto">
            <Vision360 entityType="idea" entityId={editedIdea.id} entityName={editedIdea.name} entityData={editedIdea} />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-10">
            
            {/* Metadata Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
              <InfoBox label="Empresa Relacionada" icon={<Building2 size={12} />} isEditing={isEditing} value={editedIdea.empresa} onChange={(v) => setEditedIdea({...editedIdea, empresa: v})} />
              <InfoBox label="Potencial" icon={<DollarSign size={12} />} isEditing={isEditing} value={editedIdea.potencial} onChange={(v) => setEditedIdea({...editedIdea, potencial: v})} />
              <InfoBox label="Complexidade" icon={<Target size={12} />} isEditing={isEditing} value={editedIdea.complexidade} onChange={(v) => setEditedIdea({...editedIdea, complexidade: v})} />
              <InfoBox label="Score Geral" icon={<Star size={12} className="text-yellow-500" />} isEditing={isEditing} value={editedIdea.score} onChange={(v) => setEditedIdea({...editedIdea, score: v})} />
              <InfoBoxSelect 
                label="Trimestre (Roadmap)" 
                icon={<Calendar size={12} />} 
                isEditing={isEditing} 
                value={editedIdea.quarter || 'Backlog'} 
                onChange={(v) => setEditedIdea({...editedIdea, quarter: v})}
                options={[
                  { value: 'Backlog', label: 'Backlog' },
                  { value: 'Q3 2026', label: 'Q3 2026 (Atual)' },
                  { value: 'Q4 2026', label: 'Q4 2026' },
                  { value: 'Q1 2027', label: 'Q1 2027' },
                  { value: 'Q2 2027', label: 'Q2 2027' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <TextAreaField label="Problema" value={editedIdea.problema} isEditing={isEditing} onChange={(v) => setEditedIdea({...editedIdea, problema: v})} />
              <TextAreaField label="Solução" value={editedIdea.solucao} isEditing={isEditing} onChange={(v) => setEditedIdea({...editedIdea, solucao: v})} />
              <TextAreaField label="Mercado e Público" value={editedIdea.mercado} isEditing={isEditing} onChange={(v) => setEditedIdea({...editedIdea, mercado: v})} />
              <TextAreaField label="Concorrentes" value={editedIdea.concorrentes} isEditing={isEditing} onChange={(v) => setEditedIdea({...editedIdea, concorrentes: v})} />
              <TextAreaField label="Escopo MVP" value={editedIdea.mvp} isEditing={isEditing} onChange={(v) => setEditedIdea({...editedIdea, mvp: v})} />
              <TextAreaField label="Modelo de Monetização" value={editedIdea.monetizacao} isEditing={isEditing} onChange={(v) => setEditedIdea({...editedIdea, monetizacao: v})} />
            </div>
            
            <TextAreaField className="xl:col-span-2" label="Observações Livres" value={editedIdea.observacoes} isEditing={isEditing} onChange={(v) => setEditedIdea({...editedIdea, observacoes: v})} />

          </div>
        )}

        {/* Footer (Actions) */}
        {!isConverting && (
          <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-between items-center rounded-b-[30px] gap-3 shrink-0">
            <div>
              {!isEditing && (
                editedIdea.convertedToProjectId ? (
                  <button 
                    onClick={handleGoToProject}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 hover:scale-[1.01] transition-all cursor-pointer flex items-center gap-2"
                  >
                    <GitBranch size={14} className="animate-pulse" />
                    <span>Ver Projeto Vinculado</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsConverting(true)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.01] shadow-sm transition-all cursor-pointer flex items-center gap-2"
                  >
                    <GitBranch size={14} />
                    <span>Evoluir para Projeto</span>
                  </button>
                )
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {isEditing ? (
                <button onClick={handleSave} className="px-8 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 shadow-md hover:bg-indigo-700 transition-all">
                  Salvar Alterações
                </button>
              ) : (
                <button onClick={onClose} className="px-8 py-3 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all">
                  Fechar
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoBox({ label, icon, value, isEditing, onChange }: { label: string, icon: any, value: string, isEditing: boolean, onChange: (v: string) => void }) {
  return (
    <FormGroup>
      <FormLabel className="flex items-center gap-1.5">{icon} {label}</FormLabel>
      <div className="flex items-center mt-1">
        {isEditing ? (
          <FormInput value={value} onChange={e => onChange(e.target.value)} className="!py-1.5 !px-3" />
        ) : (
          <span className="text-sm font-semibold text-slate-700">{value}</span>
        )}
      </div>
    </FormGroup>
  );
}

interface InfoBoxSelectProps {
  label: string;
  icon: any;
  value: string;
  isEditing: boolean;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}

function InfoBoxSelect({ label, icon, value, isEditing, onChange, options }: InfoBoxSelectProps) {
  const displayLabel = options.find(o => o.value === value)?.label || value;
  return (
    <FormGroup>
      <FormLabel className="flex items-center gap-1.5">{icon} {label}</FormLabel>
      <div className="flex items-center mt-1">
        {isEditing ? (
          <FormSelect value={value} onChange={e => onChange(e.target.value)} className="!py-1.5 !px-2 !text-xs !rounded-lg">
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </FormSelect>
        ) : (
          <span className="text-sm font-semibold text-slate-700">{displayLabel}</span>
        )}
      </div>
    </FormGroup>
  );
}

function TextAreaField({ label, value, isEditing, onChange, className = "" }: { label: string, value: string, isEditing: boolean, onChange: (v: string) => void, className?: string }) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <h3 className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider border-b border-slate-100 pb-2">{label}</h3>
      {isEditing ? (
        <FormTextarea 
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={4}
        />
      ) : (
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          {value}
        </p>
      )}
    </div>
  );
}
