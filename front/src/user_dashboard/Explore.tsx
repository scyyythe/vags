import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/user_dashboard/navbar/Header";
import ArtGalleryContainer from "@/components/user_dashboard/Explore/gallery/ArtGalleryContainer";
import SearchBar from "@/components/user_dashboard/local_components/SearchBar";
import CategoryFilter from "@/components/user_dashboard/local_components/CategoryFilter";
import ArtCard from "@/components/user_dashboard/Explore/cards/ArtCard";
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
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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
      setLoading(true);

      try {
        const response = await apiClient.get("art/list/", {
          params: { page: currentPage, limit: 20 },
        });

        const fetchedArtworks = response.data.map((artwork) => ({
          id: artwork.id,
          title: artwork.title,
          artistName: artwork.artist,
          artistImage: "",
          description: artwork.description,
          style: artwork.category,
          medium: artwork.medium,
          status: artwork.status,
          price: artwork.price,
          visibility: artwork.visibility,
          datePosted: new Date(artwork.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          artworkImage: artwork.image_url,
          likesCount: artwork.likes_count,
        }));

        setArtworksState(fetchedArtworks);
        setArtworks(fetchedArtworks);
      } catch (error) {
        console.error("Error fetching artworks:", error);
        toast.error("Failed to load artworks");
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, [currentPage, refreshData]);

  // Memoized filtered artworks based on search query and selected category
  const filteredArtworksMemo = useMemo(() => {
    return artworks.filter((artwork) => {
      const searchMatches =
        artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artwork.artistName.toLowerCase().includes(searchQuery.toLowerCase());

      const categoryMatches = selectedCategory === "All" || artwork.style === selectedCategory;

      return searchMatches && categoryMatches;
    });
  }, [artworks, searchQuery, selectedCategory]);

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
            <div className="flex-1 pl-4 bg-blue-100 bg-opacity-50 rounded-full ml-3">
              <SearchBar onSearchChange={setSearchQuery} />
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
                  className="text-[11px] bg-red-700 hover:bg-red-600 text-white rounded-full flex items-center gap-1"
                  onClick={handleCreateClick}
                >
                  <i className="bx bx-plus text-sm"></i>
                  Create
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[11px] rounded-full flex items-center gap-1"
                  onClick={handleSortClick}
                >
                  <i className="bx bx-sort-alt-2 text-sm"></i>
                  Sort
                </Button>
              </div>
            </div>

            <div className="h-[800px] lg:w-[133%] custom-scrollbars">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {loading ? (
                  <div className="col-span-full text-center text-sm text-gray-500 ">Loading artworks...</div>
                ) : (
                  filteredArtworksMemo.map((card) => (
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
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
