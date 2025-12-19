import { SkeletonLoader } from '@/components/ui/skeleton-loader';

export function BookingsTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filters Card Skeleton */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <SkeletonLoader variant="rect" className="h-10 w-full" />
          </div>
          <SkeletonLoader variant="rect" className="h-10 w-full md:w-[180px]" />
          <SkeletonLoader variant="rect" className="h-10 w-full md:w-[180px]" />
        </div>
      </div>

      {/* Table Card Skeleton */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 pt-6">
          <div className="overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Guest</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Property</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Check-in</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Check-out</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nights</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Platform</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Payment</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {[...Array(8)].map((_, index) => (
                  <tr key={index} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle">
                      <SkeletonLoader variant="text" className="h-4 w-32" />
                    </td>
                    <td className="p-4 align-middle">
                      <SkeletonLoader variant="text" className="h-4 w-40" />
                    </td>
                    <td className="p-4 align-middle">
                      <SkeletonLoader variant="text" className="h-4 w-24" />
                    </td>
                    <td className="p-4 align-middle">
                      <SkeletonLoader variant="text" className="h-4 w-24" />
                    </td>
                    <td className="p-4 align-middle">
                      <SkeletonLoader variant="text" className="h-4 w-12" />
                    </td>
                    <td className="p-4 align-middle">
                      <SkeletonLoader variant="rect" className="h-6 w-16 rounded-full" />
                    </td>
                    <td className="p-4 align-middle">
                      <SkeletonLoader variant="rect" className="h-6 w-20 rounded-full" />
                    </td>
                    <td className="p-4 align-middle">
                      <SkeletonLoader variant="rect" className="h-6 w-20 rounded-full" />
                    </td>
                    <td className="p-4 align-middle text-right">
                      <SkeletonLoader variant="text" className="h-4 w-16 ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BookingsPageSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <SkeletonLoader variant="text" className="h-9 w-32 mb-2" />
        <SkeletonLoader variant="text" className="h-5 w-64" />
      </div>

      <BookingsTableSkeleton />
    </div>
  );
}