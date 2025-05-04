import Header from "@/components/user_dashboard/navbar/Header";
import CategoryFilter from "@/components/user_dashboard/Explore/navigation/CategoryFilter";
import ArtCard from "@/components/user_dashboard/Explore/cards/ArtCard";
import { toast } from "sonner";

const Marketplace = () => {
  // const categories = ["All", "Trending", "Collections", "Lorem"];
  
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
    <div className="min-h-screen bg-background">
      <Header />
      <div className="text-sm container mx-auto px-4 sm:px-6 pt-24 pb-12 no-scrollbar overflow-y-auto max-h-screen">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Marketplace</h2>
            <p className="text-muted-foreground">
              This section is currently under development.
              <br />
              Check back soon for exciting sellers and artworks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;