import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import IdentitySelectionPopup from "./IdentitySelection";
import { usePlaceBid } from "@/hooks/bid/usePlaceBid";
import { ArtworkAuction } from "@/hooks/auction/useAuction";

interface BidPopupProps {
  isOpen: boolean;
  data: ArtworkAuction;
  onClose: () => void;
  artworkId: string;
  artworkTitle: string;
  username?: string;
  fullName?: string;
  start_bid_amount: number;
  onBidSuccess?: () => void;
}

const BidPopup: React.FC<BidPopupProps> = ({
  isOpen,
  onClose,
  artworkId,
  data,
  artworkTitle,
  username = "@AnonymousArtFan",
  fullName = "Anonymous User",
  start_bid_amount,
  onBidSuccess,
}) => {
  const [bidAmount, setBidAmount] = useState<string>("");
  const [showIdentityPopup, setShowIdentityPopup] = useState(false);
  const { mutate: placeBid } = usePlaceBid();

  useEffect(() => {
    if (typeof window === "undefined" || !document.body) return;
    document.body.classList.toggle("no-scroll", isOpen);
    return () => document.body.classList.remove("no-scroll");
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const start = new Date(data.start_time);
    const now = new Date();

    if (now < start) {
      const formattedStart = start.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      toast.error(`Auction hasn't started yet. It will start on ${formattedStart}`);
      return;
    }

    const bid = parseInt(bidAmount);

    if (isNaN(bid)) {
      toast.error("Please enter a valid number.");
      return;
    }

    if (bid < start_bid_amount) {
      toast.warning(`Minimum bid amount is ₱${start_bid_amount}`);
      return;
    }

    // Show identity selection popup
    setShowIdentityPopup(true);
  };

  const handleIdentityConfirm = (identity: "anonymous" | "username" | "fullName") => {
    const bid = parseInt(bidAmount);
    if (!isNaN(bid) && artworkId) {
      placeBid(
        {
          artwork_id: artworkId,
          amount: bid,
          identity_type: identity,
        },
        {
          onSuccess: () => {
            toast.success(`Bid of ₱${bid.toLocaleString()} placed as ${identity}`);
            setShowIdentityPopup(false);
            setBidAmount("");
            onClose();
            if (onBidSuccess) onBidSuccess();
          },
        }
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-xs mx-4 relative" onClick={(e) => e.stopPropagation()}>
        <div className="py-6 px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="relative text-lg font-bold top-5">Place your bid</h2>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-gray-600 hover:text-black"
            >
              <X size={17} />
            </button>
          </div>

          <p className="text-gray-600 text-[10px] mb-8">
            You're placing a bid for <span className="text-red-900 font-semibold">{artworkTitle}</span>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-8 text-[10px]">
              <label className="block text-xs font-medium mb-2">Enter bid amount</label>
              <input
                type="number"
                placeholder={`Minimum bid ₱${start_bid_amount}`}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-red-800"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-800 hover:bg-red-700 text-white text-[10px] py-2 rounded-full font-medium transition-colors"
            >
              Place Bid
            </button>
          </form>
        </div>
      </div>

      {/* Identity Selection Modal */}
      <IdentitySelectionPopup
        isOpen={showIdentityPopup}
        onClose={() => setShowIdentityPopup(false)}
        onConfirm={handleIdentityConfirm}
        username={username}
      />
    </div>
  );
};

export default BidPopup;
