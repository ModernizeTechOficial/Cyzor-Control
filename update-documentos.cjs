const fs = require('fs');
let content = fs.readFileSync('src/components/DocumentacaoView.tsx', 'utf8');

content = content.replace(
  /const \[documents, setDocuments\] = useState<any\[\]>\(\[\]\);/,
  `const { data: documentsData, isLoading: isDocumentsLoading } = useDocuments();\n  const { data: projectsData } = useProjects();\n\n  const [documents, setDocuments] = useState<any[]>([]);\n  useEffect(() => { if (documentsData) setDocuments(documentsData); }, [documentsData]);`
);
content = content.replace(
  /const \[projects, setProjects\] = useState<any\[\]>\(\[\]\);/,
  `const [projects, setProjects] = useState<any[]>([]);\n  useEffect(() => { if (projectsData) setProjects(projectsData); }, [projectsData]);`
);

content = content.replace(
  /import { useAuth } from '\.\.\/context\/AuthContext';/,
  `import { useAuth } from '../context/AuthContext';\nimport { useDocuments, useProjects } from '../hooks/useCyzorQueries';\nimport { SkeletonDashboard } from './common/skeletons/SkeletonDashboard';\nimport { useQueryClient } from '@tanstack/react-query';`
);

content = content.replace(
  /const loadData = async \(\) => \{[\s\S]*?setIsSyncing\(false\);\n    \}\n  \};/,
  `const queryClient = useQueryClient();\n  const loadData = async () => {\n    setIsSyncing(true);\n    await Promise.all([\n      queryClient.invalidateQueries({ queryKey: ['documents'] }),\n      queryClient.invalidateQueries({ queryKey: ['projects'] })\n    ]);\n    setIsSyncing(false);\n  };`
);

content = content.replace(
  /useEffect\(\(\) => \{\n    if \(activeWorkspace\) \{\n      loadData\(\);\n    \}\n  \}, \[activeWorkspace\]\);/,
  ``
);

content = content.replace(
  /return \(\n    <div className="w-full/,
  `if (isDocumentsLoading) {\n    return <SkeletonDashboard />;\n  }\n\n  return (\n    <div className="w-full`
);

fs.writeFileSync('src/components/DocumentacaoView.tsx', content);
console.log('DocumentacaoView updated');
