sed -i 's/setSelectedDoc(doc);/setSelectedDoc(doc);\n    setGlobalFilters({ ...globalFilters, documentId: doc.id });/g' src/components/DocumentacaoView.tsx
sed -i 's/setSelectedDoc(null);/setSelectedDoc(null);\n    if (globalFilters.documentId) setGlobalFilters({ ...globalFilters, documentId: undefined });/g' src/components/DocumentacaoView.tsx
