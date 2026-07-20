import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ActionButton {
  label: string;
  icon?: React.ElementType;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
}

interface StandardHeaderProps {
  title: string;
  subtitle: string;
  breadcrumb?: { label: string; onClick?: () => void }[];
  actions?: ActionButton[];
  children?: React.ReactNode;
}

export default function StandardHeader({ title, subtitle, breadcrumb, actions, children }: StandardHeaderProps) {
  const { activeWorkspace } = useAuth();

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative text-left py-2 px-1">
      <div className="flex flex-col gap-3">
        {/* Breadcrumb - More subtle */}
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#64748B]/60">
          <span className="hover:text-[#111111] cursor-pointer transition-colors">Workspace</span>
          <ChevronRight size={10} className="opacity-30" />
          {breadcrumb?.map((item, index) => (
            <React.Fragment key={index}>
              <span 
                className={`${item.onClick ? 'hover:text-[#111111] cursor-pointer' : 'text-[#64748B]'} transition-colors`}
                onClick={item.onClick}
              >
                {item.label}
              </span>
              {index < breadcrumb.length - 1 && <ChevronRight size={10} className="opacity-30" />}
            </React.Fragment>
          )) || <span className="text-[#111111]">{title}</span>}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-display font-black text-[#111111] tracking-tight leading-none">
              {title}
            </h1>
            {activeWorkspace && (
              <div className="px-2.5 py-1 bg-[#F1F5F9] border border-[#0F172A05] rounded-lg flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#111111]/20 animate-pulse" />
                <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">
                  {activeWorkspace.name}
                </span>
              </div>
            )}
          </div>
          <p className="text-[#64748B] text-base font-medium max-w-xl leading-relaxed opacity-80">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        {actions?.map((action, i) => {
          const isPrimary = action.variant === 'primary' || !action.variant;
          const isGhost = action.variant === 'ghost';
          
          if (isPrimary) {
            return (
              <button 
                key={i}
                onClick={action.onClick}
                disabled={action.disabled}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#111111] text-white font-bold text-xs uppercase tracking-wider hover:bg-black hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {action.icon && <action.icon size={16} />}
                <span>{action.label}</span>
              </button>
            );
          }

          return (
            <button 
              key={i}
              onClick={action.onClick}
              disabled={action.disabled}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-[#0F172A0F] text-[#111111] font-bold text-xs uppercase tracking-wider hover:bg-[#FAFAFA] transition-all cursor-pointer disabled:opacity-50"
            >
              {action.icon && <action.icon size={16} />}
              <span>{action.label}</span>
            </button>
          );
        })}
        {children}
      </div>
    </div>
  );
}
