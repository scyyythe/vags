import React, { useState, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import ArtGrid from "./ArtGrid";
import { ChevronDown } from "lucide-react";
import { useMediumOptions } from "@/components/user_dashboard/user_profile/components/options/MediumOptions";
import CreatedTab from "@/components/user_dashboard/user_profile/tabs/CreatedTab";
import ArtCategorySelect from "@/components/user_dashboard/local_components/categories/ArtCategorySelect";
import { toast } from "sonner";
import useArtworks, { Artwork } from "@/hooks/artworks/fetch_artworks/useArtworks";
import EmptyTrashPopup from "@/components/user_dashboard/user_profile/components/status_options/popups/empty_trash/EmptyTrash";
import UnhidePopup from "@/components/user_dashboard/user_profile/components/status_options/popups/unhide/Unhide";
import UnarchivePopup from "@/components/user_dashboard/user_profile/components/status_options/popups/unarchive/Unarchive";
import RestoreAllConfirmation from "@/components/user_dashboard/user_profile/components/status_options/popups/restore_all/RestoreAllConfirmation";
import RestoreAllAuctionsConfirmation from "@/components/user_dashboard/user_profile/components/status_options/popups/restore_all_auctions/RestoreAllAuctionsConfirmation";
import { getLoggedInUserId } from "@/auth/decode";
import CollectionTab from "../tabs/CollectionTab";
import OnBidTab from "../tabs/OnBidTab";
import ExhibitTab from "@/components/user_dashboard/user_profile/tabs/ExhibitsTab";
import useUnarchiveAllMyArtworks from "@/hooks/mutate/visibility/arc/useUnarchiveAllMyArtworks";
import useBulkUnhideArtworks from "@/hooks/mutate/visibility/private/useBulkUnhideArtworks";
import useBulkUnhideExhibits from "@/hooks/mutate/visibility/private/useBulkUnhideExhibits";
import useBulkUnhideAuctions from "@/hooks/mutate/visibility/private/useBulkUnhideAuctions";
import { useRestoreAllExhibits } from "@/hooks/exhibit/useRestoreAllExhibits";
import { useRestoreAllAuctions } from "@/hooks/auction/useRestoreAllAuctions";
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
  const location = useLocation();
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

  const translatedMediums = useMediumOptions();

  const priceRangeOptions = ["Low to High", "High to Low"];
  const sortByOptions = ["Latest", "Oldest", "Most Viewed", "Most Liked"];

  const [selectedStatus, setSelectedStatus] = useState("Active");
  const [showStatusOptions, setShowStatusOptions] = useState(false);
  const statusOptions = ["Active", "Hidden", "Archived", "Deleted", "Private"];

  const [showEmptyTrashPopup, setShowEmptyTrashPopup] = useState(false);
  const [showUnhidePopup, setShowUnhidePopup] = useState(false);
  const [ShowMakePublicPopup, setShowMakePublicPopup] = useState(false);
  const [showUnarchivePopup, setShowUnarchivePopup] = useState(false);
  const [showRestoreAllPopup, setShowRestoreAllPopup] = useState(false);
  const [showRestoreAllAuctionsPopup, setShowRestoreAllAuctionsPopup] = useState(false);

  const [artworkList, setArtworkList] = useState<Artwork[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const { id: userId } = useParams();

  const loggedInUserId = getLoggedInUserId();
  const isOwnProfile = userId === loggedInUserId;
  const endpointType = isOwnProfile ? "created-by-me" : "specific-user";

  const { data: artworks, isLoading } = useArtworks(
    currentPage,
    userId,
    true,
    endpointType,
    selectedStatus.toLowerCase() as any
  );
  const { mutate: unarchiveAllMyArtworks } = useUnarchiveAllMyArtworks(artworks ?? []);
  const { mutate: bulkUnhideArtworks } = useBulkUnhideArtworks();
  const { mutate: bulkUnhideExhibits } = useBulkUnhideExhibits();
  const { mutate: bulkUnhideAuctions } = useBulkUnhideAuctions();
  const { mutate: restoreAllExhibits } = useRestoreAllExhibits();
  const { mutate: restoreAllAuctions } = useRestoreAllAuctions();
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
    toast.success("Trash emptied!", {
      closeButton: true,
    });
    setShowEmptyTrashPopup(false);
  };

  const cancelEmptyTrash = () => {
    setShowEmptyTrashPopup(false);
  };

  // UNHIDE BUTTON
  const confirmUnhideAll = () => {
    if (activeTab === "exhibits") {
      bulkUnhideExhibits();
    } else if (activeTab === "onBid") {
      bulkUnhideAuctions();
    } else {
      bulkUnhideArtworks();
    }
    setShowUnhidePopup(false);
  };

  const cancelUnhide = () => {
    setShowUnhidePopup(false);
  };

  // UNARCHIVE BUTTON
  const confirmUnarchiveAll = () => {
    unarchiveAllMyArtworks();
    toast.success("All archived artworks have been unarchived!", {
      closeButton: true,
    });
    setShowUnarchivePopup(false);
  };

  const cancelUnarchive = () => {
    setShowUnarchivePopup(false);
  };

  // RESTORE ALL BUTTON
  const handleRestoreAll = () => {
    setShowRestoreAllPopup(true);
  };

  const confirmRestoreAll = () => {
    restoreAllExhibits();
    setShowRestoreAllPopup(false);
  };

  const cancelRestoreAll = () => {
    setShowRestoreAllPopup(false);
  };

  // RESTORE ALL AUCTIONS BUTTON
  const handleRestoreAllAuctions = () => {
    setShowRestoreAllAuctionsPopup(true);
  };

  const confirmRestoreAllAuctions = () => {
    restoreAllAuctions();
    setShowRestoreAllAuctionsPopup(false);
  };

  const cancelRestoreAllAuctions = () => {
    setShowRestoreAllAuctionsPopup(false);
  };

  const handlePriceRangeSelect = (option: string) => {
    setSelectedPriceRange(option);
    setShowPriceOptions(false);
  };

  const filteredArtworksMemo = useMemo(() => {
    if (!artworks) return [];

    let filtered = artworks;

    // Category filtering - always apply
    filtered = filtered.filter((artwork) => {
      return selectedCategory.toLowerCase() === "all" || artwork.style.toLowerCase() === selectedCategory.toLowerCase();
    });

    // Status filtering - only for cases not handled by backend
    if (selectedStatus.toLowerCase() === "active") {
      // For active status, show public + private active artworks
      filtered = filtered.filter((art) => {
        return (
          art.visibility?.toLowerCase() === "public" ||
          (art.visibility?.toLowerCase() === "private" && art.art_status?.toLowerCase() === "active")
        );
      });
    } else if (["hidden", "public", "private"].includes(selectedStatus.toLowerCase())) {
      // Backend already filtered these cases, so no additional status filtering needed
      // Keep all artworks returned by backend
    } else {
      // For archived and deleted, still filter on frontend
      const statusMap: Record<string, string> = {
        archived: "archived",
        deleted: "deleted",
      };

      const mapped = statusMap[selectedStatus.toLowerCase()];
      if (mapped) {
        if (mapped === "archived") {
          filtered = filtered.filter((art) => art.visibility?.toLowerCase() === "archived");
        } else if (mapped === "deleted") {
          filtered = filtered.filter((art) => art.visibility?.toLowerCase() === "deleted");
        }
      }
    }

    // Debug - log what we received from backend
    console.log(`Backend returned ${artworks.length} artworks for status: ${selectedStatus}`);
    console.log(
      "Artworks from backend:",
      artworks.map((art) => ({ id: art.id, title: art.title, visibility: art.visibility, art_status: art.art_status }))
    );

    // Sorting
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

    console.log(`After filtering: ${filtered.length} artworks`);
    return filtered;
  }, [artworks, selectedCategory, selectedSortBy, selectedStatus]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    toast(`Selected category: ${category}`, {
      closeButton: true,
    });
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
              className="flex items-center space-x-1 px-3 py-1 rounded-full border border-gray-300"
            >
              <i className="bx bx-filter"></i>
              <span className="text-[10px]">Apply Filter</span>
            </button>

            {showFilters && (
              <div
                className="absolute right-0 top-full mt-2 text-[10px] bg-white shadow-lg whitespace-nowrap rounded-md p-2 mb-8 z-10 w-30 animate-fade-in overflow-y-auto"
                style={{ maxHeight: "50vh" }}
              >
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
                      {translatedMediums.map((option, idx) => (
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
                <div className="mb-2">
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
                </div>

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

          {selectedStatus === "Private" && (
            <div className="flex justify-between items-center my-4">
              <h2 className="text-sm font-semibold">Private Artworks</h2>
              <button
                onClick={() => setShowMakePublicPopup(true)}
                className="text-[10px] py-2 pr-2 text-green-700 hover:text-green-600 font-medium"
              >
                Make All Public
              </button>
            </div>
          )}
          <CreatedTab filteredArtworks={filteredArtworksMemo} isLoading={isLoading} />
        </>
      )}

      {activeTab === "collections" && <CollectionTab />}
      {activeTab === "onBid" && (
        <OnBidTab
          selectedStatus={selectedStatus}
          onShowUnhidePopup={() => setShowUnhidePopup(true)}
          onShowRestoreAllPopup={handleRestoreAllAuctions}
        />
      )}

      {activeTab === "exhibits" && (
        <>
          {selectedStatus === "Archived" && (
            <div className="flex justify-between items-center my-4">
              <h2 className="text-sm font-semibold">Archived Exhibits</h2>
              <button
                onClick={() => setShowUnarchivePopup(true)}
                className="text-[10px] py-2 pr-2 text-yellow-700 hover:text-yellow-600 font-medium"
              >
                Unarchive All
              </button>
            </div>
          )}

          {selectedStatus === "Deleted" && isOwnProfile && (
            <div className="flex justify-between items-center my-4">
              <h2 className="text-sm font-semibold">Deleted Exhibits</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleRestoreAll}
                  className="text-[10px] py-2 pr-2 text-green-700 hover:text-green-600 font-medium"
                >
                  Restore All
                </button>
                <button
                  onClick={handleEmptyTrash}
                  className="text-[10px] py-2 pr-2 text-red-700 hover:text-red-600 font-medium"
                >
                  Empty Trash
                </button>
              </div>
            </div>
          )}

          {selectedStatus === "Hidden" && (
            <div className="flex justify-between items-center my-4">
              <h2 className="text-sm font-semibold">Hidden Exhibits</h2>
              <button
                onClick={() => setShowUnhidePopup(true)}
                className="text-[10px] py-2 pr-2 text-blue-700 hover:text-blue-600 font-medium"
              >
                Unhide All
              </button>
            </div>
          )}

          <ExhibitTab
            selectedStatus={selectedStatus}
            includeDeleted={selectedStatus === "Deleted"}
            includeHidden={selectedStatus === "Hidden"}
            includeArchived={selectedStatus === "Archived"}
            userId={userId}
          />
        </>
      )}
      {activeTab === "onSale" && <SellTab selectedPriceRange={selectedPriceRange} selectedStatus={selectedStatus} navigationState={location.state} />}

      <UnarchivePopup isOpen={showUnarchivePopup} onCancel={cancelUnarchive} onConfirm={confirmUnarchiveAll} />
      <EmptyTrashPopup isOpen={showEmptyTrashPopup} onCancel={cancelEmptyTrash} onConfirm={confirmEmptyTrash} />
      <UnhidePopup isOpen={showUnhidePopup} onCancel={cancelUnhide} onConfirm={confirmUnhideAll} />
      <RestoreAllConfirmation isOpen={showRestoreAllPopup} onCancel={cancelRestoreAll} onConfirm={confirmRestoreAll} />
      <RestoreAllAuctionsConfirmation
        isOpen={showRestoreAllAuctionsPopup}
        onCancel={cancelRestoreAllAuctions}
        onConfirm={confirmRestoreAllAuctions}
      />
    </div>
  );
};

export default ProfileTabs;
