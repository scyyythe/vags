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
      className={`rounded-2xl overflow-hidden shadow-2xl ${className}`}
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.8,
        delay: 0.8 + (index * 0.1),
        ease: [0.22, 1, 0.36, 1]
      }}
      whileHover={{ scale: 1.02 }}
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