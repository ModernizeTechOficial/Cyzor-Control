const fs = require('fs');
let content = fs.readFileSync('src/components/EmpresasView.tsx', 'utf8');

content = content.replace(
  /const \[companies, setCompanies\] = useState<any\[\]>\(\[\]\);/,
  `const { data: companiesData, isLoading: isCompaniesLoading } = useCompanies();\n  const { data: projectsData } = useProjects();\n\n  const [companies, setCompanies] = useState<any[]>([]);\n  useEffect(() => { if (companiesData) setCompanies(companiesData); }, [companiesData]);`
);

content = content.replace(
  /const \[projects, setProjects\] = useState<any\[\]>\(\[\]\);/,
  `const [projects, setProjects] = useState<any[]>([]);\n  useEffect(() => { if (projectsData) setProjects(projectsData); }, [projectsData]);`
);

content = content.replace(
  /import { useAuth } from '\.\.\/context\/AuthContext';/,
  `import { useAuth } from '../context/AuthContext';\nimport { useCompanies, useProjects } from '../hooks/useCyzorQueries';\nimport { SkeletonDashboard } from './common/skeletons/SkeletonDashboard';\nimport { useQueryClient } from '@tanstack/react-query';`
);

content = content.replace(
  /const loadData = async \(\) => \{[\s\S]*?setIsSyncing\(false\);\n    \}\n  \};/,
  `const queryClient = useQueryClient();\n  const loadData = async () => {\n    setIsSyncing(true);\n    await Promise.all([\n      queryClient.invalidateQueries({ queryKey: ['companies'] }),\n      queryClient.invalidateQueries({ queryKey: ['projects'] })\n    ]);\n    setIsSyncing(false);\n  };`
);

content = content.replace(
  /useEffect\(\(\) => \{\n    if \(activeWorkspace\) \{\n      loadData\(\);\n    \}\n  \}, \[activeWorkspace\]\);/,
  ``
);

content = content.replace(
  /return \(\n    <div className="w-full/,
  `if (isCompaniesLoading) {\n    return <SkeletonDashboard />;\n  }\n\n  return (\n    <div className="w-full`
);

fs.writeFileSync('src/components/EmpresasView.tsx', content);
console.log('EmpresasView updated');
