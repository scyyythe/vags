const ArtCardSkeleton = () => (
  <div className="animate-pulse rounded-lg bg-gray-100 h-[250px] w-full">
    <div className="h-40 bg-gray-300 rounded-t-lg"></div>
    <div className="p-2 space-y-2">
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

export default ArtCardSkeleton;
