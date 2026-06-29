import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-slate-300 dark:bg-slate-800 rounded ${className}`} />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="glass-card rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3.5 w-1/3" />
          <Skeleton className="h-4.5 w-1/2" />
        </div>
      </div>
    </div>
  );
};

export const ListSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <div className="glass-card rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
        <Skeleton className="h-4.5 w-1/4" />
        <Skeleton className="h-3.5 w-16" />
      </div>
      <div className="space-y-4 divide-y divide-[var(--border-color)]">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="flex items-center justify-between pt-4 first:pt-0 gap-4">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-12 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="glass-card rounded-2xl p-5 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4.5 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      {/* Visual bars mock */}
      <div className="h-56 flex items-end justify-between pt-6 gap-3">
        <Skeleton className="h-[20%] w-full rounded-t-lg" />
        <Skeleton className="h-[45%] w-full rounded-t-lg" />
        <Skeleton className="h-[35%] w-full rounded-t-lg" />
        <Skeleton className="h-[75%] w-full rounded-t-lg" />
        <Skeleton className="h-[60%] w-full rounded-t-lg" />
        <Skeleton className="h-[90%] w-full rounded-t-lg" />
      </div>
    </div>
  );
};
