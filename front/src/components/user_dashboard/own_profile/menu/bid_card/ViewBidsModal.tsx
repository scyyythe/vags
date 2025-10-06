import React, { useEffect } from "react";
import { X } from "lucide-react";

interface Bid {
  id?: string;
  amount: number;
  bidderFullName: string;
  timestamp: string | Date;
  identity_type?: string;
  user?: {
    profile_picture?: string;
  };
}

interface ViewBidsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bids: Bid[];
  isOwner?: boolean;
  formatBidDate?: (date: string | Date) => string;
}

const ViewBidsModal: React.FC<ViewBidsModalProps> = ({
  isOpen,
  onClose,
  bids,
  isOwner = true,
  formatBidDate = (date) => new Date(date).toLocaleString(),
}) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // Cleanup when modal is unmounted
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-xs max-h-md flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 flex-shrink-0">
          <h2 className="font-semibold text-sm">Bids</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Bids List */}
        <div className="p-4 overflow-y-auto flex-1">
          <div className="flex flex-col gap-3">
            {bids.length > 0 ? (
              bids.map((bid) => {
                const isAnonymous = bid.identity_type === "anonymous";
                const profilePicture =
                  !isAnonymous && bid.user?.profile_picture
                    ? bid.user.profile_picture
                    : null;
                const avatarLetter = (
                  bid.bidderFullName?.charAt(0) || "A"
                ).toUpperCase();

                return (
                  <div
                    key={bid.id || bid.timestamp.toString()}
                    className="flex items-center gap-3"
                  >
                    {profilePicture ? (
                      <img
                        src={profilePicture}
                        alt={bid.bidderFullName || "Bidder"}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700 border border-gray-300">
                        {avatarLetter}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <i className="bx bx-money text-sm text-gray-400"></i>
                        <span className="font-semibold text-sm">
                          {bid.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <span>by</span>
                        <span className="font-medium text-gray-700">
                          {bid.bidderFullName}
                        </span>
                        {isOwner && formatBidDate && (
                          <span className="ml-1 text-xs text-gray-400">
                            {formatBidDate(bid.timestamp)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-xs text-gray-400">
                No bids yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBidsModal;
