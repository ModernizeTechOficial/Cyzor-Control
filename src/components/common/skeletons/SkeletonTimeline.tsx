import React from 'react';
import { Skeleton } from './Skeleton';

interface SkeletonTimelineProps {
  rows?: number;
}

export function SkeletonTimeline({ rows = 5 }: SkeletonTimelineProps) {
  return (
    <div className="w-full bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-center mb-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      
      <div className="flex gap-4 border-b border-slate-100 pb-2">
        <Skeleton className="h-4 w-32" />
        <div className="flex-1 flex justify-between">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-4 w-12" />
          ))}
        </div>
      </div>
      
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={`row-${i}`} className="flex gap-4 items-center">
            <div className="w-32 flex flex-col gap-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="flex-1 relative h-10 bg-slate-50 rounded-lg flex items-center">
              <Skeleton className="absolute h-8 rounded-xl" style={{ 
                left: `${10 + (i * 15)}%`, 
                width: `${20 + (i % 3) * 10}%` 
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
