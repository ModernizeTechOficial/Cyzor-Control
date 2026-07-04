sed -i '/const \[editingClient/a \
\
  useEffect(() => {\n    if (globalFilters.clientId && clients && clients.length > 0) {\n      const p = clients.find((proj: any) => proj.id.toString() === globalFilters.clientId.toString());\n      if (p) {\n        setEditingClient(p);\n        setIsModalOpen(true);\n        setActiveModalTab('\''visao_360'\'');\n      }\n    }\n  }, [globalFilters.clientId, clients]);\n' src/components/ClientesView.tsx
