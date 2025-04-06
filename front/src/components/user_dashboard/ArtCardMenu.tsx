import React, { useState } from 'react';
import { Share, Bookmark, EyeOff, Flag } from 'lucide-react';

const ArtCardMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative flex flex-col items-center mt-10">
      {/* Three Dots Button */}
      <button onClick={() => setIsOpen(!isOpen)} className="space-x-1 space-y-1 mb-2">
        <div className="w-2 h-2 bg-black rounded-full"></div>
        <div className="w-2 h-2 bg-black rounded-full"></div>
        <div className="w-2 h-2 bg-black rounded-full"></div>
      </button>

      {/* Vertical Menu */}
      {isOpen && (
        
        <div className="flex flex-col items-center bg-gray-100 rounded-full py-4 px-3 space-y-6 shadow-md">
          <Share className="w-6 h-6 text-black cursor-pointer hover:scale-110 transition" />
          <Bookmark className="w-6 h-6 text-black cursor-pointer hover:scale-110 transition" />
          <EyeOff className="w-6 h-6 text-black cursor-pointer hover:scale-110 transition" />
          <Flag className="w-6 h-6 text-black cursor-pointer hover:scale-110 transition" />
        </div>
      )}
    </div>
  );
};

export default ArtCardMenu;
