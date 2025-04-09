import { useState, useContext, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, ChevronLeft, MoreHorizontal, MessageCircle, Share, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { LikedArtworksContext } from "@/App";
import { toast } from "sonner";
import RelatedArtwork from "../user_dashboard/RelatedArtworks";
import Header from "../../components/user_dashboard/Header";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const ArtworkDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { likedArtworks, toggleLike } = useContext(LikedArtworksContext);
  const [comment, setComment] = useState("");
  const [artwork, setArtwork] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedArtworks, setRelatedArtworks] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(true);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Artwork data (mock data for now, would come from API in real app)
  const artworksData = [
    {
      id: "1",
      title: "The Distorted Face",
      artist: "Angel Canete",
      artistImage: "https://i.pravatar.cc/150?img=2",
      artworkImage: "/lovable-uploads/e8dc3c38-ae14-44fb-a292-ec37f4e6d7e8.png",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
      style: "Painting",
      medium: "Acrylic Paint",
      datePosted: "March 23, 2023",
      likes: 3500,
      comments: [
        { id: "c1", user: "Joe Amber", userImage: "https://i.pravatar.cc/150?img=3", text: "I love it!", likes: 90, timestamp: "3d ago" }
      ]
    },
    {
      id: "2",
      title: "Liquid Dreams",
      artist: "Angel Canete",
      artistImage: "https://i.pravatar.cc/150?img=2",
      artworkImage: "https://www.goneminimal.com/wp-content/uploads/2022/04/Minimal-abstract-flower-painting-Minimalist-Painting-Gone-Minimal-edited-scaled.jpg",
      description: "Exploring the fluidity of consciousness through abstract representation.",
      style: "Painting",
      medium: "Acrylic Paint",
      datePosted: "January 15, 2023",
      likes: 2800,
      comments: []
    },
    {
      id: "3",
      title: "Ethereal Passage",
      artist: "Angel Canete",
      artistImage: "https://i.pravatar.cc/150?img=2",
      artworkImage: "https://images.squarespace-cdn.com/content/v1/58fd82dbbf629ab224f81b68/1599802230471-29DU3BQDBTQET95TAS58/image-asset.jpeg",
      description: "A journey through the boundaries of perception and reality.",
      style: "Painting",
      medium: "Acrylic Paint",
      datePosted: "February 10, 2023",
      likes: 3200,
      comments: []
    },
    {
      id: "4",
      title: "Abstract Emotions",
      artist: "Angel Canete",
      artistImage: "https://i.pravatar.cc/150?img=2",
      artworkImage: "https://i.pinimg.com/474x/dd/2a/03/dd2a03319703aab428a444f883a6f7ab.jpg",
      description: "Expressing complex emotional states through color and form.",
      style: "Painting",
      medium: "Acrylic Paint",
      datePosted: "April 5, 2023",
      likes: 1900,
      comments: []
    },
    {
      id: "5",
      title: "Geometric Harmony",
      artist: "Angel Canete",
      artistImage: "https://i.pravatar.cc/150?img=2",
      artworkImage: "https://cdn.pixabay.com/photo/2022/05/26/11/58/line-art-7222688_640.jpg",
      description: "Finding balance and symmetry in geometric abstraction.",
      style: "Painting",
      medium: "Acrylic Paint",
      datePosted: "May 18, 2023",
      likes: 2100,
      comments: []
    }
  ];

  // Related artworks data
  const relatedArtworksData = [
    {
      id: "6",
      title: "Melting Boundaries",
      artist: "Angel Canete",
      image: "/lovable-uploads/e8dc3c38-ae14-44fb-a292-ec37f4e6d7e8.png"
    },
    {
      id: "7",
      title: "Fluid Forms",
      artist: "Angel Canete",
      image: "/lovable-uploads/e8dc3c38-ae14-44fb-a292-ec37f4e6d7e8.png"
    },
    {
      id: "8",
      title: "Abstract Realms",
      artist: "Angel Canete",
      image: "/lovable-uploads/e8dc3c38-ae14-44fb-a292-ec37f4e6d7e8.png"
    },
    {
      id: "9",
      title: "Golden Illusion",
      artist: "Angel Canete",
      image: "/lovable-uploads/e8dc3c38-ae14-44fb-a292-ec37f4e6d7e8.png"
    },
    {
      id: "10",
      title: "Melting Boundaries",
      artist: "Angel Canete",
      image: "/lovable-uploads/e8dc3c38-ae14-44fb-a292-ec37f4e6d7e8.png"
    },
    {
      id: "11",
      title: "Fluid Forms",
      artist: "Angel Canete",
      image: "/lovable-uploads/e8dc3c38-ae14-44fb-a292-ec37f4e6d7e8.png"
    },
    {
      id: "12",
      title: "Abstract Realms",
      artist: "Angel Canete",
      image: "/lovable-uploads/e8dc3c38-ae14-44fb-a292-ec37f4e6d7e8.png"
    },
    {
      id: "13",
      title: "Golden Illusion",
      artist: "Angel Canete",
      image: "/lovable-uploads/e8dc3c38-ae14-44fb-a292-ec37f4e6d7e8.png"
    }
  ];

  useEffect(() => {
    // Simulate API call to fetch artwork details
    setIsLoading(true);
    setTimeout(() => {
      const foundArtwork = artworksData.find(artwork => artwork.id === id);
      if (foundArtwork) {
        setArtwork(foundArtwork);
        setComments(foundArtwork.comments || []);
        // Get other artworks by the same artist for the related section
        setRelatedArtworks(relatedArtworksData);
      }
      setIsLoading(false);
    }, 500);
  }, [id]);

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
        timestamp: "Just now"
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

  if (!artwork) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto pt-24 px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Artwork Not Found</h2>
          <p className="mb-8">The artwork you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="text-red-600 hover:underline">Return to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto pt-20 px-6">
        {/* Back button and title */}
        <div className="mb-8">
          <Link to="/explore" className="flex items-center text-black hover:text-gray-800">
            <ChevronLeft size={20} />
            <span className="font-medium ml-2">Artwork Details</span>
          </Link>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left sidebar - Artwork details with collapsible trigger */}
          <div className="w-full md:w-[200px] shrink-0">
            <Collapsible
              open={isDetailOpen}
              onOpenChange={setIsDetailOpen}
              className="bg-gray-50 rounded-lg"
            >
              <div className="p-5 flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-sm font-medium mb-3">Artwork Details</h3>
                  <CollapsibleContent className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium mb-3">Artwork Style</h3>
                      <p className="text-sm text-gray-700">{artwork?.style}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-3">Medium</h3>
                      <p className="text-sm text-gray-700">{artwork?.medium}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-3">Date Posted</h3>
                      <p className="text-sm text-gray-700">{artwork?.datePosted}</p>
                    </div>
                  </CollapsibleContent>
                </div>
                
                <CollapsibleTrigger asChild>
                  <button 
                    className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                    aria-label="Toggle artwork details"
                  >
                    <MoreVertical size={18} />
                  </button>
                </CollapsibleTrigger>
              </div>
            </Collapsible>
          </div>
          
          {/* Center - Artwork Image */}
          <div className="flex-1 max-w-xl mx-auto">
            <div className="bg-white rounded-lg p-4 shadow-sm overflow-hidden">
              <img
                src={artwork?.artworkImage}
                alt={artwork?.title}
                className="w-full h-auto object-contain"
              />
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  className="flex items-center gap-2"
                >
                  <Heart 
                    size={18} 
                    className={likedArtworks[artwork?.id] ? "text-red-600" : "text-gray-500"} 
                    fill={likedArtworks[artwork?.id] ? "#dc2626" : "none"} 
                  />
                  <span className="text-sm text-gray-700">Likes</span>
                </button>
                <span className="text-sm">{(3.5).toFixed(1)}k</span>
              </div>
              
              <button
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <Share size={18} className="text-gray-500" />
              </button>
            </div>
          </div>
          
          {/* Right side - Title, description, comments */}
          <div className="w-full md:w-[300px] shrink-0">
            <div className="relative">
              <h1 className="text-2xl font-bold mb-1">{artwork?.title}</h1>
              <p className="text-sm text-gray-600 mb-1">by {artwork?.artist}</p>
              
              <div className="absolute top-0 right-0">
                <div className="relative">
                  <button 
                    className="p-2 rounded-full hover:bg-gray-100"
                    onClick={toggleMoreMenu}
                  >
                    <MoreHorizontal size={18} />
                  </button>
                  
                  {showMoreMenu && (
                    <div className="absolute right-0 top-8 z-10 bg-white shadow-lg rounded-lg py-2 w-36">
                      <button
                        onClick={handleSaveArtwork}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-gray-100"
                      >
                        Save to collection
                      </button>
                      <button
                        onClick={handleReportArtwork}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-gray-100"
                      >
                        Report artwork
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-800 mt-4 mb-2">
                {artwork?.description}
              </p>
              <button className="text-xs text-gray-500 hover:underline">Show more</button>
              
              <Separator className="my-6" />
              
              {/* Comments section */}
              <div className="mb-6">
                {comments.length > 0 ? (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-medium">{comments[0]?.user}</span>
                      <span className="text-xs text-gray-500">{comments[0]?.text}</span>
                    </div>
                    
                    <div className="flex text-xs text-gray-500 gap-2 mb-4">
                      <span>{comments[0]?.likes} likes</span>
                      <span>•</span>
                      <span>{comments[0]?.timestamp}</span>
                    </div>
                    
                    <div className="mb-4">
                      <Avatar className="h-6 w-6 inline-block mr-2">
                        <AvatarImage src={comments[0]?.userImage} />
                        <AvatarFallback>{comments[0]?.user[0]}</AvatarFallback>
                      </Avatar>
                      {comments.length > 1 && (
                        <span className="text-xs">View all {comments.length} comments</span>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 mb-4">No comments yet. Be the first to comment!</p>
                )}
              </div>
              
              {/* Add comment form */}
              <form onSubmit={handleCommentSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 pr-20"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                  <button
                    type="button"
                    className="text-gray-400"
                  >
                    😊
                  </button>
                  <button
                    type="submit"
                    className="text-gray-500 hover:text-gray-700"
                    disabled={!comment.trim()}
                  >
                    <span className="text-xs font-medium">Post</span>
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
              <RelatedArtwork 
                key={relatedArt.id}
                id={relatedArt.id}
                title={relatedArt.title}
                image={relatedArt.image}
                artist={relatedArt.artist}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkDetails;
