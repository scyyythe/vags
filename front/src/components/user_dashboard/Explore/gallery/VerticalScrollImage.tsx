import { motion } from "framer-motion";

interface VerticalScrollImageProps {
  src: string;
  alt: string;
  className?: string;
  index: number;
}

const VerticalScrollImage = ({ src, alt, className, index }: VerticalScrollImageProps) => {
  return (
    <motion.div
      className={`rounded-lg overflow-hidden ${className}`}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        duration: 0.8,
        delay: 0.4 + index * 0.15, // stagger
        ease: [0.25, 0.8, 0.25, 1],
      }}
      whileHover={{ scale: 1.03 }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
      />
    </motion.div>
  );
};

export default VerticalScrollImage;
