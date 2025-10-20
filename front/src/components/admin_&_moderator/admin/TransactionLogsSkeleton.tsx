export default function TransactionLogsSkeleton() {
  const rows = Array.from({ length: 6 });

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="divide-y">
        {rows.map((_, idx) => (
          <div key={idx} className="p-3 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="h-3 w-20 bg-gray-200 rounded" />
                <div className="h-5 w-16 bg-gray-200 rounded" />
                <div className="h-3 w-28 bg-gray-200 rounded" />
                <div className="h-3 w-28 bg-gray-200 rounded hidden sm:block" />
              </div>
              <div className="h-4 w-16 bg-gray-200 rounded" />
            </div>
            <div className="flex justify-between mt-2">
              <div className="h-3 w-24 bg-gray-200 rounded" />
              <div className="h-4 w-14 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


