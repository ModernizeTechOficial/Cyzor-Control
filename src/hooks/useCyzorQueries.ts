import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

export function useProjects() {
  const { fetchWithAuth, activeWorkspace } = useAuth();
  
  return useQuery({
    queryKey: ['projects', activeWorkspace?.id],
    queryFn: async () => {
      const res = await fetchWithAuth('/api/projects');
      if (!res.ok) throw new Error('Falha ao carregar projetos');
      return res.json();
    },
    enabled: !!activeWorkspace,
  });
}

export function useCompanies() {
  const { fetchWithAuth, activeWorkspace } = useAuth();
  
  return useQuery({
    queryKey: ['companies', activeWorkspace?.id],
    queryFn: async () => {
      const res = await fetchWithAuth('/api/companies');
      if (!res.ok) throw new Error('Falha ao carregar empresas');
      return res.json();
    },
    enabled: !!activeWorkspace,
  });
}

export function useTasks() {
  const { fetchWithAuth, activeWorkspace } = useAuth();
  
  return useQuery({
    queryKey: ['tasks', activeWorkspace?.id],
    queryFn: async () => {
      const res = await fetchWithAuth('/api/tasks');
      if (!res.ok) throw new Error('Falha ao carregar tarefas');
      return res.json();
    },
    enabled: !!activeWorkspace,
  });
}

export function useFinance() {
  const { fetchWithAuth, activeWorkspace } = useAuth();
  
  return useQuery({
    queryKey: ['finance', activeWorkspace?.id],
    queryFn: async () => {
      const res = await fetchWithAuth('/api/finance');
      if (!res.ok) throw new Error('Falha ao carregar financeiro');
      return res.json();
    },
    enabled: !!activeWorkspace,
  });
}

export function useDocuments() {
  const { fetchWithAuth, activeWorkspace } = useAuth();
  
  return useQuery({
    queryKey: ['documents', activeWorkspace?.id],
    queryFn: async () => {
      const res = await fetchWithAuth('/api/documents');
      if (!res.ok) throw new Error('Falha ao carregar documentos');
      return res.json();
    },
    enabled: !!activeWorkspace,
  });
}

export function useMembers() {
  const { fetchWithAuth, activeWorkspace } = useAuth();
  
  return useQuery({
    queryKey: ['members', activeWorkspace?.id],
    queryFn: async () => {
      const res = await fetchWithAuth('/api/workspace/members');
      if (!res.ok) throw new Error('Falha ao carregar membros');
      return res.json();
    },
    enabled: !!activeWorkspace,
  });
}

export function useIdeas() {
  const { fetchWithAuth, activeWorkspace } = useAuth();
  
  return useQuery({
    queryKey: ['ideas', activeWorkspace?.id],
    queryFn: async () => {
      const res = await fetchWithAuth('/api/ideas');
      if (!res.ok) throw new Error('Falha ao carregar ideias');
      return res.json();
    },
    enabled: !!activeWorkspace,
  });
}

export function useProducts() {
  const { fetchWithAuth, activeWorkspace } = useAuth();
  
  return useQuery({
    queryKey: ['products', activeWorkspace?.id],
    queryFn: async () => {
      const res = await fetchWithAuth('/api/products');
      if (!res.ok) throw new Error('Falha ao carregar produtos');
      return res.json();
    },
    enabled: !!activeWorkspace,
  });
}
