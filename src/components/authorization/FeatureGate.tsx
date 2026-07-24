import React from 'react';
import { useFeature } from '../../hooks/useAuthorization';

interface FeatureGateProps {
  feature: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function FeatureGate({ feature, fallback = null, children }: FeatureGateProps) {
  const { enabled, isLoading } = useFeature(feature);

  if (isLoading) {
    return <>{fallback}</>;
  }

  return <>{enabled ? children : fallback}</>;
}
