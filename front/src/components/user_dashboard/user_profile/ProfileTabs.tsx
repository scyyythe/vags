import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

const tabs = [
  { id: 'created', label: 'Created' },
  { id: 'onBid', label: 'On Bid' },
  { id: 'onSale', label: 'On Sale' },
  { id: 'collections', label: 'Collections' }
];

const ProfileTabs = () => {
  const [activeTab, setActiveTab] = useState('created');
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
              className={`px-4 py-2 whitespace-nowrap text-sm ${
                activeTab === tab.id
                  ? 'border-b-2 border-black font-medium'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center mt-4 sm:mt-0 space-x-2 relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2 text-sm font-normal">
                <span>{filterCategory}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white p-1 shadow-lg rounded-md min-w-[140px] animate-fade-in">
              <DropdownMenuItem 
                className="cursor-pointer hover:bg-gray-100 rounded"
                onClick={() => setFilterCategory('Digital Art')}
              >
                Digital Art
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer hover:bg-gray-100 rounded"
                onClick={() => setFilterCategory('Physical Art')}
              >
                Physical Art
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer hover:bg-gray-100 rounded"
                onClick={() => setFilterCategory('Photography')}
              >
                Photography
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Apply Filter Button */}
          <div className="relative">
            <Button 
              onClick={() => setShowFilters(!showFilters)} 
              variant="outline" 
              className="flex items-center space-x-2 px-3 py-2"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.5 2H1.5L6.5 8.4V13L9.5 14V8.4L14.5 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-sm">Apply Filter</span>
            </Button>
            
            {showFilters && (
              <div className="absolute right-0 top-full mt-2 bg-white shadow-lg rounded-md p-2 z-10 w-48 animate-fade-in">
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
                    <div className="bg-white shadow-md rounded-md mt-1 animate-fade-in">
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
    </div>
  );
};

export default ProfileTabs;
