import { MoreHorizontal, ExternalLink, Play, Copy, Box, Activity, Github } from 'lucide-react';

export default function WorkspaceHeader({ product, companies = [] }: { product: any, companies?: any[] }) {
  const stack = ['Node.js', 'React', 'PostgreSQL']; // We leave a static stack since there's no DB structure for it, but it's a UI element.
  const companyName = companies.find(c => c.id === product.companyId)?.name || 'Empresa Interna';

  return (
    <div className="bg-[#111111] text-white pt-16 pb-20 px-8 relative overflow-hidden shrink-0">
      
      {/* Decorative Gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-blue-500/20 via-purple-500/10 to-transparent rounded-full blur-[100px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-[1600px] mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-white/10 flex items-center justify-center font-display font-bold text-4xl shadow-2xl relative group">
            {product.logo || product.name?.charAt(0) || 'P'}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[28px]" />
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-white/10 border border-white/5 rounded-md text-white/80">
                {companyName}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 border rounded-md ${
                product.status === 'Produção' ? 'bg-emerald-500/20 border-emerald-500/20 text-emerald-400' :
                product.status === 'Arquivado' ? 'bg-slate-500/20 border-slate-500/20 text-slate-400' :
                'bg-blue-500/20 border-blue-500/20 text-blue-400'
              }`}>
                {product.status || 'Em Desenvolvimento'}
              </span>
            </div>
            
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">{product.name}</h1>
              <span className="text-white/40 text-sm font-medium mb-1.5 flex items-center gap-1 cursor-pointer hover:text-white/80 transition-colors"
                onClick={() => {
                  const slug = product.slug || product.name?.toLowerCase().replace(/\s+/g, '-');
                  navigator.clipboard.writeText(slug);
                  alert('Slug copiado: ' + slug);
                }}
              >
                /{product.slug || product.name?.toLowerCase().replace(/\s+/g, '-')}
                <Copy size={12} />
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-1">
              {stack.map((tech: string, i: number) => (
                <div key={i} className="flex items-center gap-1.5 text-xs font-semibold text-white/60 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                  <Box size={12} className="opacity-50" />
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/15 transition-all">
            <Github size={16} />
            <span className="hidden sm:inline">Repositório</span>
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/15 transition-all">
            <ExternalLink size={16} />
            <span className="hidden sm:inline">Visualizar</span>
          </button>
          <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/5 text-white/80 hover:bg-white/10 hover:text-white transition-colors">
            <MoreHorizontal size={18} />
          </button>
        </div>

      </div>
    </div>
  );
}
