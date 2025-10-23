import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VerticalScrollImage from "./VerticalScrollImage";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { useLanguage } from "@/context/LanguageContext";

interface Artwork {
  id: string;
  title: string;
  image_url: string[];
  artist: { name: string };
  likes_count: number;
}

interface ArtVideoIntroProps {
  artworks: Artwork[];
}

/** Single column that vertically marquee-scrolls its children */
const VerticalMarqueeColumn = ({
  images,
  heights,
  duration,
  delay = 0,
}: {
  images: string[];
  heights: string[]; // e.g. ["h-28","h-24","h-48"]
  duration: number;  // seconds
  delay?: number;    // seconds (can be negative to desync)
}) => {
  // Duplicate once for seamless loop (100% -> -50%)
  const looped = useMemo(() => images.concat(images), [images]);

  return (
    <div className="relative overflow-hidden h-[400px]">
      <div
        className="flex flex-col gap-3 animate-vertical"
        style={{
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
        }}
      >
        {looped.map((src, i) => (
          <VerticalScrollImage
            key={`${src}-${i}`}
            src={src}
            alt="Artwork"
            className={`${heights[i % heights.length]} w-full`}
            index={i}
          />
        ))}
      </div>
    </div>
  );
};

const ArtVideoIntro = ({ artworks }: ArtVideoIntroProps) => {
  const [showNarration, setShowNarration] = useState(true);
  const { language } = useLanguage();
  const popularArtworksTitle = useAutoTranslation("Popular Artworks of the Week", language);
  const description = useAutoTranslation("Dive into this week's handpicked collection of stunning creations—each piece a bold exploration of imagination, emotion, and visual storytelling.", language);

  // Repeat the first 5 artworks to ensure we can fill/overflow
  const base = useMemo(() => artworks.slice(0, 5), [artworks]);
  const repeated = useMemo(
    () => Array.from({ length: 12 }, (_, i) => base[i % Math.max(base.length, 1)]).filter(Boolean),
    [base]
  );
  const gridImages = useMemo(
    () => repeated.map((a) => a.image_url?.[0]).filter(Boolean),
    [repeated]
  );

  // Build columns (3x3 layout order), then each column marquee-scrolls
  const col1 = useMemo(() => [gridImages[0], gridImages[6], gridImages[3]].filter(Boolean), [gridImages]);
  const col2 = useMemo(() => [gridImages[1], gridImages[7], gridImages[4]].filter(Boolean), [gridImages]);
  const col3 = useMemo(() => [gridImages[2], gridImages[8], gridImages[5]].filter(Boolean), [gridImages]);

  return (
    <AnimatePresence>
      <motion.div
        className="h-full w-full flex items-center justify-center relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 1 }}
      >
        <div className="w-full h-full px-4 grid gap-6 lg:grid-cols-2 items-center">
          {/* Left Content - Text Section */}
          <motion.div
            className="space-y-3 text-center lg:text-left lg:pl-10 mt-6 lg:mt-0"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.h1
              className="text-base sm:text-lg lg:text-2xl font-bold leading-tight
                        bg-gradient-to-r from-red-500 via-red-400 to-red-300
                        bg-clip-text text-black dark:text-gray-100"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {popularArtworksTitle}
            </motion.h1>

            <motion.p
              className="text-xs sm:text-xs text-gray-700 dark:text-gray-300 leading-relaxed max-w-full sm:max-w-[430px] mx-auto lg:mx-0"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              {description}
            </motion.p>
          </motion.div>

          {/* Right Content - Vertical Marquee Columns */}
          <motion.div
            className="grid grid-cols-3 gap-2 sm:gap-3 w-full lg:pr-10"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Column 1 */}
            <VerticalMarqueeColumn
              images={col1}
              heights={["h-24", "h-28", "h-40"]} // smaller for mobile
              duration={22}
              delay={0}
            />

            {/* Column 2 */}
            <VerticalMarqueeColumn
              images={col2}
              heights={["h-20", "h-40", "h-72"]}
              duration={25}
              delay={-4}
            />

            {/* Column 3 */}
            <VerticalMarqueeColumn
              images={col3}
              heights={["h-28", "h-16", "h-60"]}
              duration={20}
              delay={-8}
            />
          </motion.div>
        </div>


        {/* Vertical marquee keyframes */}
        <style>{`
          @keyframes vertical-marquee {
            0%   { transform: translateY(0%); }
            100% { transform: translateY(-50%); }
          }
          .animate-vertical {
            animation-name: vertical-marquee;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
            will-change: transform;
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
};

export default ArtVideoIntro;
