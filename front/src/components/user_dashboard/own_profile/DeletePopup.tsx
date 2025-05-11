import React from "react";
import { Trash2 } from "lucide-react";

interface DeleteConfirmationPopupProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationPopup: React.FC<DeleteConfirmationPopupProps> = ({
  isOpen,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full text-center relative">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 p-3 rounded-full">
            <Trash2 className="text-red-500" size={28} />
          </div>
        </div>
        <h2 className="text-base font-semibold text-gray-900 mb-2">You are about to delete a product</h2>
        <p className="text-sm text-gray-500 mb-6">This will delete your product from catalog<br />Are you sure?</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="text-sm px-4 py-2 text-gray-600 hover:text-black"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationPopup;
