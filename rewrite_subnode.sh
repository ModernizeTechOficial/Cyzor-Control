sed -i '369,414c\
function SubNode({ icon: Icon, label, count, onClick, active, items, itemType, handleNavigate, companyId }: any) {\
  const [expanded, toggle, setExpanded] = useExpandedState(`sub_${label}_${companyId}`, false);\
\
  return (\
    <div className="flex flex-col relative">\
      <div \
        className={`group flex items-center justify-between py-1.5 pr-2 pl-[32px] rounded-lg cursor-pointer transition-all ${active ? '\''text-[#111111] font-bold bg-[#111111]/5'\'' : '\''text-[#64748B] hover:bg-[#F1F5F9]'\''}`}\
        onClick={() => setExpanded(!expanded)}\
      >\
        <div className="flex items-center gap-2 overflow-hidden flex-1">\
          {items.length > 0 ? (\
            <button className="p-0.5 text-[#94A3B8]" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>\
              {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}\
            </button>\
          ) : (\
             <div className="w-[16px]" />\
          )}\
          <Icon size={14} className="flex-shrink-0 text-[#94A3B8]" />\
          <span className="text-[12px] truncate hover:underline" onClick={(e) => { e.stopPropagation(); onClick(e); }}>{label}</span>\
        </div>\
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">\
          {count > 0 && !active && (\
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#0F172A05] text-[#64748B]">\
              {count}\
            </span>\
          )}\
          <button className="p-1 rounded text-[#94A3B8] hover:bg-black/5" onClick={(e) => { e.stopPropagation(); handleNavigate(itemType, { companyId, add: true }); }}><Plus size={12} /></button>\
        </div>\
      </div>\
      \
      <AnimatePresence>\
        {expanded && items.length > 0 && (\
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: '\''auto'\'', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex flex-col gap-0.5 pb-1 relative before:absolute before:left-[39px] before:top-0 before:bottom-2 before:w-[1px] before:bg-slate-100">\
            {items.map((item: any) => (\
              <LeafNode \
                key={item.id} \
                icon={Folder} \
                label={item.name} \
                indent={1} \
                onClick={() => handleNavigate(itemType, { companyId, projectId: item.id })} \
                active={false}\
              />\
            ))}\
          </motion.div>\
        )}\
      </AnimatePresence>\
    </div>\
  );\
}' src/components/Sidebar.tsx
