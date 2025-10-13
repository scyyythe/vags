import { Skeleton } from "@/components/ui/skeleton";

const NotificationSkeleton = () => {
  return (
    <div className="space-y-4 pr-2">
      {/* Generate 5 skeleton notifications */}
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-start gap-3">
          {/* Avatar skeleton */}
          <Skeleton className="w-6 h-6 rounded-full" />
          
          {/* Content skeleton */}
          <div className="flex-1 space-y-2">
            {/* Name and action skeleton */}
            <div className="flex items-center gap-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
            
            {/* Target/message skeleton */}
            <Skeleton className="h-3 w-32" />
            
            {/* Time skeleton */}
            <Skeleton className="h-2 w-12 mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationSkeleton;
