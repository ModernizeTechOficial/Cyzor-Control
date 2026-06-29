interface Activity {
  id: string;
  action: string;
  time: string;
}

export default function HomeTimeline({ activities }: { activities: Activity[] }) {
  return (
    <div className="bg-white border border-slate-100 rounded-[24px] p-8 shadow-sm">
      <h2 className="text-lg font-bold text-[#111111] mb-6">Timeline</h2>
      <div className="space-y-4">
        {activities.map(activity => (
          <div key={activity.id} className="flex gap-4">
            <span className="text-xs text-slate-400 font-mono w-16">{activity.time}</span>
            <p className="text-sm text-[#111111]">{activity.action}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
