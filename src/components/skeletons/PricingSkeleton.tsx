import { SkeletonLoader } from '@/components/ui/skeleton-loader';

/**
 * Skeleton loader for the Pricing page.
 * Mirrors the full page layout: header, tabs, property sidebar,
 * calendar grid, info cards, stats row, and 14-day table.
 */
export function PricingPageSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <SkeletonLoader variant="rect" width="1.5rem" height="1.5rem" />
            <SkeletonLoader variant="text" width="14rem" height="2rem" />
          </div>
          <SkeletonLoader variant="text" width="22rem" height="1rem" />
        </div>
        <div className="flex items-center gap-3">
          <SkeletonLoader variant="rect" width="2.5rem" height="1.25rem" className="rounded-full" />
          <SkeletonLoader variant="text" width="8rem" height="1rem" />
          <SkeletonLoader variant="rect" width="7rem" height="2.25rem" className="rounded-md" />
        </div>
      </div>

      {/* ── Tabs strip ── */}
      <div className="grid w-full max-w-md grid-cols-2 gap-1 rounded-lg border bg-muted/50 p-1">
        <SkeletonLoader variant="rect" className="h-9 rounded-md" />
        <SkeletonLoader variant="rect" className="h-9 rounded-md" />
      </div>

      {/* ── AI Tab content (default view) ── */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Property sidebar */}
        <div className="lg:col-span-1 rounded-lg border bg-card">
          <div className="p-6 space-y-4">
            <SkeletonLoader variant="text" width="8rem" height="1.25rem" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-3 rounded-lg border space-y-2">
                  <SkeletonLoader variant="text" width="70%" height="0.875rem" />
                  <SkeletonLoader variant="text" width="50%" height="0.75rem" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar card */}
        <div className="lg:col-span-3 rounded-lg border bg-card">
          <div className="p-6 space-y-4">
            {/* Calendar header row */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <SkeletonLoader variant="rect" width="1rem" height="1rem" />
                  <SkeletonLoader variant="text" width="18rem" height="1.25rem" />
                </div>
                <SkeletonLoader variant="text" width="24rem" height="0.875rem" />
              </div>
              <div className="flex items-center gap-2">
                <SkeletonLoader variant="rect" width="2rem" height="2rem" className="rounded-md" />
                <SkeletonLoader variant="text" width="8rem" height="1rem" />
                <SkeletonLoader variant="rect" width="2rem" height="2rem" className="rounded-md" />
              </div>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="text-center py-2">
                  <SkeletonLoader variant="text" width="2rem" height="0.75rem" className="mx-auto" />
                </div>
              ))}
            </div>

            {/* Calendar day cells (5 rows × 7 cols) */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-20 p-1 border rounded-lg flex flex-col items-center justify-between">
                  <SkeletonLoader variant="text" width="1rem" height="0.75rem" />
                  <SkeletonLoader variant="text" width="2rem" height="0.875rem" />
                  <SkeletonLoader variant="text" width="1.5rem" height="0.625rem" />
                </div>
              ))}
            </div>

            {/* Legend row */}
            <div className="flex items-center gap-6 mt-4 pt-4 border-t">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <SkeletonLoader variant="rect" width="1rem" height="1rem" className="rounded" />
                  <SkeletonLoader variant="text" width="3rem" height="0.75rem" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── How AI Pricing Works card ── */}
      <div className="rounded-lg border bg-card">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <SkeletonLoader variant="rect" width="1rem" height="1rem" />
            <SkeletonLoader variant="text" width="12rem" height="1.25rem" />
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/50 space-y-2">
                <SkeletonLoader variant="text" width="60%" height="0.875rem" />
                <SkeletonLoader variant="text" width="90%" height="0.75rem" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
