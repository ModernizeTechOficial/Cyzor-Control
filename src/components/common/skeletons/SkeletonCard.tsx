import React from 'react';
import { Skeleton } from './Skeleton';

export function SkeletonCard() {
  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 flex flex-col gap-4 shadow-sm w-full">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-6 w-2/4" />
      <div className="flex gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="mt-2 pt-4 border-t border-slate-100 flex justify-between items-center">
        <Skeleton className="h-8 w-8 circular" variant="circular" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}
