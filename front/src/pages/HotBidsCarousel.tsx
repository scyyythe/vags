import React, { useState, useEffect } from 'react'; 
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const hotBids = [
  {
    id: 1,
    title: 'Greek Statue',
    artist: 'Claude Banks',
    image: 'https://i.pinimg.com/736x/36/8c/e2/368ce235497faa78bc726d660213f750.jpg',
    profile: 'https://i.pinimg.com/736x/0d/16/8e/0d168e2fd560157618bd701d346a4d9b.jpg'
  },
  {
    id: 2,
    title: 'Ancient Sculpture',
    artist: 'Claude Banks',
    image: 'https://i.pinimg.com/736x/2b/70/f8/2b70f8c1ebf959e3e3c6019563430cfb.jpg',
    profile: 'https://i.pinimg.com/736x/66/91/9e/66919ebf625fc5a45a4ad4814c6f9371.jpg'
  },
  {
    id: 3,
    title: 'Modern Art',
    artist: 'Claude Banks',
    image: 'https://i.pinimg.com/736x/96/e5/51/96e551d5690b0ff3e27d3cd3182fedc0.jpg',
    profile: 'https://i.pinimg.com/736x/9d/27/eb/9d27eb4e41185b7d0cd910f3a8f9befa.jpg'
  }
];

const HotBidsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemCount = hotBids.length;
  const radius = 250; 

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? itemCount - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === itemCount - 1 ? 0 : prevIndex + 1));
  };

  useEffect(() => {
    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <section className="py-20 px-6 md:px-12" id="bids">
      <div className="max-w-screen-xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Explore Hot Bids
        </h2>

        <div className=" flex justify-center items-center h-[460px] -mb-20">
          {hotBids.map((bid, index) => {
            const angle = ((index - currentIndex) * 120) % 360;
            const radians = (angle * Math.PI) / 180;
            const x = Math.sin(radians) * radius * 1.9; 
            const y = -Math.abs(Math.cos(radians) * radius * 0.4); 
            const scale = 0.7 + (Math.cos(radians) * 0.3);
            const opacity = 0.5 + (Math.cos(radians) * 0.5);

            return (
              <motion.div
                key={bid.id}
                className="absolute transition-all duration-700"
                animate={{ transform: `translate(${x}px, ${y}px) scale(${scale})`, opacity }}
              >
                <div className="rounded-xl shadow-xl relative">
                  <img src={bid.image} alt={bid.title} className="w-48 h-48 object-cover rounded-lg" />

                  {/* Profile is only visible on center card */}
                  {index === currentIndex && (
                    <img
                      src={bid.profile}
                      alt="profile"
                      className="w-10 h-10 rounded-full absolute -bottom-5 left-1/2 transform -translate-x-1/2 border-2 border-white"
                    />
                  )}
                </div>

                {index === currentIndex && (
                  <div className="text-center mt-6">
                    <p className="text-xs text-gray-500">{bid.artist}</p>
                    <p className="text-lg font-medium">{bid.title}</p>
                  </div>
                )}
              </motion.div>
            );
          })}

          <div className="flex justify-center -mb-60 space-x-4">
            <button onClick={goToPrevious} className="p-2 rounded-full bg-black text-white">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={goToNext} className="p-2 rounded-full bg-black text-white">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotBidsCarousel;
