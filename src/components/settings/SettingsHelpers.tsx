import { Settings, CheckCircle2, Copy, Trash2, Loader2, Sparkles, AlertCircle } from 'lucide-react';

export function InputField({ 
  label, 
  value, 
  onChange, 
  isTextarea = false, 
  placeholder = '',
  disabled = false,
  type = 'text'
}: { 
  label: string, 
  value: string, 
  onChange: (val: string) => void, 
  isTextarea?: boolean,
  placeholder?: string,
  disabled?: boolean,
  type?: string
}) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-[11px] font-bold tracking-widest uppercase text-[#64748B] px-1">{label}</label>
      {isTextarea ? (
        <textarea 
          value={value || ''} 
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-[#FAFAFA] disabled:opacity-60 border border-[#0F172A0F] rounded-[16px] py-3.5 px-4 outline-none focus:border-[#111111]/30 transition-all text-[#111111] font-medium shadow-[0_2px_8px_rgba(0,0,0,0.01)] min-h-[100px] resize-none"
        />
      ) : (
        <input 
          type={type} 
          value={value || ''} 
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-[#FAFAFA] disabled:opacity-60 border border-[#0F172A0F] rounded-[16px] py-3.5 px-4 outline-none focus:border-[#111111]/30 transition-all text-[#111111] font-medium shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
        />
      )}
    </div>
  );
}

export function SelectField({ 
  label, 
  options, 
  value, 
  onChange,
  disabled = false
}: { 
  label: string, 
  options: { label: string; value: string }[] | string[], 
  value: string, 
  onChange: (val: string) => void,
  disabled?: boolean
}) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-[11px] font-bold tracking-widest uppercase text-[#64748B] px-1">{label}</label>
      <select 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full bg-[#FAFAFA] disabled:opacity-60 border border-[#0F172A0F] rounded-[16px] py-3.5 px-4 outline-none focus:border-[#111111]/30 transition-all text-[#111111] font-medium shadow-[0_2px_8px_rgba(0,0,0,0.01)] cursor-pointer"
      >
        {options.map((opt, i) => {
          const isString = typeof opt === 'string';
          const optLabel = isString ? opt : opt.label;
          const optVal = isString ? opt : opt.value;
          return <option key={i} value={optVal}>{optLabel}</option>;
        })}
      </select>
    </div>
  );
}

export function CheckboxOption({ 
  label, 
  checked = false, 
  onChange,
  disabled = false
}: { 
  label: string, 
  checked?: boolean, 
  onChange: (val: boolean) => void,
  disabled?: boolean
}) {
  return (
    <label className={`flex items-center gap-3 p-4 bg-[#FAFAFA] border border-[#0F172A0F] rounded-[16px] cursor-pointer hover:bg-[#FFFFFF] transition-colors ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
      <input 
        type="checkbox" 
        checked={checked} 
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 accent-[#111111]" 
      />
      <span className="text-sm font-bold text-[#111111]">{label}</span>
    </label>
  );
}

export function MiniCard({ 
  label, 
  value, 
  icon: Icon, 
  highlight = false 
}: { 
  label: string, 
  value: string | number, 
  icon: any, 
  highlight?: boolean 
}) {
  return (
    <div className={`border rounded-[20px] p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] ${highlight ? 'bg-[#111111] border-[#111111] text-white' : 'bg-[#FFFFFF] border-[#0F172A0F] text-[#111111]'}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${highlight ? 'bg-white/10 text-white' : 'bg-[#FAFAFA] border border-[#0F172A0F] text-[#64748B]'}`}>
        <Icon size={16} />
      </div>
      <div>
        <span className={`text-[10px] font-bold uppercase tracking-widest ${highlight ? 'text-white/60' : 'text-[#64748B]'}`}>{label}</span>
        <h4 className="text-2xl font-bold truncate">{value}</h4>
      </div>
    </div>
  );
}

export function BtnSave({ 
  label = "Salvar Configurações", 
  onClick, 
  loading = false,
  disabled = false
}: { 
  label?: string; 
  onClick?: () => void; 
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <button 
      disabled={loading || disabled}
      onClick={onClick}
      className="px-8 py-3.5 rounded-[16px] text-sm font-bold text-[#FFFFFF] bg-[#111111] hover:bg-black disabled:bg-[#111111]/50 shadow-[0_4px_14px_rgba(0,0,0,0.15)] transition-all flex items-center gap-2 cursor-pointer"
    >
      {loading ? <Loader2 className="animate-spin" size={16} /> : <Settings size={16} />}
      {label}
    </button>
  );
}

export function WorkspaceItem({ 
  name, 
  company, 
  type, 
  status, 
  active = false, 
  date, 
  onSelect,
  onDuplicate,
  onDelete
}: any) {
  return (
    <div 
      onClick={onSelect}
      className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 border rounded-[20px] transition-all cursor-pointer gap-4 ${active ? 'bg-[#FAFAFA] border-[#111111]/60 shadow-sm' : 'bg-[#FFFFFF] border-[#0F172A0F] hover:bg-[#FAFAFA]/50 hover:shadow-sm'}`}
    >
      <div className="flex gap-4 items-center">
        <div className={`w-12 h-12 rounded-[16px] flex flex-col items-center justify-center font-bold text-lg flex-shrink-0 ${active ? 'bg-[#111111] text-white' : 'bg-[#FAFAFA] border border-[#0F172A0F] text-[#111111]'}`}>
          {name.charAt(0)}
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[#111111]">{name}</span>
            {active && <span className="bg-[#111111] text-white text-[9px] uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle2 size={10} /> ATUAL</span>}
          </div>
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest">{company} • TYPE: {type}</span>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-6">
        <div className="flex flex-col text-left sm:text-right">
           <span className={`text-[10px] font-bold px-2 py-0.5 w-max rounded-md border sm:ml-auto ${status === 'Ativo' ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20' : 'bg-[#64748B]/10 text-[#64748B] border-[#0F172A0F]'}`}>{status}</span>
           <span className="text-[10px] text-[#64748B] mt-1">Criado em {date}</span>
        </div>
        <div className="flex items-center gap-2 border-l border-[#0F172A0F] pl-6" onClick={(e) => e.stopPropagation()}>
          {onDuplicate && (
            <button 
              onClick={onDuplicate}
              className="text-[#64748B] hover:text-[#111111] p-2 bg-[#FAFAFA] rounded-xl hover:bg-[#F1F5F9] transition-all" 
              title="Duplicar"
            >
              <Copy size={16} />
            </button>
          )}
          {onDelete && (
            <button 
              onClick={onDelete}
              className="text-[#64748B] hover:text-red-500 p-2 bg-[#FAFAFA] rounded-xl hover:bg-red-50 transition-all border border-transparent hover:border-red-100" 
              title="Excluir"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function Toast({ 
  message, 
  type = 'success', 
  onClose 
}: { 
  message: string, 
  type?: 'success' | 'error', 
  onClose: () => void 
}) {
  return (
    <div className={`fixed bottom-6 right-6 px-5 py-4 rounded-[16px] text-sm font-bold flex items-center gap-3 shadow-lg z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 ${type === 'success' ? 'bg-[#111111] text-white' : 'bg-red-600 text-white'}`}>
      {type === 'success' ? <CheckCircle2 className="text-[#10B981]" size={18} /> : <AlertCircle className="text-white animate-pulse" size={18} />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80 text-xs">✕</button>
    </div>
  );
}
