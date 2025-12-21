import { SkeletonLoader } from '@/components/ui/skeleton-loader';

export function PropertyCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-shadow">
      <div className="flex flex-col space-y-1.5 p-6">
        <div className="flex items-start justify-between gap-2">
          <SkeletonLoader variant="text" className="h-7 w-40" />
          <SkeletonLoader variant="rect" className="h-6 w-20 rounded-full" />
        </div>
        <SkeletonLoader variant="text" className="h-4 w-64" />
      </div>
      <div className="p-6 pt-0 space-y-3">
        <div>
          <SkeletonLoader variant="text" className="h-3 w-32 mb-2" />
          <div className="space-y-2">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded bg-accent/50">
                <div className="flex items-center gap-2">
                  <SkeletonLoader variant="rect" className="h-5 w-16 rounded-full" />
                  <SkeletonLoader variant="text" className="h-3 w-16" />
                </div>
                <SkeletonLoader variant="rect" className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <SkeletonLoader variant="rect" className="h-9 w-full" />
      </div>
    </div>
  );
}

export function PropertiesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, index) => (
        <PropertyCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function PropertiesPageSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <SkeletonLoader variant="text" className="h-9 w-32 mb-2" />
          <SkeletonLoader variant="text" className="h-5 w-64" />
        </div>
        <SkeletonLoader variant="rect" className="h-10 w-32" />
      </div>

      <PropertiesGridSkeleton />
    </div>
  );
}