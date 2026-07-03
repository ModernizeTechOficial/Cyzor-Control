import React from 'react';
import { Skeleton } from './Skeleton';

interface SkeletonKanbanProps {
  columns?: number;
  cardsPerColumn?: number;
}

export function SkeletonKanban({ columns = 4, cardsPerColumn = 3 }: SkeletonKanbanProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 w-full">
      {Array.from({ length: columns }).map((_, colIndex) => (
        <div key={`col-${colIndex}`} className="flex-shrink-0 w-72 bg-[#FAFAFA]/50 rounded-2xl p-3 border border-neutral-100 flex flex-col min-h-[520px]">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20 rounded-full" />
              <Skeleton className="h-3 w-6" />
            </div>
            <Skeleton className="h-5 w-5 rounded" />
          </div>
          
          <div className="flex flex-col gap-3">
            {Array.from({ length: cardsPerColumn }).map((_, cardIndex) => (
              <div key={`card-${colIndex}-${cardIndex}`} className="bg-white p-4 rounded-xl border border-neutral-200/50 shadow-sm flex flex-col gap-3">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex items-center gap-2 mt-1">
                  <Skeleton className="h-4 w-12 rounded-md" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="mt-2">
                  <div className="flex justify-between mb-1">
                    <Skeleton className="h-2 w-12" />
                    <Skeleton className="h-2 w-6" />
                  </div>
                  <Skeleton className="h-1 w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
