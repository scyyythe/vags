import { useState, useEffect, useContext } from "react";
import { Heart, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LikedArtworksContext } from "@/context/LikedArtworksProvider";
import { toast } from "sonner";
import TipJarIcon from "../tip_jar/TipJarIcon";
import { useDonation } from "../../../../context/DonationContext";
import ArtCardMenu from "./ArtCardMenu";
import { Link } from "react-router-dom";
import apiClient from "@/utils/apiClient";
import useFavorite from "@/hooks/useFavorite";
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
  likesCount: number;
}

const ArtCard = ({
  id,
  artistName,
  artistImage,
  artworkImage,
  title,
  isExplore = false,
  likesCount = 0,
}: ArtCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const { isFavorite, handleFavorite } = useFavorite(id);

  const { likedArtworks, likeCounts, setLikedArtworks, setLikeCounts, toggleLike } = useContext(LikedArtworksContext);
  const { openPopup } = useDonation();

  const handleLike = () => {
    toggleLike(id);
  };

  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const response = await apiClient.get(`/likes/${id}/status/`);
        setLikedArtworks((prev) => ({ ...prev, [id]: response.data.isLiked }));
        setLikeCounts((prev) => ({ ...prev, [id]: response.data.likeCount }));
      } catch (error) {
        console.error("Failed to fetch like status:", error);
      }
    };

    fetchLikeStatus();
  }, [id, setLikedArtworks, setLikeCounts]);

  const handleHide = () => {
    setIsHidden(true);
    toast("Artwork hidden");
    setMenuOpen(false);
  };

  const handleReport = () => {
    toast("Artwork reported");
    setMenuOpen(false);
  };
  const handleSaved = () => {
    handleFavorite();
    setMenuOpen(false);
  };

  const handleTipJar = () => {
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
        <div className="relative text-gray-500" style={{ height: "24px" }}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className={`p-1 rounded-full ${menuOpen ? "border border-gray-300 text-black" : ""}`}
          >
            <MoreHorizontal size={14} />
          </button>
          <ArtCardMenu
            isOpen={menuOpen}
            onFavorite={handleSaved}
            onHide={handleHide}
            onReport={handleReport}
            isFavorite={isFavorite}
            isReported={false}
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
          <p className="text-xs font-medium">
            {title ? title.slice(0, 10) + (title.length > 10 ? "..." : "") : "Untitled Artwork"}
          </p>

          <div className="flex items-center space-x-1">
            <button
              onClick={handleLike}
              className={`p-1 rounded-full transition-colors ${
                likedArtworks[id] ? "text-red" : "text-gray-400 hover:text-red"
              }`}
              aria-label="Like artwork"
            >
              <Heart
                size={15}
                className={likedArtworks[id] ? "text-red-600 fill-red-600" : "text-gray-800"}
                fill={likedArtworks[id] ? "currentColor" : "none"}
              />
            </button>
            <span className="text-[9px] text-gray-500">{likeCounts[id] ?? likesCount}</span>

            <div
              onClick={(e) => {
                e.stopPropagation();
                handleTipJar();
              }}
            >
              <TipJarIcon onClick={handleTipJar} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtCard;
