import { useState } from "react";
import Header from "@/components/user_dashboard/Header";
import Hero from "@/components/user_dashboard/Hero";
import SearchBar from "@/components/user_dashboard/SearchBar";
import CategoryFilter from "@/components/user_dashboard/CategoryFilter";
import ArtCard from "@/components/user_dashboard/ArtCard";
import PopularArtworks from "@/components/user_dashboard/PopularArtworks";
import TopArtists from "@/components/user_dashboard/TopArtists";
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

const Explore = () => {
  const categories = ["All", "Trending", "Collections", "Lorem"];
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    toast(`Selected category: ${category}`);
  };

  const artCards = [
    {
      id: "1",
      artistName: "Angel Canete",
      artistImage: "https://i.pravatar.cc/150?img=1",
      artworkImage: "https://images.unsplash.com/photo-1610483778913-6e83d8b75bb3?q=80&w=1470&auto=format&fit=crop",
      title: "Slopes",
    },
    {
      id: "2",
      artistName: "Angel Canete",
      artistImage: "https://i.pravatar.cc/150?img=2",
      artworkImage: "https://images.unsplash.com/photo-1515405295579-ba7b45403062?q=80&w=1480&auto=format&fit=crop",
      title: "Slopes",
    },
    {
      id: "3",
      artistName: "Angel Canete",
      artistImage: "https://i.pravatar.cc/150?img=3",
      artworkImage: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1490&auto=format&fit=crop",
      title: "Slopes",
    },
    {
      id: "4",
      artistName: "Angel Canete",
      artistImage: "https://i.pravatar.cc/150?img=4",
      artworkImage: "https://images.unsplash.com/photo-1562619425-c307888f7010?q=80&w=1480&auto=format&fit=crop",
      title: "Slopes",
    },
    {
      id: "5",
      artistName: "Angel Canete",
      artistImage: "https://i.pravatar.cc/150?img=5",
      artworkImage: "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?q=80&w=1490&auto=format&fit=crop",
      title: "Slopes",
    },
    {
      id: "6",
      artistName: "Angel Canete",
      artistImage: "https://i.pravatar.cc/150?img=6",
      artworkImage: "https://images.unsplash.com/photo-1501472312651-726afe119ff1?q=80&w=1374&auto=format&fit=crop",
      title: "Slopes",
    },
    {
      id: "7",
      artistName: "Angel Canete",
      artistImage: "https://i.pravatar.cc/150?img=7",
      artworkImage: "https://images.unsplash.com/photo-1518334584553-228357071204?q=80&w=1450&auto=format&fit=crop",
      title: "Slopes",
    },
    {
      id: "8",
      artistName: "Angel Canete",
      artistImage: "https://i.pravatar.cc/150?img=8",
      artworkImage: "https://images.unsplash.com/photo-1598300188259-626728028a90?q=80&w=1480&auto=format&fit=crop",
      title: "Slopes",
    },
    {
      id: "9",
      artistName: "Angel Canete",
      artistImage: "https://i.pravatar.cc/150?img=9",
      artworkImage: "https://images.unsplash.com/photo-1603177608775-53cb4728e83c?q=80&w=1470&auto=format&fit=crop",
      title: "Slopes",
    },
  ];

  const handleTipJar = () => {
    toast("Opening tip jar");
  };

  const handleCreateClick = () => {
    toast("Create new artwork");
  };

  const handleSortClick = () => {
    toast("Sort artworks");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 pt-24 pb-12">
        <Hero 
          title="Showtime Collection." 
          subtitle="Discover" 
          imageUrl="https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=1374&auto=format&fit=crop" 
        />
        
        {/* Browse Type and Search Container */}
        <div className="bg-white shadow-sm rounded-full flex items-center p-2 my-6">
          <div className="flex items-center px-4 border-r">
            <span className="text-sm font-medium mr-2">Browse Type</span>
            <Select defaultValue="Digital Art">
              <SelectTrigger className="border-0 bg-transparent h-8 w-32 px-1 focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Digital Art" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Digital Art">Digital Art</SelectItem>
                <SelectItem value="Physical Art">Physical Art</SelectItem>
                <SelectItem value="Photography">Photography</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 pl-2">
            <SearchBar />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <CategoryFilter categories={categories} onSelectCategory={handleCategorySelect} />
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="rounded-full flex items-center gap-1" onClick={handleSortClick}>
                  <SortAsc size={16} />
                  Sort
                </Button>
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center gap-1" onClick={handleCreateClick}>
                  <Plus size={16} />
                  Create
                </Button>
              </div>
            </div>
            
            <ScrollArea className="h-[800px] pr-4 no-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {artCards.map((card) => (
                  <ArtCard
                    key={card.id}
                    id={card.id}
                    artistName={card.artistName}
                    artistImage={card.artistImage}
                    artworkImage={card.artworkImage}
                    title={card.title}
                    showPrice={false}
                    onButtonClick={handleTipJar}
                    isExplore={true}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
          
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <PopularArtworks />
              <TopArtists />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
