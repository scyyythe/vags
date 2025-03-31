import React from 'react';
import { motion } from 'framer-motion';

// Artist data
const artists = Array(12).fill(null).map((_, index) => ({
  id: index + 1,
  name: 'Claude Banks',
  followers: '30k',
  image: `/pics/111.jpg`
}));

const PopularArtists = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <section className="py-20 px-6 md:px-12">
      <div className="max-w-screen-xl mx-auto">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Popular Artists
        </motion.h2>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {artists.map((artist) => (
            <motion.div key={artist.id} variants={item}>
              <div className="artist-card group cursor-pointer bg-gray-100 p-4 rounded-full shadow-lg hover:shadow-2xl transition-shadow duration-300 flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 shadow-md">
                  <img 
                    src={artist.image} 
                    alt={artist.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{artist.name}</span>
                  <span className="text-xs text-red-500">{artist.followers}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PopularArtists;
