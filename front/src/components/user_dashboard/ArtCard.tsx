import { useState, useContext } from "react";
import { Heart, MoreHorizontal, ShoppingBag } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ArtCardMenu from "./ArtCardMenu";
import { LikedArtworksContext } from "@/App";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ArtCardProps {
  id: string;
  artistName: string;
  artistImage: string;
  artworkImage: string;
  title?: string;
  price?: string;
  currency?: string;
  showPrice?: boolean;
  showButton?: boolean;
  buttonText?: string;
  onButtonClick?: () => void;
  isExplore?: boolean;
}

const ArtCard = ({
  id,
  artistName,
  artistImage,
  artworkImage,
  title,
  price,
  currency = "php",
  showPrice = true,
  showButton = true,
  buttonText = "View Art",
  onButtonClick,
  isExplore = false,
}: ArtCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { likedArtworks, toggleLike } = useContext(LikedArtworksContext);
  
  const handleLike = () => {
    toggleLike(id);
    
    if (!likedArtworks[id]) {
      toast("Artwork added to favorites");
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleSave = () => {
    toast("Artwork saved");
    setMenuOpen(false);
  };

  const handleHide = () => {
    toast("Artwork hidden");
    setMenuOpen(false);
  };

  const handleReport = () => {
    toast("Artwork reported");
    setMenuOpen(false);
  };

  if (isExplore) {
    return (
      <div className="art-card group animate-fadeIn rounded-3xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 border 1px border-gray-200">
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8 border">
              <AvatarImage src={artistImage} alt={artistName} />
              <AvatarFallback>{artistName.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium">{artistName}</span>
          </div>
          <div className="relative">
            <button onClick={handleMenuClick} className="p-1 rounded-full hover:bg-secondary">
              <MoreHorizontal size={16} />
            </button>
            <ArtCardMenu
              isOpen={menuOpen}
              onClose={() => setMenuOpen(false)}
              onSave={handleSave}
              onHide={handleHide}
              onReport={handleReport}
              position="bottom"
            />
          </div>
        </div>
        <div className="aspect-square overflow-hidden p-4">
          <img
            src={artworkImage}
            alt={`Artwork by ${artistName}`}
            className="w-full h-full object-cover transition-transform duration-700 rounded-xl"
          />
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-base font-medium">{title || "Untitled Artwork"}</p>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleLike}
                className={`p-1 rounded-full transition-colors ${
                  likedArtworks[id] ? "text-red" : "text-gray-400 hover:text-red"
                }`}
                aria-label="Like artwork"
              >
                <Heart size={18} fill={likedArtworks[id] ? "#ff2a36" : "none"} />
              </button>
              <span className="text-sm text-gray-500">
                {Math.floor(Math.random() * 500)}
              </span>
              <button 
                className="p-1 rounded-full"
                aria-label="Save artwork"
              >
                <ShoppingBag size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="art-card group animate-fadeIn">
      <div className="aspect-square overflow-hidden relative">
        <img
          src={artworkImage}
          alt={`Artwork by ${artistName}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={artistImage} alt={artistName} />
              <AvatarFallback>{artistName.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{artistName}</span>
          </div>
          <div className="relative">
            <button onClick={handleMenuClick} className="p-1 rounded-full hover:bg-secondary">
              <MoreHorizontal size={16} />
            </button>
            <ArtCardMenu
              isOpen={menuOpen}
              onClose={() => setMenuOpen(false)}
              onSave={handleSave}
              onHide={handleHide}
              onReport={handleReport}
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">
            {showPrice && price ? `${currency} ${price}` : title || "Untitled Artwork"}
          </p>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleLike}
              className={`p-1 rounded-full transition-colors ${
                likedArtworks[id] ? "text-red" : "text-gray-400 hover:text-red"
              }`}
            >
              <Heart size={16} fill={likedArtworks[id] ? "#ff2a36" : "none"} />
            </button>
            {showButton && (
              <button 
                onClick={onButtonClick} 
                className="button-outline text-xs py-1 px-3"
              >
                {buttonText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtCard;