import { SkeletonLoader, SkeletonList } from "@/components/ui/skeleton-loader";

interface CrewsListSkeletonProps {
  folderCount?: number;
  membersPerFolder?: number;
  showNestedFolders?: boolean;
}

/**
 * Skeleton loader for the crews hierarchy list
 * Matches the exact structure of the crews page with folders and members
 */
export function CrewsListSkeleton({ 
  folderCount = 3, 
  membersPerFolder = 2,
  showNestedFolders = true 
}: CrewsListSkeletonProps) {
  return (
    <div className="space-y-1">
      {Array.from({ length: folderCount }).map((_, folderIndex) => (
        <CrewFolderWithMembersSkeleton
          key={folderIndex}
          depth={0}
          memberCount={membersPerFolder}
          showNested={showNestedFolders && folderIndex === 0}
        />
      ))}
    </div>
  );
}

interface CrewFolderWithMembersSkeletonProps {
  depth?: number;
  memberCount?: number;
  showNested?: boolean;
}

function CrewFolderWithMembersSkeleton({ 
  depth = 0, 
  memberCount = 2,
  showNested = false 
}: CrewFolderWithMembersSkeletonProps) {
  const paddingLeft = `${depth * 1.5 + 0.75}rem`;
  
  return (
    <div className="space-y-1">
      {/* Folder header */}
      <div 
        className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted/50 transition-colors"
        style={{ paddingLeft }}
      >
        <SkeletonLoader variant="rect" width="1rem" height="1rem" />
        <SkeletonLoader variant="rect" width="1rem" height="1rem" />
        <SkeletonLoader variant="rect" width="1rem" height="1rem" />
        <SkeletonLoader variant="text" width="12rem" />
        <SkeletonLoader variant="rect" width="1.5rem" height="1.5rem" className="ml-auto" />
      </div>

      {/* Folder members */}
      <div className="space-y-1">
        {Array.from({ length: memberCount }).map((_, memberIndex) => (
          <div
            key={memberIndex}
            className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted/30 transition-colors"
            style={{ paddingLeft: `${(depth + 1) * 1.5 + 0.75}rem` }}
          >
            <SkeletonLoader variant="rect" width="1rem" height="1rem" />
            <SkeletonLoader variant="circle" width="1.5rem" height="1.5rem" />
            <SkeletonLoader variant="rect" width="1rem" height="1rem" />
            <div className="flex-1 space-y-1">
              <SkeletonLoader variant="text" width="8rem" />
              <SkeletonLoader variant="text" width="6rem" height="0.875rem" />
            </div>
            <SkeletonLoader variant="text" width="4rem" />
          </div>
        ))}
        
        {/* Nested folders (only for first folder to show hierarchy) */}
        {showNested && (
          <CrewFolderWithMembersSkeleton
            depth={depth + 1}
            memberCount={1}
            showNested={false}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Compact skeleton for crew member items
 */
export function CrewMemberItemSkeleton() {
  return (
    <div className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted/30 transition-colors">
      <SkeletonLoader variant="rect" width="1rem" height="1rem" />
      <SkeletonLoader variant="circle" width="1.5rem" height="1.5rem" />
      <SkeletonLoader variant="rect" width="1rem" height="1rem" />
      <div className="flex-1 space-y-1">
        <SkeletonLoader variant="text" width="8rem" />
        <SkeletonLoader variant="text" width="6rem" height="0.875rem" />
      </div>
      <SkeletonLoader variant="text" width="4rem" />
    </div>
  );
}

/**
 * Compact skeleton for folder items
 */
export function CrewFolderItemSkeleton() {
  return (
    <div className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <SkeletonLoader variant="rect" width="1rem" height="1rem" />
      <SkeletonLoader variant="rect" width="1rem" height="1rem" />
      <SkeletonLoader variant="rect" width="1rem" height="1rem" />
      <SkeletonLoader variant="text" width="12rem" />
      <SkeletonLoader variant="rect" width="1.5rem" height="1.5rem" className="ml-auto" />
    </div>
  );
}

/**
 * Loading state for empty crews page
 */
export function EmptyCrewsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonLoader variant="text" width="16rem" height="2.25rem" />
          <SkeletonLoader variant="text" width="20rem" height="1rem" />
        </div>
        <SkeletonLoader variant="rect" width="8rem" height="2.25rem" />
      </div>

      {/* Empty state card */}
      <div className="rounded-lg border bg-card p-8 text-center">
        <SkeletonLoader variant="circle" width="4rem" height="4rem" className="mx-auto mb-4" />
        <SkeletonLoader variant="text" width="12rem" className="mx-auto mb-2" />
        <SkeletonLoader variant="text" width="16rem" className="mx-auto" />
      </div>
    </div>
  );
}