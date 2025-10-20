import React, { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BidCardSkeleton from "@/components/skeletons/bidding/BidCardSkeleton";
import { getLoggedInUserId } from "@/auth/decode";
import BidCard from "../../Bidding/cards/BidCard";
import useAuctions, { ArtworkAuction } from "@/hooks/auction/useAuction";
import { useMyAuctions } from "@/hooks/auction/useMyAuctions";
import { useRestoreAllAuctions } from "@/hooks/auction/useRestoreAllAuctions";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

type ExtendedAuction = ArtworkAuction & {
  isPaid?: boolean;
  joinedByCurrentUser?: boolean;
  isHighestBidder?: boolean;
  isLost?: boolean;
  visibility?: string;
};

type MyBidFilter = "all" | "active" | "won" | "lost";

type OnBidTabProps = {
  selectedStatus: string;
  onShowUnhidePopup?: () => void;
  onShowRestoreAllPopup?: () => void;
};

const OnBidTab = ({ selectedStatus, onShowUnhidePopup, onShowRestoreAllPopup }: OnBidTabProps) => {
  const [activeTab, setActiveTab] = useState<"on_going" | "sold" | "closed" | "my_bids">("on_going");
  const [myBidFilter, setMyBidFilter] = useState<MyBidFilter>("all");
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();
  const { id: visitedUserId } = useParams();
  const loggedInUserId = getLoggedInUserId();
  const isMyProfile = !visitedUserId || visitedUserId === loggedInUserId;
  const { language } = useLanguage();

  // Translation hooks for status headers
  const deletedAuctionsText = useAutoTranslation("Deleted Auctions", language);
  const hiddenAuctionsText = useAutoTranslation("Hidden Auctions", language);
  const archivedAuctionsText = useAutoTranslation("Archived Auctions", language);
  const privateAuctionsText = useAutoTranslation("Private Auctions", language);

  // Translation hooks for buttons
  const restoreAllText = useAutoTranslation("Restore All", language);
  const unhideAllText = useAutoTranslation("Unhide All", language);

  // Translation hooks for tabs
  const onGoingText = useAutoTranslation("ON GOING", language);
  const soldText = useAutoTranslation("SOLD", language);
  const closedText = useAutoTranslation("CLOSED", language);
  const myBidsText = useAutoTranslation("MY BIDS", language);

  // Translation hooks for filters
  const allText = useAutoTranslation("ALL", language);
  const activeText = useAutoTranslation("ACTIVE", language);
  const wonText = useAutoTranslation("WON", language);
  const lostText = useAutoTranslation("LOST", language);

  // Translation hooks for empty state messages
  const noArtworksOnBidText = useAutoTranslation("No artworks are currently on bid.", language);
  const noArtworksSoldText = useAutoTranslation("No artworks have been sold yet.", language);
  const noArtworksWithoutBiddersText = useAutoTranslation("No artworks without bidders.", language);
  const notJoinedAuctionsText = useAutoTranslation("You haven't joined any auctions yet.", language);
  const noActiveWinningBidsText = useAutoTranslation("No active winning bids.", language);
  const noConfirmedBidsText = useAutoTranslation("No confirmed bids yet.", language);
  const notLostAuctionsText = useAutoTranslation("You haven't lost any auctions yet.", language);
  const { data: participatedAuctions = [], isLoading: isLoadingParticipated } = useAuctions(
    1,
    loggedInUserId,
    true,
    "participated"
  );

  const { data: myAuctions = [], isLoading: isLoadingMyAuctions } = useMyAuctions({
    includeHidden: selectedStatus === "Hidden",
    includeDeleted: selectedStatus === "Deleted",
  });

  const { data: auctions = [], isLoading: isLoadingAuctions } = useAuctions(
    1,
    isMyProfile ? loggedInUserId : visitedUserId,
    true,
    isMyProfile ? "created-by-me" : "specific-user"
  );

  // Use the appropriate data based on profile type and status
  const auctionsToUse =
    isMyProfile && (selectedStatus === "Hidden" || selectedStatus === "Deleted") ? myAuctions : auctions;
  const isLoadingToUse =
    isMyProfile && (selectedStatus === "Hidden" || selectedStatus === "Deleted")
      ? isLoadingMyAuctions
      : isLoadingAuctions;

  const participatedAuctionsWithFlags = useMemo(() => {
    return participatedAuctions
      .filter((auction) => auction.artwork.art_status !== "Claimed") // remove claimed artworks
      .map((auction) => {
        const isHighestBidder = auction.highest_bid?.user?.id === loggedInUserId;
        const joinedByCurrentUser = auction.bid_history?.some((bid) => bid.user?.id === loggedInUserId) ?? false;
        const isPaid = auction.status === "sold" && isHighestBidder;
        const isLost =
          joinedByCurrentUser && !isHighestBidder && (auction.status === "sold" || auction.status === "closed");

        return {
          ...auction,
          isHighestBidder,
          joinedByCurrentUser,
          isPaid,
          isLost,
        };
      });
  }, [participatedAuctions, loggedInUserId]);

  const auctionsToDisplay: ExtendedAuction[] =
    activeTab === "my_bids" ? participatedAuctionsWithFlags : (auctionsToUse as ExtendedAuction[]);

  const filteredAuctions = useMemo(() => {
    return auctionsToDisplay.filter((a) => {
      // If a status filter is applied (not Active), apply appropriate filtering
      if (selectedStatus !== "Active") {
        if (selectedStatus === "Archived") {
          // Show auctions with archived artworks
          return a.artwork?.visibility?.toLowerCase() === "archived";
        } else if (selectedStatus === "Deleted") {
          // Show deleted auctions (check auction visibility, not artwork visibility)
          return a.visibility?.toLowerCase() === "deleted";
        } else if (selectedStatus === "Hidden") {
          // Backend already handles hidden filtering, so show all returned auctions
          return true;
        }
        // For other statuses, show all auctions
        return true;
      }

      // Normal filtering when status is Active
      if (activeTab === "my_bids") {
        if (!a.joinedByCurrentUser) return false;

        switch (myBidFilter) {
          case "active":
            return a.isHighestBidder && a.status === "on_going";
          case "won":
            return a.isHighestBidder && a.status === "sold";
          case "lost":
            return a.isLost;
          case "all":
          default:
            return true;
        }
      }

      return a.status === activeTab;
    });
  }, [auctionsToDisplay, selectedStatus, activeTab, myBidFilter]);

  const tabEmptyMessages = {
    on_going: noArtworksOnBidText,
    sold: noArtworksSoldText,
    closed: noArtworksWithoutBiddersText,
    my_bids: {
      all: notJoinedAuctionsText,
      active: noActiveWinningBidsText,
      won: noConfirmedBidsText,
      lost: notLostAuctionsText,
    },
  };

  const handleBidClick = useCallback(
    (artwork: ArtworkAuction) => {
      localStorage.setItem("selectedBid", JSON.stringify(artwork));
      navigate(`/bid/${artwork.id}/`, { state: { artwork } });
    },
    [navigate]
  );

  // Helper function to get translated tab label
  const getTabLabel = (tab: string): string => {
    switch (tab) {
      case "on_going":
        return onGoingText;
      case "sold":
        return soldText;
      case "closed":
        return closedText;
      default:
        return tab.replace("_", " ").toUpperCase();
    }
  };

  // Helper function to get translated filter label
  const getFilterLabel = (filter: MyBidFilter): string => {
    switch (filter) {
      case "all":
        return allText;
      case "active":
        return activeText;
      case "won":
        return wonText;
      case "lost":
        return lostText;
    }
  };

  return (
    <div>
      {/* Status Filter Header */}
      {selectedStatus !== "Active" && (
        <div className="flex justify-between items-center my-4">
          <h2 className="text-sm font-semibold">
            {selectedStatus === "Deleted" && deletedAuctionsText}
            {selectedStatus === "Hidden" && hiddenAuctionsText}
            {selectedStatus === "Archived" && archivedAuctionsText}
            {selectedStatus === "Private" && privateAuctionsText}
          </h2>
          <div className="flex gap-2">
            {/* Restore All button for Deleted status */}
            {selectedStatus === "Deleted" && isMyProfile && onShowRestoreAllPopup && (
              <button
                onClick={onShowRestoreAllPopup}
                className="text-[10px] py-2 pr-2 text-green-700 hover:text-green-600 font-medium"
              >
                {restoreAllText}
              </button>
            )}
            {/* Unhide All button for Hidden status */}
            {selectedStatus === "Hidden" && isMyProfile && (
              <button
                onClick={onShowUnhidePopup}
                className="text-[10px] py-2 pr-2 text-blue-700 hover:text-blue-600 font-medium"
              >
                {unhideAllText}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      {selectedStatus === "Active" && (
        <div className="relative flex space-x-8 text-[10px] pl-2 border-gray-300 mb-7">
          {["on_going", ...(isMyProfile ? ["sold", "closed"] : [])].map((tab) => (
            <button
              key={tab}
              className={`pb-2 font-medium ${
                activeTab === tab ? "border-b-2 border-red-800 text-red-800" : "text-gray-600"
              }`}
              onClick={() => {
                setActiveTab(tab as typeof activeTab);
                setShowDropdown(false);
              }}
            >
              {getTabLabel(tab)}
            </button>
          ))}

          {/* MY BIDS tab only for own profile */}
          {isMyProfile && (
            <div className="relative flex items-center space-x-1">
              <button
                className={`pb-2 font-medium ${
                  activeTab === "my_bids" ? "border-b-2 border-red-800 text-red-800" : "text-gray-600"
                }`}
                onClick={() => {
                  setActiveTab("my_bids");
                  setShowDropdown(false);
                  setMyBidFilter("all");
                }}
              >
                {myBidsText} ({getFilterLabel(myBidFilter)})
              </button>

              {activeTab === "my_bids" && (
                <button className="pb-2" onClick={() => setShowDropdown((prev) => !prev)}>
                  <svg
                    className={`w-3 h-3 transition-transform ${showDropdown ? "rotate-180" : "rotate-0"}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}

              {activeTab === "my_bids" && showDropdown && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded shadow z-10 text-[10px]">
                  {(["all", "active", "won", "lost"] as MyBidFilter[]).map((option) => (
                    <button
                      key={option}
                      className={`block px-4 py-2 text-left w-full whitespace-nowrap ${
                        myBidFilter === option ? "font-semibold text-black" : "text-gray-600"
                      }`}
                      onClick={() => {
                        setMyBidFilter(option);
                        setShowDropdown(false);
                      }}
                    >
                      {getFilterLabel(option)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {/* Content */}
      {(activeTab === "my_bids" ? isLoadingParticipated : isLoadingToUse) ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <BidCardSkeleton key={index} />
          ))}
        </div>
      ) : filteredAuctions.length === 0 ? (
        <div className="flex flex-col items-center justify-center col-span-full text-center p-4">
          <img src="/pics/empty.png" alt="No artwork" className="w-48 h-48 mb-4 opacity-80" />
          <p className="text-xs text-gray-500">
            {activeTab === "my_bids" ? tabEmptyMessages.my_bids[myBidFilter] : tabEmptyMessages[activeTab]}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {filteredAuctions.map((auction) => (
            <BidCard
              key={auction.id}
              data={auction}
              onClick={() => handleBidClick(auction)}
              isHidden={selectedStatus === "Hidden"}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OnBidTab;
