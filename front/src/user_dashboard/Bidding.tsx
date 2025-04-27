import Header from "@/components/user_dashboard/navbar/Header";
import ArtsContainer from "@/components/user_dashboard/Bidding/featured/ArtsContainer";
import BidCard from "@/components/user_dashboard/Bidding/cards/BidCard";
import CategoryFilter from "@/components/user_dashboard/local_components/CategoryFilter";
import { useState, useEffect } from "react";

interface Artwork {
  id: string;
  title: string;
  artist: string;
  artistAvatar: string;
  description: string;
  image: string;
  endTime: string;
}

const Bidding = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);

  useEffect(() => {
    // Simulated backend fetch
    const fetchedArtworks: Artwork[] = [
      {
        id: "1",
        title: "Humanoid Sculpture",
        artist: "Jane Shaun",
        artistAvatar: "https://randomuser.me/api/portraits/women/1.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        image: "https://i.pinimg.com/736x/ee/25/b5/ee25b5fcde96a813deed82b3469805e2.jpg",
        endTime: "2d : 15h : 20m",
      },
      {
        id: "2",
        title: "Spacial Metal",
        artist: "Rick Splin",
        artistAvatar: "https://i.pinimg.com/474x/09/82/70/09827028e812b74970caa859cbf3dec5.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        image: "https://i.pinimg.com/736x/6a/73/f4/6a73f4e2d33497ba6dc9ba5c2fe26da4.jpg",
        endTime: "2d : 15h : 20m",
      },
      {
        id: "3",
        title: "Lost Marbles",
        artist: "Jurk Flans",
        artistAvatar: "https://i.pinimg.com/474x/76/81/9f/76819f10e7acdf48403d2b6e7134b347.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        image: "https://i.pinimg.com/736x/40/61/96/40619677fdba2bcf162828a948762c38.jpg",
        endTime: "2d : 15h : 20m",
      },
      {
        id: "4",
        title: "Space Mind",
        artist: "Lohr Barns",
        artistAvatar: "https://i.pinimg.com/474x/f1/16/6d/f1166dfe695a098adae052509fdedc00.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        image: "https://i.pinimg.com/474x/e9/b4/3b/e9b43b47b0b47e6d0176c07ee4fca803.jpg",
        endTime: "2d : 15h : 20m",
      },

    ];

    setArtworks(fetchedArtworks);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 pt-20">
        <main className="container">
          <section className="mb-16">
            <ArtsContainer
              artworks={artworks} 
            />
          </section>
        </main> 
      </div>
    </div>
  );
};

export default Bidding;