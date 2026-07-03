const fs = require('fs');
let content = fs.readFileSync('src/components/ProdutosView.tsx', 'utf8');

// The file might use fetchWithAuth and useAuth
// Search for state declarations
content = content.replace(
  /const \[products, setProducts\] = useState<any\[\]>\(\[\]\);/,
  `const { data: productsData, isLoading: isProductsLoading } = useProducts();\n  const { data: companiesData } = useCompanies();\n  const { data: projectsData } = useProjects();\n\n  const [products, setProducts] = useState<any[]>([]);\n  useEffect(() => { if (productsData) setProducts(productsData); }, [productsData]);`
);

content = content.replace(
  /const \[companies, setCompanies\] = useState<any\[\]>\(\[\]\);/,
  `const [companies, setCompanies] = useState<any[]>([]);\n  useEffect(() => { if (companiesData) setCompanies(companiesData); }, [companiesData]);`
);
content = content.replace(
  /const \[projectsList, setProjectsList\] = useState<any\[\]>\(\[\]\);/,
  `const [projectsList, setProjectsList] = useState<any[]>([]);\n  useEffect(() => { if (projectsData) setProjectsList(projectsData); }, [projectsData]);`
);

// Add imports
content = content.replace(
  /import { useAuth } from '\.\.\/context\/AuthContext';/,
  `import { useAuth } from '../context/AuthContext';\nimport { useProducts, useCompanies, useProjects } from '../hooks/useCyzorQueries';\nimport { SkeletonDashboard } from './common/skeletons/SkeletonDashboard';\nimport { useQueryClient } from '@tanstack/react-query';`
);

// Replace syncData
content = content.replace(
  /const syncData = async \(\) => \{[\s\S]*?setIsSyncing\(false\);\n    \}\n  \};/,
  `const queryClient = useQueryClient();\n  const syncData = async () => {\n    setIsSyncing(true);\n    await Promise.all([\n      queryClient.invalidateQueries({ queryKey: ['products'] }),\n      queryClient.invalidateQueries({ queryKey: ['companies'] }),\n      queryClient.invalidateQueries({ queryKey: ['projects'] })\n    ]);\n    setIsSyncing(false);\n  };`
);

content = content.replace(
  /useEffect\(\(\) => \{\n    if \(activeWorkspace\) \{\n      syncData\(\);\n    \}\n  \}, \[activeWorkspace\]\);/,
  ``
);

// Loading rendering
content = content.replace(
  /return \(\n    <div className="w-full/,
  `if (isProductsLoading) {\n    return <SkeletonDashboard />;\n  }\n\n  return (\n    <div className="w-full`
);

fs.writeFileSync('src/components/ProdutosView.tsx', content);
console.log('ProdutosView updated');
