const fs = require('fs');
let content = fs.readFileSync('src/components/equipe/EquipeDashboard.tsx', 'utf8');

content = content.replace(
  /const \[members, setMembers\] = useState<any\[\]>\(\[\]\);/,
  `const { data: membersData, isLoading: isMembersLoading } = useMembers();\n  const { data: projectsData } = useProjects();\n\n  const [members, setMembers] = useState<any[]>([]);\n  useEffect(() => { if (membersData) setMembers(membersData); }, [membersData]);`
);
content = content.replace(
  /const \[projects, setProjects\] = useState<any\[\]>\(\[\]\);/,
  `const [projects, setProjects] = useState<any[]>([]);\n  useEffect(() => { if (projectsData) setProjects(projectsData); }, [projectsData]);`
);

content = content.replace(
  /import { useAuth } from '\.\.\/\.\.\/context\/AuthContext';/,
  `import { useAuth } from '../../context/AuthContext';\nimport { useMembers, useProjects } from '../../hooks/useCyzorQueries';\nimport { SkeletonDashboard } from '../common/skeletons/SkeletonDashboard';\nimport { useQueryClient } from '@tanstack/react-query';`
);

content = content.replace(
  /const syncData = async \(\) => \{[\s\S]*?setIsSyncing\(false\);\n    \}\n  \};/,
  `const queryClient = useQueryClient();\n  const syncData = async () => {\n    setIsSyncing(true);\n    await Promise.all([\n      queryClient.invalidateQueries({ queryKey: ['members'] }),\n      queryClient.invalidateQueries({ queryKey: ['projects'] })\n    ]);\n    setIsSyncing(false);\n  };`
);

content = content.replace(
  /useEffect\(\(\) => \{\n    if \(activeWorkspace\) \{\n      syncData\(\);\n    \}\n  \}, \[activeWorkspace\]\);/,
  ``
);

content = content.replace(
  /return \(\n    <div className="w-full/,
  `if (isMembersLoading) {\n    return <SkeletonDashboard />;\n  }\n\n  return (\n    <div className="w-full`
);

fs.writeFileSync('src/components/equipe/EquipeDashboard.tsx', content);
console.log('EquipeDashboard updated');
