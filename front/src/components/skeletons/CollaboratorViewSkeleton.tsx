import React from "react";
import Header from "@/components/user_dashboard/navbar/Header";

const CollaboratorViewSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto pt-20 pb-4">
        {/* Back button skeleton */}
        <div className="mb-3">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse mr-2"></div>
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Collaborator View Notice skeleton */}
        <div className="mb-6">
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-3 w-96 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="space-y-8">
          {/* Banner Image skeleton */}
          <div className="w-full rounded-lg h-64 mb-4 bg-gray-200 animate-pulse"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Slots skeleton */}
            <div className="space-y-6">
              <div>
                {/* Available Slots title */}
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>

                {/* Color coding legend skeleton */}
                <div className="mb-3 flex flex-wrap gap-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 mr-1 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 mr-1 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>

                {/* Slots grid skeleton */}
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className="h-[93px] rounded-lg bg-gray-200 animate-pulse"></div>
                  ))}
                </div>
              </div>

              {/* Progress status skeleton */}
              <div className="border rounded-md p-4 bg-gray-50">
                <div className="h-3 w-40 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="flex items-center justify-between">
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-24 h-1 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Preview Button skeleton */}
              <div className="mt-7">
                <div className="h-8 w-32 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-3 w-64 bg-gray-200 rounded animate-pulse mt-2"></div>
              </div>
            </div>

            {/* Right Column - Artworks skeleton */}
            <div>
              {/* Your Artworks title */}
              <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mb-4"></div>

              {/* Artworks grid skeleton */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-1">
                {Array.from({ length: 9 }, (_, i) => (
                  <div key={i} className="bg-gray-200 rounded-lg h-[96px] animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Submit button skeleton */}
          <div className="flex justify-end mt-8">
            <div className="h-8 w-32 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaboratorViewSkeleton;
