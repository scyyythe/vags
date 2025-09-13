import React, { useState } from "react";
import { X, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import useUpdateUserDetails from "@/hooks/mutate/users/useUserMutate";
import { getLoggedInUserId } from "@/auth/decode";
import useUserQuery from "@/hooks/users/useUserQuery";

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
  const [usernameInput, setUsernameInput] = useState("");

  const { mutate: updateUser } = useUpdateUserDetails();
  const id = getLoggedInUserId();
  const { data: user, refetch } = useUserQuery(id);

  const currentUsername = user?.username ? `@${user.username}` : "";
  const hasUsername = !!user?.username;

  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedIdentity === "username" && !hasUsername) {
      setShowUsernameSetup(true);
      return;
    }
    if (selectedIdentity) {
      onConfirm(selectedIdentity);
    }
  };

  const handleEditUsername = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUsernameInput(currentUsername.replace("@", ""));
    setShowUsernameEdit(true);
  };

  const handleUsernameSet = (newUsername: string) => {
    const formData = new FormData();
    formData.append("username", newUsername);

    updateUser([id, formData], {
      onSuccess: () => {
        refetch();
        setShowUsernameSetup(false);
        setSelectedIdentity("username");
      },
      onError: () => {
        toast.error("Could not set username.", { closeButton: true });
      },
    });
  };

  const handleUsernameUpdate = (newUsername: string) => {
    const formData = new FormData();
    formData.append("username", newUsername);

    updateUser([id, formData], {
      onSuccess: () => {
        refetch();
        setShowUsernameEdit(false);
      },
      onError: () => {
        toast.error("Could not update username.", { closeButton: true });
      },
    });
  };

  // ---------- Username Setup Form ----------
  const UsernameSetupForm = () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!usernameInput.trim()) {
        toast.error("Please enter a username", { closeButton: true });
        return;
      }
      if (usernameInput.length < 3) {
        toast.error("Username must be at least 3 characters long", { closeButton: true });
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        handleUsernameSet(usernameInput.trim());
        toast.success("Username set successfully!", { closeButton: true });
        setIsLoading(false);
        setUsernameInput("");
      }, 1000);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <label className="block text-[10px] font-medium text-gray-700 mb-2">Username</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-[10px]">@</span>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Enter username"
              className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-full text-[10px] focus:outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800"
              maxLength={20}
              disabled={isLoading}
            />
          </div>
          <p className="text-[9px] text-gray-500 mt-1">3-20 characters. Letters, numbers, and underscores only.</p>
        </div>
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => setShowUsernameSetup(false)}
            disabled={isLoading}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[10px] py-2 rounded-full font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !usernameInput.trim()}
            className={`flex-1 text-white text-[10px] py-2 rounded-full font-medium transition-colors ${
              isLoading || !usernameInput.trim()
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-red-800 hover:bg-red-700"
            }`}
          >
            {isLoading ? "Setting..." : "Set Username"}
          </button>
        </div>
      </form>
    );
  };

  // ---------- Username Edit Form ----------
  const UsernameEditForm = () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!usernameInput.trim()) {
        toast.error("Username cannot be empty", { closeButton: true });
        return;
      }
      if (usernameInput.length < 3) {
        toast.error("Username must be at least 3 characters long", { closeButton: true });
        return;
      }
      if (usernameInput.length > 20) {
        toast.error("Username must be 20 characters or less", { closeButton: true });
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(usernameInput)) {
        toast.error("Username can only contain letters, numbers, and underscores", { closeButton: true });
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        handleUsernameUpdate(usernameInput);
        toast.success("Username updated successfully!", { closeButton: true });
        setIsLoading(false);
      }, 1000);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-7 mt-4">
        <div>
          <label className="block text-[10px] font-medium text-gray-700 mb-1">Username</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-[10px]">@</span>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-full text-[10px] focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
              placeholder="Enter username"
              maxLength={20}
              disabled={isLoading}
            />
          </div>
          <p className="text-[9px] text-gray-500 mt-1">3-20 characters. Letters, numbers, and underscores only.</p>
        </div>
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading || !usernameInput.trim()}
            className={`flex-1 text-white text-[10px] py-2 rounded-full font-medium transition-colors ${
              isLoading || !usernameInput.trim()
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-red-800 hover:bg-red-700"
            }`}
          >
            {isLoading ? "Updating..." : "Update Username"}
          </button>
        </div>
      </form>
    );
  };

  // ---------- Main Container ----------
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

            <p className="text-gray-500 text-[10px]">Choose how you want your name to appear on this bid.</p>

            {/* Username / Anonymous Options */}
            {!showUsernameSetup && !showUsernameEdit && (
              <div className="space-y-4 my-7">
                {/* Username Option */}
                <div
                  className={`px-4 py-2 border rounded-full cursor-pointer transition-all ${
                    selectedIdentity === "username"
                      ? "border-red-800 bg-red-50"
                      : "border-gray-200 hover:border-red-800"
                  }`}
                  onClick={() => (hasUsername ? setSelectedIdentity("username") : setShowUsernameSetup(true))}
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
                      {!hasUsername && (
                        <span className="text-black mt-1 block">
                          <button onClick={() => setShowUsernameSetup(true)} className="font-medium text-[10px] hover:underline">
                            Set up username first
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Anonymous Option */}
                <div
                  className={`px-4 py-2 border rounded-full cursor-pointer transition-all ${
                    selectedIdentity === "anonymous"
                      ? "border-red-800 bg-red-50"
                      : "border-gray-200 hover:border-red-800"
                  }`}
                  onClick={() => setSelectedIdentity("anonymous")}
                >
                  <div className="flex items-start gap-3">
                    <i className="bx bx-hide"></i>
                    <div className="flex-1">
                      <h3 className="font-medium text-[10px]">Bid Anonymously</h3>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Inline Username Setup */}
            {showUsernameSetup && <UsernameSetupForm />}

            {/* Inline Username Edit */}
            {showUsernameEdit && <UsernameEditForm />}

            {!showUsernameSetup && !showUsernameEdit && (
              <>
                <div className="text-[8px] text-left -mt-4 ml-2">
                  <a
                    href="#"
                    className="text-red-800 hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info("Privacy information displayed", { closeButton: true });
                    }}
                  >
                    Learn more about bid privacy and security
                  </a>
                </div>

                <div className="flex gap-3 mt-8">
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
                    {selectedIdentity === "username" && !hasUsername ? "Set Username" : "Confirm"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default IdentitySelectionPopup;
