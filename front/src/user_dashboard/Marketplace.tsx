import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/user_dashboard/navbar/Header";
import { Footer } from "@/components/user_dashboard/footer/Footer";
import CategoryFilter from "@/components/user_dashboard/Marketplace/category_filter/CategoryFilter";
import ArtCategorySelect from "@/components/user_dashboard/local_components/categories/ArtCategorySelect";
import TopSellers from "@/components/user_dashboard/Marketplace/top_seller/TopSellers";
import WishlistModal from "@/components/user_dashboard/Marketplace/wishlist/WishlistModal";
import SellCard from "@/components/user_dashboard/Marketplace/cards/SellCard";
import { toast } from "sonner";
import { ChevronDown, Grid3X3 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const Marketplace = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const categories = ["All", "Trending", "Following"];
  const navigate = useNavigate();

  const sortOptions = ["Latest", "Price: Low to High", "Price: High to Low", "Most Popular"];
  const editionOptions = ["Original (1 of 1)", "Limited Edition", "Open Edition"];

  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [showWishlist, setShowWishlist] = useState(false);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleSellClick = () => {
    navigate("/sell");
  };

  const handleLike = (id: string) => {
    setLikedItems(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(id)) {
        newLiked.delete(id);
        toast("Removed from wishlist");
      } else {
        newLiked.add(id);
        toast("Added to wishlist");
      }
      return newLiked;
    });
  };

  const handleRemoveFromWishlist = (id: string) => {
    setLikedItems(prev => {
      const newLiked = new Set(prev);
      newLiked.delete(id);
      return newLiked;
    });
    toast("Removed from wishlist");
  };

  const handleWishlistClick = () => {
    setShowWishlist(true);
    console.log("Wishlist opened");
  };

  const mockArtworks = [
    {
      id: "1",
      artworkImage: "https://i.pinimg.com/736x/a4/c9/8d/a4c98d5c9dcb90b3208b5abfe703d85d.jpg",
      price: 100,
      originalPrice: 120,
      title: "Mock Artwork 1",
    },
    {
      id: "2",
      artworkImage: "https://i.pinimg.com/736x/2b/16/27/2b1627359c0fc9f6225b5afd0811ddf1.jpg",
      price: 200,
      originalPrice: 250,
      title: "Mock Artwork 2",
      rating: 4.5,
    },
    {
      id: "3",
      artworkImage: "https://i.pinimg.com/736x/cf/f3/4b/cff34bcec60045f4187080e67608ead5.jpg",
      price: 150,
      title: "Mock Artwork 3", 
    },
    {
      id: "4",
      artworkImage: "https://i.pinimg.com/736x/21/bd/78/21bd78a21a5521f18fee9c99013b618f.jpg",
      price: 860,
      originalPrice: 1000,
      title: "Mock Artwork 4",
      rating: 4.2,
    },
    {
      id: "5",
      artworkImage: "https://i.pinimg.com/736x/90/cf/6d/90cf6d8f2277af8c2791a95bd9f8dfe0.jpg",
      price: 720,
      title: "Mock Artwork 5", 
    },
  ];

  const wishlistItems = mockArtworks
    .filter(card => likedItems.has(card.id))
    .map(card => ({
      ...card,
      image: card.artworkImage, 
  }));;

  return (
    <>
      <div className="flex flex-col h-full bg-background">
        <Header />
          <div className="flex-1 container mx-auto px-4 sm:px-6 pt-20">
          {/* Top Sellers Section */}
          <TopSellers />
          
          {/* Marketplace Filters */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-md font-bold text-gray-900">Marketplace</h1>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleWishlistClick}
                  className="text-[10px] text-gray-600 hover:text-gray-900 font-medium"
                >
                  Wishlist
                </button>
                <div 
                onClick={handleWishlistClick}
                className="relative w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center cursor-pointer">
                  <img
                    src="https://img.icons8.com/puffy-filled/32/BF0101/like.png"
                    alt="Wishlist Icon"
                    className="w-3.5 h-3.5"
                  />
                  {likedItems.size > 0 && (
                    <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                      {likedItems.size}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <CategoryFilter categories={categories} onSelectCategory={handleCategorySelect} />

              <div className="flex gap-3">
                <div className="relative">
                  <ArtCategorySelect
                    selectedCategory={selectedCategory}
                    onChange={(value) => setSelectedCategory(value)}
                  />
                </div>

                {/* Sort dropdown with editions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex py-1 px-2.5 rounded-full border border-gray-300 gap-2">
                      <Grid3X3 className="w-3 h-3 relative top-0.5" />
                      <span className="text-[10px]">Sort</span>
                      <ChevronDown className="w-3 h-3 relative top-0.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white z-0">
                    {sortOptions.map((option) => (
                      <DropdownMenuItem key={option} className="text-[10px]">
                        {option}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    {editionOptions.map((option) => (
                      <DropdownMenuItem key={option} className="text-[10px]">
                        {option}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <button
                  className="py-1 px-4 text-[10px] bg-red-700 hover:bg-red-600 text-white rounded-full flex items-center gap-1"
                  onClick={handleSellClick}
                >
                  <i className="bx bx-plus text-xs"></i>
                    Sell
                </button>
              </div>
            </div>

          </div>
          
          {/* Marketplace Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-4">
            {mockArtworks.map((artwork) => (
              <SellCard
                key={artwork.id}
                id={artwork.id}
                artworkImage={artwork.artworkImage}
                price={artwork.price}
                originalPrice={artwork.originalPrice ?? 0} 
                title={artwork.title}
                rating={artwork.rating}
                isLiked={likedItems.has(artwork.id)}
                onLike={() => handleLike(artwork.id)}
                isMarketplace={true} 
              />
            ))}
          </div>
        </div>
        
      </div>
      
      <div>
        <Footer />
      </div>

      {/* Wishlist Modal */}
      <WishlistModal
        isOpen={showWishlist}
        onClose={() => setShowWishlist(false)}
        wishlistItems={wishlistItems}
        onRemoveFromWishlist={handleRemoveFromWishlist}
      />

    </>
  );
};

export default Marketplace;