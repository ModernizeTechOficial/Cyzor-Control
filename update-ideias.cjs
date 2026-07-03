const fs = require('fs');
let content = fs.readFileSync('src/components/IdeiasView.tsx', 'utf8');

content = content.replace(
  /const \[ideas, setIdeas\] = useState<any\[\]>\(\[\]\);/,
  `const { data: ideasData, isLoading: isIdeasLoading } = useIdeas();\n\n  const [ideas, setIdeas] = useState<any[]>([]);\n  useEffect(() => { if (ideasData) setIdeas(ideasData); }, [ideasData]);`
);

content = content.replace(
  /import { useAuth } from '\.\.\/context\/AuthContext';/,
  `import { useAuth } from '../context/AuthContext';\nimport { useIdeas } from '../hooks/useCyzorQueries';\nimport { SkeletonDashboard } from './common/skeletons/SkeletonDashboard';\nimport { useQueryClient } from '@tanstack/react-query';`
);

content = content.replace(
  /const loadIdeas = async \(\) => \{[\s\S]*?setIsSyncing\(false\);\n    \}\n  \};/,
  `const queryClient = useQueryClient();\n  const loadIdeas = async () => {\n    setIsSyncing(true);\n    await queryClient.invalidateQueries({ queryKey: ['ideas'] });\n    setIsSyncing(false);\n  };`
);

content = content.replace(
  /useEffect\(\(\) => \{\n    if \(activeWorkspace\) \{\n      loadIdeas\(\);\n    \}\n  \}, \[activeWorkspace\]\);/,
  ``
);

content = content.replace(
  /return \(\n    <div className="w-full/,
  `if (isIdeasLoading) {\n    return <SkeletonDashboard />;\n  }\n\n  return (\n    <div className="w-full`
);

fs.writeFileSync('src/components/IdeiasView.tsx', content);
console.log('IdeiasView updated');
