import type { CSSProperties, ReactNode } from 'react';

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

/** A placeholder block in the shape of content that is still loading. */
export default function Skeleton({ className, style }: SkeletonProps) {
  return <span className={`skeleton block ${className ?? ''}`} style={style} />;
}

/**
 * Wraps loading placeholders so screen readers hear one "Loading" instead
 * of a pile of empty blocks.
 */
export function SkeletonGroup({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      <div aria-hidden>{children}</div>
    </div>
  );
}

/** Rows shaped like ResultsTable: a place diamond, car, scout and time. */
export function ResultsTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div>
      <div className="flex gap-6 border-b-2 border-ink/20 px-3 pb-2.5">
        {[44, 32, 52, 36].map((w, i) => (
          <Skeleton key={i} className="h-2.5" style={{ width: w }} />
        ))}
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-6 border-b border-divider px-3 py-4"
        >
          <span className="flex w-11 justify-center">
            {i < 3 ? (
              <Skeleton className="size-[22px] rotate-45 rounded-[3px]" />
            ) : (
              <Skeleton className="h-3.5 w-3" />
            )}
          </span>
          <Skeleton className="h-4 w-9" />
          <Skeleton
            className="h-4 flex-1"
            style={{ maxWidth: 120 + ((i * 37) % 80) }}
          />
          <span className="flex-1" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="hidden h-4 w-16 sm:block" />
          <Skeleton className="hidden h-4 w-24 sm:block" />
        </div>
      ))}
    </div>
  );
}

/** Homepage derby rows: the yellow year bar, year, race day and venue. */
export function DerbyListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <SkeletonGroup label="Loading derbies">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="grid grid-cols-1 gap-2 border-b border-divider py-[22px] sm:grid-cols-[140px_1fr_1fr_20px] sm:items-center sm:gap-6"
        >
          <div className="flex items-center gap-3">
            <span className="h-9 w-1 bg-cs-yellow/50" />
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-4 w-36" />
          <Skeleton className="hidden h-4 w-40 sm:block" />
          <Skeleton className="hidden size-4 sm:block" />
        </div>
      ))}
    </SkeletonGroup>
  );
}

/** The derby page: year hero, stitched art frame, den tabs and results. */
export function DerbyPageSkeleton() {
  return (
    <SkeletonGroup label="Loading derby">
      <section className="grid items-center gap-12 min-[800px]:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div>
          <Skeleton className="h-3 w-36" />
          <Skeleton className="mt-4 h-[clamp(64px,10vw,108px)] w-[min(100%,340px)] rounded-md" />
          <Skeleton className="mt-4 h-7 w-56" />
          <Skeleton className="mt-4 h-4 w-64" />
          <div className="mt-8 flex gap-3.5">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton
                key={i}
                className="mx-[3px] size-[14px] rotate-45 rounded-[2px]"
              />
            ))}
          </div>
          <div className="mt-8 flex items-center gap-5">
            <Skeleton className="size-[126px] rounded-[3px]" />
            <div className="flex-1">
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="mt-2 h-5 w-48" />
              <Skeleton className="mt-2 h-3.5 w-40" />
            </div>
          </div>
        </div>
        <div className="order-first min-[800px]:order-none">
          <div className="rounded-[18px] border-[3px] border-ink/12 p-[22px] outline-[1.5px] -outline-offset-10 outline-ink/12 outline-dashed">
            <Skeleton className="aspect-[16/10] w-full rounded-md" />
          </div>
          <Skeleton className="mt-3.5 h-2.5 w-32" />
        </div>
      </section>
      <hr className="mt-14 mb-7 border-divider" />
      <div className="flex flex-wrap gap-2">
        {[64, 64, 64, 64, 112].map((w, i) => (
          <Skeleton key={i} className="h-[38px]" style={{ width: w }} />
        ))}
      </div>
      <div className="mt-7 mb-3 flex items-center justify-between">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-[38px] w-32" />
      </div>
      <ResultsTableSkeleton />
    </SkeletonGroup>
  );
}

/** Heats pages: header with progress, standings and a grid of heat cards. */
export function HeatsViewSkeleton() {
  return (
    <SkeletonGroup label="Loading heats">
      <Skeleton className="mb-7 h-3.5 w-24" />
      <Skeleton className="h-3 w-56" />
      <Skeleton className="mt-3 h-[clamp(40px,7vw,64px)] w-[min(100%,360px)] rounded-md" />
      <div className="mt-4 flex items-center gap-3">
        <Skeleton className="h-3.5 w-32" />
        <span className="h-1.5 w-[120px] rounded-[3px] bg-divider" />
      </div>
      <hr className="mt-10 mb-6 border-divider" />
      <Skeleton className="mb-4 h-8 w-36" />
      <ResultsTableSkeleton rows={5} />
      <hr className="mt-14 mb-6 border-divider" />
      <Skeleton className="mb-5 h-8 w-24" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[repeat(auto-fill,minmax(440px,1fr))]">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-md border border-divider bg-surface"
          >
            <div className="flex items-center justify-between border-b border-divider px-[18px] py-4">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
            {Array.from({ length: 4 }, (_, row) => (
              <div
                key={row}
                className="flex items-center gap-4 border-b border-divider px-[18px] py-3 last:border-b-0"
              >
                <Skeleton className="size-[26px] rounded-full" />
                <Skeleton className="h-4 w-9" />
                <Skeleton
                  className="h-4 flex-1"
                  style={{ maxWidth: 110 + ((row * 29) % 60) }}
                />
                <span className="flex-1" />
                <Skeleton className="h-4 w-14" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </SkeletonGroup>
  );
}
