import { useState, useEffect,  useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Heart,
  MoreHorizontal,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { LikedArtworksContext } from "@/App";
import BidMenu from "@/components/user_dashboard/Bidding/cards/BidMenu";
import BidPopup from "../place_bid/BidPopup";
import Header from "@/components/user_dashboard/navbar/Header";
import { useArtworkContext } from "@/context/ArtworkContext";
import { useIsMobile } from "@/hooks/use-mobile";
import RelatedBids from "@/components/user_dashboard/Bidding/bid_viewing/RelatedBids";

export interface BidCardData {
  id: string;
  title: string;
  currentBid: number;
  timeRemaining: string;
  imageUrl: string;
}

const BidDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [bid, setBid] = useState<any>(null);
  const [views, setViews] = useState<number>(0);
  const [showBidPopup, setShowBidPopup] = useState(false);

  const { likedArtworks, likeCounts, toggleLike } = useContext(LikedArtworksContext);
  const isLiked = likedArtworks[id] || false;
  const { artworks } = useArtworkContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();

  const navigate = useNavigate();
  const [artwork, setArtwork] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedArtworks, setRelatedArtworks] = useState<any[]>([]);

  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const descriptionRef = useRef<HTMLDivElement | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isReported, setIsReported] = useState(false);


  useEffect(() => {
    const stored = localStorage.getItem("selectedBid");
    if (stored) {
      const parsedBid = JSON.parse(stored);
      setBid(parsedBid);
  
      setArtwork({
        artworkImage: parsedBid.image,
        title: parsedBid.title,
        artistName: parsedBid.artist,
        description: parsedBid.description,
      });
  
      localStorage.removeItem("selectedBid");
      setIsLoading(false); 
    }
  }, []);  

  useEffect(() => {
    if (!id) return;
  
    const viewedKey = `viewed_bid_${id}`;
    const alreadyViewed = localStorage.getItem(viewedKey);
  
    if (!alreadyViewed) {
      fetch(`/api/bids/${id}/view`, { method: "POST" })
        .then(res => res.json())
        .then(data => {
          if (data.views !== undefined) setViews(data.views);
          localStorage.setItem(viewedKey, "true"); // mark as viewed
        })
        .catch(err => console.error("Failed to increment views:", err));
    }
  }, [id]);
  

  useEffect(() => {
    if (descriptionRef.current) {
      const isOver = descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight;
      setIsOverflowing(isOver);
    }
  }, [artwork?.description, showFullDescription]);
  

  const handleBidSubmit = (amount: number) => {
    if (!bid?.id) return;
    toast.success(`Bid of ${amount}K placed successfully!`);
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
  
  
  if (isLoading || !artwork) {
    return <div>Loading...</div>;
  }


  return (
    <div className="min-h-screen">
      <Header />
      {/* Back button */}
      <div className={` w-[200px] ${isMobile ? 'ml-3 mt-20 px-4 whitespace-nowrap' : 'md:ml-16 whitespace-nowrap mt-20'}`}>
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-sm font-semibold"
        >
          <i className='bx bx-chevron-left text-lg mr-2'></i>
          Go back
        </button>
      </div>

        <div className={`w-full ${isMobile ? 'flex flex-col px-4' : 'flex justify-center items-center py-6 border'} gap-6`}>
              {/* Center - Artwork Image */}
              <div className={`relative z-0  ${isMobile ? 'mt-8 pl-9' : 'mt-4'}`}>

                <div className="inline-block transform scale-[1.10]">
                  <div className="w-[390px] h-[390px] overflow-hidden shadow-[0_4px_14px_rgba(0,0,0,0.15)] rounded-xl">
                    <img
                      src={artwork?.artworkImage}
                      alt={artwork?.title}
                      className="w-full h-full object-cover transition-transform duration-700 rounded-xl"
                    />

                    {/* Expand Button Container */}
                    <div className={`absolute bottom-3 right-3 ${isMobile ? '' : 'z-10'} flex flex-col items-end gap-3`}>
                      
                      {/* Expand Icon */}
                      <div
                        className="group flex flex-row-reverse items-center bg-white/70 backdrop-blur-md rounded-full px-1 py-1 shadow-md overflow-hidden w-[32px] h-[32px] hover:w-[90px] hover:pl-4 transition-[width,padding] ease-in-out duration-700 cursor-pointer"
                        onClick={() => setIsExpanded(true)}
                      >
                        <i className='bx bx-expand-alt text-[12px] mr-[6px]'></i>
                        <span
                          className="mr-3 text-[10px] font-medium whitespace-nowrap transform translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all ease-in-out duration-700"
                        >
                          Expand
                        </span>
                      </div>

                    </div>
                  </div>
                </div>

              </div>
  
            

            {/* Right side - Title, artist, description*/}
            <div className={`${isMobile ? 'w-full mt-2 px-4' : 'w-full max-w-[390px] min-w-[280px]'}`}>
              <div className={`${isMobile ? '' : 'relative left-10'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={handleLike} 
                      className="flex items-center space-x-1 text-gray-800 rounded-3xl py-2 px-3 border border-gray-200"
                    >
                      <Heart
                        size={isMobile ? 16 : 14}
                        className={isLiked ? "text-red-600 fill-red-600" : "text-gray-800"}
                        fill={isLiked ? "currentColor" : "none"}
                      />
                      {(likeCounts[id || ""] ?? 0) > 0 && (
                        <span className={`${isMobile ? 'text-xs' : 'text-[9px]'}`}>
                          {likeCounts[id || ""]}
                        </span>
                      )}

                    </button>

                    <div className="flex items-center space-x-2 text-xs">
                      <i className="bx bx-show text-lg"></i>
                      <span>{views}</span>
                    </div>

                  </div>

                  <div className="relative">
                    <button 
                      className="py-3 pr-[11px] text-gray-500"
                      onClick={() => setMenuOpen(!menuOpen)}
                    >
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

                <h1 className={`${isMobile ? 'text-sm' : 'text-xl'} font-bold mb-2`}>{artwork?.title || "The Distorted Face"}</h1>
                
                <p className={`${isMobile ? 'text-xs' : 'text-[10px]'} text-gray-600 mb-4`}>by {artwork?.artistName || "Angel Ganev"}</p>
                
                <div className="relative mt-6">
                  <div
                    ref={descriptionRef}
                    className={`
                      text-[10px] text-gray-700 transition-all duration-300 ease-in-out
                      ${showFullDescription ? "max-h-40 overflow-y-auto pr-1" : "max-h-[3.5rem] overflow-hidden"}
                    `}
                    style={{ lineHeight: "1.25rem" }}
                  >
                    {artwork?.description || "No description available."}
                  </div>

                  {isOverflowing && (
                    <button
                      onClick={() => setShowFullDescription((prev) => !prev)}
                      className="text-[10px] text-blue-500 hover:underline mt-1 block"
                    >
                      {showFullDescription ? "Hide" : "Show More"}
                    </button>
                  )}
                </div>


                <Separator className="my-10" />

                <div className="bg-gray-100 px-6 py-4 rounded-xl flex justify-between items-center text-center mt-8 shadow-sm">
                  {/* Highest Bid */}
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-500 mb-1">Highest Bid</p>
                    <p className="text-xl font-semibold">{bid.highestBid}</p>
                  </div>

                  {/* Separator */}
                  <div className="w-px h-12 bg-gray-300 mx-6" />

                  {/* Auction Timer */}
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-500">Auction ends in</p>
                    <div className="flex items-center justify-center gap-8">
                      <div className="flex flex-col items-center">
                        <p className="text-md font-semibold">{bid.timeRemaining.hrs}</p>
                        <span className="text-[8px] text-gray-400">hrs</span>
                      </div>
                      {/* <span className="text-lg font-semibold">:</span> */}
                      <div className="flex flex-col items-center">
                        <p className="text-md font-semibold">{bid.timeRemaining.mins}</p>
                        <span className="text-[8px] text-gray-400">mins</span>
                      </div>
                      {/* <span className="text-lg font-semibold">:</span> */}
                      <div className="flex flex-col items-center">
                        <p className="text-md font-semibold">{bid.timeRemaining.secs}</p>
                        <span className="text-[8px] text-gray-400">secs</span>
                      </div>
                    </div>
                  </div>

                </div>

                <button onClick={() => setShowBidPopup(true)} className="w-full bg-red-800 hover:bg-red-700 text-white text-xs py-3 rounded-full mt-8">
                  Place A Bid
                </button>
                
                </div>
                <BidPopup
                  isOpen={showBidPopup}
                  onClose={() => setShowBidPopup(false)}
                  artworkTitle={bid.title}
                  onSubmit={handleBidSubmit}
                />

            </div>
          </div>
           
          <div className="container mx-auto px-4 md:px-12 mt-2 mb-2">
            <h2 className={`font-semibold ${isMobile ? 'text-sm mt-8 ml-4' : 'text-md mb-4'}`}>Related Artworks</h2>
            <RelatedBids currentCategory={bid.category} currentBidId={bid.id} />
          </div>   

          {isExpanded && (
            <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center overflow-hidden">
              
              <button
                onClick={() => setIsExpanded(false)}
                className="absolute top-4 right-6 text-white text-3xl font-bold z-[60]"
              >
                <i className='bx bx-x text-2xl'></i>
              </button>

              <div className="relative w-full h-full px-4 py-16 flex justify-center items-center">
                <img
                  src={artwork?.artworkImage}
                  alt="Expanded artwork"
                  className="max-h-[80vh] max-w-[90vw] object-contain"
                />
              </div>
            </div>
          )}
    </div>

  );
};

export default BidDetails;
