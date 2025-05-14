import React, { useState } from 'react';
import { X, Pencil } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type Identity = 'anonymous' | 'username' | 'fullName';

interface IdentitySelectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedIdentity: Identity) => void;
  username?: string;
  fullName?: string;
}

const IdentitySelectionPopup: React.FC<IdentitySelectionPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  username = '@ArtLover123',
  fullName = 'Jane Doe'
}) => {
  const [selectedIdentity, setSelectedIdentity] = useState<Identity | null>(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedIdentity) {
      onConfirm(selectedIdentity);
      toast.success(`Bid placed with ${selectedIdentity} identity`);
    }
  };

  const handleEditProfile = () => {
    navigate("/settings/edit-profile");
    onClose();
  };

  const hasUsername = username !== '';
  const hasFullName = fullName !== '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-xs mx-4 relative" onClick={e => e.stopPropagation()}>
        <div className="py-6 px-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-bold">Choose How to Display Your Identity</h2>
            <button 
              onClick={onClose}
              className="text-gray-600 hover:text-black"
            >
              <X size={17} />
            </button>
          </div>
          
          <p className="text-gray-500 text-[10px] mb-6">
            Your selected identity will be visible alongside your bid.
          </p>

          <div className="space-y-6 mb-8">
            {/* Anonymous Option */}
            <div 
              className={`px-4 py-2 border rounded-full cursor-pointer transition-all ${selectedIdentity === 'anonymous' ? 'border-red-800 bg-red-50' : 'border-gray-200 hover:border-red-300'}`}
              onClick={() => setSelectedIdentity('anonymous')}
            >
              <div className="flex items-start gap-3">
                < i className='bx bx-lock'></i> 
                <div>
                  <h3 className="font-medium text-[10px]">Anonymous</h3>
                  {/* <p className="text-gray-500 text-[10px]">Your identity will not be shown. Others will see 'Anonymous Bidder'.</p> */}
                </div>
              </div>
            </div>

            {/* Username Option */}
            <div 
              className={`px-4 py-2 border rounded-full cursor-pointer transition-all ${selectedIdentity === 'username' ? 'border-red-800 bg-red-50' : 'border-gray-200 hover:border-red-300'}`}
              onClick={() => setSelectedIdentity('username')}
            >
              <div className="flex items-start gap-3">
                < i className='bx bx-user' ></i> 
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-[10px]">Use My Username</h3>
                    <button 
                      onClick={handleEditProfile}
                      className="text-red-800 text-[10px] flex items-center gap-1 hover:underline"
                    >
                      <Pencil size={10} /> Edit
                    </button>
                  </div>
                  {/* <p className="text-gray-500 text-xs">
                    {hasUsername 
                      ? `Your current username (${username}) will be shown with your bid.` 
                      : "You don't have a username yet."}
                  </p> */}
                  {!hasUsername && (
                    <span className="text-amber-600 text-[10px] mt-1 block">
                      <button onClick={handleEditProfile} className="underline">Set now</button>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Full Name Option */}
            <div 
              className={`px-4 py-2 border rounded-full cursor-pointer transition-all ${selectedIdentity === 'fullName' ? 'border-red-800 bg-red-50' : 'border-gray-200 hover:border-red-300'}`}
              onClick={() => setSelectedIdentity('fullName')}
            >
              <div className="flex items-start gap-3">
                < i className='bx bx-user-circle'></i> 
                <div>
                  <h3 className="font-medium text-[10px]">Use My Full Name</h3>
                  {/* <p className="text-gray-500 text-xs">
                    {hasFullName 
                      ? `Display your full name (${fullName}) as listed in your profile.` 
                      : "You haven't added your full name yet."}
                  </p> */}
                  {!hasFullName && (
                    <span className="text-amber-600 text-xs mt-1 block">
                      <button onClick={handleEditProfile} className="underline">Set now</button>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="text-[9px] text-center mb-6">
            <a href="#" className="text-red-800 hover:underline" onClick={(e) => { e.preventDefault(); toast.info("Privacy information displayed"); }}>
              Learn more about bid privacy and security
            </a>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[10px] py-2 rounded-full font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedIdentity}
              className={`flex-1 text-white text-[10px] py-2 rounded-full font-medium transition-colors ${selectedIdentity ? 'bg-red-800 hover:bg-red-700' : 'bg-gray-300 cursor-not-allowed'}`}
            >
              Confirm & Place Bid
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdentitySelectionPopup;
