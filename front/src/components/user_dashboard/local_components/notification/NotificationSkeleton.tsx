import { Skeleton } from "@/components/ui/skeleton";

const NotificationSkeleton = () => {
  return (
    <div className="space-y-4 pr-2">
      {/* Generate 6 skeleton notifications with varying content lengths */}
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-start gap-3 p-2 rounded-md">
          {/* Avatar skeleton - varies between circular and square for different notification types */}
          {index % 3 === 0 ? (
            <Skeleton className="w-6 h-6 rounded-full" />
          ) : (
            <Skeleton className="w-6 h-6 rounded-full" />
          )}

          {/* Content skeleton */}
          <div className="flex-1 space-y-1">
            {/* Name and action skeleton - varies in length */}
            <div className="flex items-center gap-1 flex-wrap">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
              {index % 2 === 0 && <Skeleton className="h-3 w-12" />}
            </div>

            {/* Message/target skeleton - varies in length */}
            {index % 4 !== 0 && <Skeleton className="h-3 mt-1" style={{ width: `${120 + index * 20}px` }} />}

            {/* Additional content for some notifications */}
            {index === 1 && (
              <div className="flex items-center gap-1 mt-1">
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-6" />
              </div>
            )}

            {/* Time skeleton */}
            <Skeleton className="h-2 w-10 mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationSkeleton;
