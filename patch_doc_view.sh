sed -i 's/export default function DocumentacaoView() {/import { useNavigation } from "..\/context\/NavigationContext";\n\nexport default function DocumentacaoView() {\n  const { globalFilters, setGlobalFilters } = useNavigation();/g' src/components/DocumentacaoView.tsx
sed -i '/const \[selectedDoc, setSelectedDoc\]/a \
\
  useEffect(() => {\n    if (globalFilters.documentId && documents && documents.length > 0) {\n      const p = documents.find((proj: any) => proj.id.toString() === globalFilters.documentId.toString());\n      if (p) setSelectedDoc(p);\n    }\n  }, [globalFilters.documentId, documents]);\n' src/components/DocumentacaoView.tsx
