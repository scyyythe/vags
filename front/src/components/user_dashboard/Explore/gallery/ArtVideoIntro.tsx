import { useState } from "react"; 
import { motion, AnimatePresence } from "framer-motion";
import VerticalScrollImage from "./VerticalScrollImage";

interface Artwork {
  id: string;
  title: string;
  image_url: string[];
  artist: {
    name: string;
  };
  likes_count: number;
}

interface ArtVideoIntroProps {
  artworks: Artwork[];
}

const ArtVideoIntro = ({ artworks }: ArtVideoIntroProps) => {
  const [showNarration, setShowNarration] = useState(true);
  
  // Use first 9 artworks for the masonry grid (3x3)
  const gridImages = artworks.slice(0, 9).map(artwork => artwork.image_url[0]);

  return (
    <AnimatePresence>
      <motion.div
        className="h-full w-full flex items-center justify-center relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 1 }}
      >
        <div className="w-full h-full px-6 grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Content - Text Section */}
          <motion.div
            className="space-y-4 lg:pr-6"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.h1
              className="text-lg lg:text-xl font-bold leading-tight bg-gradient-to-r from-red-500 via-red-400 to-red-300 bg-clip-text text-black"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Popular Artworks of the Week
            </motion.h1>
            
            <motion.p
              className="text-xs text-gray-700 leading-relaxed max-w-sm"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              Dive into this week's handpicked collection of stunning creations— 
              each piece a bold exploration of imagination, emotion, and visual 
              storytelling.
            </motion.p>
          </motion.div>

          {/* Right Content - Masonry Image Grid */}
          <motion.div
            className="grid grid-cols-3 gap-3 h-400px]" // ⬅️ scaled to fit inside 500px container
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Column 1 */}
            <div className="space-y-3">
              <VerticalScrollImage src={gridImages[0]} alt="Abstract art piece" className="h-28" index={0} />
              <VerticalScrollImage src={gridImages[6]} alt="Red liquid portrait" className="h-24" index={3} />
              <VerticalScrollImage src={gridImages[3]} alt="Mystic forest scene" className="h-48" index={6} />
            </div>

            {/* Column 2 */}
            <div className="space-y-3">
              <VerticalScrollImage src={gridImages[1]} alt="Neon portrait" className="h-24" index={1} />
              <VerticalScrollImage src={gridImages[7]} alt="Dried flowers" className="h-48" index={4} />
              <VerticalScrollImage src={gridImages[4]} alt="Cosmic art" className="h-32" index={7} />
            </div>

            {/* Column 3 */}
            <div className="space-y-3">
              <VerticalScrollImage src={gridImages[2]} alt="Golden landscape" className="h-28" index={2} />
              <VerticalScrollImage src={gridImages[8]} alt="Blue flower petals" className="h-20" index={5} />
              <VerticalScrollImage src={gridImages[5]} alt="Abstract composition" className="h-48" index={8} />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ArtVideoIntro;
