import { useState, useContext, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Heart,
  MoreHorizontal,
  EllipsisVertical,
  GripVertical,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { LikedArtworksContext } from "@/App";
import { toast } from "sonner";
import ArtCardMenu from "./ArtCardMenu";
import TipJarIcon from "./TipJarIcon";
import { useDonation } from "../../context/DonationContext";
import Header from "../../components/user_dashboard/Header";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useArtworkContext } from "../../context/ArtworkContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const ArtworkDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { likedArtworks, likeCounts, toggleLike } = useContext(LikedArtworksContext);
  const isLiked = likedArtworks[id] || false;
  const { artworks } = useArtworkContext();
  const { openPopup } = useDonation();
  const isMobile = useIsMobile();

  const navigate = useNavigate();
  const [comment, setComment] = useState("");
  const [artwork, setArtwork] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedArtworks, setRelatedArtworks] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isReported, setIsReported] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const foundArtwork = artworks.find((art) => art.id === id);
    if (foundArtwork) {
      setArtwork(foundArtwork);
      setComments([]); // Future: Fetch comments from backend
      setRelatedArtworks([]); // Future: Fetch related artworks from backend
    }
    setIsLoading(false);
  }, [id, artworks]);

  const handleLike = () => {
    if (artwork) {
      toggleLike(artwork.id);
      toast(`${likedArtworks[artwork.id] ? "Unliked" : "Liked"} the artwork`);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      const newComment = {
        id: `c${comments.length + 1}`,
        user: "You",
        userImage: "https://i.pravatar.cc/150?img=5",
        text: comment,
        likes: 0,
        timestamp: "Just now",
      };

      setComments([...comments, newComment]);
      toast("Comment posted");
      setComment("");
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
  
  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast(isFavorite ? "Artwork favorite removed" : "Artwork added to favorites");
    setMenuOpen(false);
  };

  const toggleDetailsPanel = () => {
    setIsDetailOpen(!isDetailOpen);
  };

  const handleTipJar = () => {
    if (!artwork) return;
    openPopup({
      id: artwork.id,
      title: artwork?.title || "Untitled Artwork",
      artistName: artwork?.artistName || "Unknown Artist",
      artworkImage: artwork?.artworkImage || "",
    });
  };  

  const [commentLikes, setCommentLikes] = useState<{ [commentId: string]: number }>({
    'comment1': 90,
  });
  
  const [likedComments, setLikedComments] = useState<{ [commentId: string]: boolean }>({
    'comment1': false,
  });
  
  const [commentMenus, setCommentMenus] = useState<{ [commentId: string]: boolean }>({
    'comment1': false,
  });
  
  const handleCommentLike = (commentId: string) => {
    setLikedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
    setCommentLikes(prev => ({
      ...prev,
      [commentId]: prev[commentId] + (likedComments[commentId] ? -1 : 1),
    }));
  };
  
  const toggleCommentMenu = (commentId: string) => {
    setCommentMenus(prev => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };
  

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto pt-24 px-4">
          <div className="animate-pulse">
            <div className="h-8 w-40 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7">
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
              <div className="lg:col-span-5">
                <div className="h-12 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-6 w-1/3"></div>
                <div className="h-24 bg-gray-200 rounded mb-8"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto pt-24 px-4 text-center">
          <h2 className="text-lg font-bold mb-4">Artwork Not Found</h2>
          <p className="mb-8 text-xs">
            The artwork you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/explore" className="text-red-600 text-xs hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 md:px-6 py-4 md:py-8">
        {/* Back button */}
        <div className={`mt-8 md:mt-12 ${isMobile ? 'px-4 pt-8' : 'md:ml-12'}`}>
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-sm font-semibold"
          >
            <i className='bx bx-chevron-left text-lg mr-2'></i>
            Artwork Details
          </button>
        </div>

        <div className={` ${isMobile ? 'flex flex-col' : 'flex justify-center items-start space-x-2'}`}> 
          {/* Artwork, Right-side Sliding */}
          <div
            className={`${isMobile ? 'w-full' : 'flex justify-center items-start transition-transform duration-500 ease-in-out'}`}
            style={{
              transform: !isMobile && isDetailOpen ? "translateX(70px)" : "translateX(0)",
            }}
          >
            {/* Artwork container */}
            <div className={`relative ${isMobile ? 'w-full' : 'w-full max-w-[480px] min-w-[320px]'}`}>
              {/* Collapsible Sidebar */}
              {!isMobile && (
                <div
                  className={`absolute right-100 top-0 w-[27%] h-full z-20 transition-all duration-500 ease-in-out pointer-events-none ${
                    isDetailOpen ? "opacity-100 translate-x-0 pointer-events-auto" : "opacity-0 -translate-x-10"
                  }`}
                  style={{ right: "calc(100% + 16px)" }}
                >
                <div className="bg-gray-50 rounded-sm relative top-1/4 p-6 text-justify shadow-md">
                  <div className="mb-8">
                    <h3 className="text-[10px] font-medium mb-2">Artwork Style</h3>
                    <p className="text-[10px] text-gray-700">{artwork?.style || "Painting"}</p>
                  </div>
                  <div className="mb-8">
                    <h3 className="text-[10px] font-medium mb-2">Medium</h3>
                    <p className="text-[10px] text-gray-700">{artwork?.medium || "Acrylic Paint"}</p>
                  </div>
                  <div className="mb-2">
                    <h3 className="text-[10px] font-medium mb-2">Date Posted</h3>
                    <p className="text-[10px] text-gray-700">{artwork?.datePosted || "March 25, 2023"}</p>
                  </div>
                </div>
              </div>
              )}

              {/* Mobile Information Panel (Collapsible) */}
              {isMobile && (
                  <Collapsible className="px-4">
                    <div className="flex justify-between items-center mb-2">
                      <CollapsibleTrigger className="p-1 -mb-2 mt-2">
                        <GripVertical size={16} />
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="transition-all duration-500 ease-in-out">
                      <div className="bg-gray-50 rounded-md p-4 text-xs">
                        <div className="grid grid-cols-3 gap-8 px-8">
                          <div>
                            <h4 className="text-[10px] font-medium mb-1">Artwork Style</h4>
                            <p className="text-[10px] text-gray-700">{artwork?.style || "Painting"}</p>
                          </div>
                          <div>
                            <h4 className="text-[10px] font-medium mb-1">Medium</h4>
                            <p className="text-[10px] text-gray-700">{artwork?.medium || "Acrylic Paint"}</p>
                          </div>
                          <div>
                            <h4 className="text-[10px] font-medium mb-1">Date Posted</h4>
                            <p className="text-[10px] text-gray-700">{artwork?.datePosted || "March 25, 2023"}</p>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

              {/* Center - Artwork Image */}
              <div className={`relative z-0 ${isMobile ? 'px-4' : ''}`}>
                {!isMobile && (
                  <button
                    onClick={toggleDetailsPanel}
                    className="p-1 text-gray-500 hover:text-black absolute left-0 top-1/2 transform -translate-y-1/2"
                  >
                  <GripVertical size={15} />
                </button>
                )}

                <div className="inline-block transform scale-[.85] -mb-10 relative">
                  <div className="aspect-square overflow-hidden shadow-[0_4px_14px_rgba(0,0,0,0.15)] rounded-xl">
                    <img
                      src={artwork?.artworkImage}
                      alt={artwork?.title}
                      className="w-full h-full object-cover transition-transform duration-700 rounded-xl"
                    />
                    {/* TipJar Floating Button */}
                    <div
                      className={`absolute bottom-3 right-3 ${isMobile ? '' : 'z-10'}`}
                    >
                      <div
                        className={`group flex flex-row-reverse items-center bg-white/70 backdrop-blur-md rounded-full px-1 py-1 shadow-md overflow-hidden w-[32px] h-[32px] hover:w-auto hover:pl-4 transition-all ease-in-out duration-700 animate-tipjar cursor-pointer`}
                        onClick={handleTipJar}
                      >
                        <TipJarIcon onClick={handleTipJar} />
                        <span
                          className={`mr-1 text-[10px] font-medium whitespace-nowrap transform translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all ease-in-out duration-700 animate-donate`}
                        >
                          Donate
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            

            {/* Right side - Title, artist, description, comments */}
            <div className={`${isMobile ? 'w-full mt-6 px-4' : 'w-full max-w-[390px] min-w-[280px]'}`}>
              <div className={`${isMobile ? '' : 'relative top-10'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => toggleLike(id)} 
                      className="flex items-center space-x-1 text-gray-800 rounded-3xl py-2 px-3 border border-gray-200"
                    >
                      <Heart
                        size={isMobile ? 16 : 14}
                        className={likedArtworks[artwork?.id] ? "text-red-600 fill-red-600" : "text-gray-800"}
                        fill={isLiked ? "currentColor" : "none"}
                      />
                      {(likeCounts[artwork?.id] ?? artwork?.likesCount ?? 0) > 0 && (
                        <span className={`${isMobile ? 'text-xs' : 'text-[9px]'}`}>
                          {likeCounts[artwork?.id] ?? artwork?.likesCount}
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

                    <ArtCardMenu
                      isOpen={menuOpen}
                      onFavorite={handleFavorite}
                      onHide={handleHide}
                      onReport={handleReport}
                      isFavorite={isFavorite}
                      isReported={isReported}
                      className={isMobile ? "mobile-menu-position" : ""} 
                    />
                  </div>
                </div>

                <h1 className={`${isMobile ? 'text-lg' : 'text-md'} font-bold mb-2`}>{artwork?.title || "The Distorted Face"}</h1>
                
                <p className={`${isMobile ? 'text-xs' : 'text-[10px]'} text-gray-600 mb-4`}>by {artwork?.artistName || "Angel Ganev"}</p>
                
                <p className={`${isMobile ? 'text-xs' : 'text-[10px]'} text-gray-800 mb-2`}>
                  {artwork?.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor."}
                </p>
                
                <Separator className="my-6" />
                
                {/* User profile and comment section */}
                <div className="mb-6 relative">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                    <Avatar className={`${isMobile ? 'h-6 w-6' : 'h-3 w-3'} mr-2`}>
                        <AvatarImage src="https://i.pravatar.cc/150?img=3" alt="Jai Anoba" />
                        <AvatarFallback>JA</AvatarFallback>
                      </Avatar>

                      <div>
                        <p className={`${isMobile ? 'text-xs' : 'text-[9px]'} font-semibold`}>Jai Anoba</p>
                        <p className={`${isMobile ? 'text-xs' : 'text-[10px]'} text-gray-700 mt-1`}>I love it!</p>

                        <div className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-[9px]'} text-gray-500 mt-1`}>
                          <span>3d</span>
                          <span>·</span>
                          <button className="hover:underline text-gray-500">Reply</button>
                          <span>·</span>
                          <button
                            onClick={() => handleCommentLike('comment1')}
                            className="flex items-center gap-1"
                          >
                            <Heart
                              size={isMobile ? 12 : 10}
                              className={likedComments['comment1'] ? 'text-red-500 fill-red-500' : 'text-gray-500'}
                              fill={likedComments['comment1'] ? 'currentColor' : 'none'}
                            />
                            {commentLikes['comment1']}
                          </button>

                          {/* Three dots button */}
                          <div className="relative ml-1">
                            <button
                              onClick={() => toggleCommentMenu('comment1')}
                              className="p-1 text-gray-500 hover:text-black"
                            >
                               <MoreHorizontal size={isMobile ? 14 : 12} />
                            </button>

                            {commentMenus['comment1'] && (
                              <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-10">
                                <button
                                  className={`w-full text-left px-3 py-2 ${isMobile ? 'text-xs' : 'text-[8px]'} hover:bg-gray-100`}
                                  onClick={() => {
                                    alert('Blocked user');
                                    toggleCommentMenu('comment1');
                                  }}
                                >
                                  Block User
                                </button>
                                <button
                                  className={`w-full text-left px-3 py-2 ${isMobile ? 'text-xs' : 'text-[9px]'} hover:bg-gray-100`}
                                  onClick={() => {
                                    alert('Reported content');
                                    toggleCommentMenu('comment1');
                                  }}
                                >
                                  Report Content
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div> 
                  </div>
                </div>

                
                {/* Add comment form */}
                <form onSubmit={handleCommentSubmit} className="relative">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className={`w-full border border-gray-200 rounded-full px-4 py-2 ${isMobile ? 'text-sm' : 'text-[10px]'} focus:outline-none focus:ring-1 focus:ring-gray-300 pr-16`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                    <button type="button" className="text-gray-400">
                      😊
                    </button>
                    <button type="submit" className={`${isMobile ? 'text-sm' : 'text-[10px]'} text-gray-400`} disabled={!comment.trim()}>
                      <svg className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'}`} viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14 1.788 0 5.297-4.76 5.297 4.76 1.788 0-7-14z" />
                      </svg>
                    </button>
                  </div>
                </form>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkDetails;
