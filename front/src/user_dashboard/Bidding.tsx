import Header from "@/components/user_dashboard/navbar/Header";
import { Footer } from "@/components/user_dashboard/footer/Footer";
import ArtsContainer from "@/components/user_dashboard/Bidding/featured/ArtsContainer";
import Components from "@/components/user_dashboard/Bidding/navbar/Components";
import CategoryFilter from "@/components/user_dashboard/Bidding/navigation/CategoryFilter";
import ArtCategorySelect from "@/components/user_dashboard/local_components/categories/ArtCategorySelect";
import BidCard from "@/components/user_dashboard/Bidding/cards/BidCard";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, memo } from "react";
import useAuctions from "@/hooks/auction/useAuction";
import { ArtworkAuction } from "@/hooks/auction/useAuction";
import "react-loading-skeleton/dist/skeleton.css";
import BidCardSkeleton from "@/components/skeletons/bidding/BidCardSkeleton";
import { useSearchParams } from "react-router-dom";
import { useFetchBiddingArtworks } from "@/hooks/auction/useFetchBiddingArtworks";
import useFollowedAuctions from "@/hooks/auction/followed_users/useFollowedBiddings";
import useBulkBidReportStatus from "@/hooks/mutate/report/useBulkAuctionReport";
import ActiveAccountOnly from "@/components/auth/ActiveAccountOnly";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import useRealTimeAuctions from "@/hooks/auction/useRealTimeAuctions";
import useRealTimeBids from "@/hooks/bid/useRealTimeBids";

interface StaticArtwork {
  id: string;
  title: string;
  artist: string;
  artistAvatar: string;
  description: string;
  image: string;
  endTime: string;
  likes: number;
  views: number;
  highestBid: number;
  timeRemaining: { hrs: number; mins: number; secs: number };
}

