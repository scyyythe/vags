import React from "react";
import { Clock } from "lucide-react";

const BidDetailsSkeleton: React.FC = () => {
  return (
    <div className="p-6 animate-pulse">
      <div className="h-4 w-32 bg-gray-300 rounded mb-6" />

      <div className="space-y-5">
        <div>
          <div className="h-3 w-24 bg-gray-300 rounded mb-1" />
          <div className="h-5 w-36 bg-gray-400 rounded" />
        </div>

        <div>
          <div className="h-3 w-40 bg-gray-300 rounded mb-1" />
          <div className="h-4 w-28 bg-gray-400 rounded" />
        </div>

        <div>
          <div className="h-3 w-24 bg-gray-300 rounded mb-1" />
          <div className="h-4 w-32 bg-gray-400 rounded" />
        </div>

        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <Clock className="text-amber-400 mt-0.5" size={15} />
          <div className="w-full">
            <div className="h-3 w-28 bg-amber-200 rounded mb-1" />
            <div className="h-3 w-48 bg-amber-100 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BidDetailsSkeleton;
