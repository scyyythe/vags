import React, { useState } from "react";
import { X, Pencil } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import UsernameSetupPopup from "./UsernameSetup";
import UsernameEditPopup from "./UsernameEdit";

type Identity = "anonymous" | "username" | "fullName";

interface IdentitySelectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedIdentity: Identity) => void;
  username?: string;
}

const IdentitySelectionPopup: React.FC<IdentitySelectionPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  username = "",
}) => {
  const [selectedIdentity, setSelectedIdentity] = useState<Identity | null>(null);
  const [showUsernameSetup, setShowUsernameSetup] = useState(false);
  const [showUsernameEdit, setShowUsernameEdit] = useState(false);
  const [currentUsername, setCurrentUsername] = useState(username);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedIdentity === "username" && !currentUsername) {
      setShowUsernameSetup(true);
      return;
    }
    
    if (selectedIdentity) {
      onConfirm(selectedIdentity);
      toast.success(`Bid placed with ${selectedIdentity} identity`);
    }
  };

   const handleEditProfile = () => {
    navigate("/settings/edit-profile");
    onClose();
  };

  const handleEditUsername = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowUsernameEdit(true);
  };

  const handleUsernameSet = (newUsername: string) => {
    setCurrentUsername(`@${newUsername}`);
    setShowUsernameSetup(false);
    setSelectedIdentity("username");
  };

  const handleUsernameUpdate = (newUsername: string) => {
    setCurrentUsername(`@${newUsername}`);
    setShowUsernameEdit(false);
  };

  const handleSetUsernameNow = () => {
    setShowUsernameSetup(true);
  };

  const hasUsername = currentUsername !== "";

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-white rounded-2xl w-full max-w-xs mx-4 relative" onClick={(e) => e.stopPropagation()}>
          <div className="py-6 px-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-bold">Place Your Bid</h2>
              <button onClick={onClose} className="text-gray-600 hover:text-black">
                <X size={17} />
              </button>
            </div>

            <p className="text-gray-500 text-[10px] mb-6">
              {hasUsername
                ? "Use your username for this bid."
                : "Set a username to bid."}
            </p>


            <div className="space-y-6 my-11">

              {/* Username Option */}
              <div
                className={`px-4 py-2 border rounded-full cursor-pointer transition-all ${
                  selectedIdentity === "username" ? "border-red-800 bg-red-50" : "border-gray-200 hover:border-red-800"
                }`}
                onClick={() => hasUsername ? setSelectedIdentity("username") : setShowUsernameSetup(true)}
              >
                <div className="flex items-start gap-3">
                  <i className="bx bx-user"></i>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-[10px]">Use My Username</h3>
                      {hasUsername && (
                        <button
                          onClick={handleEditUsername}
                          className="text-red-800 text-[10px] flex items-center gap-1 hover:underline"
                        >
                          <Pencil size={10} /> Edit
                        </button>
                      )}
                    </div>
                    {hasUsername ? (
                      <p className=""></p>
                    ) : (
                      <span className="text-black mt-1 block">
                        <button onClick={handleSetUsernameNow} className="font-medium text-[10px] hover:underline">
                          Set up username first
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              </div>

            </div>

            <div className="text-[8px] text-center -mt-8">
                <a
                  href="#"
                  className="text-red-800 hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info("Privacy information displayed");
                  }}
                >
                  Learn more about bid privacy and security
                </a>
            </div>

            <div className="flex gap-3 mt-11">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[10px] py-2 rounded-full font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedIdentity}
                className={`flex-1 text-white text-[10px] py-2 rounded-full font-medium transition-colors ${
                  selectedIdentity ? "bg-red-800 hover:bg-red-700" : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {selectedIdentity === "username" && !hasUsername ? "Set Username" : "Confirm & Place Bid"}
              </button>
            </div>

          </div>
        </div>
      </div>

      <UsernameSetupPopup
        isOpen={showUsernameSetup}
        onClose={() => setShowUsernameSetup(false)}
        onUsernameSet={handleUsernameSet}
      />

      <UsernameEditPopup
        isOpen={showUsernameEdit}
        onClose={() => setShowUsernameEdit(false)}
        onUsernameUpdate={handleUsernameUpdate}
        currentUsername={currentUsername}
      />
    </>
  );
};

export default IdentitySelectionPopup;
