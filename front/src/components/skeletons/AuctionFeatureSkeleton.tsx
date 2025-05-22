import React from "react";

const AuctionFeatureSkeleton = () => {
  return (
    <section className="py-20 px-6 md:px-12 bg-black text-white" id="auctions">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="relative overflow-hidden rounded-2xl bg-gray-800 h-[430px] flex items-center justify-center">
            <p className="text-gray-500">Image Placeholder</p>
          </div>

          <div className="space-y-6 w-full max-w-lg">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold mb-4">Auction Title</h2>
              <p className="text-gray-400 text-xs mb-10"> Lorem ipsum dolor sit amet.</p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-600" />
              <div className="mb-2">
                <p className="text-[10px] text-gray-400">Owned by</p>
                <p className="text-xs font-medium">Artist Name</p>
              </div>
            </div>

            <div className="bg-gray-900 rounded-3xl py-7 flex justify-center items-center max-w-md">
              <div className="flex w-full">
                <div className="flex-1 text-center">
                  <p className="text-[11px] text-white mb-3">Current Bid</p>
                  <p className="text-xl md:text-2xl font-semibold whitespace-nowrap">₱ 0</p>
                </div>

                <div className="border-l border-gray-700 h-19 mx-12"></div>

                <div className="flex-1 text-center">
                  <p className="text-[11px] text-white mb-3">Auction ending in</p>
                  <div className="flex text-center space-x-6 justify-center">
                    <div className="text-center">
                      <p className="text-lg font-semibold mb-1">00</p>
                      <p className="text-[10px] text-gray-400">hrs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold mb-1">00</p>
                      <p className="text-[10px] text-gray-400">mins</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold mb-1">00</p>
                      <p className="text-[10px] text-gray-400">secs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-8">
              <button className="bg-red-700 text-white text-xs flex-1 rounded-full px-4 py-2 hover:bg-red-600">
                Place a bid
              </button>
              <button className="btn-secondary flex-1 text-xs rounded-full">View item</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuctionFeatureSkeleton;
