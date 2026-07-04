sed -i 's/onClick={(e) => {/onClick={() => setExpanded(!expanded)}/g' src/components/Sidebar.tsx
sed -i 's/if (items.length > 0) setExpanded(!expanded);//g' src/components/Sidebar.tsx
sed -i 's/          onClick(e);//g' src/components/Sidebar.tsx
sed -i 's/        }}//g' src/components/Sidebar.tsx
sed -i 's/<span className="text-\[12px\] truncate">{label}<\/span>/<span className="text-[12px] truncate hover:underline" onClick={(e) => { e.stopPropagation(); onClick(e); }}>{label}<\/span>/g' src/components/Sidebar.tsx
