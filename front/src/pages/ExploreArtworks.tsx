import React from "react";
import { motion } from "framer-motion";
import { MoreHorizontal, Heart } from "lucide-react";
import useArtworks from "@/hooks/artworks/fetch_artworks/useArtworks";
import ArtCardSkeleton from "@/components/skeletons/ArtCardSkeleton";
import { useModal } from '../context/ModalContext'; 

const ExploreArtworks = () => {
  const { data: artworks, isLoading } = useArtworks(1, undefined, true, "all", "public", true);
  const { showRegisterModal, setShowRegisterModal } = useModal(); 

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };
  if (isLoading) return <ArtCardSkeleton />;

  return (
    <section className="w-full max-w-7xl mx-auto py-20 px-6 md:px-12 bg-gray-50" id="artworks">
      <div>
        <div className="flex justify-between items-center mb-12">
          <motion.h2
            className="text-2xl md:text-2xl font-bold"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Explore New Artworks
          </motion.h2>

          <motion.a
            onClick={() => setShowRegisterModal(true)}
            className="bg-black text-white text-xs font-small rounded-full px-4 py-2 hover:bg-gray-800 transition-colors"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            See All
          </motion.a>
        </div>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {artworks.slice(0, 10).map((artwork) => (
            <motion.div key={artwork.id} variants={item} className="card-hover">
              <div className="bg-white px-5 py-3 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                <div className="relative group">
                  <div className="flex justify-between items-center pt-2 px-2 pb-4">
                    <div className="flex items-center space-x-1">
                      <div className="w-5 h-5 rounded-full overflow-hidden mr-2">
                        <img
                          src={artwork.artistImage}
                          alt={artwork.artistName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[10px] text-gray-700">{artwork.artistName}</span>
                    </div>
                    <button className="text-gray-500 hover:text-gray-700">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  <img
                    src={artwork.artworkImage}
                    alt={artwork.title}
                    className="w-full aspect-square object-cover rounded-xl transition-transform duration-300"
                  />

                  <div className="pt-4 px-2 pb-2">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-sm font-medium relative top-1">{artwork.title}</h3>
                      <button className="text-gray-500 hover:text-red-500 transition-colors relative top-1" 
                      onClick={() => setShowRegisterModal(true)}>
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
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
