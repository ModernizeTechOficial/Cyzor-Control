import React from 'react';
import { SkeletonCard } from './SkeletonCard';
import { SkeletonChart } from './SkeletonChart';
import { SkeletonTable } from './SkeletonTable';
import { Skeleton } from './Skeleton';

export function SkeletonDashboard() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={`stat-${i}`} />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SkeletonChart />
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm w-full h-full flex flex-col gap-4">
            <Skeleton className="h-5 w-40" />
            <div className="flex-1 flex flex-col justify-center items-center gap-4">
              <Skeleton className="h-32 w-32 rounded-full" variant="circular" />
              <div className="w-full flex justify-between mt-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="w-full">
        <SkeletonTable rows={4} />
      </div>
    </div>
  );
}
