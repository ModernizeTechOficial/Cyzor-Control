import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
  style?: React.CSSProperties;
}

export function Skeleton({ className = '', variant = 'rectangular', style }: SkeletonProps) {
  const baseClasses = "animate-pulse bg-neutral-200/60";
  let variantClasses = "";
  
  if (variant === 'circular') {
    variantClasses = "rounded-full";
  } else if (variant === 'text') {
    variantClasses = "rounded";
  } else {
    variantClasses = "rounded-xl"; // default rounded for our platform
  }

  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`} style={style} />
  );
}
