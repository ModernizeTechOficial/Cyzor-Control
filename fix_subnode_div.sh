sed -i '372,378c\
      <div\
        className={`group flex items-center justify-between py-1.5 pr-2 pl-[32px] rounded-lg cursor-pointer transition-all ${active ? '\''text-[#111111] font-bold bg-[#111111]/5'\'' : '\''text-[#64748B] hover:bg-[#F1F5F9]'\''}`}\
        onClick={() => setExpanded(!expanded)}\
      >' src/components/Sidebar.tsx
