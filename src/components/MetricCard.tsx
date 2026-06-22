export default function MetricCard({ title, value, sub, icon: Icon }: { title: string, value: string, sub?: string, icon: any }) {
    return (
      <div className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[30px] p-8 flex flex-col justify-between min-h-[180px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:-translate-y-1 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] transform group-hover:scale-110 transition-transform duration-500 pointer-events-none">
          <Icon size={80} className="text-[#111111]" strokeWidth={1} />
        </div>
        
        <div className="flex justify-between items-start relative z-10">
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest">{title}</span>
          <div className="w-10 h-10 rounded-[20px] bg-[#FAFAFA] flex items-center justify-center border border-[#0F172A0F]">
            <Icon size={18} className="text-[#111111]" />
          </div>
        </div>
        
        <div className="flex items-end justify-between relative z-10 mt-6">
          <span className="text-4xl font-bold text-[#111111] tracking-tight">{value}</span>
          {sub && (
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#111111] bg-[#FAFAFA] border border-[#0F172A0F] px-2 py-1.5 rounded-[12px]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#111111]"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
              {sub}
            </div>
          )}
        </div>
      </div>
    );
  }
