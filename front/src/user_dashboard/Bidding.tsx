import Header from "@/components/user_dashboard/navbar/Header";
import { Footer } from "@/components/user_dashboard/footer/Footer";
import ArtsContainer from "@/components/user_dashboard/Bidding/featured/ArtsContainer";
import Components from "@/components/user_dashboard/Bidding/navbar/Components";
import BidCard from "@/components/user_dashboard/Bidding/cards/BidCard"; 
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


interface Artwork {
  id: string;
  title: string;
  artist: string;
  artistAvatar: string;
  description: string;
  image: string;
  endTime: string;
  likes: number;
  views: number;
  highestBid: number;
  timeRemaining: { hrs: number; mins: number; secs: number };
}


const Bidding = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulated backend fetch
    const fetchedArtworks: Artwork[] = [
      {
        id: "1",
        title: "Human Metaloid",
        artist: "Jane Shaun",
        artistAvatar: "https://randomuser.me/api/portraits/women/1.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        image: "https://i.pinimg.com/736x/ee/25/b5/ee25b5fcde96a813deed82b3469805e2.jpg",
        endTime: "2d : 15h : 20m",
        likes: 12000,
        views: 34000,
        highestBid: 95000,
        timeRemaining: { hrs: 2, mins: 15, secs: 20 },
      },
      {
        id: "2",
        title: "Dissolution of Soul",
        artist: "Rick Splin",
        artistAvatar: "https://i.pinimg.com/474x/09/82/70/09827028e812b74970caa859cbf3dec5.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        image: "https://i.pinimg.com/474x/41/ff/68/41ff685dd8f538b1e1e5b4116991dbfc.jpg",
        endTime: "2d : 15h : 20m",
        likes: 12000,
        views: 34000,
        highestBid: 95000,
        timeRemaining: { hrs: 2, mins: 15, secs: 20 },
      },
      {
        id: "3",
        title: "Lost Skull",
        artist: "Jurk Flans",
        artistAvatar: "https://i.pinimg.com/474x/76/81/9f/76819f10e7acdf48403d2b6e7134b347.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        image: "https://i.pinimg.com/736x/47/8d/a5/478da58eee635ab3be6e65fba0595222.jpg",
        endTime: "2d : 15h : 20m",
        likes: 12000,
        views: 34000,
        highestBid: 95000,
        timeRemaining: { hrs: 2, mins: 15, secs: 20 },
      },
      {
        id: "4",
        title: "Space Connection",
        artist: "Lohr Barns",
        artistAvatar: "https://i.pinimg.com/474x/f1/16/6d/f1166dfe695a098adae052509fdedc00.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        image: "https://i.pinimg.com/736x/d4/e9/fa/d4e9fa9888d3ee4edc6a06e0cb72d811.jpg",
        endTime: "2d : 15h : 20m",
        likes: 12000,
        views: 34000,
        highestBid: 95000,
        timeRemaining: { hrs: 2, mins: 15, secs: 20 },
      },
      
    ];

    setArtworks(fetchedArtworks);
  }, []);

  const handlePlaceBid = (id: string) => {
    console.log(`Placing bid for artwork ID: ${id}`);
    // Connect this to backend API
  };

  const handleBidClick = (artwork: Artwork) => {
    localStorage.setItem("selectedBid", JSON.stringify(artwork));
    navigate(`/bid/${artwork.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 pt-20">
        <main className="container">
          <section className="mb-10">
            <ArtsContainer
              artworks={artworks} 
            />
          </section>
            <Components
            />
        </main> 
        <div className="lg:w-[100%] custom-scrollbars pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {/* BidCards */}
              {artworks.map((artwork) => (
                <div
                key={artwork.id}
                onClick={() => handleBidClick(artwork)}
                style={{ cursor: "pointer" }}
              >
                <BidCard
                  data={{
                    id: artwork.id,
                    title: artwork.title,
                    currentBid: Math.floor(Math.random() * 5) + 1,
                    timeRemaining: artwork.endTime,
                    imageUrl: artwork.image,
                  }}
                  onPlaceBid={handlePlaceBid}
                />
              </div>
              ))}
            </div>
          </div>
      </div>
      <div >
        <Footer />
      </div>
    </div>
  );
};

export default Bidding;