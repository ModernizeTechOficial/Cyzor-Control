export default function HomeWorkspaceStatus() {
  const status = [
    { label: 'Servidor', value: 'Online' },
    { label: 'Cloud', value: 'Sync' },
    { label: 'API', value: '99%' },
  ];
  return (
    <div className="bg-white border border-slate-100 rounded-[24px] p-8 shadow-sm">
      <h2 className="text-lg font-bold text-[#111111] mb-6">Workspace Status</h2>
      <div className="grid grid-cols-3 gap-4">
        {status.map(s => (
          <div key={s.label} className="p-4 bg-slate-50 rounded-xl">
             <p className="text-[10px] text-slate-500 uppercase">{s.label}</p>
             <p className="text-xs font-bold mt-1 text-emerald-600">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
