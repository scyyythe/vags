import React from "react";
import { motion } from "framer-motion";
import { MoreHorizontal, Heart } from "lucide-react";
import useArtworks from "@/hooks/artworks/fetch_artworks/useArtworks";
import ArtCardSkeleton from "@/components/skeletons/artworks/ArtCardSkeleton";
import { useModal } from "../context/ModalContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { useLanguage } from "@/context/LanguageContext";

// ✅ Subcomponent for one artwork card
const ArtworkCard = ({ artwork, item }: { artwork: any; item: any }) => {
  const { setShowRegisterModal } = useModal();
  const { language } = useLanguage();

  // Translate artwork title here safely
  const translatedTitle = useAutoTranslation(artwork.title, language);

  const handleCardClick = () => {
    setShowRegisterModal(true);
  };

  return (
    <motion.div key={artwork.id} variants={item} className="card-hover">
      <div 
        className="bg-white px-5 py-3 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="relative group">
          <div className="flex justify-between items-center pt-2 px-2 pb-4">
            <div className="flex items-center space-x-1">
              <div className="w-5 h-5 rounded-full overflow-hidden mr-2">
                <img src={artwork.artistImage} alt={artwork.artistName} className="w-full h-full object-cover" />
              </div>
              {/* Artist name stays original */}
              <span className="text-[10px] text-gray-700">{artwork.artistName}</span>
            </div>
            <button 
              className="text-gray-500 hover:text-gray-700"
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click when clicking the button
              }}
            >
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
              {/* Translated title */}
              <h3 className="text-sm font-medium relative top-1 truncate max-w-[120px]">{translatedTitle}</h3>

              <button
                className="text-gray-500 hover:text-red-500 transition-colors relative top-1"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click when clicking the heart button
                  setShowRegisterModal(true);
                }}
              >
                <Heart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ExploreArtworks = () => {
  const { data: artworks, isLoading } = useArtworks(1, undefined, true, "all", "public", true);
  const { setShowRegisterModal } = useModal();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  // Current language
  const { language } = useLanguage();

  // Static translations
  const heading = useAutoTranslation("Explore New Artworks", language);
  const seeAll = useAutoTranslation("See All", language);

  if (isLoading) return <ArtCardSkeleton />;

  return (
    <section className="w-full max-w-7xl mx-auto pb-20 pt-10 px-6 md:px-12" id="artworks">
      <div>
        <div className="flex justify-between items-center mb-12">
          <motion.h2
            className="text-2xl md:text-2xl font-bold"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {heading}
          </motion.h2>

          <motion.a
            onClick={() => setShowRegisterModal(true)}
            className="bg-black text-white text-xs font-small rounded-full px-4 py-2 hover:bg-gray-800 transition-colors cursor-pointer"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {seeAll}
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
            <ArtworkCard key={artwork.id} artwork={artwork} item={item} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ExploreArtworks;
