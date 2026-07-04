sed -i '/const \[selectedProject/a \
\
  useEffect(() => {\n    if (globalFilters.projectId && projectsData && projectsData.length > 0) {\n      const p = projectsData.find((proj: any) => proj.id.toString() === globalFilters.projectId.toString());\n      if (p) setSelectedProject(p);\n    }\n  }, [globalFilters.projectId, projectsData]);\n' src/components/ProjetosView.tsx
