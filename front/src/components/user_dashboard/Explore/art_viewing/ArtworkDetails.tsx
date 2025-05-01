import { useState, useEffect,  useContext, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Heart,
  MoreHorizontal,
  GripVertical,
  Reply,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { LikedArtworksContext } from "@/App";
import ArtCardMenu from "@/components/user_dashboard/Explore/cards/ArtCardMenu";
import { useDonation } from "@/context/DonationContext";
import Header from "@/components/user_dashboard/navbar/Header";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useArtworkContext } from "@/context/ArtworkContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDistanceToNow } from 'date-fns';
import CommentSection from "@/components/user_dashboard/Explore/comment_sec/Comment";

const ArtworkDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { likedArtworks, likeCounts, toggleLike } = useContext(LikedArtworksContext);
  const isLiked = likedArtworks[id] || false;
  const { artworks } = useArtworkContext();
  const { openPopup } = useDonation();
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();

  const navigate = useNavigate();
  const [comment, setComment] = useState("");
  const [artwork, setArtwork] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedArtworks, setRelatedArtworks] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [viewAll] = useState(false);

  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const descriptionRef = useRef<HTMLDivElement | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isReported, setIsReported] = useState(false);

  const [commentLikes, setCommentLikes] = useState<{ [commentId: string]: number }>({});
  const [likedComments, setLikedComments] = useState<{ [commentId: string]: boolean }>({});
  const [commentMenus, setCommentMenus] = useState<{ [commentId: string]: boolean }>({});
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({});

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

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      const newComment = {
        id: `c${Date.now()}`,
        user: "You",
        userImage: "https://i.pravatar.cc/150?img=5",
        text: comment,
        likes: 0,
        timestamp: new Date().toISOString(),
        replies: []
      };

      setComments(prev => [...prev, newComment]);
      setCommentLikes(prev => ({
        ...prev,
        [newComment.id]: 0
      }));
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

  const handleCommentLike = (commentId: string) => {
    setLikedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
    setCommentLikes(prev => ({
      ...prev,
      [commentId]: (prev[commentId] || 0) + (likedComments[commentId] ? -1 : 1),
    }));
  };
  
  const toggleCommentMenu = (commentId: string) => {
    setCommentMenus(prev => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleReply = (commentId: string) => {
    const parentComment = comments.find(c => c.id === commentId);
    if (parentComment) {
      setComment(`@${parentComment.user} `);
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const onEmojiClick = (
    event: React.MouseEvent<Element, MouseEvent>,
    emojiObject: { emoji: string }
  ) => {
    setComment(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
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

  const renderComment = (commentItem: any, isReply = false) => (
    <div
      key={commentItem.id}
      className={`mb-6 relative ${isReply ? 'ml-8 pl-4 border-l border-gray-200' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <Avatar className={`${isMobile ? 'h-6 w-6' : 'h-3 w-3'} mr-2`}>
            <AvatarImage src={commentItem.userImage} alt={commentItem.user} />
            <AvatarFallback>{commentItem.user.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
  
          <div>
            <p className={`${isMobile ? 'text-xs' : 'text-[9px]'} font-semibold`}>{commentItem.user}</p>
            <p className={`${isMobile ? 'text-xs' : 'text-[10px]'} text-gray-700 mt-1`}>{commentItem.text}</p>
  
            <div className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-[9px]'} text-gray-500 mt-1`}>
              <span>{formatDistanceToNow(new Date(commentItem.timestamp), { addSuffix: true })}</span>
              <span>·</span>
              <button 
                onClick={() => handleReply(commentItem.id)} 
                className="hover:underline text-gray-500 flex items-center gap-1"
              >
                <Reply size={isMobile ? 12 : 10} />
                Reply
              </button>
              <span>·</span>
              <button
                onClick={() => handleCommentLike(commentItem.id)}
                className="flex items-center gap-1"
              >
                <Heart
                  size={isMobile ? 12 : 10}
                  className={likedComments[commentItem.id] ? 'text-red-500 fill-red-500' : 'text-gray-500'}
                  fill={likedComments[commentItem.id] ? 'currentColor' : 'none'}
                />
                {commentLikes[commentItem.id] || commentItem.likes || 0}
              </button>
  
              <div className="relative ml-1">
                <button
                  onClick={() => toggleCommentMenu(commentItem.id)}
                  className="p-1 text-gray-500 hover:text-black"
                >
                  <MoreHorizontal size={isMobile ? 14 : 12} />
                </button>
  
                {commentMenus[commentItem.id] && (
                  <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-10">
                    <button
                      className={`w-full text-left px-3 py-2 ${isMobile ? 'text-xs' : 'text-[8px]'} hover:bg-gray-100`}
                      onClick={() => {
                        toast.success(`Blocked user ${commentItem.user}`);
                        toggleCommentMenu(commentItem.id);
                      }}
                    >
                      Block User
                    </button>
                    <button
                      className={`w-full text-left px-3 py-2 ${isMobile ? 'text-xs' : 'text-[9px]'} hover:bg-gray-100`}
                      onClick={() => {
                        toast.success("Content reported");
                        toggleCommentMenu(commentItem.id);
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
  
      {!isReply && commentItem.replies && commentItem.replies.length > 0 && (
        <div className="mt-2 ml-8">
          <button
            onClick={() => toggleReplies(commentItem.id)}
            className="text-blue-500 hover:text-blue-600 text-[10px] flex items-center gap-1"
          >
            {expandedComments[commentItem.id] ? 'Hide' : 'View'} {commentItem.replies.length} {commentItem.replies.length === 1 ? 'reply' : 'replies'}
          </button>
        </div>
      )}
  
      {!isReply && commentItem.replies && expandedComments[commentItem.id] && (
        <div className="mt-4">
          {commentItem.replies.map((reply: any) => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const closeExpandedView = () => {
    setIsExpanded(false);
  };
  
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
            Go back
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
            <div className={`relative mr-6 ${isMobile ? 'w-full' : 'w-full max-w-[500px] min-w-[380px]'}`}>
              {/* Collapsible Sidebar */}
              {!isMobile && (
                <div
                  className={`absolute right-100 top-0 w-[32%] h-[140%] z-20 transition-all duration-500 ease-in-out pointer-events-none ${
                    isDetailOpen ? "opacity-100 translate-x-0 pointer-events-auto" : "opacity-0 -translate-x-1"
                  }`}
                  style={{ right: "calc(100% + 16px)", marginRight: "40px"  }}
                >
                <div className="bg-gray-100 rounded-sm relative top-1/4 p-6 text-justify shadow-md">
                  <div className="mb-6">
                    <h3 className="text-[9px] font-medium mb-1">Artwork Style</h3>
                    <p className="text-[9px] text-gray-700">{artwork?.style || "Painting"}</p>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-[9px] font-medium mb-1">Medium</h3>
                    <p className="text-[9px] text-gray-700">{artwork?.medium || "Acrylic Paint"}</p>
                  </div>
                  <div className="mb-1">
                    <h3 className="text-[9px] font-medium mb-1">Date Posted</h3>
                    <p className="text-[9px] text-gray-700">{artwork?.datePosted || "March 25, 2023"}</p>
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
              <div className={`relative z-0 mt-12 ${isMobile ? 'px-4' : ''}`}>
                {!isMobile && (
                  <button
                    onClick={toggleDetailsPanel}
                    className="p-1 text-gray-500 hover:text-black absolute -left-12 top-1/2 transform -translate-y-1/2S"
                  >
                  <GripVertical size={15} />
                </button>
                )}

                <div className="inline-block transform scale-[1.10] -mb-6 relative">
                  <div className="aspect-square overflow-hidden shadow-[0_4px_14px_rgba(0,0,0,0.15)] rounded-xl">
                    <img
                      src={artwork?.artworkImage}
                      alt={artwork?.title}
                      className="w-full h-full object-cover transition-transform duration-700 rounded-xl"
                    />

                    {/* TipJar + Expand Button Container */}
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

                      {/* TipJar Icon */}
                      <div
                        className="group flex flex-row-reverse items-center bg-white/70 backdrop-blur-md rounded-full px-1 py-1 shadow-md overflow-hidden w-[32px] h-[32px] hover:w-[90px] hover:pl-4 transition-[width,padding] ease-in-out duration-700 cursor-pointer animate-tipjar"
                        onClick={handleTipJar}
                      >
                        <i className='bx bx-box text-[12px] mr-[6px]' ></i>
                        <span
                          className="mr-3 text-[10px] font-medium whitespace-nowrap transform translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all ease-in-out duration-700 animate-donate"
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
            <div className={`${isMobile ? 'w-full mt-6 px-4s' : 'w-full max-w-[390px] min-w-[280px]'}`}>
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
                      className="py-3 pr-3 text-gray-500"
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

                {/* Comment Section */}
                <CommentSection artworkId={id} />

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded artwork view */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center overflow-hidden">
          
          <button
            onClick={closeExpandedView}
            className="absolute top-[14px] right-[35px] text-white text-3xl font-bold z-[60]"
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

export default ArtworkDetails;
