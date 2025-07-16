
const ShippingSkeleton = () => {
  return (
    <div className="min-h-screen bg-white animate-pulse px-4 pt-20 max-w-6xl mx-auto">
      <div className="h-4 w-32 bg-gray-200 rounded mb-6"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {Array.from({ length: 2 }).map((_, idx) => (
          <div
            key={idx}
            className="border border-gray-200 rounded-lg py-4 px-8"
          >
            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 rounded-full bg-gray-300 mt-2"></div>
              <div className="space-y-2">
                <div className="w-24 h-3 bg-gray-300 rounded" />
                <div className="w-40 h-3 bg-gray-300 rounded" />
                <div className="w-32 h-3 bg-gray-300 rounded" />
                <div className="w-28 h-3 bg-gray-300 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-4 w-32 bg-gray-300 rounded mb-8" />
      <div className="w-36 h-8 bg-gray-400 rounded-full ml-auto" />
    </div>
  );
};

export default ShippingSkeleton;
