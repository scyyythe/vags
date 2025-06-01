import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ArtworkImageCarouselProps {
  images: string[];
  title: string;
  onExpand: () => void;
  isMobile?: boolean;
}

const ArtworkImageCarousel = ({ images, title, onExpand, isMobile = false }: ArtworkImageCarouselProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const shouldShowNavigation = images.length > 1;

  return (
    <div
      className={`relative ${isMobile ? "w-full" : "w-[580px] h-[420px]"} group`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`${isMobile ? "" : "w-full h-full overflow-hidden shadow-[0_4px_14px_rgba(0,0,0,0.15)] rounded-xl"}`}>
        <img
          src={images[currentImageIndex]}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 rounded-xl cursor-pointer"
          onClick={onExpand}
        />

        {/* Navigation arrows - only show if multiple images and hovered */}
        {shouldShowNavigation && isHovered && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-all duration-200 z-10"
            >
              <ChevronLeft size={20} className="text-gray-700" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-all duration-200 z-10"
            >
              <ChevronRight size={20} className="text-gray-700" />
            </button>
          </>
        )}

        {/* Image indicators */}
        {shouldShowNavigation && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentImageIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}

        {/* Expand Button Container */}
        <div className={`absolute bottom-3 right-3 ${isMobile ? "" : "z-10"} flex flex-col items-end gap-3`}>
          <div
            className="group flex flex-row-reverse items-center bg-white/70 backdrop-blur-md rounded-full px-1 py-1 shadow-md overflow-hidden w-[32px] h-[32px] hover:w-[90px] hover:pl-4 transition-[width,padding] ease-in-out duration-700 cursor-pointer"
            onClick={onExpand}
          >
            <i className="bx bx-expand-alt text-[12px] mr-[6px]"></i>
            <span className="mr-3 text-[10px] font-medium whitespace-nowrap transform translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all ease-in-out duration-700">
              Expand
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkImageCarousel;
