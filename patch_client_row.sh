sed -i 's/setEditingClient(client);/setEditingClient(client);\n    setGlobalFilters({ ...globalFilters, clientId: client.id });/g' src/components/ClientesView.tsx
sed -i 's/setEditingClient(null);/setEditingClient(null);\n    if (globalFilters.clientId) setGlobalFilters({ ...globalFilters, clientId: undefined });/g' src/components/ClientesView.tsx
