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

const ArtworkDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { likedArtworks, likeCounts, toggleLike } = useContext(LikedArtworksContext);
  const isLiked = likedArtworks[id] || false;
  const { artworks } = useArtworkContext();
  const { openPopup } = useDonation();

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
          <h2 className="text-2xl font-bold mb-4">Artwork Not Found</h2>
          <p className="mb-8">
            The artwork you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/explore" className="text-red-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        {/* Back button */}
        <div className="mt-12 ml-12">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-sm font-semibold"
          >
            <i className='bx bx-chevron-left text-lg mr-2'></i>
            Artwork Details
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8 md:gap-4 overflow-hidden">
          {/* Artwork details with collapsible */}
          <div className="relative flex items-center justify-start w-full md:w-auto">
          {/* Collapsible Sidebar - Positioned Absolutely */}
          <div
            className={`absolute left-0 top-0 h-full transition-transform duration-500 ease-in-out z-10 ${
              isDetailOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
            }`}
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

          {/* Center - Artwork Image */}
          <div
            className={`ml-0 transition-transform duration-500 ease-in-out ${
              isDetailOpen ? "translate-x-[150px]" : "translate-x-0"
            }`}
          >
            <button
              onClick={toggleDetailsPanel}
              className="p-1 text-gray-500 hover:text-black absolute left-0 top-1/2 transform -translate-y-1/2"
            >
              <GripVertical size={15} />
            </button>

            <div className="inline-block transform scale-[.85] -mb-10 relative">
              <div className="overflow-hidden rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.15)] mb-6 relative">
                <img
                  src={artwork?.artworkImage}
                  alt={artwork?.title}
                  className="h-auto w-auto max-w-full max-h-[500px] object-contain"
                />
                {/* TipJar Floating Button */}
                <div className="absolute bottom-3 right-3 group cursor-pointer">
                  <div className={`flex flex-row-reverse items-center bg-white/70 backdrop-blur-md rounded-full px-1 py-1 shadow-md overflow-hidden w-[32px] h-[32px] group-hover:w-auto group-hover:pl-4 transition-all ease-in-out duration-700 animate-tipjar`}>
                    <TipJarIcon onClick={handleTipJar} />
                    <span className={`mr-1 text-[10px] font-medium whitespace-nowrap transform translate-x-10 opacity-0 animate-donate group-hover:translate-x-0 group-hover:opacity-100 transition-all ease-in-out duration-700`}>
                      Donate
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


          {/* Right side - Title, artist, description, comments */}
          <div className={`flex-1 min-w-0 max-w-screen-xs transition-all duration-500 ease-in-out ${isDetailOpen ? "ml-[150px]" : "ml-0"}`}style={{ overflowWrap: 'break-word' }}>

            <div className="relative top-10">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => toggleLike(id)} 
                    className="flex items-center space-x-1 text-gray-800 rounded-3xl py-2 px-3 border border-gray-200"
                  >
                    <Heart
                      size={14}
                      className={likedArtworks[artwork?.id] ? "text-red-600 fill-red-600" : "text-gray-800"}
                      fill={isLiked ? "currentColor" : "none"}
                    />
                    {(likeCounts[artwork?.id] ?? artwork?.likesCount ?? 0) > 0 && (
                      <span className="text-[9px]">
                        {likeCounts[artwork?.id] ?? artwork?.likesCount}
                      </span>
                    )}
                  </button>
                </div>

                <button 
                  className="py-3 text-gray-500 relative"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  <MoreHorizontal size={14} />
                </button>

                <ArtCardMenu
                  isOpen={menuOpen}
                  onFavorite={handleFavorite}
                  onHide={handleHide}
                  onReport={handleReport}
                  isFavorite={isFavorite}
                  isReported={isReported}
                />
              </div>

              <h1 className="text-md font-bold mb-2">{artwork?.title || "The Distorted Face"}</h1>
              
              <p className="text-[10px] text-gray-600 mb-4">by {artwork?.artistName || "Angel Ganev"}</p>
              
              <p className="text-xs text-gray-800 mb-2">
                {artwork?.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor."}
              </p>
              {/* <button className="text-xs text-gray-500 hover:underline">
                Show more
              </button> */}
              
              <Separator className="my-6" />
              
              {/* User profile and comment section */}
              <div className="mb-6 relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <Avatar className="h-3 w-3 mr-2">
                      <AvatarFallback>JA</AvatarFallback>
                    </Avatar>

                    <div>
                      <p className="text-[9px] font-semibold">Jai Anoba</p>
                      <p className="text-xs text-gray-700 mt-1">I love it!</p>

                      <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1">
                        <span>3d</span>
                        <span>·</span>
                        <button className="hover:underline text-gray-500">Reply</button>
                        <span>·</span>

                        <button
                          onClick={() => handleCommentLike('comment1')}
                          className="flex items-center gap-1"
                        >
                          <Heart
                            size={12}
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
                            <MoreHorizontal size={12} />
                          </button>

                          {commentMenus['comment1'] && (
                            <div className="absolute right-0 mt-1 w-36 bg-white border rounded-md shadow-lg z-10">
                              <button
                                className="w-full text-left px-3 py-2 text-[9px] hover:bg-gray-100"
                                onClick={() => alert('Blocked user')}
                              >
                                Block User
                              </button>
                              <button
                                className="w-full text-left px-3 py-2 text-[9px] hover:bg-gray-100"
                                onClick={() => alert('Reported content')}
                              >
                                Report Content
                              </button>
                            </div>
                          )}
                        </div>
                        {/* <span>·</span> */}
                        {/* <button className="hover:underline text-gray-500">View replies (2)</button> */}
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
                  className="w-full border border-gray-200 rounded-full px-4 py-2 text-[10px] focus:outline-none focus:ring-1 focus:ring-gray-300 pr-16"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                  <button type="button" className="text-gray-400">
                    😊
                  </button>
                  <button type="submit" className="text-[10px] text-gray-400" disabled={!comment.trim()}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.8214 2.48697 15.5291 3.33782 17L2.5 21.5L7 20.6622C8.47087 21.513 10.1786 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Related Artworks Section */}
        <div className="mt-14">
          <h2 className="text-xs mb-6">Related Artworks</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {relatedArtworks.map((relatedArt) => (
              <div key={relatedArt.id} className="cursor-pointer">
                <img
                  src={relatedArt.image}
                  alt={relatedArt.title}
                  className="w-full h-auto aspect-square object-cover rounded-lg shadow-sm"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkDetails;
