import React from "react";
import { Card } from "@/components/ui/card";

const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={`bg-gray-200 animate-pulse rounded ${className}`}></div>
);

const ExhibitReviewSkeleton = () => {
  return (
    <div className="p-10 space-y-6">
      {/* Header */}
      <SkeletonBlock className="h-6 w-1/4 mb-2" />
      <SkeletonBlock className="h-3 w-1/2 mb-4" />

      {/* Banner */}
      <SkeletonBlock className="w-full h-72 rounded-lg" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Exhibit Details */}
        <Card className="p-5 space-y-4">
          <SkeletonBlock className="h-4 w-3/4" />
          <SkeletonBlock className="h-3 w-1/2" />
          <SkeletonBlock className="h-4 w-2/3" />
          <SkeletonBlock className="h-3 w-1/2" />
          <SkeletonBlock className="h-4 w-full" />
        </Card>

        {/* Environment & Slots */}
        <Card className="p-5 space-y-4">
          <SkeletonBlock className="h-32 w-full rounded-md" />
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[...Array(6)].map((_, i) => (
              <SkeletonBlock key={i} className="h-20 w-full rounded-md" />
            ))}
          </div>
        </Card>

        {/* Collaborator Status */}
        <Card className="p-5 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <SkeletonBlock className="h-4 w-1/3" />
              <SkeletonBlock className="h-2 w-full rounded-full" />
            </div>
          ))}

          {/* Overall Completion */}
          <div className="mt-4 space-y-2">
            <SkeletonBlock className="h-4 w-1/4" />
            <SkeletonBlock className="h-2 w-full rounded-full" />
          </div>

          {/* Preview Button */}
          <SkeletonBlock className="h-8 w-3/4 rounded-full mt-4" />
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-6">
        <SkeletonBlock className="h-8 w-20 rounded-full" />
        <SkeletonBlock className="h-8 w-32 rounded-full" />
      </div>
    </div>
  );
};

export default ExhibitReviewSkeleton;
