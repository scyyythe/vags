import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/user_dashboard/Header";
import ArtGalleryContainer from "@/components/gallery/ArtGalleryContainer";
import SearchBar from "@/components/user_dashboard/SearchBar";
import CategoryFilter from "@/components/user_dashboard/CategoryFilter";
import ArtCard from "@/components/user_dashboard/ArtCard";
import { Plus, SortAsc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDonation } from "../context/DonationContext";

const Explore = () => {
  const navigate = useNavigate();
  const categories = ["All", "Trending", "Collections"];
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { openPopup } = useDonation();
  
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    toast(`Selected category: ${category}`);
  };

  const artCards = [
    {
      id: "1",
      artistName: "Angel Canete",
      artistImage: "https://i.pravatar.cc/150?img=2",
      artworkImage: "https://images.unsplash.com/photo-1515405295579-ba7b45403062?q=80&w=1480&auto=format&fit=crop",
      title: "Slopes",
    },
    
  ];

  const artworks = [
    {
      id: "1",
      title: "Ethereal Landscapes",
      artist: "Maria Sanchez",
      image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=1470"
    },
    {
      id: "2",
      title: "Urban Perspectives",
      artist: "John Rodriguez",
      image: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1374"
    },
    {
      id: "3",
      title: "Abstract Emotions",
      artist: "Emily Chen",
      image: "https://images.unsplash.com/photo-1579541591969-73f8839fa52c?auto=format&fit=crop&q=80&w=1470"
    },
    {
      id: "4",
      title: "Vivid Expressions",
      artist: "David Kim",
      image: "https://images.unsplash.com/photo-1583250087320-5e0d20208d1e?auto=format&fit=crop&q=80&w=1467"
    }
  ];

  const handleTipJar = () => {
    toast("Opening tip jar");
  };

  const handleCreateClick = () => {
    navigate("/create");
  };

  const handleSortClick = () => {
    toast("Sort artworks");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 pt-20 pb-12">
        <main className="container">
          <section className="mb-16">
            <ArtGalleryContainer
              artworks={artworks} 
            />
          </section>
        </main>
        {/* Browse Type and Search Container */} 
        <div className="relative flex justify-center items-center -top-16">
        <div className="browse-container bg-white shadow-lg w-full md:w-3/4 lg:w-[85%] rounded-lg flex items-center p-4">
          <div className="flex items-center px-4 border-r">
            <span className="text-xs font-semibold mr-5">Browse Type</span>
            <Select defaultValue="Digital Art">
              <SelectTrigger className="border-0 bg-transparent h-8 w-35 px-3 text-xs focus:ring-0 focus:ring-offset-0 rounded-sm border border-gray-300">
                <img src="/pics/b_logo.png" className="w-3 h-3 mr-2" />
                <SelectValue className="ml-8" placeholder="Digital Art" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Digital Art" className="text-xs">Digital Art</SelectItem>
                <SelectItem value="Physical Art" className="text-xs">Physical Art</SelectItem>
                <SelectItem value="Photography" className="text-xs">Photography</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 pl-2 bg-blue-100 bg-opacity-50 rounded-sm ml-3">
            <SearchBar />
          </div>
        </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6 lg:w-[133%]">
              <CategoryFilter categories={categories} onSelectCategory={handleCategorySelect} />
              <div className="flex space-x-2 text-xs">
                <Button size="sm" className="text-xs bg-red-700 hover:bg-red-600 text-white rounded-full flex items-center gap-1" onClick={handleCreateClick}>
                  <Plus size={8} />
                  Create
                </Button>
                <Button variant="outline" size="sm" className="text-xs rounded-full flex items-center gap-1" onClick={handleSortClick}>
                  <SortAsc size={8} />
                  Sort
                </Button>
              </div>
            </div>
            
            <ScrollArea className="h-[800px] lg:w-[133%] pr-4 no-scrollbar">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {artCards.map((card) => (
                  <ArtCard
                    key={card.id}
                    id={card.id}
                    artistName={card.artistName}
                    artistImage={card.artistImage}
                    artworkImage={card.artworkImage}
                    title={card.title}
                    onButtonClick={handleTipJar}
                    isExplore={true}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Explore;
