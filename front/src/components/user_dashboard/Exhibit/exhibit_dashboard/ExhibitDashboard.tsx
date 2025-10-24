import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowLeft, Eye, Heart, MessageCircle } from "lucide-react";
import { useExhibitCardDetail } from "@/hooks/exhibit/useCardDetail";
import { useIsMobile } from "@/hooks/use-mobile";
import Header from "@/components/user_dashboard/navbar/Header";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import ExhibitCardDetailSkeleton from "@/components/skeletons/exhibits/ExhibitCardDetail";

const ExhibitDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const { data: exhibit, isLoading } = useExhibitCardDetail(id);
  const [currentArtworkIndex, setCurrentArtworkIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Translation hooks
  const exhibitDetailsText = useAutoTranslation("Exhibit Details", language);
  const backToExhibitText = useAutoTranslation("Back to Exhibit", language);
  const artworkText = useAutoTranslation("Artwork", language);
  const ofText = useAutoTranslation("of", language);
  const noArtworksText = useAutoTranslation("No artworks found in this exhibit.", language);
  const viewsText = useAutoTranslation("views", language);
  const likesText = useAutoTranslation("likes", language);
  const commentsText = useAutoTranslation("comments", language);

  const artworks = exhibit?.artworks || [];
  const currentArtwork = artworks[currentArtworkIndex];

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
        <Header />
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
        <Header />
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
        <Header />
        <div className="container mx-auto pt-24 px-4 text-center">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">{noArtworksText}</h2>
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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      
      {/* Header */}
      <div className="container mx-auto px-4 md:px-6 py-4 md:py-8">
        <div className={`mt-8 md:mt-12 ${isMobile ? "px-4 pt-8" : "md:ml-12"}`}>
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => navigate(`/view-exhibit/${id}`)} 
              className="flex items-center text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <ArrowLeft size={16} className="mr-2" />
              {backToExhibitText}
            </button>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {artworkText} {currentArtworkIndex + 1} {ofText} {artworks.length}
            </div>
          </div>
        </div>

        {/* Main Dashboard */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Artwork Display */}
          <div className="flex-1">
            <div className="relative">
              {/* Current Artwork */}
              <div className="relative w-full h-[500px] lg:h-[600px] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-lg">
                {currentArtwork && (
                  <img
                    src={(() => {
                      // Try artworkImage first, then image_url, with array handling
                      if (currentArtwork.artworkImage && currentArtwork.artworkImage !== "" && currentArtwork.artworkImage !== "h") {
                        return currentArtwork.artworkImage;
                      }
                      if (currentArtwork.image_url) {
                        return Array.isArray(currentArtwork.image_url) ? currentArtwork.image_url[0] : currentArtwork.image_url;
                      }
                      return "";
                    })()}
                    alt={currentArtwork.title || `Artwork ${currentArtworkIndex + 1}`}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                      isTransitioning ? 'opacity-50' : 'opacity-100'
                    }`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (currentArtwork.image_url && target.src !== currentArtwork.image_url) {
                        target.src = Array.isArray(currentArtwork.image_url) ? currentArtwork.image_url[0] : currentArtwork.image_url;
                      }
                    }}
                  />
                )}
                
                {/* Navigation Arrows */}
                {artworks.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevious}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
                      disabled={isTransitioning}
                    >
                      <ChevronLeft size={20} className="text-gray-700 dark:text-gray-300" />
                    </button>
                    
                    <button
                      onClick={handleNext}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
                      disabled={isTransitioning}
                    >
                      <ChevronRight size={20} className="text-gray-700 dark:text-gray-300" />
                    </button>
                  </>
                )}
              </div>

              {/* Artwork Info */}
              {currentArtwork && (
                <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {currentArtwork.title || `Artwork ${currentArtworkIndex + 1}`}
                  </h3>
                  {currentArtwork.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 text-justify">
                      {currentArtwork.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Artwork Thumbnails */}
          <div className="w-full lg:w-80">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {artworkText}s ({artworks.length})
              </h4>
              
              <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                {artworks.map((artwork, index) => (
                  <div
                    key={artwork.id || index}
                    className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
                      index === currentArtworkIndex 
                        ? 'ring-2 ring-blue-500 shadow-lg' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleArtworkClick(index)}
                  >
                    <img
                      src={(() => {
                        // Try artworkImage first, then image_url, with array handling
                        if (artwork.artworkImage && artwork.artworkImage !== "" && artwork.artworkImage !== "h") {
                          return artwork.artworkImage;
                        }
                        if (artwork.image_url) {
                          return Array.isArray(artwork.image_url) ? artwork.image_url[0] : artwork.image_url;
                        }
                        return "";
                      })()}
                      alt={artwork.title || `Artwork ${index + 1}`}
                      className="w-full h-24 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (artwork.image_url && target.src !== artwork.image_url) {
                          target.src = Array.isArray(artwork.image_url) ? artwork.image_url[0] : artwork.image_url;
                        }
                      }}
                    />
                    {index === currentArtworkIndex && (
                      <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                        <div className="bg-blue-500 text-white rounded-full p-1">
                          <ChevronRight size={12} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExhibitDashboard;
