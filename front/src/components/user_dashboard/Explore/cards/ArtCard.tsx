import { useState, useEffect, useContext, useCallback } from "react";
import { Heart, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LikedArtworksContext } from "@/context/LikedArtworksProvider";
import { toast } from "sonner";
import TipJarIcon from "../tip_jar/TipJarIcon";
import { useDonation } from "../../../../context/DonationContext";
// import ArtCardMenu from "./ArtCardMenu";
import OwnerMenu from "@/components/user_dashboard/own_profile/Menu";
import { Link } from "react-router-dom";
import useFavorite from "@/hooks/interactions/useFavorite";
import useLikeStatus from "@/hooks/interactions/useLikeStatus";
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

  const { data, error, isLoading } = useLikeStatus(id);
  const { likedArtworks, likeCounts, setLikedArtworks, setLikeCounts, toggleLike } = useContext(LikedArtworksContext);
  const { openPopup } = useDonation();

  useEffect(() => {
    if (data) {
      setLikedArtworks((prev) => ({ ...prev, [id]: data.isLiked }));
      setLikeCounts((prev) => ({ ...prev, [id]: data.likeCount }));
    }
  }, [data, id, setLikedArtworks, setLikeCounts]);

  const handleLike = useCallback(() => {
    toggleLike(id);
  }, [id, toggleLike]);

  const handleHide = useCallback(() => {
    setIsHidden(true);
    toast("Artwork hidden");
    setMenuOpen(false);
  }, []);

  const handleReport = useCallback(() => {
    toast("Artwork reported");
    setMenuOpen(false);
  }, []);

  const handleSaved = useCallback(() => {
    handleFavorite();
    setMenuOpen(false);
  }, [handleFavorite]);

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
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching like status</div>;

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
          {/* CONDITIONAL MENU */}
          {/* {isExplore ? (
            <ArtCardMenu
              isOpen={menuOpen}
              onFavorite={handleSaved}
              onHide={handleHide}
              onReport={handleReport}
              isFavorite={isFavorite}
              isReported={false}
            />
          ) : ( */}
            <OwnerMenu
              isOpen={menuOpen}
              onRequestBid={() => console.log("Request to bid")}
              onSell={() => console.log("Sell artwork")}
              onEdit={() => console.log("Edit artwork")}
              onToggleVisibility={() => console.log("Toggle visibility")}
              onArchive={() => console.log("Archive")}
              isPublic={true}
            />
          {/* )} */}
        </div>
      </div>
      <Link to={`/artwork/${id}`} state={{ artworkImage, artistName, title, likesCount }} className="w-full">
        <div className="aspect-square overflow-hidden p-4">
          <img
            src={artworkImage}
            alt={`Artwork by ${artistName}`}
            className="w-full h-full object-cover transition-transform duration-700 rounded-xl"
          />
        </div>

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
      </Link>
    </div>
  );
};

export default ArtCard;