const Bidding = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [staticArtworks, setStaticArtworks] = useState<StaticArtwork[]>([]);

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const categories = ["All", "Trending", "Following"];
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFilterCategory, setSelectedFilterCategory] = useState("All");
  const [selectedArtCategory, setSelectedArtCategory] = useState("All");

  const [showIncoming, setShowIncoming] = useState(false);

  // Translation hooks
  const upcomingText = useAutoTranslation("Upcoming", language);
  const failedToFetchText = useAutoTranslation("Failed to fetch bidding artworks.", language);
  const noUpcomingAuctionsText = useAutoTranslation("No upcoming auctions found.", language);
  const noUpcomingAuctionsAltText = useAutoTranslation("No Upcoming Auctions", language);
  const noActiveAuctionsText = useAutoTranslation("No ongoing auctions found for this filter.", language);
  const noActiveAuctionsAltText = useAutoTranslation("No Ongoing Auctions", language);

  const currentPage = 1;

  const handleCategorySelect = (category: string) => {
    setSelectedFilterCategory(category);
  };

  const { data: biddingArtworks = [], isLoading, isError } = useFetchBiddingArtworks({ status: "on_going" });

  const [page, setPage] = useState(1);
  const { data: followedAuctions = [] } = useFollowedAuctions(page);

  // Real-time auctions hook for live updates
  const { hasNewAuctions, refreshAuctions } = useRealTimeAuctions();

  // Real-time bids hook for live updates
  const { hasNewBids, refreshBids } = useRealTimeBids();

  const filteredArtworks = useMemo(() => {
    const now = new Date();
    let activeArtworks: ArtworkAuction[] = [];

    if (selectedFilterCategory === "Following") {
      activeArtworks = followedAuctions || [];
    } else {
      activeArtworks = biddingArtworks?.filter((a) => 
        new Date(a.start_time) <= now && a.status === "on_going"
      ) || [];

      if (selectedFilterCategory === "Trending") {
        // Optimize: Use a more efficient sorting approach
        activeArtworks = [...activeArtworks].sort((a, b) => {
          const likesA = a.auction_likes_count || 0;
          const likesB = b.auction_likes_count || 0;
          return likesB - likesA;
        });
      }
    }

    // Apply filters efficiently
    if (selectedArtCategory !== "All" || searchQuery?.trim()) {
      const categoryLower = selectedArtCategory.toLowerCase();
      const queryLower = searchQuery?.toLowerCase();

      activeArtworks = activeArtworks.filter((artwork) => {
        // Category filter
        if (selectedArtCategory !== "All") {
          const artworkCategory = artwork.artwork.category?.toLowerCase();
          if (artworkCategory !== categoryLower) {
            return false;
          }
        }

        // Search filter
        if (queryLower?.trim()) {
          const title = artwork.artwork.title.toLowerCase();
          const artist = artwork.artwork.artist.toLowerCase();
          if (!title.includes(queryLower) && !artist.includes(queryLower)) {
            return false;
          }
        }

        return true;
      });
    }
    return activeArtworks;
  }, [biddingArtworks, followedAuctions, searchQuery, selectedFilterCategory, selectedArtCategory]);

  const auctionIds = useMemo(() => filteredArtworks.map((artwork) => artwork.id), [filteredArtworks]);
  const { data: reportStatusData, isLoading: isReportLoading } = useBulkBidReportStatus(auctionIds);

  const handlePlaceBid = (id: string) => {
    console.log(`Placing bid for artwork ID: ${id}`);
  };

  const handleBidClick = (artwork: ArtworkAuction) => {
    localStorage.setItem("selectedBid", JSON.stringify(artwork));
    navigate(`/bid/${artwork.id}/ `, {
      state: { artwork },
    });
  };

  const upcomingArtworks = useMemo(() => {
    const now = new Date();
    const upcoming = biddingArtworks.filter((artwork) => 
      new Date(artwork.start_time) > now
    );
    
    // Debug logging
    console.log("All bidding artworks:", biddingArtworks.length);
    console.log("Current time:", now.toISOString());
    console.log("Upcoming artworks:", upcoming.length);
    upcoming.forEach(artwork => {
      console.log(`Upcoming auction: ${artwork.id}, start_time: ${artwork.start_time}, status: ${artwork.status}`);
    });
    
    return upcoming;
  }, [biddingArtworks]);

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 pt-20">
        <ActiveAccountOnly>
          <main className="container">
            <section className="mb-8">
              <ArtsContainer artworks={staticArtworks} />
            </section>
            <div className="flex items-center justify-between -ml-7 mb-6 w-[114%] md:w-[105%] lg:w-[105%] pl-2 sm:pl-0">
              <div className="flex items-center gap-3">
                <CategoryFilter categories={categories} onSelectCategory={setSelectedFilterCategory} />
              </div>
              <div className="flex space-x-2 text-xs">
                {/* Incoming Auctions */}
                <button
                  onClick={() => setShowIncoming((prev) => !prev)}
                  className={`px-3 rounded-full border border-gray-300 dark:border-gray-600 transition-all text-[10px] 
                    ${showIncoming ? "shadow-md font-medium bg-gray-100 dark:bg-gray-700" : "bg-white dark:bg-gray-800"}`}
                >
                  {upcomingText}
                </button>

                <div className="relative">
                  <ArtCategorySelect
                    selectedCategory={selectedArtCategory}
                    onChange={(value) => setSelectedArtCategory(value)}
                  />
                </div>
              </div>
            </div>
          </main>

          <div className="lg:w-[100%] custom-scrollbars pb-4 pl-2 sm:pl-0">
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <BidCardSkeleton key={index} />
                ))}
              </div>
            )}
            {isError && <p className="text-center text-red-500 py-10">{failedToFetchText}</p>}

            {/* ACTIVE AUCTIONS */}
            {!showIncoming && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredArtworks.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center text-center py-16">
                    <img src="/pics/empty.png" alt={noActiveAuctionsAltText} className="w-48 h-48 mb-4 opacity-70" />
                    <p className="text-gray-500 text-sm">{noActiveAuctionsText}</p>
                  </div>
                ) : (
                  filteredArtworks.map((artwork) => {
                    const reportInfo = reportStatusData?.[artwork.id];
                    return (
                      <div key={artwork.id} onClick={() => handleBidClick(artwork)} style={{ cursor: "pointer" }}>
                        <BidCard data={artwork} reportInfo={reportInfo} onPlaceBid={handlePlaceBid} />
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* UPCOMING AUCTIONS SECTION */}
            {showIncoming && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {upcomingArtworks.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center text-center py-16">
                    <img src="/pics/empty.png" alt={noUpcomingAuctionsAltText} className="w-48 h-48 mb-4 opacity-70" />
                    <p className="text-gray-500 text-sm">{noUpcomingAuctionsText}</p>
                  </div>
                ) : (
                  upcomingArtworks.map((artwork) => {
                    const reportInfo = reportStatusData?.[artwork.id];
                    return (
                      <div key={artwork.id} onClick={() => handleBidClick(artwork)} style={{ cursor: "pointer" }}>
                        <BidCard data={artwork} reportInfo={reportInfo} onPlaceBid={handlePlaceBid} />
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </ActiveAccountOnly>
      </div>
      <Footer />
    </div>
  );
};

export default memo(Bidding);
