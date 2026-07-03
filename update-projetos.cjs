const fs = require('fs');
let content = fs.readFileSync('src/components/ProjetosView.tsx', 'utf8');

content = content.replace(
  /const \[projects, setProjects\] = useState<any\[\]>\(\[\]\);/,
  `const { data: projectsData, isLoading: isProjectsLoading } = useProjects();\n  const { data: companiesData, isLoading: isCompaniesLoading } = useCompanies();\n  const { data: tasksData } = useTasks();\n  const { data: financeData } = useFinance();\n  const { data: docsData } = useDocuments();\n  const { data: membersData } = useMembers();\n\n  const [projects, setProjects] = useState<any[]>([]);\n  useEffect(() => { if (projectsData) setProjects(projectsData); }, [projectsData]);`
);

content = content.replace(
  /const \[companies, setCompanies\] = useState<any\[\]>\(\[\]\);/,
  `const [companies, setCompanies] = useState<any[]>([]);\n  useEffect(() => { if (companiesData) setCompanies(companiesData); }, [companiesData]);`
);
content = content.replace(
  /const \[tasks, setTasks\] = useState<any\[\]>\(\[\]\);/,
  `const [tasks, setTasks] = useState<any[]>([]);\n  useEffect(() => { if (tasksData) setTasks(tasksData); }, [tasksData]);`
);
content = content.replace(
  /const \[financeEntries, setFinanceEntries\] = useState<any\[\]>\(\[\]\);/,
  `const [financeEntries, setFinanceEntries] = useState<any[]>([]);\n  useEffect(() => { if (financeData) setFinanceEntries(financeData); }, [financeData]);`
);
content = content.replace(
  /const \[documents, setDocuments\] = useState<any\[\]>\(\[\]\);/,
  `const [documents, setDocuments] = useState<any[]>([]);\n  useEffect(() => { if (docsData) setDocuments(docsData); }, [docsData]);`
);
content = content.replace(
  /const \[members, setMembers\] = useState<any\[\]>\(\[\]\);/,
  `const [members, setMembers] = useState<any[]>([]);\n  useEffect(() => { if (membersData) setMembers(membersData); }, [membersData]);`
);

content = content.replace(
  /import { useAuth } from '\.\.\/context\/AuthContext\.tsx';/,
  `import { useAuth } from '../context/AuthContext.tsx';\nimport { useProjects, useCompanies, useTasks, useFinance, useDocuments, useMembers } from '../hooks/useCyzorQueries';\nimport { SkeletonDashboard } from './common/skeletons/SkeletonDashboard';\nimport { useQueryClient } from '@tanstack/react-query';`
);

content = content.replace(
  /const syncPlatformData = async \(\) => \{[\s\S]*?setIsSyncing\(false\);\n    \}\n  \};/,
  `const queryClient = useQueryClient();\n  const syncPlatformData = async () => {\n    setIsSyncing(true);\n    await Promise.all([\n      queryClient.invalidateQueries({ queryKey: ['projects'] }),\n      queryClient.invalidateQueries({ queryKey: ['companies'] }),\n      queryClient.invalidateQueries({ queryKey: ['tasks'] }),\n      queryClient.invalidateQueries({ queryKey: ['finance'] }),\n      queryClient.invalidateQueries({ queryKey: ['documents'] }),\n      queryClient.invalidateQueries({ queryKey: ['members'] })\n    ]);\n    setIsSyncing(false);\n  };`
);

content = content.replace(
  /useEffect\(\(\) => \{\n    syncPlatformData\(\);\n  \}, \[activeWorkspace\]\);/,
  ``
);

content = content.replace(
  /return \(\n    <div className="w-full/,
  `if (isProjectsLoading || isCompaniesLoading) {\n    return <SkeletonDashboard />;\n  }\n\n  return (\n    <div className="w-full`
);

fs.writeFileSync('src/components/ProjetosView.tsx', content);
console.log('ProjetosView updated');
