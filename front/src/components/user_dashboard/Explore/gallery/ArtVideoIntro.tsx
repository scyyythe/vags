import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VerticalScrollImage from "./VerticalScrollImage";

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
        <div className="w-full h-full px-6 grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Content - Text Section */}
          <motion.div
            className="space-y-4 lg:pl-10"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.h1
              className="text-lg lg:text-2xl font-bold leading-tight bg-gradient-to-r from-red-500 via-red-400 to-red-300 bg-clip-text text-black"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Popular Artworks of the Week
            </motion.h1>

            <motion.p
              className="text-xs text-gray-700 leading-relaxed max-w-[430px]"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              Dive into this week's handpicked collection of stunning creations—
              each piece a bold exploration of imagination, emotion, and visual
              storytelling.
            </motion.p>
          </motion.div>

          {/* Right Content - Vertical Marquee Columns */}
          <motion.div
            className="grid grid-cols-3 gap-3 pr-10"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Column 1 */}
            <VerticalMarqueeColumn
              images={col1}
              heights={["h-28", "h-24", "h-48"]}
              duration={22}
              delay={0}
            />

            {/* Column 2 */}
            <VerticalMarqueeColumn
              images={col2}
              heights={["h-24", "h-48", "h-32"]}
              duration={25}
              delay={-4}
            />

            {/* Column 3 */}
            <VerticalMarqueeColumn
              images={col3}
              heights={["h-32", "h-20", "h-48"]}
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
