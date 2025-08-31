import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const ProfileHeaderSkeleton: React.FC = () => {
  return (
    <div className="w-full px-4 animate-pulse">
      {/* Cover Photo Skeleton */}
      <div className="relative w-full h-52 md:h-72 rounded-lg overflow-hidden bg-gray-200" />

      {/* Profile Info Skeleton */}
      <div className="flex flex-col items-center -mt-14 md:-mt-14">
        {/* Profile Image Skeleton */}
        <Avatar className="w-28 h-28 border-4 border-white z-20">
          <AvatarFallback className="bg-gray-300" />
        </Avatar>

        {/* Name Skeleton */}
        <div className="h-4 w-32 bg-gray-300 rounded mt-4" />

        {/* Stats Skeleton */}
        <div className="flex space-x-2 mt-2">
          <div className="h-3 w-20 bg-gray-300 rounded" />
          <div className="h-3 w-14 bg-gray-300 rounded" />
        </div>

        {/* Buttons Skeleton */}
        <div className="flex items-center space-x-2 mt-4">
          <div className="h-6 w-20 bg-gray-300 rounded-full" />
          <div className="h-6 w-6 bg-gray-300 rounded-full" />
          <div className="h-6 w-6 bg-gray-300 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default ProfileHeaderSkeleton;
