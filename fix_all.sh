sed -i 's/else if (hasChildren && onExpand) onExpand(e);/else if (hasChildren && onExpand) onExpand(e);\n          }}/g' src/components/Sidebar.tsx
sed -i '337,338c\        onClick={() => setExpanded(!expanded)}' src/components/Sidebar.tsx
sed -i '374,378c\        onClick={() => setExpanded(!expanded)}' src/components/Sidebar.tsx
