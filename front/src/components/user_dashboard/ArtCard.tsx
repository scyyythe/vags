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
  const [isFavorite, setIsFavorite] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const { likedArtworks, toggleLike } = useContext(LikedArtworksContext);
  const { openPopup } = useDonation();
  
  const handleLike = () => {
    toggleLike(id);
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
    setIsFavorite(!isFavorite);
    toast(isFavorite ? "Artwork favorite removed" : "Artwork added to favorites");
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
            <Avatar className="h-5 w-5 border">
              <AvatarImage src={artistImage} alt={artistName} />
              <AvatarFallback>{artistName.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-[9px] font-medium">{artistName}</span>
          </div>
          <div className="relative text-gray-500" style={{ height: '24px' }}>
            <button 
              onClick={() => setMenuOpen((prev) => !prev)}
              className={`p-1 rounded-full ${menuOpen ? 'border border-gray-300 text-black' : ''}`}
            >
              <MoreHorizontal size={14} />
            </button>
            <ArtCardMenu
              isOpen={menuOpen}
              onFavorite={handleFavorite}
              onHide={handleHide}
              onReport={handleReport}
              isFavorite={isFavorite}
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
            <p className="text-xs font-medium">{title || "Untitled Artwork"}</p>
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
              <Heart size={15} className={likedArtworks[id] ? "text-red-600 fill-red-600" : "text-gray-800"} fill={likedArtworks[id] ? "currentColor" : "none"} />
            </button>
              <span className="text-xs text-gray-500">
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
