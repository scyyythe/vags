import { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, MoreHorizontal, GripVertical } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { LikedArtworksContext } from "@/context/LikedArtworksProvider";
import ReportOptionsPopup from "@/components/user_dashboard/Bidding/cards/ReportOptions";
import BidMenu from "@/components/user_dashboard/Bidding/cards/BidMenu";
import BidPopup from "../place_bid/BidPopup";
import Header from "@/components/user_dashboard/navbar/Header";
import { useArtworkContext } from "@/context/ArtworkContext";
import { useIsMobile } from "@/hooks/use-mobile";
import RelatedBids from "@/components/user_dashboard/Bidding/bid_viewing/RelatedBids";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLocation } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ArtCardSkeleton from "@/components/skeletons/ArtCardSkeleton";
import CountdownTimer from "@/hooks/count/useCountdown";
// import { useFetchBiddingArtworks } from "@/hooks/auction/useAuction";
import { useFetchBiddingArtworkById } from "@/hooks/auction/useFetchAuctionDetails";
import AuctionCountdown from "@/hooks/count/AuctionCountDown";
import { ArtworkAuction } from "@/hooks/auction/useAuction";
import BidCard from "@/components/user_dashboard/Bidding/cards/BidCard";
export interface BidCardData {
  id: string;
  title: string;
  currentBid: number;
  end_time: string;
  imageUrl: string;
  highestBid: number;
}

const BidDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { data: item, isLoading } = useFetchBiddingArtworkById(id!);
  useEffect(() => {
    if (item) {
      console.log("Fetched auction item:", item);
    }
  }, [item]);

  const [views, setViews] = useState<number>(0);
  const [showBidPopup, setShowBidPopup] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const location = useLocation();
  const { artwork } = location.state;

  const { likedArtworks, likeCounts, toggleLike } = useContext(LikedArtworksContext);

  const isLiked = likedArtworks[id] || false;
  const { artworks } = useArtworkContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();

  const navigate = useNavigate();

  const [setIsLoading] = useState(true);
  const [relatedArtworks, setRelatedArtworks] = useState<any[]>([]);

  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const descriptionRef = useRef<HTMLDivElement | null>(null);

  const [showReportOptions, setShowReportOptions] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isReported, setIsReported] = useState(false);

  //LIST OF BIDS SECTION
  const formatBidDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    const hour = date.getHours().toString().padStart(2, "0");
    const minute = date.getMinutes().toString().padStart(2, "0");
    return `${day} ${month} ${year}, ${hour}:${minute}`;
  };

  const onReport = () => {
    setIsReported(true);
    toast("Report submitted!");
  };

  const handleReportSubmit = (category: string, option?: string) => {
    console.log("Report submitted:", { category, option });
    onReport();
  };

  const isOwner = true; // Replace this with your real owner check!

  // Mock bid data
  const mockBids = [
    {
      id: "1",
      amount: 3000,
      user: { name: "jayjay", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
      created_at: "2025-05-13T16:40:00Z",
    },
    {
      id: "2",
      amount: 3000,
      user: { name: "jayjay", avatar: "https://randomuser.me/api/portraits/women/32.jpg" },
      created_at: "2025-05-24T20:40:00Z",
    },
    {
      id: "3",
      amount: 3000,
      user: { name: "jayjay", avatar: "https://randomuser.me/api/portraits/women/33.jpg" },
      created_at: "2025-05-24T20:40:00Z",
    },
    {
      id: "4",
      amount: 3000,
      user: { name: "jayjay", avatar: "https://randomuser.me/api/portraits/women/34.jpg" },
      created_at: "2025-05-24T20:40:00Z",
    },
  ];

  // Mock related artworks data
  const mockRelatedArtworks: ArtworkAuction[] = [
    {
      id: "rel1",
      artwork: {
        id: "art1",
        title: "Sunset Dreams",
        artist: "Anna Rivera",
        artist_id: "artist1",
        category: "Landscape",
        artistAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
        description: "A beautiful sunset over the mountains.",
        image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
        likes_count: 120,
        medium: "Oil on canvas",
        price: 5000,
        profile_picture: "https://randomuser.me/api/portraits/women/44.jpg",
        size: "24x36",
        visibility: "public",
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-02T00:00:00Z",
      },
      highest_bid: {
        bidderFullName: "John Doe",
        amount: 2400,
        timestamp: "2025-05-10T14:00:00Z",
        identity_type: "fullName",
      },
      bid_history: [],
      end_time: "2025-06-01T18:00:00Z",
      start_time: "2025-05-01T12:00:00Z",
      status: "on_going",
      start_bid_amount: 1000,
      timeRemaining: {
        finished: false,
        hrs: 48,
        mins: 30,
        secs: 0,
      },
    },
    {
      id: "rel2",
      artwork: {
        id: "art2",
        title: "Blue Harmony",
        artist: "Miguel Santos",
        artist_id: "artist2",
        category: "Abstract",
        artistAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
        description: "An abstract piece with vibrant blues.",
        image_url: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
        likes_count: 85,
        medium: "Acrylic",
        price: 3000,
        profile_picture: "https://randomuser.me/api/portraits/men/32.jpg",
        size: "30x40",
        visibility: "public",
        created_at: "2025-02-10T00:00:00Z",
        updated_at: "2025-02-15T00:00:00Z",
      },
      highest_bid: {
        bidderFullName: "Jane Smith",
        amount: 1800,
        timestamp: "2025-05-15T11:30:00Z",
        identity_type: "username",
      },
      bid_history: [],
      end_time: "2025-06-03T12:00:00Z",
      start_time: "2025-05-05T10:00:00Z",
      status: "on_going",
      start_bid_amount: 800,
      timeRemaining: {
        finished: false,
        hrs: 72,
        mins: 0,
        secs: 0,
      },
    },
    {
      id: "rel3",
      artwork: {
        id: "art3",
        title: "Urban Lights",
        artist: "Lara Cruz",
        artist_id: "artist3",
        category: "Cityscape",
        artistAvatar: "https://randomuser.me/api/portraits/women/33.jpg",
        description: "City lights glowing at night.",
        image_url: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
        likes_count: 200,
        medium: "Photography",
        price: 7000,
        profile_picture: "https://randomuser.me/api/portraits/women/33.jpg",
        size: "20x30",
        visibility: "public",
        created_at: "2025-03-01T00:00:00Z",
        updated_at: "2025-03-05T00:00:00Z",
      },
      highest_bid: {
        bidderFullName: "Alice Johnson",
        amount: 3200,
        timestamp: "2025-05-20T16:45:00Z",
        identity_type: "anonymous",
      },
      bid_history: [],
      end_time: "2025-06-04T20:00:00Z",
      start_time: "2025-05-10T09:00:00Z",
      status: "on_going",
      start_bid_amount: 1500,
      timeRemaining: {
        finished: false,
        hrs: 96,
        mins: 15,
        secs: 0,
      },
    },
    {
      id: "rel4",
      artwork: {
        id: "art4",
        title: "Morning Dew",
        artist: "Carlos Mendez",
        artist_id: "artist4",
        category: "Nature",
        artistAvatar: "https://randomuser.me/api/portraits/men/45.jpg",
        description: "Fresh morning dew on leaves.",
        image_url: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=400&q=80",
        likes_count: 150,
        medium: "Watercolor",
        price: 4500,
        profile_picture: "https://randomuser.me/api/portraits/men/45.jpg",
        size: "18x24",
        visibility: "public",
        created_at: "2025-04-01T00:00:00Z",
        updated_at: "2025-04-05T00:00:00Z",
      },
      highest_bid: {
        bidderFullName: "Mark Lee",
        amount: 2700,
        timestamp: "2025-05-22T13:20:00Z",
        identity_type: "fullName",
      },
      bid_history: [],
      end_time: "2025-06-05T15:00:00Z",
      start_time: "2025-05-12T08:00:00Z",
      status: "on_going",
      start_bid_amount: 1200,
      timeRemaining: {
        finished: false,
        hrs: 80,
        mins: 0,
        secs: 0,
      },
    },
  ];




  // useEffect(() => {
  //   if (!id) return;

  //   const viewedKey = `viewed_bid_${id}`;
  //   const alreadyViewed = localStorage.getItem(viewedKey);

  //   if (!alreadyViewed) {
  //     fetch(`/api/bids/${id}/view`, { method: "POST" })
  //       .then((res) => res.json())
  //       .then((data) => {
  //         if (data.views !== undefined) setViews(data.views);
  //         localStorage.setItem(viewedKey, "true"); // mark as viewed
  //       })
  //       .catch((err) => console.error("Failed to increment views:", err));
  //   }
  // }, [id]);

  useEffect(() => {
    if (descriptionRef.current) {
      const isOver = descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight;
      setIsOverflowing(isOver);
    }
  }, [artwork?.description, showFullDescription]);
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const handleBidSubmit = (amount: number) => {
    if (!item?.id) return;
    toast.success(`Bid of ${amount}php placed successfully!`);
  };

  const handleLike = () => {
    if (artwork && id) {
      toggleLike(id);
      toast(`${likedArtworks[id] ? "Unliked" : "Liked"} the artwork`);
    }
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

  const toggleDetailsPanel = () => {
    setIsDetailOpen(!isDetailOpen);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const closeExpandedView = () => {
    setIsExpanded(false);
  };

  if (isLoading || !artwork) {
    return <ArtCardSkeleton />;
  }

  if (item) {
    return (
      <>
      <div className="min-h-screen">
        <Header />
        {/* Back button */}
        <div
          className={` w-[200px] ${
            isMobile ? "ml-3 mt-20 px-4 whitespace-nowrap" : "md:ml-16 whitespace-nowrap mt-20"
          }`}
        >
          <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold">
            <i className="bx bx-chevron-left text-lg mr-2"></i>
            Go back
          </button>
        </div>

        <div className={`w-full ${isMobile ? "flex flex-col px-4" : "flex justify-center items-start py-6"}`}>
          {/* Flex container with gap between panels */}
          <div
            className={`flex ${isMobile ? "flex-col" : "flex-row"} items-start`}
            style={{
              gap: isMobile ? 0 : "2rem",
              transition: "margin 0.5s cubic-bezier(.4,0,.2,1)",
              marginLeft: !isMobile && isDetailOpen ? "60px" : 0,
            }}
          >
            <div
              className={`flex ${
                isMobile ? "flex-col" : "flex-row"
              } gap-6 transition-transform duration-500 ease-in-out`}
              style={{
                transform: !isMobile && isDetailOpen ? "translateX(30px)" : "translateX(0)",
              }}
            >
              {/* Artwork container */}
              <div className={`relative -mr-4 ${isMobile ? "w-full" : "w-full max-w-[500px] min-w-[380px]"}`}>
                {/* Collapsible Sidebar */}
                {!isMobile && (
                  <div
                    className={`absolute right-100 -top-14 w-[32%] h-[140%] z-20 transition-all duration-500 ease-in-out pointer-events-none ${
                      isDetailOpen ? "opacity-100 translate-x-0 pointer-events-auto" : "opacity-0 -translate-x-1"
                    }`}
                    style={{ right: "calc(100% + 16px)", marginRight: "40px" }}
                  >
                    <div className="bg-gray-100 rounded-sm relative top-1/4 p-6 text-justify shadow-md">
                      <div className="mb-6">
                        <h3 className="text-[9px] font-medium mb-1">Artwork Style</h3>
                        <p className="text-[9px] text-gray-700">{item.artwork.title || "Painting"}</p>
                      </div>
                      <div className="mb-6">
                        <h3 className="text-[9px] font-medium mb-1">Medium</h3>
                        <p className="text-[9px] text-gray-700">{item.artwork.medium || "Acrylic Paint"}</p>
                      </div>
                      <div className="mb-6">
                        <h3 className="text-[9px] font-medium mb-1">Date Posted</h3>
                        <p className="text-[9px] text-gray-700">
                          {item.artwork.created_at ? formatDate(item.artwork.created_at) : "March 25, 2023"}
                        </p>
                      </div>
                      <div className="mb-1">
                        <h3 className="text-[9px] font-medium mb-1">Artwork Size</h3>
                        <p className="text-[9px] text-gray-700">{item.artwork.size || "No Size"}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile Information Panel (Collapsible) */}
                {isMobile && (
                  <Collapsible className="px-4">
                    <div className="flex justify-between items-center mb-2">
                      <CollapsibleTrigger className="p-1 my-2">
                        <GripVertical size={16} />
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="transition-all duration-500 ease-in-out">
                      <div className="bg-gray-50 rounded-md p-4 text-xs whitespace-nowrap mb-8">
                        <div className="grid grid-cols-4 gap-10 px-6">
                          <div>
                            <h4 className="text-[10px] font-medium mb-1">Artwork Style</h4>
                            <p className="text-[10px] text-gray-700">{item.artwork.category || "Painting"}</p>
                          </div>
                          <div>
                            <h4 className="text-[10px] font-medium mb-1">Medium</h4>
                            <p className="text-[10px] text-gray-700">{item.artwork.medium || "Acrylic Paint"}</p>
                          </div>
                          <div>
                            <h4 className="text-[10px] font-medium mb-1">Date Posted</h4>
                            <p className="text-[10px] text-gray-700">
                              {item.artwork.created_at ? formatDate(item.artwork.created_at) : "March 25, 2023"}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-[10px] font-medium mb-1">Artwork Size</h3>
                            <p className="text-[10px] text-gray-700">{item.artwork.size}</p>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Center - Artwork Image */}
                <div className={`relative z-0  ${isMobile ? "my-6 pl-9" : "mt-3"}`}>
                  {!isMobile && (
                    <button
                      onClick={toggleDetailsPanel}
                      className="p-1 text-gray-500 hover:text-black absolute -left-12 top-1/2 transform -translate-y-1/2"
                    >
                      <GripVertical size={15} />
                    </button>
                  )}

                  <div className="inline-block transform scale-[1.10]">
                    <div className="w-[400px] h-[400px] overflow-hidden shadow-[0_4px_14px_rgba(0,0,0,0.15)] rounded-xl">
                      <img
                        src={item.artwork.image_url}
                        alt={item.artwork.title}
                        className="w-full h-full object-cover transition-transform duration-700 rounded-xl"
                      />

                      {/* Expand Button Container */}
                      <div
                        className={`absolute bottom-3 right-3 ${isMobile ? "" : "z-10"} flex flex-col items-end gap-3`}
                      >
                        {/* Expand Icon */}
                        <div
                          className="group flex flex-row-reverse items-center bg-white/70 backdrop-blur-md rounded-full px-1 py-1 shadow-md overflow-hidden w-[32px] h-[32px] hover:w-[90px] hover:pl-4 transition-[width,padding] ease-in-out duration-700 cursor-pointer"
                          onClick={() => setIsExpanded(true)}
                        >
                          <i className="bx bx-expand-alt text-[12px] mr-[6px]"></i>
                          <span className="mr-3 text-[10px] font-medium whitespace-nowrap transform translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all ease-in-out duration-700">
                            Expand
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Title, artist, description*/}
            <div
              className={`${isMobile ? "w-full mt-2 px-4" : "w-full max-w-[390px] -mt-2"}`}
              style={{
                transition: "transform 0.5s cubic-bezier(.4,0,.2,1)",
                transform: !isMobile && isDetailOpen ? "translateX(30px)" : "translateX(0)",
              }}
            >
              <div className={`${isMobile ? "" : "relative left-10"}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleLike}
                      className="flex items-center space-x-1 text-gray-800 rounded-3xl py-1.5 px-2 border border-gray-200"
                    >
                      <Heart
                        size={isMobile ? 13 : 13}
                        className={isLiked ? "text-red-600 fill-red-600" : "text-gray-800"}
                        fill={isLiked ? "currentColor" : "none"}
                      />
                      {(item.artwork.likes_count[id || ""] ?? 0) > 0 && (
                        <span className={`${isMobile ? "text-xs" : "text-[9px]"}`}>
                          {item.artwork.likes_count[id || ""]}
                        </span>
                      )}
                    </button>

                    <div className="flex items-center space-x-2 text-xs">
                      <i className="bx bx-show text-[15px]"></i>
                      <span>{views}</span>
                    </div>
                  </div>

                  <div className="relative">
                    <button className="py-3 pr-[11px] text-gray-500" onClick={() => setMenuOpen(!menuOpen)}>
                      <MoreHorizontal size={isMobile ? 14 : 14} />
                    </button>

                    <BidMenu
                      isOpen={menuOpen}
                      onHide={handleHide}
                      onReport={handleReport}
                      isReported={isReported}
                      className={isMobile ? "mobile-menu-position" : ""}
                    />
                  </div>
                </div>

                <h1 className={`${isMobile ? "text-sm" : "text-xl"} font-bold mb-2`}>
                  {item.artwork.title || "No artwork name"}
                </h1>

                <p className={`${isMobile ? "text-[9px]" : "text-[10px]"} text-gray-600 mb-1`}>
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/userprofile/${item.artwork.artist_id}`)}
                  >
                    by {item.artwork.artist || "Unknown"}
                  </span>
                </p>

                <div className="relative mt-2">
                  <div
                    ref={descriptionRef}
                    className={`
                      text-[9px] text-gray-700 transition-all duration-300 ease-in-out mb-2
                      ${showFullDescription ? "max-h-9 overflow-y-auto pr-1" : "max-h-9 overflow-hidden"}
                    `}
                    style={{ lineHeight: "1.25rem" }}
                  >
                    {item.artwork.description || "No description available."}
                  </div>

                  {isOverflowing && (
                    <button
                      onClick={() => setShowFullDescription((prev) => !prev)}
                      className="text-[9px] text-blue-500 hover:underline mt-1 block"
                    >
                      {showFullDescription ? "Hide" : "Show More"}
                    </button>
                  )}
                </div>

                {/* <Separator className="my-2" /> */}

                <div className="w-full border px-10 py-4 rounded-xl flex justify-between items-center text-center mt-4">
                  {/* Highest Bid */}
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-500 mb-2 -mt-2">Highest Bid</p>
                    <p className="text-md font-semibold">
                      {item.highest_bid && item.highest_bid.amount != null
                        ? `₱${item.highest_bid.amount.toLocaleString()}`
                        : "No bids yet"}
                    </p>
                  </div>

                  {/* Separator */}
                  <div className="w-[1px] h-12 bg-gray-200 mx-7" />

                  {/* Auction Timer */}
                  <div>
                    <div
                      className=""
                      style={{ minWidth: "140px", display: "inline-block" }}
                    >
                    <AuctionCountdown endTime={item.end_time} />
                    </div>
                  </div>

                </div>

                {/* Bids Section */}
                <div className="mt-5">
                  <h2 className="font-semibold text-[10px]">Bids</h2>
                  <div className="w-6 h-[2px] bg-black mb-3 rounded" />
                  <div className="max-h-20 overflow-y-auto pr-2 flex flex-col gap-1">
                    {mockBids.length > 0 ? (
                      mockBids.map((bid) => (
                        <div key={bid.id} className="flex items-center gap-2">
                          <img
                            src={bid.user.avatar}
                            alt={bid.user.name}
                            className="w-4 h-4 rounded-full object-cover border"
                          />
                          <div>
                            <span className="font-semibold text-[11px] mr-1">
                              < i className='bx bx-money text-[8px] text-gray-400'></i>  {bid.amount.toLocaleString()}
                            </span>
                            <span className=" flex gap-1 text-[9px] text-gray-500 -mt-1">
                              by <p className="font-medium text-gray-700">{bid.user.name}</p>
                              {isOwner && (
                                <span className="ml-1 text-[9px] text-gray-400">
                                  {formatBidDate(bid.created_at)}
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-[11px] text-gray-400">No bids yet.</div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setShowBidPopup(true)}
                  className="w-full bg-red-800 hover:bg-red-700 text-white text-xs py-2 rounded-full mt-3"
                >
                  Place A Bid
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Bids Section */}
        <div className="container md:px-6 mt-2 mb-2">
          <h2 className={`font-medium ${isMobile ? "text-xs mt-8 ml-4" : "text-xs mb-4"}`}>Related Bids</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mockRelatedArtworks.map((art) => (
              <div key={art.id} className="min-w-[200px] flex-shrink-0">
                <BidCard
                  data={art}
                  onClick={() => navigate(`/biddetails/${art.id}`, { state: { artwork: art.artwork } })}
                />
              </div>
            ))}
          </div>
        </div>

        {showBidPopup && (
          <BidPopup
            isOpen={showBidPopup}
            onClose={() => setShowBidPopup(false)}
            data={item}
            artworkId={item.artwork.id}
            artworkTitle={item.artwork.title || "Artwork"}
            start_bid_amount={item.start_bid_amount}
          />
        )}

        {/* Report Options Popup */}
        {showReportOptions && (
          <ReportOptionsPopup 
            isOpen={showReportOptions}
            onClose={() => setShowReportOptions(false)}
            onSubmit={handleReportSubmit}
          />
        )}

        {isExpanded && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center overflow-hidden">
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 right-6 text-white text-3xl font-bold z-[60]"
            >
              <i className="bx bx-x text-2xl"></i>
            </button>

            <div className="relative w-full h-full px-4 py-16 flex justify-center items-center">
              <img
                src={item.artwork.image_url}
                alt="Expanded artwork"
                className="max-h-[80vh] max-w-[90vw] object-contain"
              />
            </div>
          </div>
        )}
        
      </div>
      {/* Report Options Popup */}
        <ReportOptionsPopup 
          isOpen={showReportOptions}
          onClose={() => setShowReportOptions(false)}
          onSubmit={handleReportSubmit}
        />
      </>
    );
  }
};

export default BidDetails;
