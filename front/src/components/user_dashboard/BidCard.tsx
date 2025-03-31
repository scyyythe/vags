import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import ArtCardMenu from "./ArtCardMenu";
import { toast } from "sonner";

interface BidCardProps {
  id: string;
  artworkImage: string;
  title: string;
  currentBid: string;
}

const BidCard = ({ id, artworkImage, title, currentBid }: BidCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handlePlaceBid = () => {
    toast("Bid placed successfully");
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

  return (
    <div className="art-card">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={artworkImage}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs py-1 px-2 rounded-full">
          10d 18h 45m
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm">{title}</h3>
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
          <div className="text-xs text-muted-foreground">
            Current Bid: <span className="font-medium text-foreground">{currentBid}</span>
          </div>
          <button onClick={handlePlaceBid} className="button-primary text-xs py-1 px-3">
            Place a Bid
          </button>
        </div>
      </div>
    </div>
  );
};

export default BidCard;