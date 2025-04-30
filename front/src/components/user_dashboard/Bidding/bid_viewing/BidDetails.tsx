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
import Header from "@/components/user_dashboard/navbar/Header";
import { useArtworkContext } from "@/context/ArtworkContext";
import { useIsMobile } from "@/hooks/use-mobile";
import RelatedBids from "@/components/user_dashboard/Bidding/bid_viewing/RelatedBids";

const BidDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [bid, setBid] = useState<any>(null);

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
        likesCount: parsedBid.likes,
      });
  
      localStorage.removeItem("selectedBid");
      setIsLoading(false); 
    }
  }, []);  

  useEffect(() => {
    if (descriptionRef.current) {
      const isOver = descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight;
      setIsOverflowing(isOver);
    }
  }, [artwork?.description]);


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
      
      <div className="container mx-auto px-4 md:px-6 py-4 md:py-8 flex">
        {/* Back button */}
        <div className={`mt-8 md:mt-12 ${isMobile ? 'px-4 pt-8' : 'md:ml-12'}`}>
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-sm font-semibold"
          >
            <i className='bx bx-chevron-left text-lg mr-2'></i>
            Bid Details
          </button>
        </div>

          <div className={`flex flex-col lg:flex-row justify-center items-start gap-12 mt-12`}> 
              {/* Center - Artwork Image */}
              <div className={`relative z-0 mt-20 ${isMobile ? 'px-4' : ''}`}>

                <div className="inline-block transform scale-[1.10] -mb-6 relative">
                  <div className="w-[400px] h-[400px] overflow-hidden shadow-[0_4px_14px_rgba(0,0,0,0.15)] rounded-xl">
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
            <div className={`${isMobile ? 'w-full mt-6 px-4s' : 'w-full max-w-[390px] min-w-[280px] mt-6'}`}>
              <div className={`${isMobile ? '' : 'relative top-10 left-10'}`}>
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
                      {(likeCounts[id || ""] ?? artwork?.likesCount ?? 0) > 0 && (
                        <span className={`${isMobile ? 'text-xs' : 'text-[9px]'}`}>
                          {likeCounts[id || ""] ?? artwork?.likesCount}
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="relative">
                    <button 
                      className="py-3 text-gray-500"
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

                <h1 className={`${isMobile ? 'text-lg' : 'text-md'} font-bold mb-2`}>{artwork?.title || "The Distorted Face"}</h1>
                
                <p className={`${isMobile ? 'text-xs' : 'text-[10px]'} text-gray-600 mb-4`}>by {artwork?.artistName || "Angel Ganev"}</p>
                
                <div className="relative mt-4">
                  <div
                    ref={descriptionRef}
                    className={`
                      text-[10px] text-gray-700 transition-all duration-300 ease-in-out 
                      ${showFullDescription ? "max-h-40 overflow-y-auto pr-1" : "max-h-14 overflow-hidden"}
                    `}
                    style={{ lineHeight: '1.25rem' }}
                  >
                    {artwork?.description || "No description available."}
                  </div>

                  {isOverflowing && (
                    <button
                      onClick={() => setShowFullDescription(prev => !prev)}
                      className="text-[10px] text-blue-500 hover:underline mt-1 block"
                    >
                      {showFullDescription ? "Show Less" : "Show More"}
                    </button>
                  )}
                </div>

                <Separator className="my-6" />

                <div className="bg-gray-100 p-4 rounded-md flex justify-between text-center mb-6">
                    <div>
                        <p className="text-xs text-gray-500">Highest Bid</p>
                        <p className="text-xl font-bold">{bid.highestBid}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Auction ends in</p>
                        <p className="text-xl font-bold">
                            {bid.timeRemaining.hrs} : {bid.timeRemaining.mins} : {bid.timeRemaining.secs}
                        </p>    
                    <div className="text-[10px] text-gray-400 mt-1">Hrs &nbsp;&nbsp; Mins &nbsp;&nbsp; Secs</div>
                    </div>
                </div>

                    <button className="w-full bg-red-800 hover:bg-red-700 text-white text-xs py-3 rounded-full">
                        Place A Bid
                    </button>
                </div>

            </div>
          </div>
           
      </div>
          <div className="container mx-auto px-4 md:px-12 mt-20 mb-12">
            <h2 className="text-md font-semibold mb-4">Related Artworks</h2>
            <RelatedBids currentCategory={bid.category} currentBidId={bid.id} />
          </div>   
    </div>

  );
};

export default BidDetails;
