import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import IdentitySelectionPopup from "./IdentitySelection";
import { toast } from "sonner";
interface BidPopupProps {
  isOpen: boolean;
  onClose: () => void;
  artworkTitle: string;
  onSubmit: (bidAmount: number, identity: "anonymous" | "username" | "fullName") => void;
}

const BidPopup: React.FC<BidPopupProps> = ({ isOpen, onClose, artworkTitle, onSubmit }) => {
  const [bidAmount, setBidAmount] = useState<string>("");
  const [showIdentityPopup, setShowIdentityPopup] = useState(false);
  const serviceFee = 100;
  const marketplaceFee = bidAmount ? parseInt(bidAmount) * 0.05 : 0;
  const totalBidAmount = bidAmount ? parseInt(bidAmount) + serviceFee + marketplaceFee : 0;

  useEffect(() => {
    if (typeof window === "undefined" || !document.body) return;

    if (isOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const bid = parseInt(bidAmount);

    // Validation: Check if it's a valid number
    if (isNaN(bid)) {
      toast.error("Please enter a valid number.");
      return;
    }

    if (bid < 90000) {
      toast.warning("Minimum bid amount is ₱90,000.");
      return;
    }

    // If valid, proceed to identity selection
    setShowIdentityPopup(true);
  };

  const handleIdentityConfirm = (identity: "anonymous" | "username" | "fullName") => {
    if (bidAmount) {
      onSubmit(parseInt(bidAmount), identity);
      setShowIdentityPopup(false);
      onClose();
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
                placeholder="minimum bid 90k"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-red-800"
                required
                min="90000"
              />
            </div>

            {/* <div className="space-y-4 mb-6">
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-700">Service fee</span>
                <span className="font-medium">100</span>
              </div>
              <Separator className="my-6" />
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-700">Marketplace fee 5%</span>
                <span className="font-medium">{marketplaceFee}</span>
              </div>
              
            </div> */}
            {/* <div className="flex justify-between text-xs font-semibold mb-6">
              <span>Total bid amount</span>
              <span>{totalBidAmount}</span>
            </div> */}
            <button
              type="submit"
              className="w-full bg-red-800 hover:bg-red-700 text-white text-[10px] py-2 rounded-full font-medium transition-colors"
            >
              Place Bid
            </button>
          </form>
        </div>
      </div>
      <IdentitySelectionPopup
        isOpen={showIdentityPopup}
        onClose={() => setShowIdentityPopup(false)}
        onConfirm={handleIdentityConfirm}
      />
    </div>
  );
};

export default BidPopup;
