import React from 'react';
import { useAuthorization } from '../../hooks/useAuthorization';

interface CanProps {
  permission: string;
  resourceType?: string;
  resourceId?: number;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function Can({ permission, resourceType, resourceId, fallback = null, children }: CanProps) {
  const { can, loading, context } = useAuthorization();
  const [allowed, setAllowed] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (!context) {
      setAllowed(false);
      return;
    }

    can(permission, resourceType, resourceId).then(setAllowed);
  }, [context, permission, resourceType, resourceId, can]);

  if (loading || allowed === null) {
    return <>{fallback}</>;
  }

  return <>{allowed ? children : fallback}</>;
}
