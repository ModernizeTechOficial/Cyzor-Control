import React from 'react';
import { Skeleton } from './Skeleton';

interface SkeletonFormProps {
  fields?: number;
}

export function SkeletonForm({ fields = 4 }: SkeletonFormProps) {
  return (
    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm w-full flex flex-col gap-6">
      <div>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      
      <div className="flex flex-col gap-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={`field-${i}`} className="flex flex-col gap-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
      
      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg bg-neutral-800" />
      </div>
    </div>
  );
}
