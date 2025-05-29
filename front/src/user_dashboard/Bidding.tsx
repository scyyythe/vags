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
import ArtCardSkeleton from "@/components/skeletons/ArtCardSkeleton";
import { useSearchParams } from "react-router-dom";
import { useFetchBiddingArtworks } from "@/hooks/auction/useFetchBiddingArtworks";
import useFollowedAuctions from "@/hooks/auction/followed_users/useFollowedBiddings";
import useBulkBidReportStatus from "@/hooks/mutate/report/useBulkAuctionReport";
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
  const [staticArtworks, setStaticArtworks] = useState<StaticArtwork[]>([]);

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const categories = ["All", "Trending", "Following"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [showIncoming, setShowIncoming] = useState(false);

  const currentPage = 1;

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  useEffect(() => {
    const fetchedArtworks: StaticArtwork[] = [
      {
        id: "1",
        title: "Human Metaloid",
        artist: "Jane Shaun",
        artistAvatar: "https://randomuser.me/api/portraits/women/1.jpg",
        description: "Lorem ipsum dolor sit amet...",
        image: "https://i.pinimg.com/736x/ee/25/b5/ee25b5fcde96a813deed82b3469805e2.jpg",
        endTime: "2d : 15h : 20m",
        likes: 12000,
        views: 34000,
        highestBid: 95000,
        timeRemaining: { hrs: 2, mins: 15, secs: 20 },
      },
      {
        id: "2",
        title: "Dissolution of Soul",
        artist: "Rick Splin",
        artistAvatar: "https://i.pinimg.com/474x/09/82/70/09827028e812b74970caa859cbf3dec5.jpg",
        description: "Lorem ipsum dolor sit amet...",
        image: "https://i.pinimg.com/474x/41/ff/68/41ff685dd8f538b1e1e5b4116991dbfc.jpg",
        endTime: "2d : 15h : 20m",
        likes: 12000,
        views: 34000,
        highestBid: 95000,
        timeRemaining: { hrs: 2, mins: 15, secs: 20 },
      },
      {
        id: "3",
        title: "Lost Skull",
        artist: "Jurk Flans",
        artistAvatar: "https://i.pinimg.com/474x/76/81/9f/76819f10e7acdf48403d2b6e7134b347.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        image: "https://i.pinimg.com/736x/47/8d/a5/478da58eee635ab3be6e65fba0595222.jpg",
        endTime: "2d : 15h : 20m",
        likes: 12000,
        views: 34000,
        highestBid: 95000,
        timeRemaining: { hrs: 2, mins: 15, secs: 20 },
      },
      {
        id: "4",
        title: "Space Connection",
        artist: "Lohr Barns",
        artistAvatar: "https://i.pinimg.com/474x/f1/16/6d/f1166dfe695a098adae052509fdedc00.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        image: "https://i.pinimg.com/736x/d4/e9/fa/d4e9fa9888d3ee4edc6a06e0cb72d811.jpg",
        endTime: "2d : 15h : 20m",
        likes: 12000,
        views: 34000,
        highestBid: 95000,
        timeRemaining: { hrs: 2, mins: 15, secs: 20 },
      },
    ];

    setStaticArtworks(fetchedArtworks);
  }, []);

  const { data: biddingArtworks = [], isLoading, isError } = useFetchBiddingArtworks();

  const [page, setPage] = useState(1);
  const {
    data: followedAuctions = [],
    isLoading: isLoadingFollowed,
    isError: isErrorFollowed,
  } = useFollowedAuctions(page);

  const filteredArtworks = useMemo(() => {
    const now = new Date();

    if (selectedCategory === "Following") {
      return followedAuctions;
    }

    let activeArtworks = biddingArtworks.filter((a) => new Date(a.start_time) <= now);

    if (
      selectedCategory &&
      selectedCategory !== "All" &&
      selectedCategory !== "Following" &&
      selectedCategory !== "Trending"
    ) {
      activeArtworks = activeArtworks.filter((artwork) => artwork.artwork.category === selectedCategory);
    }

    if (selectedCategory === "Trending") {
      activeArtworks = [...activeArtworks].sort((a, b) => b.auction_likes_count - a.auction_likes_count);
    }

    if (searchQuery) {
      activeArtworks = activeArtworks.filter(
        (artwork) =>
          artwork.artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          artwork.artwork.artist.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return activeArtworks;
  }, [biddingArtworks, followedAuctions, searchQuery, selectedCategory]);
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
    return biddingArtworks.filter((artwork) => new Date(artwork.start_time) > now);
  }, [biddingArtworks]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 pt-20">
        <main className="container">
          <section className="mb-8">
            <ArtsContainer artworks={staticArtworks} />
          </section>
          <div className="flex items-center justify-between -ml-7 mb-6 w-[114%] md:w-[105%] lg:w-[105%] pl-2 sm:pl-0">
            <CategoryFilter categories={categories} onSelectCategory={handleCategorySelect} />
            <div className="flex space-x-2 text-xs">
              {/* Incoming Auctions */}
              <button
                onClick={() => setShowIncoming((prev) => !prev)}
                className={`px-3 rounded-full border border-gray-300 transition-all text-[10px] 
                  ${showIncoming ? "shadow-md font-medium" : "bg-white"}`}
              >
                Upcoming
              </button>

              <div className="relative">
                <ArtCategorySelect
                  selectedCategory={selectedCategory}
                  onChange={(value) => setSelectedCategory(value)}
                />
              </div>
            </div>
          </div>
        </main>

        <div className="lg:w-[100%] custom-scrollbars pb-4 pl-2 sm:pl-0">
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <ArtCardSkeleton />
            </div>
          )}
          {isError && <p className="text-center text-red-500 py-10">Failed to fetch bidding artworks.</p>}

          {/* ACTIVE AUCTIONS */}
          {!showIncoming && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredArtworks.map((artwork) => {
                const reportInfo = reportStatusData?.[artwork.id];
                return (
                  <div key={artwork.id} onClick={() => handleBidClick(artwork)} style={{ cursor: "pointer" }}>
                    <BidCard data={artwork} reportInfo={reportInfo} onPlaceBid={handlePlaceBid} />
                  </div>
                );
              })}
            </div>
          )}

          {/* UPCOMING AUCTIONS SECTION */}
          {showIncoming && (
            <div>
              {upcomingArtworks.length === 0 ? (
                <p className="text-gray-500 text-sm px-2">No upcoming auctions found.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {upcomingArtworks.map((artwork) => {
                    const reportInfo = reportStatusData?.[artwork.id];
                    return (
                      <div key={artwork.id} onClick={() => handleBidClick(artwork)} style={{ cursor: "pointer" }}>
                        <BidCard data={artwork} reportInfo={reportInfo} onPlaceBid={handlePlaceBid} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default memo(Bidding);
