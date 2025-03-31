
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const AuctionFeature = () => {
  const [timeLeft, setTimeLeft] = useState({
    hrs: 19,
    mins: 24,
    secs: 19
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let newSecs = prev.secs - 1;
        let newMins = prev.mins;
        let newHrs = prev.hrs;

        if (newSecs < 0) {
          newSecs = 59;
          newMins -= 1;
        }

        if (newMins < 0) {
          newMins = 59;
          newHrs -= 1;
        }

        if (newHrs < 0) {
          clearInterval(timer);
          return { hrs: 0, mins: 0, secs: 0 };
        }

        return { hrs: newHrs, mins: newMins, secs: newSecs };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 px-6 md:px-12 bg-black text-white">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <motion.div 
            className="relative overflow-hidden rounded-2xl"
            initial={{ opacity: 0, x: -50, y: 0 }}
            whileInView={{ opacity: 1, x: 0 }}
            animate={{
              y: [0, -10, 0],
              transition: {
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut"
              }
            }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <img 
              src="/pics/8.jpg" 
              alt="Humanoid Sculpture" 
              className="w-full max-h-[500px] object-contain"
            />
          </motion.div>

          
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div>
              <h2 className="text-3xl md:text-5xl font-semibold mb-4">
                Humanoid <span className="text-[#E20B0B]">Sculpture</span>
              </h2>
              <p className="text-gray-400 text-sm mb-10">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full overflow-hidden">
                <img 
                  src="/pics/55.jpg" 
                  alt="Creator" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mb-2">
                <p className="text-[10px] text-gray-400">Owned by</p>
                <p className="text-sm font-medium">Jane Smith</p>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-3xl p-7 flex justify-center items-center max-w-xl mx-auto">
              <div className="flex w-full">
                <div className="flex-1 text-center">  
                  <p className="text-[11px] text-white mb-3">Current Bid</p>
                  <p className="text-2xl md:text-3xl font-semibold whitespace-nowrap">500k php</p>
                </div>

                <div className="border-l border-gray-700 h-19 mx-12"></div>

                <div className="flex-1 text-center"> 
                  <p className="text-[11px] text-white mb-3">Auction ending in</p>
                  <div className="flex text-center space-x-6 ml-11">
                    <div className="text-center">
                      <p className="text-xl font-semibold mb-1">{timeLeft.hrs.toString().padStart(2, '0')}</p>
                      <p className="text-[10px] text-gray-400">HRS</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-semibold mb-1">{timeLeft.mins.toString().padStart(2, '0')}</p>
                      <p className="text-[10px] text-gray-400">MINS</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-semibold mb-1">{timeLeft.secs.toString().padStart(2, '0')}</p>
                      <p className="text-[10px] text-gray-400">SECS</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

              <div className="flex space-x-4">
                <button className="bg-[#E20B0B] text-white text-sm flex-1 rounded-full px-4 py-2 hover:bg-[#C10A0A]">
                  Place a bid
                </button>
                <button className="btn-secondary flex-1 text-sm rounded-full">View item</button>
              </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AuctionFeature;
