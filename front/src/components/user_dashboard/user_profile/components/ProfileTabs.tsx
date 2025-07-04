import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import ArtGrid from "./ArtGrid";
import { ChevronDown } from "lucide-react";
import { mediumOptions } from "@/components/user_dashboard/user_profile/components/options/MediumOptions";
import CreatedTab from "@/components/user_dashboard/user_profile/tabs/CreatedTab";
import ArtCategorySelect from "@/components/user_dashboard/local_components/categories/ArtCategorySelect";
import { toast } from "sonner";
import useArtworks, { Artwork } from "@/hooks/artworks/fetch_artworks/useArtworks";
import EmptyTrashPopup from "@/components/user_dashboard/user_profile/components/status_options/popups/empty_trash/EmptyTrash";
import UnhidePopup from "@/components/user_dashboard/user_profile/components/status_options/popups/unhide/Unhide";
import UnarchivePopup from "@/components/user_dashboard/user_profile/components/status_options/popups/unarchive/Unarchive";
import { getLoggedInUserId } from "@/auth/decode";
import CollectionTab from "../tabs/CollectionTab";
import OnBidTab from "../tabs/OnBidTab";
import ExhibitTab from "@/components/user_dashboard/user_profile/tabs/ExhibitsTab";
import useUnarchiveAllMyArtworks from "@/hooks/mutate/visibility/arc/useUnarchiveAllMyArtworks";
import useUnhideAllMyArtworks from "@/hooks/mutate/visibility/private/useUnhideArtwork";
import SellTab from "../tabs/OnSaleTab";
const tabs = [
  { id: "created", label: "Created" },
  { id: "exhibits", label: "Exhibits" },
  { id: "onBid", label: "On Bid" },
  { id: "onSale", label: "On Sale" },
  { id: "collections", label: "Collections" },
];
type ProfileTabsProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};
const ProfileTabs = ({ activeTab, setActiveTab }: ProfileTabsProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState("Digital Art");
  const [selectedCategory, setSelectedCategory] = useState("All");
  // Filter states
  const [showMediumOptions, setShowMediumOptions] = useState(false);
  const [showPriceOptions, setShowPriceOptions] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);

  const [selectedMedium, setSelectedMedium] = useState("Medium");
  const [selectedPriceRange, setSelectedPriceRange] = useState("Price Range");
  const [selectedSortBy, setSelectedSortBy] = useState("Sort by");

  const priceRangeOptions = ["Low to High", "High to Low"];
  const sortByOptions = ["Latest", "Oldest", "Most Viewed", "Most Liked"];

  const [selectedStatus, setSelectedStatus] = useState("Active");
  const [showStatusOptions, setShowStatusOptions] = useState(false);
  const statusOptions = ["Active", "Hidden", "Archived", "Deleted"];

  const [showEmptyTrashPopup, setShowEmptyTrashPopup] = useState(false);
  const [showUnhidePopup, setShowUnhidePopup] = useState(false);
  const [showUnarchivePopup, setShowUnarchivePopup] = useState(false);

  const [artworkList, setArtworkList] = useState<Artwork[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const { id: userId } = useParams();

  const loggedInUserId = getLoggedInUserId();
  const isOwnProfile = userId === loggedInUserId;
  const endpointType = isOwnProfile ? "created-by-me" : "specific-user";

  const { data: artworks, isLoading } = useArtworks(currentPage, userId, true, endpointType);
  const { mutate: unarchiveAllMyArtworks } = useUnarchiveAllMyArtworks(artworks ?? []);
  const { mutate: unhideAllMyArtworks } = useUnhideAllMyArtworks(artworks ?? []);
  const handleMediumSelect = (option: string) => {
    setSelectedMedium(option);
    setShowMediumOptions(false);
  };

  // EMPTY TRASH BUTTON
  const handleEmptyTrash = () => {
    setShowEmptyTrashPopup(true);
  };

  const confirmEmptyTrash = () => {
    const filtered = artworkList.filter((art) => art.status !== "Deleted");
    setArtworkList(filtered);
    toast.success("Trash emptied!");
    setShowEmptyTrashPopup(false);
  };

  const cancelEmptyTrash = () => {
    setShowEmptyTrashPopup(false);
  };

  // UNHIDE BUTTON
  const confirmUnhideAll = () => {
    unhideAllMyArtworks();
    toast.success("All hidden artworks have been unhidden!");
    setShowUnhidePopup(false);
  };

  const cancelUnhide = () => {
    setShowUnhidePopup(false);
  };

  // UNARCHIVE BUTTON
  const confirmUnarchiveAll = () => {
    unarchiveAllMyArtworks();
    toast.success("All archived artworks have been unarchived!");
    setShowUnarchivePopup(false);
  };

  const cancelUnarchive = () => {
    setShowUnarchivePopup(false);
  };

  const handlePriceRangeSelect = (option: string) => {
    setSelectedPriceRange(option);
    setShowPriceOptions(false);
  };
  const filteredArtworksMemo = useMemo(() => {
    if (!artworks) return [];

    let filtered = artworks;

    filtered = filtered.filter((artwork) => {
      return selectedCategory.toLowerCase() === "all" || artwork.style.toLowerCase() === selectedCategory.toLowerCase();
    });

    const statusMap: Record<string, string> = {
      active: "public",
      hidden: "hidden",
      private: "hidden",
      archived: "archived",
      deleted: "deleted",
    };

    filtered = filtered.filter((art) => {
      const mapped = statusMap[selectedStatus.toLowerCase()];
      return art.visibility?.toLowerCase() === mapped;
    });

    artworks.forEach((art) => console.log(art.visibility));

    // Sort
    switch (selectedSortBy) {
      case "Latest":
        filtered = filtered.sort((a, b) => new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime());
        break;
      case "Oldest":
        filtered = filtered.sort((a, b) => new Date(a.datePosted).getTime() - new Date(b.datePosted).getTime());
        break;
      case "Most Liked":
        filtered = filtered.sort((a, b) => (b.likesCount ?? 0) - (a.likesCount ?? 0));
        break;
      default:
        break;
    }

    return filtered;
  }, [artworks, selectedCategory, selectedSortBy, selectedStatus]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    toast(`Selected category: ${category}`);
  };

  const handleSortBySelect = (option: string) => {
    setSelectedSortBy(option);
    setShowSortOptions(false);
  };

  return (
    <div className="w-full mt-8">
      <div className="flex flex-col mb-4 sm:flex-row items-start sm:items-center justify-between w-full">
        {/* Tabs */}
        <div className="flex space-x-4 overflow-x-auto pb-2 w-full sm:w-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-1.5 px-4 rounded-full text-[10px] font-small ${
                activeTab === tab.id
                  ? "border border-gray-300 font-medium shadow-md"
                  : "bg-white border border-gray-200 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center mt-4 sm:mt-0 space-x-4 relative bottom-[6px]">
          <ArtCategorySelect selectedCategory={selectedCategory} onChange={handleCategorySelect} />

          {/* Apply Filter Button */}
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full border border-gray-300"
            >
              <i className="bx bx-filter"></i>
              <span className="text-[10px]">Apply Filter</span>
            </button>

            {showFilters && (
              <div className="absolute right-0 top-full mt-2 text-[10px] bg-white shadow-lg whitespace-nowrap rounded-md p-2 z-10 w-30 animate-fade-in">
                {/* Medium Filter */}
                <div className="mb-2">
                  <div
                    className="px-3 py-2 flex justify-between items-center cursor-pointer hover:bg-gray-100 rounded"
                    onClick={() => setShowMediumOptions(!showMediumOptions)}
                  >
                    <span>{selectedMedium}</span>
                    <ChevronDown className="h-4 w-4" />
                  </div>

                  {showMediumOptions && (
                    <div
                      className="bg-white shadow-md rounded-md mt-1 animate-fade-in overflow-y-auto"
                      style={{ maxHeight: "110px" }}
                    >
                      {mediumOptions.map((option, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleMediumSelect(option)}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price Range Filter */}
                {/* <div className="mb-2">
                  <div
                    className="px-3 py-2 flex justify-between items-center cursor-pointer hover:bg-gray-100 rounded"
                    onClick={() => setShowPriceOptions(!showPriceOptions)}
                  >
                    <span>{selectedPriceRange}</span>
                    <ChevronDown className="h-4 w-4" />
                  </div>

                  {showPriceOptions && (
                    <div className="bg-white shadow-md rounded-md mt-1 animate-fade-in">
                      {priceRangeOptions.map((option, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => handlePriceRangeSelect(option)}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div> */}

                {/* Status Filter */}
                {isOwnProfile && (
                  <div className="mb-2">
                    <div
                      className="px-3 py-2 flex justify-between items-center cursor-pointer hover:bg-gray-100 rounded"
                      onClick={() => setShowStatusOptions(!showStatusOptions)}
                    >
                      <span>{selectedStatus}</span>
                      <ChevronDown className="h-4 w-4" />
                    </div>

                    {showStatusOptions && (
                      <div className="bg-white shadow-md rounded-md mt-1 animate-fade-in">
                        {statusOptions.map((option, idx) => (
                          <div
                            key={idx}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                              setSelectedStatus(option);
                              setShowStatusOptions(false);
                            }}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Sort By Filter */}
                <div>
                  <div
                    className="px-3 py-2 flex justify-between items-center cursor-pointer hover:bg-gray-100 rounded"
                    onClick={() => setShowSortOptions(!showSortOptions)}
                  >
                    <span>{selectedSortBy}</span>
                    <ChevronDown className="h-4 w-4" />
                  </div>

                  {showSortOptions && (
                    <div className="bg-white shadow-md rounded-md mt-1 animate-fade-in">
                      {sortByOptions.map((option, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSortBySelect(option)}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Tab Content Rendering */}
      {activeTab === "created" && (
        <>
          {/* ARCHIVED PAGE */}
          {selectedStatus === "Archived" && (
            <div className="flex justify-between items-center my-4">
              <h2 className="text-sm font-semibold">Archived Artworks</h2>
              <button
                onClick={() => setShowUnarchivePopup(true)}
                className="text-[10px] py-2 pr-2 text-yellow-700 hover:text-yellow-600 font-medium"
              >
                Unarchive All
              </button>
            </div>
          )}

          {/* DELETED PAGE */}
          {selectedStatus === "Deleted" && (
            <div className="flex justify-between items-center my-4">
              <h2 className="text-sm font-semibold">Deleted Artworks</h2>
              <button
                onClick={handleEmptyTrash}
                className="text-[10px] py-2 pr-2 text-red-700 hover:text-red-600 font-medium"
              >
                Empty Trash
              </button>
            </div>
          )}

          {/* HIDDEN PAGE */}
          {selectedStatus === "Hidden" && (
            <div className="flex justify-between items-center my-4">
              <h2 className="text-sm font-semibold">Hidden Artworks</h2>
              <button
                onClick={() => setShowUnhidePopup(true)}
                className="text-[10px] py-2 pr-2 text-blue-700 hover:text-blue-600 font-medium"
              >
                Unhide All
              </button>
            </div>
          )}
          <CreatedTab filteredArtworks={filteredArtworksMemo} isLoading={isLoading} />
        </>
      )}

      {activeTab === "collections" && <CollectionTab />}
      {activeTab === "onBid" && <OnBidTab />}

      {activeTab === "exhibits" && <ExhibitTab />}

      {activeTab === "onSale" && 
      <SellTab/>}
      <UnarchivePopup isOpen={showUnarchivePopup} onCancel={cancelUnarchive} onConfirm={confirmUnarchiveAll} />
      <EmptyTrashPopup isOpen={showEmptyTrashPopup} onCancel={cancelEmptyTrash} onConfirm={confirmEmptyTrash} />
      <UnhidePopup isOpen={showUnhidePopup} onCancel={cancelUnhide} onConfirm={confirmUnhideAll} />
    </div>
  );
};

export default ProfileTabs;
