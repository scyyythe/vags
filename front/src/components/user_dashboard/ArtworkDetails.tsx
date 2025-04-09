import { useState, useContext, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Heart,
  ChevronLeft,
  MoreHorizontal,
  Share,
  EllipsisVertical,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { LikedArtworksContext } from "@/App";
import { toast } from "sonner";
import RelatedArtwork from "../user_dashboard/RelatedArtworks";
import Header from "../../components/user_dashboard/Header";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useArtworkContext } from "../../context/ArtworkContext";

const ArtworkDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { likedArtworks, toggleLike } = useContext(LikedArtworksContext);
  const { artworks } = useArtworkContext();

  const [comment, setComment] = useState("");
  const [artwork, setArtwork] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedArtworks, setRelatedArtworks] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(true);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast("Link copied to clipboard");
  };

  const toggleDetailsPanel = () => {
    setIsDetailOpen(!isDetailOpen);
  };

  const toggleMoreMenu = () => {
    setShowMoreMenu(!showMoreMenu);
  };

  const handleReportArtwork = () => {
    toast("Artwork reported");
    setShowMoreMenu(false);
  };

  const handleSaveArtwork = () => {
    toast("Artwork saved to collection");
    setShowMoreMenu(false);
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

  // if (!artwork) {
  //   return (
  //     <div className="min-h-screen bg-white">
  //       <Header />
  //       <div className="container mx-auto pt-24 px-4 text-center">
  //         <h2 className="text-2xl font-bold mb-4">Artwork Not Found</h2>
  //         <p className="mb-8">
  //           The artwork you're looking for doesn't exist or has been removed.
  //         </p>
  //         <Link to="/explore" className="text-red-600 hover:underline">
  //           Return to Home
  //         </Link>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        {/* Back button */}
        <div className="mb-20 border border-red-900">
          <Link to="/explore" className="flex items-center text-gray-800 hover:text-gray-600">
            <ChevronLeft size={20} />
            <span className="ml-2 font-medium">Artwork Details</span>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-8 border border-red-800">
          {/* Artwork details with collapsible */}
          <Collapsible 
            open={isDetailOpen} 
            onOpenChange={setIsDetailOpen}
            className="relative"
          >
            <CollapsibleContent className="w-full md:w-[220px] shrink-0">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Artwork Style</h3>
                  <p className="text-sm text-gray-700">{artwork?.style || "Painting"}</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Medium</h3>
                  <p className="text-sm text-gray-700">{artwork?.medium || "Acrylic Paint"}</p>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Date Posted</h3>
                  <p className="text-sm text-gray-700">{artwork?.datePosted || "March 25, 2023"}</p>
                </div>
              </div>
            </CollapsibleContent>
            
            {/* Ellipsis trigger positioned to be visible at all times */}
            <CollapsibleTrigger className="absolute top-3 left-[-30px] z-10">
              <button className="p-1 text-gray-500 hover:text-gray-700">
                <EllipsisVertical size={20} />
              </button>
            </CollapsibleTrigger>
          </Collapsible>

          {/* Center - Artwork Image */}
          <div className={`flex-1 transition-all duration-300 ${isDetailOpen ? 'md:ml-0' : 'md:ml-[-30px]'}`}>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4">
                <img
                  src={artwork?.artworkImage}
                  alt={artwork?.title}
                  className="w-full h-auto object-contain"
                />
              </div>
              
              <div className="flex items-center px-4 py-3 bg-white">
                <button 
                  onClick={handleLike} 
                  className="flex items-center mr-2 text-gray-800"
                >
                  <Heart
                    size={18}
                    className={likedArtworks[artwork?.id] ? "text-red-600 fill-red-600" : "text-gray-800"}
                    fill={likedArtworks[artwork?.id] ? "currentColor" : "none"}
                  />
                </button>
                <span className="text-sm mr-auto">3.5k</span>
                
                <button onClick={handleShare} className="p-1 text-gray-800">
                  <Share size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Right side - Title, artist, description, comments */}
          <div className="w-full md:w-[300px] shrink-0">
            <div className="relative">
              <div className="flex justify-between items-start">
                <h1 className="text-2xl font-bold">{artwork?.title || "The Distorted Face"}</h1>
                <button 
                  className="p-1 text-gray-500 relative"
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                >
                  <MoreHorizontal size={20} />
                  
                  {showMoreMenu && (
                    <div className="absolute right-0 top-8 z-10 bg-white shadow-lg rounded-lg py-2 w-40">
                      <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                        Save
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                        Report
                      </button>
                    </div>
                  )}
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">by {artwork?.artistName || "Angel Ganev"}</p>
              
              <p className="text-sm text-gray-800 mb-2">
                {artwork?.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor."}
              </p>
              {/* <button className="text-xs text-gray-500 hover:underline mb-6">
                Show more
              </button> */}
              
              <Separator className="my-6" />
              
              {/* User profile and comment section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src="https://i.pravatar.cc/150?img=12" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Joe Birdie</p>
                    </div>
                  </div>
                  <button className="text-xs font-medium text-blue-600">I love it</button>
                </div>
                
                {/* <div className="mt-4 flex items-center mb-4">
                  <Avatar className="h-5 w-5 mr-2">
                    <AvatarImage src="https://i.pravatar.cc/150?img=3" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-600">View all 3,560 comments</span>
                </div> */}
              </div>
              
              {/* Add comment form */}
              <form onSubmit={handleCommentSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 pr-16"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                  <button type="button" className="text-gray-400">
                    😊
                  </button>
                  <button type="submit" className="text-sm text-gray-400" disabled={!comment.trim()}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.8214 2.48697 15.5291 3.33782 17L2.5 21.5L7 20.6622C8.47087 21.513 10.1786 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Related Artworks Section */}
        <div className="mt-16">
          <h2 className="text-lg font-semibold mb-6">Related Artworks</h2>

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
