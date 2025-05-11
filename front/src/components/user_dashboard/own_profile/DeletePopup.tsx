import React from "react";

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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 overflow-hidden">
      <div className="bg-white rounded-lg py-7 shadow-xl max-w-sm w-full text-center relative">
        <h2 className="text-xs font-semibold text-gray-900 mb-2">You are about to delete this artwork</h2>
        <p className="text-[10px] text-gray-500 mb-6">This will permanently remove the artwork from your profile.<br />Are you sure?</p>
        <div className="flex justify-center gap-16">
          <button
            onClick={onCancel}
            className="text-[10px] px-8 py-1 text-gray-600 hover:text-black border border-gray-500 hover:border-black rounded-full transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-700 hover:bg-red-600 text-white text-[10px] px-8 py-1 rounded-full"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationPopup;
