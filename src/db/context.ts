import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContextType {
  tenantId: string; // UUID of the current tenant
  userId: string;   // Firebase Auth UID of the current user
  tenant: {
    id: string;
    name: string;
    slug: string;
    plan: string;
  };
}

export const tenantContextStorage = new AsyncLocalStorage<TenantContextType>();

/**
 * Returns the currently active tenant context for the request.
 * Throws an error if called outside an active request context.
 */
export function getTenantContext(): TenantContextType {
  const store = tenantContextStorage.getStore();
  if (!store) {
    throw new Error('Tenant context is not initialized. Ensure tenantMiddleware is applied to this route.');
  }
  return store;
}

/**
 * Safely returns the currently active tenant context or undefined if outside a request context.
 */
export function getTenantContextSafe(): TenantContextType | undefined {
  return tenantContextStorage.getStore();
}
