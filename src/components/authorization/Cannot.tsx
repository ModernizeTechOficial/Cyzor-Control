import React from 'react';
import { useAuthorization } from '../../hooks/useAuthorization';

interface CannotProps {
  permission: string;
  resourceType?: string;
  resourceId?: number;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function Cannot({ permission, resourceType, resourceId, fallback = null, children }: CannotProps) {
  const { cannot, loading, context } = useAuthorization();
  const [denied, setDenied] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (!context) {
      setDenied(false);
      return;
    }

    cannot(permission, resourceType, resourceId).then(setDenied);
  }, [context, permission, resourceType, resourceId, cannot]);

  if (loading || denied === null) {
    return <>{fallback}</>;
  }

  return <>{denied ? children : fallback}</>;
}
