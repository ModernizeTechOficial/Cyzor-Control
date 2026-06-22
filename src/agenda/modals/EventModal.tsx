import { useState, useEffect } from 'react';
import { AgendaEvent, EventType, EventCategory, EventStatus, RecurrenceType, Participant, TimeBlockType } from '../types/agenda';
import { MOCK_PARTICIPANTS, MOCK_RESOURCES } from '../utils/mockEvents';
import { X, Calendar, Clock, MapPin, User, ChevronDown, Check, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: AgendaEvent) => void;
  eventToEdit?: AgendaEvent | null;
  initialDate?: string;
  initialHour?: string;
}

export default function EventModal({ isOpen, onClose, onSave, eventToEdit, initialDate, initialHour }: EventModalProps) {
  const { token, activeWorkspace, user } = useAuth();
  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const [dbCompanies, setDbCompanies] = useState<any[]>([]);
  const [dbMembers, setDbMembers] = useState<any[]>([]);

  useEffect(() => {
    const fetchCompaniesAndProjects = async () => {
      if (!isOpen || !token || !activeWorkspace) return;
      try {
        const [projRes, compRes, membRes] = await Promise.all([
          fetch('/api/projects', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/companies', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/workspace/members', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        if (projRes.ok) {
          const projs = await projRes.json();
          setDbProjects(projs);
        }
        if (compRes.ok) {
          const comps = await compRes.json();
          setDbCompanies(comps);
        }
        if (membRes.ok) {
          const mems = await membRes.json();
          setDbMembers(mems);
        }
      } catch (err) {
        console.error("Failed to fetch projects, companies or members for agenda bind:", err);
      }
    };
    fetchCompaniesAndProjects();
  }, [isOpen, token, activeWorkspace]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [type, setType] = useState<EventType>('reuniao');
  const [category, setCategory] = useState<EventCategory>('Projetos');
  const [status, setStatus] = useState<EventStatus>('Confirmado');
  const [location, setLocation] = useState('Google Meet');
  const [owner, setOwner] = useState('Admin User');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [recurrenceDescription, setRecurrenceDescription] = useState('');
  
  // Linkages
  const [linkedProjectId, setLinkedProjectId] = useState<string>('');
  const [linkedCompanyId, setLinkedCompanyId] = useState<string>('');

  // Resources & Time Blocks
  const [reservedResources, setReservedResources] = useState<string[]>([]);
  const [isTimeBlock, setIsTimeBlock] = useState(false);
  const [timeBlockType, setTimeBlockType] = useState<TimeBlockType>('none');

  // Participants selection list
  const [selectedParticipants, setSelectedParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setDescription(eventToEdit.description);
      setDate(eventToEdit.date);
      setStartTime(eventToEdit.startTime);
      setEndTime(eventToEdit.endTime);
      setType(eventToEdit.type);
      setCategory(eventToEdit.category);
      setStatus(eventToEdit.status);
      setLocation(eventToEdit.location);
      setOwner(eventToEdit.owner);
      setRecurrence(eventToEdit.recurrence);
      setRecurrenceDescription(eventToEdit.recurrenceDescription || '');
      setLinkedProjectId(eventToEdit.linkedProject?.id.toString() || '');
      setLinkedCompanyId(eventToEdit.linkedCompany?.id.toString() || '');
      setReservedResources(eventToEdit.reservedResources);
      setIsTimeBlock(eventToEdit.isTimeBlock);
      setTimeBlockType(eventToEdit.timeBlockType);
      setSelectedParticipants(eventToEdit.participants);
    } else {
      // Set default values or prefilled values
      setTitle('');
      setDescription('');
      setDate(initialDate || new Date().toISOString().split('T')[0]);
      setStartTime(initialHour || '09:00');
      
      // Auto-set endTime to 1 hour later
      if (initialHour) {
        const h = parseInt(initialHour.split(':')[0]);
        setEndTime(`${(h + 1).toString().padStart(2, '0')}:00`);
      } else {
        setEndTime('10:00');
      }
      
      setType('reuniao');
      setCategory('Projetos');
      setStatus('Confirmado');
      setLocation('Google Meet');
      setOwner(user?.displayName || user?.email || 'Usuário Admin');
      setRecurrence('none');
      setRecurrenceDescription('');
      setLinkedProjectId('');
      setLinkedCompanyId('');
      setReservedResources([]);
      setIsTimeBlock(false);
      setTimeBlockType('none');
      setSelectedParticipants([]);
    }
  }, [eventToEdit, isOpen, initialDate, initialHour, user]);

  if (!isOpen) return null;

  const handleToggleParticipant = (person: Participant) => {
    const isSelected = selectedParticipants.some(p => p.email === person.email || p.name === person.name);
    if (isSelected) {
      setSelectedParticipants(selectedParticipants.filter(p => p.email !== person.email && p.name !== person.name));
    } else {
      setSelectedParticipants([...selectedParticipants, person]);
    }
  };

  const handleToggleResource = (res: string) => {
    if (reservedResources.includes(res)) {
      setReservedResources(reservedResources.filter(r => r !== res));
    } else {
      setReservedResources([...reservedResources, res]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startTime || !endTime || !date) {
      alert('Por favor preencha os campos obrigatórios (Título, Data, Horário).');
      return;
    }

    const linkedProj = dbProjects.find(p => p.id.toString() === linkedProjectId);
    const linkedComp = dbCompanies.find(c => c.id.toString() === linkedCompanyId);

    const savedEvent: AgendaEvent = {
      id: eventToEdit ? eventToEdit.id : `evt-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      date,
      startTime,
      endTime,
      owner,
      participants: selectedParticipants,
      location: location.trim(),
      type,
      category,
      status,
      reminder: eventToEdit ? eventToEdit.reminder : '15m',
      recurrence,
      recurrenceDescription: recurrence !== 'none' ? recurrenceDescription.trim() || 'Recorrente' : undefined,
      linkedProject: linkedProj,
      linkedCompany: linkedComp,
      comments: eventToEdit ? eventToEdit.comments : [],
      attachments: eventToEdit ? eventToEdit.attachments : [],
      checklist: eventToEdit ? eventToEdit.checklist : [],
      history: [
        {
          id: `h-modal-${Date.now()}`,
          user: 'Admin User',
          action: eventToEdit ? 'Atualizou informações no cadastro' : 'Criou o compromisso',
          time: 'Agora'
        },
        ...(eventToEdit ? eventToEdit.history : [])
      ],
      reservedResources,
      isTimeBlock,
      timeBlockType: isTimeBlock ? timeBlockType : 'none'
    };

    onSave(savedEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-[#111111]/30 backdrop-blur-[2px] transition-opacity" 
      />

      {/* Modal Dialog Content */}
      <div className="relative bg-white rounded-t-[24px] sm:rounded-[30px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] w-full max-w-[650px] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="border-b border-[#0F172A0F] p-6 lg:px-8 bg-[#FAFAFA] flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-[#111111] tracking-tight">
              {eventToEdit ? 'Editar Evento na Agenda' : 'Agendar Novo Compromisso'}
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5 font-medium">Insira as especificações operacionais do evento.</p>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-2 hover:bg-neutral-200/50 rounded-xl transition-all text-[#64748B] hover:text-[#111111]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 lg:p-8 flex flex-col gap-5 custom-scrollbar">
          
          {/* Main Title Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Título do Compromisso *</label>
            <input 
              type="text" 
              placeholder="Ex: Reunião de Alinhamento"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="border border-[#0F172A1C] bg-white text-sm rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:border-[#111111] text-[#111111] font-semibold"
              required
            />
          </div>

          {/* Description Multi-line Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Descrição Técnico-Comercial</label>
            <textarea 
              placeholder="Descreva a pauta ou objetivos desta reunião..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="border border-[#0F172A1C] bg-white text-sm rounded-xl px-4 py-2.5 placeholder-slate-400 focus:outline-none focus:border-[#111111] text-[#111111] min-h-[80px]"
            />
          </div>

          {/* Grid for Date, StartTime, EndTime */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Data do Evento *</label>
              <input 
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="border border-[#0F172A1C] bg-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#111111]"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Início *</label>
              <input 
                type="text"
                placeholder="09:00"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="border border-[#0F172A1C] bg-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#111111] font-mono font-bold"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Fim *</label>
              <input 
                type="text"
                placeholder="10:00"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="border border-[#0F172A1C] bg-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#111111] font-mono font-bold"
                required
              />
            </div>
          </div>

          {/* Location and Responsible Owner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Localização / Sala</label>
              <input 
                type="text"
                placeholder="Google Meet, Sala de Reuniões 02..."
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="border border-[#0F172A1C] bg-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#111111]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Responsável</label>
              <input 
                type="text"
                value={owner}
                onChange={e => setOwner(e.target.value)}
                className="border border-[#0F172A1C] bg-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#111111] font-semibold"
              />
            </div>
          </div>

          {/* Selectors for Type, Category, Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Tipo de Evento</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as EventType)}
                className="border border-[#0F172A1C] bg-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#111111] font-semibold"
              >
                <option value="reuniao">📹 Reunião / Videoconferência</option>
                <option value="call">📞 Call Rápido</option>
                <option value="compromisso">💼 Compromisso</option>
                <option value="visita">🚗 Visita Técnica / Comercial</option>
                <option value="entrega">📦 Entrega / Deadline</option>
                <option value="evento">⭐ Evento Corporativo</option>
                <option value="lembrete">🔔 Lembrete pessoal</option>
                <option value="treinamento">🎓 Treinamento</option>
                <option value="apresentacao">🎨 Apresentação / Pitch</option>
                <option value="outro">📁 Outro</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Setor / Categoria</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as EventCategory)}
                className="border border-[#0F172A1C] bg-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#111111] font-semibold"
              >
                <option value="Projetos">📊 Projetos / Metas</option>
                <option value="Administrativo">🏢 Administrativo</option>
                <option value="Comercial">📈 Comercial</option>
                <option value="Financeiro">💰 Financeiro</option>
                <option value="RH">👥 Recursos Humanos</option>
                <option value="Operacional">🔧 Operacional</option>
                <option value="Marketing">📢 Marketing</option>
                <option value="Tecnologia">💻 Tecnologia </option>
                <option value="Jurídico">⚖️ Jurídico</option>
                <option value="Personalizado">📁 Geral</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Status do Fluxo</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as EventStatus)}
                className="border border-[#0F172A1C] bg-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#111111] font-semibold"
              >
                <option value="Confirmado">✅ Confirmado</option>
                <option value="Agendado">📅 Agendado</option>
                <option value="Em andamento">⚡ Em andamento</option>
                <option value="Concluído font-semibold text-green-700">🏁 Concluído</option>
                <option value="Adiado">⏳ Adiado</option>
                <option value="Cancelado">❌ Cancelado</option>
              </select>
            </div>
          </div>

          {/* Recurrence Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#0F172A0D] pt-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Recorrência periódica</label>
              <select
                value={recurrence}
                onChange={e => setRecurrence(e.target.value as RecurrenceType)}
                className="border border-[#0F172A1C] bg-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#111111]"
              >
                <option value="none">Nenhuma</option>
                <option value="daily">Diariamente</option>
                <option value="weekly">Semanalmente</option>
                <option value="monthly">Mensalmente</option>
                <option value="yearly">Anualmente</option>
                <option value="personalizado">Personalizado</option>
              </select>
            </div>
            {recurrence !== 'none' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Descrição da recorrência</label>
                <input 
                  type="text"
                  placeholder="Ex: Todas as quartas e sextas"
                  value={recurrenceDescription}
                  onChange={e => setRecurrenceDescription(e.target.value)}
                  className="border border-[#0F172A1C] bg-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#111111]"
                />
              </div>
            )}
          </div>

          {/* Project & Company Bindings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#0F172A0D] pt-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Vincular a um Projeto</label>
              <select
                value={linkedProjectId}
                onChange={e => setLinkedProjectId(e.target.value)}
                className="border border-[#0F172A1C] bg-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#111111]"
              >
                <option value="">Nenhum projeto vinculado</option>
                {dbProjects.map(proj => (
                  <option key={proj.id} value={proj.id}>{proj.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Vincular a uma Empresa / Cliente</label>
              <select
                value={linkedCompanyId}
                onChange={e => setLinkedCompanyId(e.target.value)}
                className="border border-[#0F172A1C] bg-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#111111]"
              >
                <option value="">Nenhuma empresa vinculada</option>
                {dbCompanies.map(comp => (
                  <option key={comp.id} value={comp.id}>{comp.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Time Block absenses Toggle (Home Office, Vacation etc) */}
          <div className="border-t border-[#0F172A0D] pt-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="isTimeBlockCheckbox"
                checked={isTimeBlock}
                onChange={e => setIsTimeBlock(e.target.checked)}
                className="rounded text-neutral-900 border-[#0F172A22]"
              />
              <label htmlFor="isTimeBlockCheckbox" className="text-xs font-bold text-[#111111] cursor-pointer">
                Este compromisso é um bloqueio de agenda (Férias, Ausência, Home Office)
              </label>
            </div>

            {isTimeBlock && (
              <div className="bg-[#FAFAFA] border border-[#0F172A0D] rounded-xl p-4 flex flex-col gap-2.5">
                <label className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Tipo de Bloqueio</label>
                <div className="flex flex-wrap gap-2">
                  {([
                    { val: 'ferias', label: '🏖️ Férias' },
                    { val: 'ausencia', label: '🚑 Ausência Médica / Pessoal' },
                    { val: 'viagem', label: '✈️ Viagem Corporativa' },
                    { val: 'bloqueio', label: '🔒 Bloqueio de Foco' },
                    { val: 'home_office', label: '🏠 Home Office' },
                  ] as const).map(item => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setTimeBlockType(item.val as TimeBlockType)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                        timeBlockType === item.val 
                          ? 'bg-neutral-950 border-neutral-950 text-white font-bold' 
                          : 'bg-white border-[#0F172A0F] text-[#64748B] hover:text-[#111111]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Multi-reserve Room & Assets reservation checklist */}
          <div className="border-t border-[#0F172A0D] pt-4">
            <label className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider mb-2.5 block">Reserva de Salas e Equipamentos Corporativos</label>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-neutral-800">
              {MOCK_RESOURCES.map((res) => {
                const checked = reservedResources.includes(res);
                return (
                  <label key={res} className="flex items-center gap-2 p-2 px-3 border border-[#0F172A0A] rounded-xl hover:bg-[#FAFAFA] cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleResource(res)}
                      className="rounded text-neutral-900 border-[#0F172A22]"
                    />
                    <span>{res}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Invited Professionals selection checklist */}
          <div className="border-t border-[#0F172A0D] pt-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-3 block">Convidar Profissionais / Colegas</span>
            <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
              {(dbMembers.length > 0 ? dbMembers.map(m => ({
                name: m.displayName || m.email.split('@')[0],
                role: m.role || 'Colaborador',
                avatar: m.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.displayName || m.email)}`,
                area: 'Workspace',
                email: m.email
              })) : MOCK_PARTICIPANTS).map((person) => {
                const selected = selectedParticipants.some(p => p.email === person.email || p.name === person.name);
                return (
                  <div 
                    key={person.email || person.name}
                    onClick={() => handleToggleParticipant(person)}
                    className="flex justify-between items-center p-2.5 bg-[#FAFAFA] hover:bg-[#FAFAFA]/80 border border-[#0F172A0F] rounded-xl cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <img src={person.avatar} alt={person.name} className="w-8 h-8 rounded-full border border-[#0F172A0F]" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-neutral-900">{person.name}</span>
                        <span className="text-[10px] text-[#64748B]">{person.role} ({person.area})</span>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      selected 
                        ? 'bg-neutral-950 border-neutral-950 text-white' 
                        : 'bg-white border-[#0F172A1C]'
                    }`}>
                      {selected && <Check size={11} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </form>

        {/* Modal Actions Footer */}
        <div className="border-t border-[#0F172A0F] p-5 pb-8 sm:pb-5 lg:px-8 bg-[#FAFAFA] flex justify-end gap-3 bg-white">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-[#0F172A1C] text-[#64748B] hover:text-[#111111] hover:bg-[#FAFAFA] font-bold rounded-xl text-xs transition-all tracking-wider uppercase"
          >
            Cancelar
          </button>
          <button 
            type="button"
            onClick={handleFormSubmit}
            className="px-6 py-2.5 bg-[#111111] text-white hover:bg-black font-bold rounded-xl text-xs transition-all tracking-wider hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] uppercase"
          >
            {eventToEdit ? 'Salvar Edição' : 'Agendar Compromisso'}
          </button>
        </div>
      </div>
    </div>
  );
}
