import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/user_dashboard/navbar/Header";
import ArtGalleryContainer from "@/components/user_dashboard/Explore/gallery/ArtGalleryContainer";
import SearchBar from "@/components/user_dashboard/local_components/SearchBar";
import CategoryFilter from "@/components/user_dashboard/local_components/CategoryFilter";
import ArtCard from "@/components/user_dashboard/Explore/cards/ArtCard";
import { Plus, SortAsc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDonation } from "../context/DonationContext";
import { useArtworkContext } from "../context/ArtworkContext";
import ArtCategorySelect from "@/components/user_dashboard/local_components/categories/ArtCategorySelect";
import apiClient from "@/utils/apiClient";

const Explore = () => {
  const navigate = useNavigate();
  const categories = ["All", "Trending", "Collections"];
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { openPopup } = useDonation();
  const { setArtworks } = useArtworkContext();
  const [artworks, setArtworksState] = useState([]);
  const [refreshData, setRefreshData] = useState(false);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    toast(`Selected category: ${category}`);
  };

  // Static artworks array (to keep existing code intact)
  const staticArtworks = [
    {
      id: "1",
      title: "Ethereal Landscapes",
      artist: "Maria Sanchez",
      image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=1470",
    },
    {
      id: "2",
      title: "Urban Perspectives",
      artist: "John Rodriguez",
      image: "https://www.andrewshoemaker.com/images/xl/chronicle-antelope-canyon-american-southwest-arizona.jpg",
    },
    {
      id: "3",
      title: "Abstract Emotions",
      artist: "Emily Chen",
      image:
        "https://rosshillart.com/cdn/shop/articles/R._Delino_Landscape_art_-_Rosshillart.com_2200x.jpg?v=1703181542",
    },
    {
      id: "4",
      title: "Vivid Expressions",
      artist: "David Kim",
      image: "https://m.media-amazon.com/images/I/A142xwh4GVL._AC_SL1500_.jpg",
    },
  ];

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await apiClient.get("art/list/");
        const fetchedArtworks = response.data.map((artwork) => ({
          id: artwork.id,
          title: artwork.title,
          artistName: artwork.artist,
          artistImage: "",
          artworkImage: artwork.image_url,
          likesCount: artwork.likes_count,
        }));
        setArtworksState(fetchedArtworks);
        setArtworks(fetchedArtworks);
      } catch (error) {
        console.error("Error fetching artworks:", error);
        toast.error("Failed to load artworks");
      }
    };

    fetchArtworks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshData]);

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
      <div className="container mx-auto px-4 sm:px-6 pt-20">
        <main className="container">
          <section className="mb-16">
            <ArtGalleryContainer artworks={staticArtworks} />
          </section>
        </main>

        <div className="relative flex justify-center items-center -top-16">
          <div className="browse-container bg-white shadow-lg w-full md:w-3/4 lg:w-[85%] rounded-lg flex items-center p-4">
            <div className="flex items-center px-4 border-r">
              <span className="text-xs font-semibold mr-5">Browse Type</span>
              <div className="relative">
                <ArtCategorySelect />
              </div>
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
                  <i className="bx bx-sort-alt-2 text-sm"></i>
                  Sort
                </Button>
              </div>
            </div>

            <div className="h-[800px] lg:w-[133%] custom-scrollbars">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {artworks.map((card) => (
                  <ArtCard
                    key={card.id}
                    id={card.id}
                    artistName={card.artistName}
                    artistImage={card.artistImage}
                    artworkImage={card.artworkImage}
                    title={card.title}
                    onButtonClick={handleTipJar}
                    isExplore={true}
                    likesCount={card.likesCount}
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
