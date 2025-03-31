import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="relative pt-24 pb-16 px-6 md:px-12">
      <div className="w-full max-w-[100%] md:max-w-[100%] lg:max-w-[100%] mx-auto pt-16">
        
        {/* Hero Title */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6" style={{ lineHeight: '1.3' }}>
            Discover, Collect & Sell<br />Artworks
          </h1>
          <p className="text-2sm text-black max-w-2xl mx-auto">
            Step inside and let the art speak to you.
          </p>
        </motion.div>

        {/* Background Gradient */}
        <motion.div 
          className="relative mx-auto max-w-5xl aspect-[16/9] mt-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-red-300 via-red-200 to-red-400 rounded-full opacity-80 blur-2xl w-[63%] h-72"></div>

          {/* Black Card Container */}
          <div className="relative bg-black rounded-3xl p-10 md:p-16 flex flex-col items-center justify-center top-32 md:-ml-[125px] w-full md:w-[125%]">
            
            {/* Artwork Cards */}
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 w-full md:w-[89%] -top-48">
              
              <motion.div 
                className="artwork-card"
                initial={{ y: 10 }}
                animate={{ y: [30, 10, 30] }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              >
                <div className="relative bg-white p-3 rounded-2xl overflow-hidden shadow-lg">
                  <img src="/pics/2.jpg" alt="Greek Statue" className="h-40 rounded-2xl" />
                  <div className="p-2 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Greek Statue</p>
                      <p className="text-xs text-gray-500">Claude Banks</p>
                    </div>
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                      <img src="/pics/111.jpg" alt="Artist" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="artwork-card"
                initial={{ y: -10 }}
                animate={{ y: [-10, 0, -10] }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              >
                <div className="relative bg-white p-3 rounded-2xl overflow-hidden shadow-lg">
                  <img src="/pics/3.jpg" alt="Greek Statue" className="h-40 rounded-2xl" />
                  <div className="p-2 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Greek Statue</p>
                      <p className="text-xs text-gray-500">Claude Banks</p>
                    </div>
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                      <img src="/pics/9.jpg" alt="Artist" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="artwork-card"
                initial={{ y: 10 }}
                animate={{ y: [30, 10, 30] }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              >
                <div className="relative bg-white p-3 rounded-2xl overflow-hidden shadow-lg">
                  <img src="/pics/4.jpg" alt="Greek Statue" className="h-40 rounded-2xl" />
                  <div className="p-2 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Greek Statue</p>
                      <p className="text-xs text-gray-500">Claude Banks</p>
                    </div>
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                      <img src="/pics/333.jpg" alt="Artist" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>

            {/* Stats */}
            <div className="-mt-12 flex justify-center space-x-12 md:space-x-60">
              <div className="text-center">
                <p className="text-lg md:text-3xl font-semibold text-white">30k+</p>
                <p className="text-[10px] md:text-xs" style={{ color: "#8E8C8C" }}>Products</p>
              </div>
              <div className="text-center">
                <p className="text-xl md:text-3xl font-semibold text-white">10k+</p>
                <p className="text-[10px] md:text-xs" style={{ color: "#8E8C8C" }}>Biddings</p>
              </div>
              <div className="text-center">
                <p className="text-xl md:text-3xl font-semibold text-white">12k+</p>
                <p className="text-[10px] md:text-xs" style={{ color: "#8E8C8C" }}>Exhibits</p>
              </div>
              <div className="text-center">
                <p className="text-lg md:text-3xl font-semibold text-white">20k+</p>
                <p className="text-[10px] md:text-xs" style={{ color: "#8E8C8C" }}>Artists</p>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
