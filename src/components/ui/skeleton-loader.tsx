import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonLoaderProps {
  variant?: 'text' | 'circle' | 'rect' | 'avatar' | 'card' | 'list-item';
  width?: string | number;
  height?: string | number;
  className?: string;
  lines?: number;
  animated?: boolean;
}

interface SkeletonListProps {
  count?: number;
  variant?: 'text' | 'circle' | 'rect' | 'avatar' | 'card' | 'list-item';
  className?: string;
  itemClassName?: string;
}

interface SkeletonCardProps {
  showHeader?: boolean;
  showContent?: boolean;
  showFooter?: boolean;
  lines?: number;
  className?: string;
}

/**
 * Enhanced Skeleton Loader component with multiple variants
 * Supports text, circle, rectangle, avatar, card, and list-item patterns
 */
export function SkeletonLoader({ 
  variant = 'text', 
  width, 
  height, 
  className, 
  lines = 1,
  animated = true 
}: SkeletonLoaderProps) {
  const baseClasses = cn(
    "animate-pulse rounded-md bg-muted",
    !animated && "animate-none",
    className
  );

  const getDimensions = () => {
    switch (variant) {
      case 'text':
        return { width: width || '100%', height: height || '1rem' };
      case 'circle':
        return { width: width || '2.5rem', height: height || '2.5rem' };
      case 'avatar':
        return { width: width || '2.5rem', height: height || '2.5rem' };
      case 'rect':
        return { width: width || '100%', height: height || '4rem' };
      case 'card':
        return { width: width || '100%', height: height || '8rem' };
      case 'list-item':
        return { width: width || '100%', height: height || '3.5rem' };
      default:
        return { width: width || '100%', height: height || '1rem' };
    }
  };

  const dimensions = getDimensions();
  const borderRadius = variant === 'circle' || variant === 'avatar' ? '50%' : '0.375rem';

  if (lines > 1 && variant === 'text') {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={baseClasses}
            style={{
              width: i === lines - 1 ? '75%' : dimensions.width,
              height: dimensions.height,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <Skeleton
      className={cn(
        baseClasses,
        variant === 'avatar' && "rounded-full",
        variant === 'circle' && "rounded-full"
      )}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        borderRadius: borderRadius,
      }}
    />
  );
}

/**
 * Skeleton List component for loading multiple items
 */
export function SkeletonList({ 
  count = 3, 
  variant = 'list-item', 
  className, 
  itemClassName 
}: SkeletonListProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonLoader
          key={i}
          variant={variant}
          className={itemClassName}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton Card component with customizable sections
 */
export function SkeletonCard({ 
  showHeader = true, 
  showContent = true, 
  showFooter = false, 
  lines = 3,
  className 
}: SkeletonCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-6 space-y-4", className)}>
      {showHeader && (
        <div className="flex items-center space-x-3">
          <SkeletonLoader variant="avatar" />
          <div className="flex-1 space-y-2">
            <SkeletonLoader variant="text" width="60%" />
            <SkeletonLoader variant="text" width="40%" height="0.875rem" />
          </div>
        </div>
      )}
      
      {showContent && (
        <SkeletonLoader variant="text" lines={lines} />
      )}
      
      {showFooter && (
        <div className="flex justify-between items-center pt-4 border-t">
          <SkeletonLoader variant="text" width="30%" />
          <SkeletonLoader variant="rect" width="6rem" height="2rem" />
        </div>
      )}
    </div>
  );
}

/**
 * Crew-specific skeleton loaders
 */
export function CrewFolderSkeleton({ depth = 0 }: { depth?: number }) {
  return (
    <div className="space-y-1">
      <div 
        className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted/50 transition-colors"
        style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
      >
        <SkeletonLoader variant="rect" width="1rem" height="1rem" />
        <SkeletonLoader variant="rect" width="1rem" height="1rem" />
        <SkeletonLoader variant="text" width="12rem" />
      </div>
      <div className="space-y-1 ml-6">
        <CrewMemberSkeleton />
        <CrewMemberSkeleton />
      </div>
    </div>
  );
}

export function CrewMemberSkeleton({ depth = 1 }: { depth?: number }) {
  return (
    <div 
      className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted/30 transition-colors"
      style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
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
  );
}

/**
 * Crews page skeleton loader
 */
export function CrewsPageSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonLoader variant="text" width="16rem" height="2.25rem" />
          <SkeletonLoader variant="text" width="20rem" height="1rem" />
        </div>
        <SkeletonLoader variant="rect" width="8rem" height="2.25rem" />
      </div>

      {/* Main card skeleton */}
      <SkeletonCard 
        showHeader={true}
        showContent={true}
        showFooter={false}
        lines={8}
        className="min-h-[24rem]"
      />
    </div>
  );
}

export { Skeleton };