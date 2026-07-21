// src/api/empresaApi.ts

/**
 * camada de API para a entidade visual "Empresa".
 * Todas as chamadas são delegadas para os endpoints existentes `/api/companies`.
 * Esta camada NÃO contém lógica de negócio – apenas tratamento de request/response.
 */

export interface Empresa {
  id: string;
  name: string;
  industry?: string;
  cnpj?: string;
  website?: string;
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  status?: string;
  logoUrl?: string;
  coverUrl?: string;
  // outros campos que o backend retorna
  [key: string]: any;
}

/** Listar todas as empresas (workspaces) */
export async function listarEmpresas(): Promise<Empresa[]> {
  const _fetchWithAuth = (globalThis as any).fetchWithAuth ?? ((url: string, options?: RequestInit) => fetch(url, options));
  const res = await _fetchWithAuth('/api/companies', { method: 'GET' });
  if (!res.ok) throw new Error('Failed to fetch empresas');
  return res.json();
}

/** Buscar empresa por id */
export async function buscarEmpresa(id: string): Promise<Empresa> {
  const _fetchWithAuth = (globalThis as any).fetchWithAuth ?? ((url: string, options?: RequestInit) => fetch(url, options));
  const res = await _fetchWithAuth(`/api/companies/${id}`, { method: 'GET' });
  if (!res.ok) throw new Error(`Failed to fetch empresa ${id}`);
  return res.json();
}

/** Criar nova empresa */
export async function criarEmpresa(data: Partial<Empresa>): Promise<Empresa> {
  const _fetchWithAuth = (globalThis as any).fetchWithAuth ?? ((url: string, options?: RequestInit) => fetch(url, options));
  const res = await _fetchWithAuth('/api/companies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create empresa');
  return res.json();
}

/** Atualizar empresa existente */
export async function atualizarEmpresa(id: string, data: Partial<Empresa>): Promise<Empresa> {
  const _fetchWithAuth = (globalThis as any).fetchWithAuth ?? ((url: string, options?: RequestInit) => fetch(url, options));
  const res = await _fetchWithAuth(`/api/companies/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update empresa ${id}`);
  return res.json();
}

/** Remover empresa */
export async function removerEmpresa(id: string): Promise<void> {
  const _fetchWithAuth = (globalThis as any).fetchWithAuth ?? ((url: string, options?: RequestInit) => fetch(url, options));
  const res = await _fetchWithAuth(`/api/companies/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Failed to delete empresa ${id}`);
}
