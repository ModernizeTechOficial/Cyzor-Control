import { Upload, X, Eye } from 'lucide-react';
import { useState, useRef } from 'react';

interface AssetUploaderProps {
  label: string;
  url: string;
  onChange: (url: string) => void;
  size: string;
  onSizeChange: (size: string) => void;
  onUpload: (file: File) => void;
}

export default function AssetUploader({ label, url, onChange, size, onSizeChange, onUpload }: AssetUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className="flex flex-col gap-2 p-4 bg-[#FAFAFA] border border-[#0F172A0F] rounded-[16px]">
      <label className="text-[10px] font-bold tracking-widest uppercase text-[#64748B]">{label}</label>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={url} 
          onChange={(e) => onChange(e.target.value)} 
          className="w-full bg-white border border-[#0F172A0F] rounded-[12px] py-2 px-3 text-sm font-medium text-[#111111] outline-none" 
          placeholder="URL ou upload..."
        />
        <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && onUpload(e.target.files[0])} className="hidden" accept="image/png, image/svg+xml, image/jpeg, image/webp" />
        <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-white border border-[#0F172A0F] rounded-[12px] hover:bg-[#F1F5F9] transition-colors">
          <Upload size={16} />
        </button>
        {url && (
            <button onClick={handleRemove} className="p-2 bg-white border border-[#0F172A0F] rounded-[12px] hover:bg-red-50 text-red-500 transition-colors">
            <X size={16} />
            </button>
        )}
      </div>
      {url && (
        <div className="mt-2 flex items-center justify-between gap-4">
          <div className="w-16 h-16 bg-white border border-[#0F172A0F] rounded-[12px] overflow-hidden flex items-center justify-center p-1">
            <img src={url} alt="Preview" className="max-w-full max-h-full object-contain" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-[#64748B]">Tamanho (px)</label>
            <input type="number" value={size} onChange={(e) => onSizeChange(e.target.value)} className="w-20 bg-white border border-[#0F172A0F] rounded-[12px] py-1 px-2 text-sm font-medium text-[#111111]" />
          </div>
        </div>
      )}
      <p className="text-[9px] text-[#64748B] mt-1">PNG, SVG, JPG, WebP. Recomendado: {label.includes('Logo') ? '160x40' : '40x40'}</p>
    </div>
  );
}
