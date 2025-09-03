import { motion } from "framer-motion";
import { Heart, Flame } from "lucide-react";

interface ArtworkInfoCardProps {
  title: string;
  artist: string;
  tagline: string;
  isVisible: boolean;
}

export const ArtworkInfoCard = ({ title, artist, tagline, isVisible }: ArtworkInfoCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 50,
        scale: isVisible ? 1 : 0.9,
      }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="absolute bottom-8 left-8 right-8 md:bottom-16 md:left-16 md:right-auto md:w-96"
    >
      <div className="backdrop-blur-md bg-card/80 border border-border rounded-2xl p-6 glow-effect">
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-2 rounded-full bg-gallery-glow/20"
          >
            <Flame className="w-5 h-5 text-gallery-accent" />
          </motion.div>
          <span className="text-sm font-medium text-gallery-accent">Trending Now</span>
        </div>
        
        <h3 className="text-2xl font-bold text-glow mb-2">{title}</h3>
        <p className="text-lg text-muted-foreground mb-3">{artist}</p>
        <p className="text-sm text-foreground/80 leading-relaxed">{tagline}</p>
        
        <div className="flex items-center gap-2 mt-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Heart className="w-4 h-4 text-gallery-highlight fill-gallery-highlight" />
          </motion.div>
          <span className="text-xs text-muted-foreground">Featured Artwork</span>
        </div>
      </div>
    </motion.div>
  );
};