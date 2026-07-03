const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

// Replace syncData and state initializations
content = content.replace(
  /const \[projects, setProjects\] = useState<any\[\]>\(\[\]\);/,
  `const { data: projectsData, isLoading: isProjectsLoading } = useProjects();\n  const { data: companiesData, isLoading: isCompaniesLoading } = useCompanies();\n  const { data: financeData } = useFinance();\n  const { data: membersData } = useMembers();\n\n  const [projects, setProjects] = useState<any[]>([]);\n  useEffect(() => { if (projectsData) setProjects(projectsData); }, [projectsData]);`
);

content = content.replace(
  /const \[clients, setClients\] = useState<any\[\]>\(\[\]\);/,
  `const [clients, setClients] = useState<any[]>([]);\n  useEffect(() => { if (companiesData) setClients(companiesData); }, [companiesData]);`
);
content = content.replace(
  /const \[finance, setFinance\] = useState<any\[\]>\(\[\]\);/,
  `const [finance, setFinance] = useState<any[]>([]);\n  useEffect(() => { if (financeData) setFinance(financeData); }, [financeData]);`
);
content = content.replace(
  /const \[members, setMembers\] = useState<any\[\]>\(\[\]\);/,
  `const [members, setMembers] = useState<any[]>([]);\n  useEffect(() => { if (membersData) setMembers(membersData); }, [membersData]);`
);

// Add imports
content = content.replace(
  /import { useAuth } from '\.\.\/context\/AuthContext';/,
  `import { useAuth } from '../context/AuthContext';\nimport { useProjects, useCompanies, useFinance, useMembers } from '../hooks/useCyzorQueries';\nimport { SkeletonDashboard } from './common/skeletons/SkeletonDashboard';\nimport { useQueryClient } from '@tanstack/react-query';`
);

content = content.replace(
  /const syncData = async \(\) => \{[\s\S]*?setIsSyncing\(false\);\n    \}\n  \};/,
  `const queryClient = useQueryClient();\n  const syncData = async () => {\n    setIsSyncing(true);\n    await Promise.all([\n      queryClient.invalidateQueries({ queryKey: ['projects'] }),\n      queryClient.invalidateQueries({ queryKey: ['companies'] }),\n      queryClient.invalidateQueries({ queryKey: ['finance'] }),\n      queryClient.invalidateQueries({ queryKey: ['members'] })\n    ]);\n    setIsSyncing(false);\n  };`
);

content = content.replace(
  /useEffect\(\(\) => \{\n    if \(activeWorkspace\) \{\n      syncData\(\);\n    \}\n  \}, \[activeWorkspace\]\);/,
  ``
);

// Add loading state rendering
content = content.replace(
  /return \(\n    <div className="w-full/,
  `if (isProjectsLoading || isCompaniesLoading) {\n    return <SkeletonDashboard />;\n  }\n\n  return (\n    <div className="w-full`
);

fs.writeFileSync('src/components/DashboardView.tsx', content);
console.log('DashboardView updated');
