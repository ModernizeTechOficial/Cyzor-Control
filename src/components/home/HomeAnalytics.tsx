import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function HomeAnalytics() {
  const data = [
    { name: 'Jan', receita: 4000, projetos: 24, deploys: 24 },
    { name: 'Fev', receita: 3000, projetos: 13, deploys: 22 },
    { name: 'Mar', receita: 2000, projetos: 98, deploys: 29 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {[ 'Receita', 'Projetos', 'Deploys' ].map((title) => (
        <div key={title} className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 mb-4">{title}</h3>
            <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <Area type="monotone" dataKey={title.toLowerCase()} stroke="#2563eb" fill="#dbeafe" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
      ))}
    </div>
  );
}
