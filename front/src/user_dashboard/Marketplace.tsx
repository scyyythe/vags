import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/user_dashboard/navbar/Header";
import { Footer } from "@/components/user_dashboard/footer/Footer";
import CategoryFilter from "@/components/user_dashboard/Marketplace/category_filter/CategoryFilter";
import ArtCategorySelect from "@/components/user_dashboard/local_components/categories/ArtCategorySelect";
import TopSellers from "@/components/user_dashboard/Marketplace/top_seller/TopSellers";
import { toast } from "sonner";

const Marketplace = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const categories = ["All", "Trending", "Following"];
  const navigate = useNavigate();

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleSellClick = () => {
    navigate("/sell");
  };
  
  
  // const artCards = [
  //   {
  //     id: "market1",
  //     artistName: "Angel Ceraolo",
  //     artistImage: "https://i.pravatar.cc/150?img=1",
  //     artworkImage: "https://images.unsplash.com/photo-1555181126-cf46a03827c0?q=80&w=1470&auto=format&fit=crop",
  //     price: "550",
  //   },
  //   {
  //     id: "market2",
  //     artistName: "Angel Ceraolo",
  //     artistImage: "https://i.pravatar.cc/150?img=2",
  //     artworkImage: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?q=80&w=1374&auto=format&fit=crop",
  //     price: "650",
  //   },
  //   {
  //     id: "market3",
  //     artistName: "Angel Ceraolo",
  //     artistImage: "https://i.pravatar.cc/150?img=3",
  //     artworkImage: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1374&auto=format&fit=crop",
  //     price: "450",
  //   },
  //   {
  //     id: "market4",
  //     artistName: "Angel Ceraolo",
  //     artistImage: "https://i.pravatar.cc/150?img=4",
  //     artworkImage: "https://images.unsplash.com/photo-1548484352-ea579e5233a8?q=80&w=1370&auto=format&fit=crop",
  //     price: "450",
  //   },
  //   {
  //     id: "market5",
  //     artistName: "Angel Ceraolo",
  //     artistImage: "https://i.pravatar.cc/150?img=5",
  //     artworkImage: "https://images.unsplash.com/photo-1551913902-c92207136625?q=80&w=1470&auto=format&fit=crop",
  //     price: "350",
  //   },
  //   {
  //     id: "market6",
  //     artistName: "Angel Ceraolo",
  //     artistImage: "https://i.pravatar.cc/150?img=6",
  //     artworkImage: "https://images.unsplash.com/photo-1604537529428-15bcbeecfe4d?q=80&w=1469&auto=format&fit=crop",
  //     price: "550",
  //   },
  //   {
  //     id: "market7",
  //     artistName: "Angel Ceraolo",
  //     artistImage: "https://i.pravatar.cc/150?img=7",
  //     artworkImage: "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?q=80&w=1490&auto=format&fit=crop",
  //     price: "650",
  //   },
  //   {
  //     id: "market8",
  //     artistName: "Angel Ceraolo",
  //     artistImage: "https://i.pravatar.cc/150?img=8",
  //     artworkImage: "https://images.unsplash.com/photo-1498842812179-c81beecf902c?q=80&w=1364&auto=format&fit=crop",
  //     price: "450",
  //   },
  // ];

  // const handleBuyArt = () => {
  //   toast("Buy request submitted"); 
  // };

  return (
    <>
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 pt-20">
        {/* Top Sellers Section */}
        <TopSellers />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">

            <div className="flex items-center justify-between mb-6 lg:w-[133%] pl-2 sm:pl-0">
              <CategoryFilter categories={categories} onSelectCategory={handleCategorySelect} />
              <div className="flex space-x-2 text-xs mt-9">
                <div className="relative">
                  <ArtCategorySelect
                    selectedCategory={selectedCategory}
                    onChange={(value) => setSelectedCategory(value)}
                  />
                </div>

                <button
                  className="py-1.5 px-4 text-[10px] bg-red-700 hover:bg-red-600 text-white rounded-full flex items-center gap-1"
                  onClick={handleSellClick}
                >
                  <i className="bx bx-plus text-xs"></i>
                  Sell
                </button>
              </div>
            </div>

          </div> 
        </div>
      </div>

      
    </div>

      <div >
        <Footer />
      </div>

    </>
  );
};

export default Marketplace;