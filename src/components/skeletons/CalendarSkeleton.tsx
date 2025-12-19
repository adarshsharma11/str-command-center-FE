import { SkeletonLoader } from '@/components/ui/skeleton-loader';

export function CalendarPageSkeleton() {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Main Calendar Area */}
      <div className="flex-1">
        {/* Header Skeleton */}
        <div className="border-b bg-background">
          <div className="flex items-center justify-between p-4">
            {/* Left side - Date navigation */}
            <div className="flex items-center gap-2">
              <SkeletonLoader variant="rect" className="h-9 w-9 rounded-md" />
              <SkeletonLoader variant="rect" className="h-9 w-32 rounded-md" />
              <SkeletonLoader variant="rect" className="h-9 w-9 rounded-md" />
              <SkeletonLoader variant="rect" className="h-9 w-20 rounded-md" />
            </div>

            {/* Right side - Controls */}
            <div className="flex items-center gap-2">
              <SkeletonLoader variant="rect" className="h-9 w-32 rounded-md" />
              <SkeletonLoader variant="rect" className="h-9 w-24 rounded-md" />
              <SkeletonLoader variant="rect" className="h-9 w-9 rounded-md" />
              <SkeletonLoader variant="rect" className="h-9 w-9 rounded-md" />
            </div>
          </div>
        </div>

        {/* Calendar Grid Skeleton */}
        <div className="p-4">
          {/* View switcher */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-lg border bg-muted/50 p-1">
              <SkeletonLoader variant="rect" className="h-8 w-16 rounded-md" />
              <SkeletonLoader variant="rect" className="h-8 w-16 rounded-md" />
              <SkeletonLoader variant="rect" className="h-8 w-16 rounded-md" />
              <SkeletonLoader variant="rect" className="h-8 w-16 rounded-md" />
            </div>
          </div>

          {/* Calendar grid */}
          <div className="space-y-2">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-2">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-10 flex items-center justify-center">
                  <SkeletonLoader variant="text" className="h-4 w-12" />
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
              {[...Array(35)].map((_, i) => (
                <div key={i} className="aspect-square border rounded-lg p-2">
                  <SkeletonLoader variant="text" className="h-4 w-6 mb-2" />
                  <div className="space-y-1">
                    <SkeletonLoader variant="rect" className="h-3 w-full rounded" />
                    <SkeletonLoader variant="rect" className="h-3 w-3/4 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Side Panel Skeleton */}
      <div className="w-96 border-l bg-background animate-slide-in-right">
        <div className="p-6 space-y-6">
          {/* Panel header */}
          <div className="flex items-center justify-between">
            <SkeletonLoader variant="text" className="h-6 w-32" />
            <SkeletonLoader variant="rect" className="h-8 w-8 rounded-md" />
          </div>

          {/* Booking details */}
          <div className="space-y-4">
            <SkeletonLoader variant="text" className="h-5 w-48" />
            <SkeletonLoader variant="text" className="h-4 w-32" />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <SkeletonLoader variant="text" className="h-3 w-16 mb-1" />
                <SkeletonLoader variant="text" className="h-4 w-20" />
              </div>
              <div>
                <SkeletonLoader variant="text" className="h-3 w-16 mb-1" />
                <SkeletonLoader variant="text" className="h-4 w-20" />
              </div>
            </div>

            <div>
              <SkeletonLoader variant="text" className="h-3 w-16 mb-1" />
              <SkeletonLoader variant="text" className="h-4 w-40" />
            </div>

            <div>
              <SkeletonLoader variant="text" className="h-3 w-16 mb-1" />
              <SkeletonLoader variant="text" className="h-4 w-32" />
            </div>
          </div>

          <SkeletonLoader variant="rect" className="h-10 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}