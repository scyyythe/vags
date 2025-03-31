import Header from "@/components/user_dashboard/Header";
import BidCard from "@/components/user_dashboard/BidCard";
import CategoryFilter from "@/components/user_dashboard/CategoryFilter";
import { ArrowLeft, ArrowRight } from "lucide-react";

const Bidding = () => {
  const categories = ["All", "Trending", "Collections", "Lorem"];
  
  const featuredArtwork = {
    id: "featured",
    title: "Humanoid Sculpture",
    price: "900k php",
    owner: "Jane Shaun",
    image: "https://images.unsplash.com/photo-1558566919-f40d5e8d36ac?q=80&w=1374&auto=format&fit=crop",
    timeLeft: "2d : 18h : 20m"
  };
  
  const artworks = [
    {
      id: "1",
      title: "Slopes",
      currentBid: "1.2 ETH",
      image: "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=1374&auto=format&fit=crop",
    },
    {
      id: "2",
      title: "Slopes",
      currentBid: "1.2 ETH",
      image: "https://images.unsplash.com/photo-1622737133809-d95047b9e673?q=80&w=1432&auto=format&fit=crop",
    },
    {
      id: "3",
      title: "Slopes",
      currentBid: "1.2 ETH",
      image: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=1374&auto=format&fit=crop",
    },
    {
      id: "4",
      title: "Slopes",
      currentBid: "1.2 ETH",
      image: "https://images.unsplash.com/photo-1547119957-637f8679db1e?q=80&w=1364&auto=format&fit=crop",
    },
    {
      id: "5",
      title: "Slopes",
      currentBid: "1.2 ETH",
      image: "https://images.unsplash.com/photo-1598300042320-14c5df22e3a9?q=80&w=1374&auto=format&fit=crop",
    },
    {
      id: "6",
      title: "Slopes",
      currentBid: "1.2 ETH",
      image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1470&auto=format&fit=crop",
    },
    {
      id: "7",
      title: "Slopes",
      currentBid: "1.2 ETH",
      image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1528&auto=format&fit=crop",
    },
    {
      id: "8",
      title: "Slopes",
      currentBid: "1.2 ETH",
      image: "https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?q=80&w=1432&auto=format&fit=crop",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 pt-24 pb-12 no-scrollbar overflow-y-auto max-h-screen">
        <div className="mb-8">
          <div className="relative w-full h-[300px] rounded-3xl overflow-hidden group">
            <img 
              src={featuredArtwork.image} 
              alt={featuredArtwork.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent"></div>
            <div className="absolute inset-0 flex items-center px-12">
              <div className="max-w-md">
                <h1 className="text-4xl font-bold text-white mb-2">{featuredArtwork.title}</h1>
                <p className="text-3xl font-medium text-white mb-4">{featuredArtwork.price}</p>
                <div className="flex items-center space-x-3 mb-6">
                  <span className="text-white/80 text-sm">Owned By</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-gray-300 overflow-hidden">
                      <img src="https://i.pravatar.cc/100" alt="Owner" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-white text-sm">{featuredArtwork.owner}</span>
                  </div>
                </div>
                <button className="bg-white hover:bg-white/90 text-black font-medium px-6 py-2 rounded-full transition-colors">
                  Bid Now
                </button>
                <div className="mt-4 flex items-center space-x-2">
                  <span className="text-white/80 text-sm">Ending in</span>
                  <span className="text-red font-medium">{featuredArtwork.timeLeft}</span>
                </div>
              </div>
            </div>
            <div className="absolute bottom-4 right-4 flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-white/50"></div>
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <div className="w-2 h-2 rounded-full bg-white/50"></div>
              <div className="w-2 h-2 rounded-full bg-white/50"></div>
              <div className="w-2 h-2 rounded-full bg-white/50"></div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Feed</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Popular</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        
        <CategoryFilter categories={categories} />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {artworks.map((artwork) => (
            <BidCard
              key={artwork.id}
              id={artwork.id}
              title={artwork.title}
              currentBid={artwork.currentBid}
              artworkImage={artwork.image}
            />
          ))}
        </div>
        
        <div className="flex justify-center mt-8">
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-full border">
              <ArrowLeft size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-foreground text-background">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full">3</button>
            <button className="p-2 rounded-full border">
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bidding;