import { useState } from "react";
import { Footer } from "@/components/user_dashboard/footer/Footer";
import { useNavigate } from "react-router-dom";
import Header from "@/components/user_dashboard/navbar/Header";
import ExhibitCard from "@/components/user_dashboard/Exhibit/card/ExhibitCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useExhibitCards } from "@/hooks/exhibit/useCardExihibit";
import ExhibitCardSkeleton from "@/components/skeletons/ExhibitCardSkeleton";
// Mock data for exhibits
const mockExhibits = [
  {
    id: "1",
    title: "Code and Canvas",
    description: "Blending technology and creativity, the modern balance between digital algorithms — how AI can enhance and digital creativity.",
    image: "https://images.unsplash.com/photo-1533158307587-828f0a76ef46?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Digital Art",
    likes: 125,
    views: 1.5,
    isSolo: true,
  },
  {
    id: "2",
    title: "Beyond the Frame",
    description: "A collection of modern works that defy traditions, challenge norms, and break outside of the frame. Three pieces.",
    image: "https://images.unsplash.com/photo-1580136579312-94651dfd596d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Contemporary Art",
    likes: 118,
    views: 1.4,
    isSolo: false,
    collaborators: [
      { id: '1', name: 'Mark Johnson', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      { id: '2', name: 'Sara Williams', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      { id: '3', name: 'John Parker', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    ],
  },
  {
    id: "3",
    title: "Through the Lens of Now",
    description: "A visual journey of fleeting moments, raw emotions, and untold stories. These photographs freeze time and light.",
    image: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Photography",
    likes: 94,
    views: 1.3,
    isSolo: true,
  },
  {
    id: "4",
    title: "Words in Motion",
    description: "This segment celebrates the power of the written word — poems, short stories, and excerpts that provoke thought.",
    image: "https://images.unsplash.com/photo-1594122230689-45899d9e6f69?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Literature",
    likes: 85,
    views: 1.1,
    isSolo: false,
    collaborators: [
      { id: '4', name: 'Emily Chen', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      { id: '5', name: 'David Lee', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      { id: '6', name: 'Alice Wong', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    ],
  },
  {
    id: "5",
    title: "Urban Expressions",
    description: "Street art and urban culture collide in this vibrant collection of works from city artists around the world.",
    image: "https://images.unsplash.com/photo-1551913902-c92207136625?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Street Art",
    likes: 132,
    views: 1.7,
    isSolo: true,
  },
  {
    id: "6",
    title: "Abstract Realities",
    description: "Exploring the boundary between perception and reality through abstract forms and experimental techniques.",
    image: "https://images.unsplash.com/photo-1549490349-8643362247b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Abstract Art",
    likes: 107,
    views: 1.2,
    isSolo: false,
    collaborators: [
      { id: '7', name: 'Thomas White', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      { id: '8', name: 'Rebecca Smith', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      { id: '9', name: 'Michael Brown', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    ],
  },
  {
    id: "7",
    title: "Cultural Heritage",
    description: "A celebration of traditional art forms and techniques passed down through generations of artisans.",
    image: "https://i.pinimg.com/736x/a1/a8/42/a1a842b4254e1c79b2491caa0f5520e1.jpg",
    category: "Traditional Art",
    likes: 99,
    views: 1.0,
    isSolo: true,
  },
  {
    id: "8",
    title: "Nature's Canvas",
    description: "Environmental art that showcases the beauty of natural landscapes and raises awareness about conservation.",
    image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Environmental Art",
    likes: 114,
    views: 1.3,
    isSolo: false,
    collaborators: [
      { id: '10', name: 'Jennifer Kim', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      { id: '11', name: 'Robert Davis', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      { id: '12', name: 'Sophie Miller', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    ],
  }
];

type SortOption = "popularity" | "newest" | "oldest";
type FilterOption = 
  | "all"
  | "solo"
  | "collab"
  | "trending"
  | "most-viewed"
  | "solo-ongoing"
  | "solo-ended"
  | "solo-upcoming"
  | "collab-ongoing"
  | "collab-ended"
  | "collab-upcoming";


const Exhibits = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterOption>("all");
  const [sortBy, setSortBy] = useState<SortOption>("popularity");
  const categories = ["All", "Trending", "Most Viewed"];
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);

  const {data:exhibits=[],isLoading,isError}=useExhibitCards();

  const now = new Date();

  const isOngoing = (exhibit: any) =>
    exhibit.startDate && exhibit.endDate &&
    new Date(exhibit.startDate) <= now && new Date(exhibit.endDate) >= now;

  const isUpcoming = (exhibit: any) =>
    exhibit.startDate && new Date(exhibit.startDate) > now;

  const isEnded = (exhibit: any) =>
    exhibit.endDate && new Date(exhibit.endDate) < now;

  // Filter exhibits based on current filter
  const filteredExhibits = exhibits.filter((exhibit: any) => {
    if (filter === "all") return true;
    if (filter === "solo") return exhibit.isSolo;
    if (filter === "collab") return !exhibit.isSolo;
    if (filter === "trending") return exhibit.likes > 100;
    if (filter === "most-viewed") return exhibit.views > 1.3;
    if (filter === "solo-ongoing") return exhibit.isSolo && isOngoing(exhibit);
    if (filter === "solo-ended") return exhibit.isSolo && isEnded(exhibit);
    if (filter === "solo-upcoming") return exhibit.isSolo && isUpcoming(exhibit);
    if (filter === "collab-ongoing") return !exhibit.isSolo && isOngoing(exhibit);
    if (filter === "collab-ended") return !exhibit.isSolo && isEnded(exhibit);
    if (filter === "collab-upcoming") return !exhibit.isSolo && isUpcoming(exhibit);
    return true;
  });

  // Sort exhibits based on current sort option
  const sortedExhibits = [...filteredExhibits].sort((a, b) => {
    if (sortBy === "popularity") return b.likes - a.likes;
    if (sortBy === "newest") return parseInt(b.id) - parseInt(a.id);
    return parseInt(a.id) - parseInt(b.id); // oldest
  });

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);

    switch (category.toLowerCase()) {
      case "all":
        setFilter("all");
        break;
      case "trending":
        setFilter("trending");
        break;
      case "most viewed":
        setFilter("most-viewed");
        break;
      default:
        setFilter("all");
    }
  };

  return (
    <>
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-6">
        <div className="mb-8 mt-20">
          <span className="font-bold">Exhibits</span>
          
          <div className="flex flex-wrap items-center justify-between gap-4 my-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className={`py-[5px] px-4 rounded-full text-[10px] font-small transition-colors ${
                    selectedCategory === category
                      ? "border border-gray-300 font-medium shadow-md"
                      : "bg-white border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="py-1 px-4 rounded-full text-[10px] border border-gray-300">
                    <i className='bx bx-filter text-xs mr-2'></i>
                    {{
                      solo: "Solo",
                      collab: "Collab",
                      "solo-ongoing": "Solo - Ongoing",
                      "solo-ended": "Solo - Ended",
                      "solo-upcoming": "Solo - Upcoming",
                      "collab-ongoing": "Collab - Ongoing",
                      "collab-ended": "Collab - Ended",
                      "collab-upcoming": "Collab - Upcoming",
                    }[filter] || "Filter"}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilter("solo")} className="text-[10px]">
                    Solo Exhibits
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("collab")} className="text-[10px]">
                    Collab Exhibits
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("solo-ongoing")} className="text-[10px]">
                    Solo - Ongoing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("solo-ended")} className="text-[10px]">
                    Solo - Ended
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("solo-upcoming")} className="text-[10px]">
                    Solo - Upcoming
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("collab-ongoing")} className="text-[10px]">
                    Collab - Ongoing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("collab-ended")} className="text-[10px]">
                    Collab - Ended
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("collab-upcoming")} className="text-[10px]">
                    Collab - Upcoming
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <button
                className="py-[5px] px-4 text-[10px] bg-red-700 hover:bg-red-600 text-white rounded-full flex items-center gap-1"
                onClick={() => navigate("/add-exhibit")}
              >
                <i className="bx bx-plus text-xs"></i>
                Create
              </button>
            </div>
          </div>
        </div>
        
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <ExhibitCardSkeleton key={i} />)
            : sortedExhibits.map((exhibit) => (
              <ExhibitCard 
            key={exhibit.id} 
            exhibit={{
              ...exhibit,
              category: exhibit.category.charAt(0).toUpperCase() + exhibit.category.slice(1)
            }}
            onClick={() => navigate(`/view-exhibit/${exhibit.id}`)} 
          />

              ))
          }
        </div>
      </div>
      
    </div>
    <div>
        <Footer />
    </div>
    </>
  );
};

export default Exhibits;
