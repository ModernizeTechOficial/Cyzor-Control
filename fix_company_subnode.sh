sed -i '335,338c\
      <div\
        className={`group flex items-center justify-between py-1.5 pr-2 pl-2 rounded-lg cursor-pointer transition-all ${isActive ? '\''bg-[#111111]/5 text-[#111111]'\'' : '\''text-[#475569] hover:bg-[#F1F5F9]'\''}`}\
        onClick={() => setExpanded(!expanded)}\
      >' src/components/Sidebar.tsx
