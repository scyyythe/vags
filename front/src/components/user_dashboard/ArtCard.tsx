import { useState, useContext } from "react";
import { Heart, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LikedArtworksContext } from "@/App";
import { toast } from "sonner";
import TipJarIcon from "./TipJarIcon";
import { useDonation } from "../../context/DonationContext";
import ArtCardMenu from "./ArtCardMenu";
import { Link } from "react-router-dom";

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
  const [isHidden, setIsHidden] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const { likedArtworks, toggleLike } = useContext(LikedArtworksContext);
  const { openPopup } = useDonation();
  
  const handleLike = () => {
    toggleLike(id);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast(isSaved ? "Artwork unsaved" : "Artwork saved");
    setMenuOpen(false);
  };

  const handleHide = () => {
    setIsHidden(true);
    toast("Artwork hidden");
    setMenuOpen(false);
  };

  const handleReport = () => {
    setIsReported(!isReported);
    toast(isReported ? "Artwork report removed" : "Artwork reported");
    setMenuOpen(false);
  };

  const handleFavorite = () => {
    toast("Artwork added in favorites.");
    setMenuOpen(false);
  };

  const handleTipJar = () => {
    console.log("Tip jar clicked for artwork:", id);
    openPopup({
      id,
      title: title || "Untitled Artwork",
      artistName,
      artworkImage,
    });
  };

  if (isHidden) {
    return null;
  }

  if (isExplore) {
    return (
      <div className="art-card h-[100%] text-xs group animate-fadeIn rounded-xl bg-white hover:shadow-lg transition-all duration-300 border 1px border-gray-200 p-4">
        <div className="py-1 px-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8 border">
              <AvatarImage src={artistImage} alt={artistName} />
              <AvatarFallback>{artistName.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium">{artistName}</span>
          </div>
          <div className="relative">
            <button 
              onClick={handleMenuClick} 
              className={`p-1 rounded-full ${menuOpen ? 'border border-gray-300' : ''}`}
            >
              <MoreHorizontal size={16} />
            </button>
            <ArtCardMenu
              isOpen={menuOpen}
              onClose={() => setMenuOpen(false)}
              onFavorite={handleFavorite}
              onHide={handleHide}
              onReport={handleReport}
              onSave={handleSave}
              isSaved={isSaved}
              isFavorited={isFavorited}
              isReported={isReported}
            />
          </div>
        </div>
        <Link to={`/artwork/${id}`} className="w-full">
        <div className="aspect-square overflow-hidden p-4">
          <img
            src={artworkImage}
            alt={`Artwork by ${artistName}`}
            className="w-full h-full object-cover transition-transform duration-700 rounded-xl"
          />
        </div>
        </Link>
        <div className="px-4 py-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{title || "Untitled Artwork"}</p>
            <div className="flex items-center space-x-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
              className={`p-1 rounded-full transition-colors ${
                likedArtworks[id] ? "text-red" : "text-gray-400 hover:text-red"
              }`}
              aria-label="Like artwork"
            >
              <Heart size={18} className={likedArtworks[id] ? "text-red-600 fill-red-600" : "text-gray-800"} fill={likedArtworks[id] ? "currentColor" : "none"} />
            </button>
              <span className="text-xs text-gray-500">
                {/* {Math.floor(Math.random() * 500)} */}
              </span>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleTipJar();
                }}
              >
                <TipJarIcon onClick={handleTipJar}/>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

};
export default ArtCard;
