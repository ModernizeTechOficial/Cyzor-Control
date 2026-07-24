import React from 'react';
import { useAuthorization } from '../../hooks/useAuthorization';

interface PermissionGateProps {
  permission: string;
  resourceType?: string;
  resourceId?: number;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGate({ permission, resourceType, resourceId, fallback = null, children }: PermissionGateProps) {
  return <Can permission={permission} resourceType={resourceType} resourceId={resourceId} fallback={fallback}>{children}</Can>;
}
