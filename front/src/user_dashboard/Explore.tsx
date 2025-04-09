import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/user_dashboard/Header";
import ArtGalleryContainer from "@/components/gallery/ArtGalleryContainer";
import SearchBar from "@/components/user_dashboard/SearchBar";
import CategoryFilter from "@/components/user_dashboard/CategoryFilter";
import ArtCard from "@/components/user_dashboard/ArtCard";
import { Plus, SortAsc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDonation } from "../context/DonationContext";
import { useArtworkContext } from "../context/ArtworkContext";

const Explore = () => {
  const navigate = useNavigate();
  const categories = ["All", "Trending", "Collections"];
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { openPopup } = useDonation();
  const { setArtworks } = useArtworkContext();

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    toast(`Selected category: ${category}`);
  };

  const artCards = [
    {
      id: "1",
      artistName: "Angel Canete",
      artistImage: "https://i.pravatar.cc/150?img=2",
      artworkImage:
        "https://i.pinimg.com/736x/97/5d/50/975d50c7c3c345cd072ddd34b180cf88.jpg",
      title: "Slopes",
    },
    {
      id: "2",
      artistName: "Angel Canete",
      artistImage: "https://i.pravatar.cc/150?img=2",
      artworkImage:
        "https://www.goneminimal.com/wp-content/uploads/2022/04/Minimal-abstract-flower-painting-Minimalist-Painting-Gone-Minimal-edited-scaled.jpg",
      title: "Slopes",
    },
    {
      id: "3",
      artistName: "Angel Canete",
      artistImage: "https://i.pravatar.cc/150?img=2",
      artworkImage:
        "https://i.pinimg.com/474x/e7/9f/cb/e79fcb270b052643b832d5335d73859f.jpg",
      title: "Slopes",
    },
    {
      id: "4",
      artistName: "Angel Canete",
      artistImage: "https://i.pravatar.cc/150?img=2",
      artworkImage:
        "https://images.squarespace-cdn.com/content/v1/58fd82dbbf629ab224f81b68/1599802230471-29DU3BQDBTQET95TAS58/image-asset.jpeg",
      title: "Slopes",
    },
    {
      id: "5",
      artistName: "Angel Canete",
      artistImage: "https://i.pravatar.cc/150?img=2",
      artworkImage:
        "https://i.pinimg.com/474x/8a/d6/3d/8ad63d66a3c26a236a8fa0c5c94259d9.jpg",
      title: "Slopes",
    },
    {
      id: "6",
      artistName: "Angel Canete",
      artistImage: "https://i.pravatar.cc/150?img=2",
      artworkImage: "https://cdn.artcld.com/img/t51cs49ogy6do75zh2e4.jpg",
      title: "Slopes",
    },
    {
      id: "7",
      artistName: "Angel Canete",
      artistImage: "https://i.pravatar.cc/150?img=2",
      artworkImage:
        "https://as2.ftcdn.net/v2/jpg/12/28/04/85/1000_F_1228048537_dZjULPg6tMaUQWEIIu7wdCrErfQD5ulI.jpg",
      title: "Slopes",
    },
    {
      id: "8",
      artistName: "Angel Canete",
      artistImage: "https://i.pravatar.cc/150?img=2",
      artworkImage:
        "https://i.pinimg.com/474x/dc/23/08/dc23089d3a43819691c9b447e496f961.jpg",
      title: "Slopes",
    },
    {
      id: "9",
      artistName: "Angel Canete",
      artistImage: "https://i.pravatar.cc/150?img=2",
      artworkImage:
        "https://i.pinimg.com/474x/f5/bd/ed/f5bdedecbc242032fcc7665483137449.jpg",
      title: "Slopes",
    },
    {
      id: "10",
      artistName: "Angel Canete",
      artistImage: "https://i.pravatar.cc/150?img=2",
      artworkImage: "https://img.artpal.com/330392/133-23-11-9-6-50-5m.jpg",
      title: "Slopes",
    },
    {
      id: "11",
      artistName: "Angel Canete",
      artistImage: "https://i.pravatar.cc/150?img=2",
      artworkImage:
        "https://i.pinimg.com/474x/fc/d7/75/fcd7753479b158397f69c09a618eb05a.jpg",
      title: "Slopes",
    },
    {
      id: "12",
      artistName: "Angel Canete",
      artistImage: "https://i.pravatar.cc/150?img=2",
      artworkImage:
        "https://i.pinimg.com/474x/6d/bd/36/6dbd3628910db4a5f73a32a313f1d5e5.jpg",
      title: "Slopes",
    },
    {
      id: "13",
      artistName: "Angel Canete",
      artistImage: "https://i.pravatar.cc/150?img=2",
      artworkImage:
        "https://i.pinimg.com/474x/db/5b/a2/db5ba20387c6b3681588d79d0930e48a.jpg",
      title: "Slopes",
    },
    {
      id: "14",
      artistName: "Angel Canete",
      artistImage: "https://i.pravatar.cc/150?img=2",
      artworkImage:
        "https://i.pinimg.com/474x/ae/04/55/ae0455b5950a7acd62b894030ba97de0.jpg",
      title: "Slopes",
    },
    {
      id: "15",
      artistName: "Angel Canete",
      artistImage: "https://i.pravatar.cc/150?img=2",
      artworkImage:
        "https://i.pinimg.com/474x/44/a3/9c/44a39cc56caf1de8988a06bbfbea42c8.jpg",
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
      image: "https://www.andrewshoemaker.com/images/xl/chronicle-antelope-canyon-american-southwest-arizona.jpg"
    },
    {
      id: "3",
      title: "Abstract Emotions",
      artist: "Emily Chen",
      image: "https://rosshillart.com/cdn/shop/articles/R._Delino_Landscape_art_-_Rosshillart.com_2200x.jpg?v=1703181542"
    },
    {
      id: "4",
      title: "Vivid Expressions",
      artist: "David Kim",
      image: "https://m.media-amazon.com/images/I/A142xwh4GVL._AC_SL1500_.jpg"
    }
  ];


  useEffect(() => {
    setArtworks(artCards);
  }, [setArtworks]);

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

        <div className="relative flex justify-center items-center -top-16">
          <div className="browse-container bg-white shadow-lg w-full md:w-3/4 lg:w-[85%] rounded-lg flex items-center p-4">
            <div className="flex items-center px-4 border-r">
              <span className="text-xs font-semibold mr-5">Browse Type</span>
              <Select defaultValue="Digital Art">
                <SelectTrigger className="border-0 bg-transparent h-8 w-35 px-3 text-[11px] focus:ring-0 focus:ring-offset-0 rounded-sm border border-gray-300">
                  <img src="/pics/b_logo.png" className="w-3 h-3 mr-2" />
                  <SelectValue className="ml-8" placeholder="Digital Art" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Digital Art" className="text-[11px]">
                    Digital Art
                  </SelectItem>
                  <SelectItem value="Physical Art" className="text-[11px]">
                    Physical Art
                  </SelectItem>
                  <SelectItem value="Photography" className="text-[11px]">
                    Photography
                  </SelectItem>
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
              <CategoryFilter
                categories={categories}
                onSelectCategory={handleCategorySelect}
              />
              <div className="flex space-x-2 text-xs">
                <Button
                  size="sm"
                  className="text-xs bg-red-700 hover:bg-red-600 text-white rounded-full flex items-center gap-1"
                  onClick={handleCreateClick}
                >
                  <Plus size={8} />
                  Create
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs rounded-full flex items-center gap-1"
                  onClick={handleSortClick}
                >
                  <SortAsc size={8} />
                  Sort
                </Button>
              </div>
            </div>

            <div className="h-[800px] lg:w-[133%] custom-scrollbar">
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-6">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
