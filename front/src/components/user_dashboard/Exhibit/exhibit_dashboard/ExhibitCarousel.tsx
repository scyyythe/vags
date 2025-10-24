import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowLeft, Eye, Heart, MessageCircle, Grid3X3, Info } from "lucide-react";
import { useExhibitCardDetail } from "@/hooks/exhibit/useCardDetail";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import ExhibitCardDetailSkeleton from "@/components/skeletons/exhibits/ExhibitCardDetail";

const ExhibitCarousel = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const { data: exhibit, isLoading } = useExhibitCardDetail(id);
  const [currentArtworkIndex, setCurrentArtworkIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showDescriptionPopup, setShowDescriptionPopup] = useState(false);

  // Translation hooks
  const exhibitDetailsText = useAutoTranslation("Exhibit Details", language);
  const backToExhibitText = useAutoTranslation("Back to Exhibit", language);
  const artworkText = useAutoTranslation("Artwork", language);
  const ofText = useAutoTranslation("of", language);
  const noArtworksText = useAutoTranslation("No artworks found in this exhibit.", language);
  const viewsText = useAutoTranslation("views", language);
  const likesText = useAutoTranslation("likes", language);
  const commentsText = useAutoTranslation("comments", language);
  const exploreGalleryText = useAutoTranslation("Explore Gallery", language);

  const artworks = exhibit?.artworks || [];
  const currentArtwork = artworks[currentArtworkIndex];

  // Debug logging
  useEffect(() => {
    console.log('Exhibit data:', exhibit);
    console.log('Artworks:', artworks);
    console.log('Current artwork:', currentArtwork);
    if (artworks.length > 0) {
      console.log('First artwork structure:', artworks[0]);
      console.log('First artwork image sources:', {
        artworkImage: artworks[0].artworkImage,
        image_url: artworks[0].image_url,
        title: artworks[0].title
      });
    }
  }, [exhibit, artworks, currentArtwork]);

  const handlePrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentArtworkIndex((prev) => (prev > 0 ? prev - 1 : artworks.length - 1));
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentArtworkIndex((prev) => (prev < artworks.length - 1 ? prev + 1 : 0));
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleArtworkClick = (index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentArtworkIndex(index);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  if (!id) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
      
        <div className="container mx-auto pt-24 px-4 text-center">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Exhibit Not Found</h2>
          <p className="mb-8 text-xs text-gray-600 dark:text-gray-300">The exhibit you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/exhibits')} 
            className="text-red-600 dark:text-red-400 text-xs hover:underline"
          >
            Return to Exhibits
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <ExhibitCardDetailSkeleton />;
  }

  if (!exhibit) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="container mx-auto pt-24 px-4 text-center">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Exhibit Not Found</h2>
          <p className="mb-8 text-xs text-gray-600 dark:text-gray-300">The exhibit you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/exhibits')} 
            className="text-red-600 dark:text-red-400 text-xs hover:underline"
          >
            Return to Exhibits
          </button>
        </div>
      </div>
    );
  }

  if (artworks.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="container mx-auto pt-24 px-4 text-center">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">{noArtworksText}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            This exhibit doesn't have any artworks yet or the artworks are not properly loaded.
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Debug Info:</strong> Check the browser console for detailed artwork data structure.
            </p>
          </div>
          <button 
            onClick={() => navigate(`/view-exhibit/${id}`)} 
            className="text-red-600 dark:text-red-400 text-xs hover:underline"
          >
            {backToExhibitText}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-red-100 dark:from-gray-900 dark:via-red-900/20 dark:to-red-800/30 relative overflow-hidden">
      {/* Background Design Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Decorative Circles */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-red-200/20 dark:bg-red-800/20 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-red-300/30 dark:bg-red-700/30 rounded-full blur-lg"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-red-100/25 dark:bg-red-900/25 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-red-200/20 dark:bg-red-800/20 rounded-full blur-xl"></div>
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-red-200/10 to-transparent dark:from-red-800/10 rounded-br-full"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-red-200/10 to-transparent dark:from-red-800/10 rounded-tl-full"></div>
        
        {/* Floating Artistic Elements */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-red-400/40 dark:bg-red-600/40 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-red-500/50 dark:bg-red-500/50 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/3 left-1/5 w-1.5 h-1.5 bg-red-300/60 dark:bg-red-700/60 rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-2/3 right-1/5 w-1 h-1 bg-red-400/30 dark:bg-red-600/30 rounded-full animate-pulse delay-1500"></div>
        
        {/* Museum-style Frame Elements */}
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-red-300/20 to-transparent dark:via-red-700/20"></div>
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-red-300/20 to-transparent dark:via-red-700/20"></div>
      </div>
        <style>{`
          @keyframes float {
            0% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
            100% {
              transform: translateY(0px);
            }
          }
          
          @keyframes floatShadow {
            0% {
              box-shadow: 0 0 20px rgba(0,0,0,0.2), 0 0 40px rgba(0,0,0,0.1), 0 0 60px rgba(0,0,0,0.05);
            }
            50% {
              box-shadow: 0 0 30px rgba(0,0,0,0.3), 0 0 60px rgba(0,0,0,0.2), 0 0 90px rgba(0,0,0,0.1);
            }
            100% {
              box-shadow: 0 0 20px rgba(0,0,0,0.2), 0 0 40px rgba(0,0,0,0.1), 0 0 60px rgba(0,0,0,0.05);
            }
          }
        `}</style>
      {/* Header */}
      <div className="container mx-auto px-4 md:px-6 py-2 md:py-4">
        <div className={`mt-2 md:mt-3 ${isMobile ? "px-4 pt-2" : "md:ml-12"}`}>
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => navigate(`/view-exhibit/${id}`)}
              className="flex items-center text-sm font-semibold text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300"
            >
              <ArrowLeft size={16} className="mr-2" />
              {backToExhibitText}
            </button>
       
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Title Header */}
          <div className="text-center mb-4 z-50 relative">
            <div className="relative flex items-center justify-center mb-1">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                {exhibit?.title || "Exhibit"}
              </h1>
            
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-xs">Exhibit Title</p>
          </div>

          {/* Main Carousel */}
    
          <div className="relative w-full h-[500px] lg:h-[700px] overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-br from-white/10 via-red-100/20 to-red-200/30 dark:from-black/20 dark:via-red-900/10 dark:to-red-800/20 backdrop-blur-sm mt-4 border border-red-200/30 dark:border-red-800/30">
            {/* Artwork Info - Left Side */}
            <div className="absolute left-4 top-4 z-20">
              <div className="text-gray-800 dark:text-white text-xs px-2 py-1 rounded bg-white/80 dark:bg-black/40 backdrop-blur-sm">
                {artworkText} {currentArtworkIndex + 1} {ofText} {artworks.length}
              </div>
            </div>

            {/* Category - Top Right */}
            <div className="absolute right-4 top-4 z-20">
              <div className="text-gray-800 dark:text-white text-xs">
                <span className="text-gray-600 dark:text-gray-400">Category:</span> {exhibit?.category ? exhibit.category.charAt(0).toUpperCase() + exhibit.category.slice(1) : "Art Collection"}
              </div>
            </div>

            {/* Exhibit Time Info - Bottom Right */}
            <div className="absolute right-4 bottom-4 z-20">
              <div className="text-gray-800 dark:text-white text-xs">
                {exhibit?.startDate && exhibit?.endDate && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">Start:</span> 
                    <span>{new Date(exhibit.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    <span className="text-gray-600 dark:text-gray-400">End:</span>
                    <span>{new Date(exhibit.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}
              </div>
            </div>


<div
  className="absolute inset-0 flex items-center justify-center"
  style={{ perspective: "1300px" }}
>
  {artworks.map((artwork, index) => {
    const total = artworks.length;
    const isActive = index === currentArtworkIndex;

    // Adjust layout based on number of artworks
    let radius, angle, maxAngle;
    
    if (total <= 4) {
      // For 4 or fewer artworks - tighter, more focused layout
      radius = isMobile ? 200 : 350;
      maxAngle = 60; // Limit spread to 60 degrees on each side
      angle = (maxAngle * 2 / (total - 1)) * (index - currentArtworkIndex);
    } else if (total <= 6) {
      // For 5-6 artworks - moderate spread
      radius = isMobile ? 250 : 400;
      maxAngle = 90; // 90 degrees on each side
      angle = (maxAngle * 2 / (total - 1)) * (index - currentArtworkIndex);
    } else {
      // For 7+ artworks - full circular spread
      radius = isMobile ? 300 : 500;
      angle = (360 / total) * (index - currentArtworkIndex);
    }

    const x = Math.sin((angle * Math.PI) / 180) * radius;
    const z = Math.cos((angle * Math.PI) / 180) * radius;

    // Active/side styling
    const isLeftNeighbor =
    index === (currentArtworkIndex - 1 + total) % total;
  const isRightNeighbor =
    index === (currentArtworkIndex + 1) % total;
  
  // Emphasis logic for 3 main visible cards
  let scale = 0.8;
  let opacity = 0.3;
  let blur = "3px";
  let depth = -Math.abs(z) / 4;
  let rotationY = angle;
  
  if (isActive) {
    scale = 1.2;
    opacity = 1;
    blur = "0px";
    depth = 100;
  } else if (isLeftNeighbor || isRightNeighbor) {
    scale = 1.0;
    opacity = 0.8;
    blur = "1px";
  
    // Move slightly closer to the viewer for emphasis
    depth = 120;
  
    // Slight inward rotation for cinematic feel
    if (isLeftNeighbor) rotationY += 10;
    if (isRightNeighbor) rotationY -= 10;
  } else if (total <= 4) {
    // For small collections, make all artworks more visible
    scale = 0.9;
    opacity = 0.6;
    blur = "1px";
    depth = 80;
  }
  
  
  const transform = `translate(-50%, -50%) rotateY(${rotationY}deg) translateZ(${depth}px) scale(${scale})`;
  
    const imageUrl =
      artwork.artworkImage ||
      (Array.isArray(artwork.image_url)
        ? artwork.image_url[0]
        : artwork.image_url);

    return (
      <div
        key={artwork.id || index}
        className={`absolute transition-all duration-[900ms] ease-[cubic-bezier(0.45,0,0.55,1)]`}
        
        style={{
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) translate3d(${x}px, 0, ${depth}px) rotateY(${angle}deg) scale(${scale})`,
          opacity,
          filter: `blur(${blur})`,
          zIndex: isActive ? 40 : 10 - Math.abs(index - currentArtworkIndex),
        }}
      >
          <div
            onClick={() => handleArtworkClick(index)}
            className={`relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-700 ${
              isActive
                ? "ring-2 ring-white/90 shadow-[0_0_40px_rgba(0,0,0,0.3),0_0_80px_rgba(0,0,0,0.2),0_0_120px_rgba(0,0,0,0.1)] hover:scale-[1.03] animate-[float_4s_ease-in-out_infinite,floatShadow_4s_ease-in-out_infinite]"
                : "shadow-[0_0_20px_rgba(0,0,0,0.2),0_0_40px_rgba(0,0,0,0.1)] hover:scale-95 animate-[float_6s_ease-in-out_infinite,floatShadow_6s_ease-in-out_infinite]"
            } ${isMobile ? (isActive ? "w-36 h-44" : "w-32 h-40") : (isActive ? "w-52 h-64" : "w-44 h-56")}`}
          >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={artwork.title || `Artwork ${index + 1}`}
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
              <div className="text-center text-gray-600 dark:text-gray-400">
                <div className="text-3xl mb-2">🎨</div>
                <div className="text-xs">No Image</div>
              </div>
            </div>
          )}

            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2 rounded-b-2xl">
                <h3 className="text-white font-bold text-[10px] mb-0.5 drop-shadow-lg">
                  {artwork.title || `Artwork ${index + 1}`}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-gray-300 text-[9px]">{artwork.artist || "Unknown Artist"}</p>
                  {artwork.description && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDescriptionPopup(true);
                      }}
                      className="bg-black/40 backdrop-blur-sm rounded-full p-1 text-white/80 hover:text-white hover:bg-black/60 transition-all duration-200"
                    >
                      <Info size={10} />
                    </button>
                  )}
                </div>
              </div>
            )}
        </div>
        
      </div>
    );
  })}
</div>


  {/* Navigation Controls - Side Arrows */}
  {artworks.length > 1 && (
    <>
      {/* Left Arrow */}
      <button
        onClick={handlePrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-40 p-2 hover:bg-white/20 dark:hover:bg-white/20 rounded-full transition"
        disabled={isTransitioning}
      >
        <ChevronLeft size={24} className="text-gray-800 dark:text-white" />
      </button>

      {/* Right Arrow */}
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-40 p-2 hover:bg-white/20 dark:hover:bg-white/20 rounded-full transition"
        disabled={isTransitioning}
      >
        <ChevronRight size={24} className="text-gray-800 dark:text-white" />
      </button>

     
    </>
  )}
</div>

        </div>

        {/* Exhibit Info Panel */}
        <div className="mt-6 bg-gradient-to-r from-white/80 via-red-50/80 to-red-100/80 dark:from-black/20 dark:via-red-900/10 dark:to-red-800/20 backdrop-blur-sm rounded-2xl p-4 border border-red-200/30 dark:border-red-800/30">
          <div className="flex items-center justify-between">
            {/* Left Side - Collaborators */}
            <div className="flex items-center gap-4">
              <div className="text-gray-800 dark:text-white/80 text-xs">
                <span className="text-gray-600 dark:text-gray-400">Owner:</span> {
                  typeof exhibit?.owner === 'string' 
                    ? exhibit.owner 
                    : (exhibit?.owner?.name || exhibit?.owner?.id || "Unknown")
                }
              </div>
              {exhibit?.collaborators && Array.isArray(exhibit.collaborators) && exhibit.collaborators.length > 0 && (
                <div className="text-gray-800 dark:text-white/80 text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Collaborators:</span> {
                    exhibit.collaborators
                      .filter(collab => collab != null)
                      .map(collab => {
                        if (typeof collab === 'string') return collab;
                        if (typeof collab === 'object' && collab !== null) {
                          return collab.name || collab.id || 'Unknown';
                        }
                        return String(collab);
                      })
                      .join(", ")
                  }
                </div>
              )}
            </div>

            {/* Right Side - Time Info */}
            <div className="flex items-center gap-4 text-gray-800 dark:text-white/80 text-xs">
              {exhibit?.startTime && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Start:</span> {new Date(exhibit.startTime).toLocaleDateString()}
                </div>
              )}
              {exhibit?.endTime && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">End:</span> {new Date(exhibit.endTime).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description Popup Modal */}
        {showDescriptionPopup && currentArtwork && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-md w-full max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg">
                  {currentArtwork.title || `Artwork ${currentArtworkIndex + 1}`}
                </h3>
                <button
                  onClick={() => setShowDescriptionPopup(false)}
                  className="text-white/60 hover:text-white text-xl"
                >
                  ×
                </button>
              </div>
              {currentArtwork.description && (
                <p className="text-white/90 text-sm leading-relaxed text-justify">
                  {currentArtwork.description}
                </p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ExhibitCarousel;
