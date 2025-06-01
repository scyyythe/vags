import { useState, useEffect, useContext, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { LikedArtworksContext, LikedArtworksProvider } from "@/context/LikedArtworksProvider";
import ExhibitMenu from "@/components/user_dashboard/Exhibit/menu/ExhibitMenu";
import { useDonation, DonationProvider } from "@/context/DonationContext";
import Header from "@/components/user_dashboard/navbar/Header";
import { useIsMobile } from "@/hooks/use-mobile";
import useFavorite from "@/hooks/interactions/useFavorite";
import ArtworkImageCarousel from "@/components/user_dashboard/Marketplace/artwork_carousel/ArtworkCarousel";
import ReviewModal from "@/components/user_dashboard/Marketplace/reviews/ReviewModal";
import { mockArtworks } from "@/components/user_dashboard/Marketplace/mock_data/mockArtworks";

const ProductViewingContent = () => {
    const { id } = useParams<{ id: string }>();
    const { likedArtworks, toggleLike } = useContext(LikedArtworksContext);
    const isLiked = likedArtworks[id || ""] || false;
    const { isFavorite, handleFavorite: toggleFavorite } = useFavorite(id);
    const [product, setProduct] = useState<any>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const isMobile = useIsMobile();
    const navigate = useNavigate();

    // Mock reviews data
    const mockReviews = [
        {
        id: "1",
        user: "Jimuel Clamonte",
        userImage: "",
        rating: 5,
        comment: "The colors are incredibly vibrant and the texture is amazing. The print quality exceeded my expectations. It's now the centerpiece of my living room!",
        timestamp: "2024-05-01T10:00:00Z",
        verified: true
        },
        {
        id: "2",
        user: "Jimuel Clamonte",
        userImage: "",
        rating: 5,
        comment: "The colors are incredibly vibrant and the texture is amazing. The print quality exceeded my expectations. It's now the centerpiece of my living room!",
        timestamp: "2024-05-01T10:00:00Z",
        verified: true
        },
        {
        id: "3",
        user: "Jimuel Clamonte",
        userImage: "",
        rating: 5,
        comment: "The colors are incredibly vibrant and the texture is amazing. The print quality exceeded my expectations. It's now the centerpiece of my living room!",
        timestamp: "2024-05-01T10:00:00Z",
        verified: true
        }
    ];

    useEffect(() => {
        if (id) {
        const found = mockArtworks.find((artwork) => artwork.id === id);
        if (found) {
            setProduct(found);
        } else {
            setProduct(null);
        }
        }
    }, [id]);

    if (!product) {
        return <div>Product not found.</div>;
    }

    const goToPrevious = () => {
        if (product?.images?.length > 1) {
        setCurrentImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
        }
    };

    const goToNext = () => {
        if (product?.images?.length > 1) {
        setCurrentImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
        }
    };

    const handleQuantityChange = (change: number) => {
        setQuantity(prev => Math.max(1, prev + change));
    };

    const handleLike = () => {
        if (id) {
        toggleLike(id);
        }
    };

    const renderStars = (rating: number, size: string = "text-sm") => {
        return Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className={`text-yellow-400 ${size}`}>
            {index < rating ? "★" : "☆"}
        </span>
        ));
    };

    const renderRatingBar = (star: number, count: number, total: number) => {
        const percentage = total > 0 ? (count / total) * 100 : 0;
        return (
        <div className="flex items-center space-x-2 text-xs">
            <span className="w-2">{star}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
                className="bg-yellow-400 h-2 rounded-full" 
                style={{ width: `${percentage}%` }}
            />
            </div>
        </div>
        );
    };

    if (!id) {
        return (
        <div className="min-h-screen bg-white">
            <Header />
            <div className="container mx-auto pt-24 px-4 text-center">
            <h2 className="text-lg font-bold mb-4">Artwork Not Found</h2>
            <p className="mb-8 text-xs">The artwork you're looking for doesn't exist or has been removed.</p>
            <Link to="/" className="text-red-600 text-xs hover:underline">
                Return to Home
            </Link>
            </div>
        </div>
        );
    }

    if (!product) {
        return (
        <div className="min-h-screen flex justify-center items-center">
            <Header />
            <p className="text-gray-500 text-sm">Loading exhibit...</p>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Back button */}
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft size={20} className="mr-1" />
            <span className="text-sm font-medium">Product Detail</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - Image */}
          <div className="relative">
            <Card className="overflow-hidden">
              <div 
                className="relative aspect-square bg-white"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <img
                    src={product.artworkImage}
                    alt={product.title}
                    className="w-full h-auto object-cover rounded-lg cursor-pointer"
                    onClick={() => setIsExpanded(true)}
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

                {/* Navigation arrows - show when multiple images and hovered */}
                {product.images.length > 1 && isHovered && (
                  <>
                    <button
                      onClick={goToPrevious}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 z-10"
                    >
                      <ChevronLeft size={20} className="text-gray-700" />
                    </button>
                    <button
                      onClick={goToNext}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 z-10"
                    >
                      <ChevronRight size={20} className="text-gray-700" />
                    </button>
                  </>
                )}

                {/* Image counter */}
                {product.images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
                    {currentImageIndex + 1}/{product.images.length}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right side - Product Info */}
          <div className="space-y-6">
            {/* Title and Actions */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
                <div className="flex items-center space-x-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src="" alt={product.artist} />
                    <AvatarFallback className="text-xs">{product.artist?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-gray-600 text-sm">{product.artist}</span>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <MoreHorizontal size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-2">
              <div className="text-3xl font-bold text-gray-900">
                {product.currency}{product.price?.toLocaleString()}
              </div>
              {product.originalPrice && (
                <div className="text-lg text-gray-400 line-through">
                  {product.currency}{product.originalPrice?.toLocaleString()}
                </div>
              )}
            </div>

            {/* Product Details Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Artwork Style</h3>
                    <p className="text-sm text-gray-900">{product.artworkStyle}</p>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Medium</h3>
                    <p className="text-sm text-gray-900">{product.medium}</p>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Size</h3>
                    <p className="text-sm text-gray-900">{product.size}</p>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Edition</h3>
                    <p className="text-sm text-gray-900">{product.edition}</p>
                </div>
            </div>

            {/* Tabs for Description/Review */}
            <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="review">Review</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="mt-4">
                    <div className="bg-white p-4 rounded-lg border h-48 overflow-y-auto">
                    <p className="text-sm text-gray-700 leading-relaxed">
                        {product.description}
                    </p>
                    </div>
                </TabsContent>
                <TabsContent value="review" className="mt-4">
                    <div className="bg-white p-4 rounded-lg border h-48 overflow-y-auto">
                    {/* Rating Overview */}
                    <div className="flex items-start justify-between">
                        <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <span className="text-2xl font-bold">{product.rating}</span>
                            <span className="text-sm text-gray-500">out of 5</span>
                        </div>
                        <div className="flex items-center space-x-1 mb-1">
                            {renderStars(Math.floor(product.rating))}
                        </div>
                        <p className="text-xs text-gray-500">({product.totalReviews} reviews)</p>
                        </div>
                        
                        {/* Rating Breakdown */}
                        <div className="space-y-1 flex-1 max-w-32 ml-8">
                        {[5, 4, 3, 2, 1].map((star) => 
                            renderRatingBar(star, product.reviewBreakdown[star] || 0, product.totalReviews)
                        )}
                        </div>
                        
                        {/* View All Reviews Link */}
                        <button 
                        onClick={() => setIsReviewModalOpen(true)}
                        className="text-sm text-blue-600 hover:underline flex items-center"
                        >
                        View all reviews
                        <ChevronRight size={14} className="ml-1" />
                        </button>
                    </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Quantity and Buy Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                    <button 
                        onClick={() => handleQuantityChange(-1)}
                        className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                    >
                        -
                    </button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <button 
                        onClick={() => handleQuantityChange(1)}
                        className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                    >
                        +
                    </button>
                    </div>
                    
                    <button
                    onClick={handleLike}
                    className="p-2 border border-gray-300 rounded hover:bg-gray-50"
                    >
                    <Heart 
                        size={20} 
                        className={isLiked ? "text-red-500 fill-red-500" : "text-gray-600"}
                    />
                    </button>
                </div>

                <Button 
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg font-medium"
                    onClick={() => toast("Added to cart!")}
                >
                    Buy Now
                </Button>
                </div>
            </div>
            </div>
        </div>

        {/* Expanded artwork view */}
        {isExpanded && (
            <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center overflow-hidden">
                <button
                    onClick={() => setIsExpanded(false)}
                    className="absolute top-4 right-4 text-white text-3xl font-bold z-60 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center"
                >
                    ✕
                </button>
                <div className="relative w-full h-full px-4 py-16 flex justify-center items-center">
                    <img 
                    src={product.images[currentImageIndex]} 
                    alt="Expanded artwork" 
                    className="max-h-[80vh] max-w-[90vw] object-contain" 
                    />
                </div>
            </div>
        )}

        {/* Review Modal */}
        <ReviewModal 
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            reviews={mockReviews}
            totalReviews={product.totalReviews}
        />
    </div>
    );
};

const ProductViewing = () => {
    return (
        <LikedArtworksProvider>
        <DonationProvider>
            <ProductViewingContent />
        </DonationProvider>
        </LikedArtworksProvider>
    );
};

export default ProductViewing;
