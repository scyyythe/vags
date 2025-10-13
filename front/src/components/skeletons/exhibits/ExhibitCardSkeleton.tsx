const ExhibitCardSkeleton = () => {
  return (
    <div className="w-full rounded-xl bg-white border animate-pulse">
      <div className="relative">
        <div className="w-full h-40 bg-gray-200 rounded-lg" />

        <div className="absolute top-3 right-3 bg-white rounded-sm px-2 py-1">
          <div className="w-12 h-2.5 bg-gray-300 rounded" />
        </div>

        <div className="absolute top-3 left-3 flex -space-x-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-5 w-5 rounded-full bg-gray-300 border border-white"
            />
          ))}
        </div>

        <div className="absolute bottom-3 right-3 flex gap-2">
          <div className="flex items-center bg-white bg-opacity-90 rounded-full px-2 py-1">
            <div className="w-3 h-3 bg-gray-300 rounded-full mr-1" />
            <div className="w-6 h-2 bg-gray-300 rounded" />
          </div>
          <div className="flex items-center bg-white bg-opacity-90 rounded-full px-2 py-1">
            <div className="w-3 h-3 bg-gray-300 rounded-full mr-1" />
            <div className="w-6 h-2 bg-gray-300 rounded" />
          </div>
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="flex justify-between items-start">
          <div className="w-3/4 h-3 bg-gray-300 rounded" />
          <div className="w-5 h-5 bg-gray-300 rounded-full" />
        </div>
        <div className="mt-2 space-y-1">
          <div className="h-2 w-full bg-gray-200 rounded" />
          <div className="h-2 w-2/3 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
};

export default ExhibitCardSkeleton;
