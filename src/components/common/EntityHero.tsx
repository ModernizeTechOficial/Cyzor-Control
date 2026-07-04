import React from 'react';
import { Copy, Folder, Layers, Building2, Pencil, Check } from 'lucide-react';

export interface EntityBadge {
  label: string;
  variant?: 'primary' | 'secondary' | 'neutral' | 'accent' | string;
}

export interface EntityHeroProps {
  entityType: 'project' | 'product' | 'company' | 'client' | 'idea';
  name: string;
  description?: string;
  logoUrl?: string;
  coverUrl?: string;
  breadcrumbs?: string[];
  badges?: EntityBadge[];
  isEditing?: boolean;
  onNameChange?: (name: string) => void;
  onSaveName?: () => void;
  onStartEdit?: () => void;
  actions?: React.ReactNode;
}

export const EntityHero: React.FC<EntityHeroProps> = ({
  entityType,
  name,
  description,
  logoUrl,
  coverUrl,
  breadcrumbs = [],
  badges = [],
  isEditing = false,
  onNameChange,
  onSaveName,
  onStartEdit,
  actions
}) => {
  const getInitials = (val: string) => {
    if (!val) return '?';
    const parts = val.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const getEntityIcon = () => {
    switch (entityType) {
      case 'project': return <Folder size={24} />;
      case 'product': return <Layers size={24} />;
      case 'company': return <Building2 size={24} />;
      default: return <Layers size={24} />;
    }
  };

  const copySlug = () => {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    navigator.clipboard.writeText(slug);
  };

  return (
    <div className="bg-[#111111] text-white pt-12 pb-16 px-8 relative overflow-hidden shrink-0">
      
      {/* Cover Image Background */}
      {coverUrl ? (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src={coverUrl} 
            alt="Capa da Entidade" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-25 filter blur-[1px]" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/70 to-[#111111]/30" />
        </div>
      ) : (
        /* Decorative Gradients */
        <>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-blue-500/20 via-purple-500/10 to-transparent rounded-full blur-[100px] opacity-60 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full blur-[80px] pointer-events-none" />
        </>
      )}

      <div className="relative z-10 max-w-[1600px] mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          
          {/* Logo */}
          <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-white/10 flex items-center justify-center font-display font-bold text-4xl shadow-2xl relative group overflow-hidden shrink-0">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={name} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain p-2 bg-white" 
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-[#111111] flex items-center justify-center text-white text-3xl font-bold">
                {getInitials(name)}
              </div>
            )}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[28px]" />
          </div>
          
          <div className="flex flex-col gap-3 text-left">
            
            {/* Breadcrumbs & Perspective */}
            {breadcrumbs.length > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                {breadcrumbs.map((bc, idx) => (
                  <React.Fragment key={idx}>
                    <span>{bc}</span>
                    {idx < breadcrumbs.length - 1 && <span className="opacity-50">/</span>}
                  </React.Fragment>
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-4 flex-wrap">
              {isEditing && onNameChange ? (
                <div className="flex items-center gap-2">
                  <input
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight bg-white/10 border border-white/20 rounded-xl px-3 py-1 outline-none focus:border-white/40 shadow-sm w-[300px] sm:w-[400px]"
                  />
                  {onSaveName && (
                    <button 
                      onClick={onSaveName}
                      className="p-2 bg-white text-black hover:bg-slate-100 rounded-xl transition-all cursor-pointer shadow-sm"
                      title="Salvar Nome"
                    >
                      <Check size={18} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">{name}</h1>
                  {onStartEdit && (
                    <button 
                      onClick={onStartEdit}
                      className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                      title="Editar Nome"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                </div>
              )}
              
              {!isEditing && (
                <span 
                  className="text-white/40 text-xs font-medium flex items-center gap-1 cursor-pointer hover:text-white/80 transition-colors mt-1"
                  onClick={copySlug}
                  title="Copiar Slug"
                >
                  /{name.toLowerCase().replace(/\s+/g, '-')}
                  <Copy size={11} />
                </span>
              )}
            </div>

            {/* Description */}
            {description && (
              <p className="text-xs text-white/70 max-w-2xl font-medium leading-relaxed mb-1">
                {description}
              </p>
            )}

            {/* Badges */}
            {badges.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {badges.map((badge, idx) => (
                  <span 
                    key={idx}
                    className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${
                      badge.variant === 'primary' ? 'bg-indigo-500/20 border-indigo-500/20 text-indigo-400' :
                      badge.variant === 'secondary' ? 'bg-emerald-500/20 border-emerald-500/20 text-emerald-400' :
                      badge.variant === 'accent' ? 'bg-blue-500/20 border-blue-500/20 text-blue-400' :
                      'bg-white/10 border-white/5 text-white/80'
                    }`}
                  >
                    {badge.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        {actions && (
          <div className="flex items-center gap-3 w-full md:w-auto self-end md:self-auto justify-end">
            {actions}
          </div>
        )}

      </div>
    </div>
  );
};
