import React from "react";

const HotBidsCarouselSkeleton = () => {
  return (
    <section className="py-20 px-6 md:px-12" id="bids">
      <div className="max-w-screen-xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Explore Hot Bids</h2>
        <div className="flex justify-center items-center h-[460px] -mb-20">
          {[...Array(1)].map((_, index) => (
            <div
              key={index}
              className="absolute animate-pulse transition-all duration-700"
              style={{
                transform: `translate(${Math.sin(index) * 200}px, -50px) scale(0.8)`,
                opacity: 0.5,
              }}
            >
              <div className="w-48 h-48 bg-gray-300 rounded-lg mb-2"></div>
              <div className="w-24 h-4 bg-gray-300 rounded mb-1 mx-auto"></div>
              <div className="w-16 h-4 bg-gray-200 rounded mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HotBidsCarouselSkeleton;
