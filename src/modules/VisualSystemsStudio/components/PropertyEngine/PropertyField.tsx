import React from 'react';
import { PropertyDefinition, PropertyType } from '../../types';
import { AlertCircle, HelpCircle } from 'lucide-react';

interface PropertyFieldProps {
  property: PropertyDefinition;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  allValues: Record<string, any>;
}

const PropertyField: React.FC<PropertyFieldProps> = ({ property, value, onChange, error, allValues }) => {
  // Check dependency
  if (property.dependency) {
    const depValue = allValues[property.dependency.property];
    if (property.dependency.equals !== undefined && depValue !== property.dependency.equals) return null;
    if (property.dependency.notEquals !== undefined && depValue === property.dependency.notEquals) return null;
    if (property.dependency.includes !== undefined && !property.dependency.includes.includes(depValue)) return null;
  }

  const renderInput = () => {
    switch (property.type) {
      case 'string':
        return (
          <input
            type="text"
            value={value || ''}
            placeholder={property.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-4 py-3 bg-[#FAFAFA] border ${error ? 'border-rose-500' : 'border-[#0F172A0F]'} rounded-2xl text-[#111111] text-sm font-medium focus:border-blue-500/30 focus:bg-white outline-none transition-all placeholder:text-[#64748B]/30 shadow-sm`}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value ?? ''}
            placeholder={property.placeholder}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className={`w-full px-4 py-3 bg-[#FAFAFA] border ${error ? 'border-rose-500' : 'border-[#0F172A0F]'} rounded-2xl text-[#111111] text-sm font-medium focus:border-blue-500/30 focus:bg-white outline-none transition-all placeholder:text-[#64748B]/30 shadow-sm`}
          />
        );
      case 'boolean':
        return (
          <button
            onClick={() => onChange(!value)}
            className={`flex items-center justify-between w-full p-4 rounded-2xl border transition-all ${value ? 'bg-blue-500 border-blue-600 text-white' : 'bg-[#FAFAFA] border-[#0F172A0F] text-[#64748B]'}`}
          >
            <span className="text-xs font-bold uppercase tracking-widest">{property.label}</span>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${value ? 'bg-white/30' : 'bg-[#64748B]/10'}`}>
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${value ? 'left-4.5' : 'left-0.5'}`} />
            </div>
          </button>
        );
      case 'select':
        return (
          <select
            value={value || property.defaultValue || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-4 py-3 bg-[#FAFAFA] border ${error ? 'border-rose-500' : 'border-[#0F172A0F]'} rounded-2xl text-[#111111] text-sm font-bold outline-none focus:bg-white transition-all shadow-sm`}
          >
            {property.options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      case 'code':
      case 'json':
        return (
          <div className="space-y-2">
            <textarea
              value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
              onChange={(e) => onChange(e.target.value)}
              placeholder={property.placeholder}
              className={`w-full px-4 py-3 bg-[#111111] text-blue-400 font-mono text-[11px] rounded-2xl border ${error ? 'border-rose-500' : 'border-transparent'} outline-none focus:border-blue-500/30 transition-all min-h-[120px] resize-none shadow-xl`}
            />
          </div>
        );
      case 'header_list':
        return (
          <div className="space-y-2">
            {(value || []).map((header: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={header.key}
                  onChange={(e) => {
                    const newList = [...(value || [])];
                    newList[idx] = { ...newList[idx], key: e.target.value };
                    onChange(newList);
                  }}
                  placeholder="Key"
                  className="flex-1 px-3 py-1.5 bg-[#FAFAFA] border border-[#0F172A0F] rounded-xl text-[10px] font-bold outline-none"
                />
                <input
                  type="text"
                  value={header.value}
                  onChange={(e) => {
                    const newList = [...(value || [])];
                    newList[idx] = { ...newList[idx], value: e.target.value };
                    onChange(newList);
                  }}
                  placeholder="Value"
                  className="flex-1 px-3 py-1.5 bg-[#FAFAFA] border border-[#0F172A0F] rounded-xl text-[10px] font-bold outline-none"
                />
                <button 
                  onClick={() => {
                    const newList = (value || []).filter((_: any, i: number) => i !== idx);
                    onChange(newList);
                  }}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                >
                  <AlertCircle size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={() => onChange([...(value || []), { key: '', value: '' }])}
              className="w-full py-2 rounded-xl border border-dashed border-[#0F172A15] text-[#64748B] text-[10px] font-black uppercase tracking-widest hover:bg-[#FAFAFA] transition-all"
            >
              + Add Header
            </button>
          </div>
        );
      case 'column_list':
        return (
          <div className="space-y-2">
            {(value || []).map((col: any, idx: number) => (
              <div key={idx} className="flex flex-col gap-2 p-3 bg-[#FAFAFA] border border-[#0F172A0F] rounded-xl shadow-sm relative group/col">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={col.name}
                    onChange={(e) => {
                      const newList = [...(value || [])];
                      newList[idx] = { ...newList[idx], name: e.target.value };
                      onChange(newList);
                    }}
                    placeholder="column_name"
                    className="flex-1 px-2 py-1 bg-white border border-[#0F172A0F] rounded text-[11px] font-bold outline-none"
                  />
                  <select
                    value={col.type}
                    onChange={(e) => {
                      const newList = [...(value || [])];
                      newList[idx] = { ...newList[idx], type: e.target.value };
                      onChange(newList);
                    }}
                    className="px-1 py-1 bg-white border border-[#0F172A0F] rounded text-[10px] font-bold"
                  >
                    <option value="uuid">UUID</option>
                    <option value="varchar">VARCHAR</option>
                    <option value="int">INT</option>
                    <option value="boolean">BOOL</option>
                    <option value="timestamp">TIME</option>
                  </select>
                  <button 
                    onClick={() => {
                      const newList = (value || []).filter((_: any, i: number) => i !== idx);
                      onChange(newList);
                    }}
                    className="p-1 text-rose-500 opacity-0 group-hover/col:opacity-100 transition-opacity"
                  >
                    <AlertCircle size={14} />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() => onChange([...(value || []), { name: 'new_col', type: 'varchar' }])}
              className="w-full py-2 rounded-xl border border-dashed border-[#0F172A15] text-[#64748B] text-[10px] font-black uppercase tracking-widest hover:bg-[#FAFAFA] transition-all"
            >
              + Add Column
            </button>
          </div>
        );
      default:
        return <div className="text-xs text-rose-500">Field type {property.type} not implemented</div>;
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between ml-1">
        <label className="text-[11px] font-bold text-[#64748B] flex items-center gap-1.5">
          {property.label}
          {property.validation?.required && <span className="text-rose-500">*</span>}
        </label>
        {property.description && (
          <div className="group relative">
            <HelpCircle size={12} className="text-[#64748B]/40 cursor-help" />
            <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-[#111111] text-white text-[9px] rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-2xl z-50">
              {property.description}
            </div>
          </div>
        )}
      </div>
      {renderInput()}
      {error && <span className="text-[10px] font-bold text-rose-500 ml-1 flex items-center gap-1">
        <AlertCircle size={10} /> {error}
      </span>}
    </div>
  );
};

export default PropertyField;
