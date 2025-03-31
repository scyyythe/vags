import Header from "@/components/user_dashboard/Header";
import CategoryFilter from "@/components/user_dashboard/CategoryFilter";
import ArtCard from "@/components/user_dashboard/ArtCard";
import { toast } from "sonner";

const Marketplace = () => {
  const categories = ["All", "Trending", "Collections", "Lorem"];
  
  const artCards = [
    {
      id: "market1",
      artistName: "Angel Ceraolo",
      artistImage: "https://i.pravatar.cc/150?img=1",
      artworkImage: "https://images.unsplash.com/photo-1555181126-cf46a03827c0?q=80&w=1470&auto=format&fit=crop",
      price: "550",
    },
    {
      id: "market2",
      artistName: "Angel Ceraolo",
      artistImage: "https://i.pravatar.cc/150?img=2",
      artworkImage: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?q=80&w=1374&auto=format&fit=crop",
      price: "650",
    },
    {
      id: "market3",
      artistName: "Angel Ceraolo",
      artistImage: "https://i.pravatar.cc/150?img=3",
      artworkImage: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1374&auto=format&fit=crop",
      price: "450",
    },
    {
      id: "market4",
      artistName: "Angel Ceraolo",
      artistImage: "https://i.pravatar.cc/150?img=4",
      artworkImage: "https://images.unsplash.com/photo-1548484352-ea579e5233a8?q=80&w=1370&auto=format&fit=crop",
      price: "450",
    },
    {
      id: "market5",
      artistName: "Angel Ceraolo",
      artistImage: "https://i.pravatar.cc/150?img=5",
      artworkImage: "https://images.unsplash.com/photo-1551913902-c92207136625?q=80&w=1470&auto=format&fit=crop",
      price: "350",
    },
    {
      id: "market6",
      artistName: "Angel Ceraolo",
      artistImage: "https://i.pravatar.cc/150?img=6",
      artworkImage: "https://images.unsplash.com/photo-1604537529428-15bcbeecfe4d?q=80&w=1469&auto=format&fit=crop",
      price: "550",
    },
    {
      id: "market7",
      artistName: "Angel Ceraolo",
      artistImage: "https://i.pravatar.cc/150?img=7",
      artworkImage: "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?q=80&w=1490&auto=format&fit=crop",
      price: "650",
    },
    {
      id: "market8",
      artistName: "Angel Ceraolo",
      artistImage: "https://i.pravatar.cc/150?img=8",
      artworkImage: "https://images.unsplash.com/photo-1498842812179-c81beecf902c?q=80&w=1364&auto=format&fit=crop",
      price: "450",
    },
  ];

  const handleBuyArt = () => {
    toast("Buy request submitted");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 pt-24 pb-12 no-scrollbar overflow-y-auto max-h-screen">
        <h1 className="text-3xl font-bold mb-6">Explore</h1>
        
        <CategoryFilter categories={categories} />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {artCards.map((card) => (
            <ArtCard
              key={card.id}
              id={card.id}
              artistName={card.artistName}
              artistImage={card.artistImage}
              artworkImage={card.artworkImage}
              price={card.price}
              buttonText="Buy Now"
              onButtonClick={handleBuyArt}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;