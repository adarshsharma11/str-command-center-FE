import { SkeletonLoader } from '@/components/ui/skeleton-loader';

export function AutomationPageSkeleton({ showLogs = true }: { showLogs?: boolean } = {}) {
  return (
    <div className="p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <SkeletonLoader variant="text" width="16rem" height="2.25rem" />
          <SkeletonLoader variant="text" width="20rem" height="1rem" />
        </div>
        <SkeletonLoader variant="rect" width="8rem" height="2.25rem" />
      </div>

      {/* Rules List Card Skeleton */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <div className="flex items-center gap-2">
            <SkeletonLoader variant="rect" width="1.25rem" height="1.25rem" />
            <SkeletonLoader variant="text" width="8rem" height="1.25rem" />
          </div>
        </div>
        <div className="p-6 pt-0">
          <div className="space-y-4">
            {/* Rule items */}
            {[...Array(3)].map((_, index) => (
              <div key={index} className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Rule name and switch */}
                    <div className="flex items-center gap-3">
                      <SkeletonLoader variant="text" width="12rem" height="1.125rem" />
                      <SkeletonLoader variant="rect" width="2.75rem" height="1.5rem" />
                    </div>
                    
                    {/* Badges */}
                    <div className="flex gap-2 flex-wrap">
                      <SkeletonLoader variant="rect" width="6rem" height="1.5rem" />
                      <SkeletonLoader variant="rect" width="5rem" height="1.5rem" />
                    </div>
                    
                    {/* Condition */}
                    <SkeletonLoader variant="text" width="16rem" height="0.875rem" />
                    
                    {/* Description */}
                    <SkeletonLoader variant="text" width="20rem" height="0.875rem" />
                    
                    {/* Date */}
                    <SkeletonLoader variant="text" width="10rem" height="0.75rem" />
                  </div>
                  
                  {/* Edit button */}
                  <SkeletonLoader variant="rect" width="2rem" height="2rem" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rule Builder Card Skeleton */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <SkeletonLoader variant="text" width="6rem" height="1.25rem" />
        </div>
        <div className="p-6 pt-0">
          <div className="p-8 text-center border-2 border-dashed border-border rounded-lg">
            <SkeletonLoader variant="rect" width="3rem" height="3rem" className="mx-auto mb-4" />
            <SkeletonLoader variant="text" width="16rem" height="1rem" className="mx-auto mb-4" />
            <SkeletonLoader variant="rect" width="10rem" height="2.25rem" className="mx-auto" />
          </div>
        </div>
      </div>

      {/* Execution Logs Card Skeleton */}
      {showLogs && (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <SkeletonLoader variant="text" width="8rem" height="1.25rem" />
          </div>
          <div className="p-6 pt-0">
            <div className="overflow-x-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      <SkeletonLoader variant="text" width="4rem" height="0.75rem" />
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      <SkeletonLoader variant="text" width="4rem" height="0.75rem" />
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      <SkeletonLoader variant="text" width="4rem" height="0.75rem" />
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {[...Array(5)].map((_, index) => (
                    <tr key={index} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle">
                        <SkeletonLoader variant="text" width="6rem" height="0.875rem" />
                      </td>
                      <td className="p-4 align-middle">
                        <SkeletonLoader variant="text" width="8rem" height="0.875rem" />
                      </td>
                      <td className="p-4 align-middle">
                        <SkeletonLoader variant="text" width="5rem" height="0.875rem" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}