import React, { useState } from 'react';
import ArtGrid from './ArtGrid'; 
import { ChevronDown } from 'lucide-react';
import CreatedTab from "@/components/user_dashboard/user_profile/tabs/CreatedTab";
import ArtCategorySelect from "@/components/user_dashboard/local_components/categories/ArtCategorySelect";

const tabs = [
  { id: 'created', label: 'Created' },
  { id: 'onBid', label: 'On Bid' },
  { id: 'onSale', label: 'On Sale' },
  { id: 'collections', label: 'Collections' }
];

const ProfileTabs = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState('Digital Art');
  
  // Filter states
  const [showMediumOptions, setShowMediumOptions] = useState(false);
  const [showPriceOptions, setShowPriceOptions] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  
  const [selectedMedium, setSelectedMedium] = useState('Medium');
  const [selectedPriceRange, setSelectedPriceRange] = useState('Price Range');
  const [selectedSortBy, setSelectedSortBy] = useState('Sort by');

  const mediumOptions = ['Clay', 'Resin', 'Charcoal', 'Canvas', 'Ink', '3D Model'];
  const priceRangeOptions = ['Low to High', 'High to Low'];
  const sortByOptions = ['Latest', 'Oldest', 'Most Viewed', 'Most Liked'];

  const handleMediumSelect = (option: string) => {
    setSelectedMedium(option);
    setShowMediumOptions(false);
  };

  const handlePriceRangeSelect = (option: string) => {
    setSelectedPriceRange(option);
    setShowPriceOptions(false);
  };

  const handleSortBySelect = (option: string) => {
    setSelectedSortBy(option);
    setShowSortOptions(false);
  };

  return (
    <div className="w-full mt-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full">
        {/* Tabs */}
        <div className="flex space-x-4 overflow-x-auto pb-2 w-full sm:w-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-1.5 px-4 rounded-full text-[10px] font-small ${
                activeTab === tab.id
                  ? 'border border-gray-300 font-medium shadow-md'
                  : 'bg-white border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center mt-4 sm:mt-0 space-x-4 relative">
          <ArtCategorySelect 
            selectedCategory={filterCategory}
            onChange={setFilterCategory}
          />

          {/* Apply Filter Button */}
          <div className="relative">
            <button 
              onClick={() => setShowFilters(!showFilters)} 
              className="flex items-center space-x-1 px-3 py-2 rounded-full border broder-gray-400"
            >
              <i className='bx bx-filter'></i>
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
                      style={{ maxHeight: '110px' }} // or any height you prefer
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
      <div className="mt-4">
        {activeTab === 'created' && <CreatedTab />}
        {/* Add similar rendering for other tabs like 'onBid', 'onSale', etc. */}
      </div>
    </div>
  );
};

export default ProfileTabs;
