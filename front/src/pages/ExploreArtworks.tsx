
import React from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, Heart } from 'lucide-react';

// Artwork data
const artworks = [
  {
    id: 1,
    title: 'Artwork Title',
    price: 'price',
    artist: {
      name: 'Engent Canvice',
      image: '/pics/0.jpg'
    },
    image: '/pics/00.jpg'
  },
  {
    id: 2,
    title: 'Artwork Title',
    price: 'price',
    artist: {
      name: 'Engent Canvice',
      image: '/pics/1.jpg'
    },
    image: '/pics/11.jpg'
  },
  {
    id: 3,
    title: 'Artwork Title',
    price: 'price',
    artist: {
      name: 'Engent Canvice',
      image: '/pics/2.jpg'
    },
    image: '/pics/22.jpg'
  },
  {
    id: 4,
    title: 'Artwork Title',
    price: 'price',
    artist: {
      name: 'Engent Canvice',
      image: '/pics/3.jpg'
    },
    image: '/pics/33.jpg'
  },
  {
    id: 5,
    title: 'Artwork',
    price: 'price',
    artist: {
      name: 'Engent Canvice',
      image: '/pics/4.jpg'
    },
    image: '/pics/44.jpg'
  },
  {
    id: 6,
    title: 'Artwork',
    price: 'price',
    artist: {
      name: 'Engent Canvice',
      image: '/pics/5.jpg'
    },
    image: '/pics/55.jpg'
  },
  {
    id: 7,
    title: 'Artwork',
    price: 'price',
    artist: {
      name: 'Engent Canvice',
      image: '/pics/6.jpg'
    },
    image: '/pics/66.jpg'
  },
  {
    id: 8,
    title: 'Artwork',
    price: 'price',
    artist: {
      name: 'Engent Canvice',
      image: '/pics/7.jpg'
    },
    image: '/pics/77.jpg'
  },
];

const ExploreArtworks = () => {
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
    <section className="py-20 px-6 md:px-12 bg-gray-50">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Explore New Artworks
          </motion.h2>
          
          <motion.a 
            href="#" 
            className="bg-black text-white text-sm font-small rounded-full px-4 py-2 hover:bg-gray-800 transition-colors"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            See All
          </motion.a>
        </div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {artworks.map((artwork) => (
            <motion.div key={artwork.id} variants={item} className="card-hover">
              <div className="bg-white p-3 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                <div className="relative group">
                  <div className="flex justify-between items-center p-2">
                    <div className="flex items-center space-x-1">
                      <div className="w-5 h-5 rounded-full overflow-hidden mr-2">
                        <img 
                          src={artwork.artist.image} 
                          alt={artwork.artist.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[10px] text-gray-700">{artwork.artist.name}</span>
                    </div>
                    <button className="text-gray-500 hover:text-gray-700">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <img 
                    src={artwork.image} 
                    alt={artwork.title}
                    className="w-full aspect-square object-cover rounded-xl transition-transform duration-300"
                  />
                  
                  <div className="p-2">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-sm font-medium">{artwork.title}</h3>
                      <button className="text-gray-500 hover:text-red-500 transition-colors relative top-4">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">{artwork.price}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ExploreArtworks;
