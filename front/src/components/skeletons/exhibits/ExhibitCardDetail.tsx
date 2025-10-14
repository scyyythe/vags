const ExhibitCardDetailSkeleton = () => {
  return (
    <div className="animate-pulse min-h-screen">
      <div className="container mx-auto px-4 md:px-6 py-4 md:py-8">
      
        <div className="mb-6 w-24 h-4 bg-gray-300 rounded"></div>

        <div className="flex flex-col md:flex-row md:space-x-10">
       
          <div className="w-full md:w-[580px] h-[420px] bg-gray-200 rounded-xl mb-6 md:mb-0"></div>

        
          <div className="flex-1 space-y-4">
          
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
              </div>
              <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
            </div>

         
            <div className="h-5 bg-gray-300 rounded w-1/2"></div>

  
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>


            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              <div className="h-3 bg-gray-200 rounded w-4/6"></div>
            </div>

      
            <div className="my-6 border-t border-gray-300"></div>


            <div className="h-6 w-24 bg-gray-300 rounded mb-2"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExhibitCardDetailSkeleton;
