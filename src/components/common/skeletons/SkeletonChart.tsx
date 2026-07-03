import React from 'react';
import { Skeleton } from './Skeleton';

export function SkeletonChart() {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm w-full flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-5 w-32 mb-1" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="h-48 w-full flex items-end justify-between gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton 
            key={`bar-${i}`} 
            className="w-full rounded-t-sm" 
            style={{ height: `${20 + Math.random() * 80}%` }} 
          />
        ))}
      </div>
    </div>
  );
}
