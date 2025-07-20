import React from "react";
import Header from "@/components/user_dashboard/navbar/Header";

const SkeletonBox = ({ className }: { className: string }) => (
  <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
);

const ProductViewingSkeleton = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-12">
        {/* Back button */}
        <div className="mb-6">
          <SkeletonBox className="w-32 h-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Skeleton */}
          <div className="w-full max-w-[580px] min-w-[400px] mx-auto">
            <SkeletonBox className="w-full h-[475px] rounded-xl" />
          </div>

          {/* Right side - Info Skeleton */}
          <div className="w-full max-w-[550px] min-w-[400px] space-y-6">
            {/* Title and Profile */}
            <div>
              <SkeletonBox className="w-3/4 h-6 mb-2" />
              <div className="flex items-center space-x-2">
                <SkeletonBox className="w-6 h-6 rounded-full" />
                <SkeletonBox className="w-24 h-4" />
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <SkeletonBox className="w-20 h-6" />
              <SkeletonBox className="w-16 h-4" />
            </div>

            {/* Product Detail Grid */}
            <div className="grid grid-cols-4 gap-4 text-center border py-4 rounded-md">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <SkeletonBox className="w-3/4 h-3 mx-auto mb-1" />
                  <SkeletonBox className="w-1/2 h-4 mx-auto" />
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 text-sm font-medium">
              <SkeletonBox className="w-24 h-6" />
              <SkeletonBox className="w-16 h-6" />
            </div>

            {/* Tab content */}
            <div className="space-y-3 mt-3">
              <SkeletonBox className="w-3/4 h-3" />
              <SkeletonBox className="w-full h-3" />
              <SkeletonBox className="w-5/6 h-3" />
              <SkeletonBox className="w-2/3 h-3" />
            </div>

            {/* Quantity and Buy */}
            <div className="flex items-center justify-between space-x-4">
              <SkeletonBox className="w-24 h-10 rounded-full" />
              <SkeletonBox className="w-full h-10 rounded-full" />
              <SkeletonBox className="w-10 h-10 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductViewingSkeleton;
