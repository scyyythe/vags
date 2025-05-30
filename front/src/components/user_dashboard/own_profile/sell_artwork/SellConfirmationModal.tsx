import React from 'react';
import { Button } from '@/components/ui/button';

interface SellConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const SellConfirmationModal: React.FC<SellConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-96 max-w-md mx-4 text-center">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">
          Confirm Artwork Listing
        </h2>
        <p className="text-[10px] text-gray-600 mb-8">
          Are you sure you want to list this artwork for sale? This will make it publicly available for purchase.
        </p>
        
        <div className="flex gap-4">
          <Button
            onClick={onConfirm}
            className="flex-1 h-8 bg-red-800 hover:bg-red-700 text-white text-[11px] py-3 rounded-full font-medium"
          >
            Yes, List for Sale
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1 h-8 border-gray-300 text-gray-700 text-[11px] hover:bg-gray-50 py-3 rounded-full font-medium"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SellConfirmationModal;
