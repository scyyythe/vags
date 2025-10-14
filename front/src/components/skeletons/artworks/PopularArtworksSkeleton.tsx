const PopularArtworksSkeleton = () => {
  return (
    <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 w-full md:w-[89%] -top-48">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="animate-pulse bg-white p-3 rounded-2xl overflow-hidden shadow-lg">
          <div className="h-40 bg-gray-300 rounded-2xl mb-4" />
          <div className="flex justify-between items-center">
            <div>
              <div className="h-4 w-24 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 w-16 bg-gray-200 rounded"></div>
            </div>
            <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PopularArtworksSkeleton;
