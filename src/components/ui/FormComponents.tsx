import React from 'react';

interface LabelProps {
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}

export const FormLabel = ({ children, className = '', required = false }: LabelProps) => (
  <label className={`text-[10px] font-bold text-[#64748B] uppercase tracking-wider ${className}`}>
    {children} {required && <span className="text-rose-500">*</span>}
  </label>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const FormInput = ({ className = '', ...props }: InputProps) => (
  <input 
    {...props}
    className={`w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors bg-slate-50/40 ${className}`}
  />
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const FormSelect = ({ className = '', ...props }: SelectProps) => (
  <select 
    {...props}
    className={`w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors bg-slate-50/40 font-bold ${className}`}
  />
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const FormTextarea = ({ className = '', ...props }: TextareaProps) => (
  <textarea 
    {...props}
    className={`w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors bg-slate-50/40 resize-none ${className}`}
  />
);

interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const FormGroup = ({ children, className = '' }: FormGroupProps) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    {children}
  </div>
);
