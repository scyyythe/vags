import React, { useState, useEffect } from "react";
import EditableField from "../components/EditableField";
import ActionButtons from "../components/ActionButtons";
import useUserDetails from "@/hooks/users/useUserDetails";
import { getLoggedInUserId } from "@/auth/decode";
import useUpdateUserDetails from "@/hooks/mutate/users/useUserMutate";
import useDeactivateAccount from "@/hooks/mutate/users/useDeactivateAccount";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { toast } from "sonner";
import DeleteConfirmationPopup from "../components/delete_deact_modals/DeleteConfirmationPopup";
import DeactivateConfirmationPopup from "../components/delete_deact_modals/DeactivateConfirmationPopup";

const AccountDetails = () => {
  const userId = getLoggedInUserId();
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidFullName = (fullName: string) => /^[a-zA-Z]+(?: [a-zA-Z]+)+$/.test(fullName.trim());

  const { firstName, lastName, gender, address, dateOfBirth, email, userStatus, isLoading, error } =
    useUserDetails(userId);
  const { mutate: updateUser } = useUpdateUserDetails();
  const { mutate: deactivateAccount } = useDeactivateAccount();

  const { language: selectedLanguage } = useLanguage();

  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    country: "Philippines",
    date_of_birth: "",
    language: "English",
    email: "",
  });

  const [originalData, setOriginalData] = useState({ ...formData });

  // Popups
  const [showDeactivatePopup, setShowDeactivatePopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  // Translations
  const accountInfoLabel = useAutoTranslation("Account Information", selectedLanguage);
  const fullNameLabel = useAutoTranslation("Full name", selectedLanguage);
  const countryLabel = useAutoTranslation("Country", selectedLanguage);
  const genderLabel = useAutoTranslation("Gender", selectedLanguage);
  const languageLabel = useAutoTranslation("Language", selectedLanguage);
  const dobLabel = useAutoTranslation("Date of Birth", selectedLanguage);
  const emailLabel = useAutoTranslation("Email Address", selectedLanguage);
  const translatedFullName = useAutoTranslation(formData.fullName || "Unknown", selectedLanguage);
  const translatedDateOfBirth = useAutoTranslation(formData.date_of_birth || "N/A", selectedLanguage);
  const translatedCountry = useAutoTranslation(formData.country || "Philippines", selectedLanguage);
  const translatedEmail = useAutoTranslation(formData.email || "Unknown", selectedLanguage);
  const translatedGender = useAutoTranslation(formData.gender || "Unknown", selectedLanguage);
  const translatedLanguage = useAutoTranslation(formData.language || "English", selectedLanguage);

  const deactivationDeletionLabel = useAutoTranslation("Deactivation and Deletion", selectedLanguage);
  const deactivateAccountLabel = useAutoTranslation("Deactivate account", selectedLanguage);
  const deactivateDesc = useAutoTranslation(
    "Temporarily hide your profile, uploaded artworks, and activity within the gallery. While deactivated, your content won't be visible to other users, but your data will be saved and can be restored at any time by reactivating your account.",
    selectedLanguage
  );
  const deactivateNote = useAutoTranslation(
    "Note: You can cancel deactivation within 30 days. After that, only reactivation is allowed.",
    selectedLanguage
  );

  const deactivateBtn = useAutoTranslation("Deactivate Account", selectedLanguage);
  const deleteAccountLabel = useAutoTranslation("Delete your data and account", selectedLanguage);
  const deleteDesc = useAutoTranslation(
    "Permanently remove your account from the system, including all uploaded artworks, favorites, exhibition history, and profile details. This action is irreversible and your data cannot be recovered once deleted.",
    selectedLanguage
  );
  const deleteBtn = useAutoTranslation("Delete Account", selectedLanguage);
  const loadingText = useAutoTranslation("Loading user details...", selectedLanguage);
  const errorText = useAutoTranslation("Error fetching user details.", selectedLanguage);

  useEffect(() => {
    if (!isLoading && !error) {
      let formattedDob = "";
      if (dateOfBirth) {
        const parsedDate = new Date(dateOfBirth);
        if (!isNaN(parsedDate.getTime())) {
          formattedDob = parsedDate.toISOString().split("T")[0];
        }
      }

      const newFormData = {
        fullName: `${firstName || "Unknown"} ${lastName || ""}`.trim(),
        gender: gender || "Unknown",
        date_of_birth: formattedDob || "",
        email: email || "Unknown",
        country: "Philippines",
        language: selectedLanguage,
      };

      setFormData(newFormData);
      setOriginalData(newFormData);
    }
  }, [firstName, lastName, gender, dateOfBirth, email, isLoading, error]);

  const handleChange = (field: string, value: string | Date) => {
    if (field === "date_of_birth" && value instanceof Date) {
      value = value.toISOString().split("T")[0];
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (!isValidFullName(formData.fullName)) {
      toast.error("Please enter a valid full name!", { closeButton: true });
      return;
    }

    if (!isValidEmail(formData.email)) {
      toast.error("Please enter a valid email address.", { closeButton: true });
      return;
    }

    const [updatedFirstName, ...rest] = formData.fullName.split(" ");
    const updatedLastName = rest.join(" ");
    const formattedDob = formData.date_of_birth;

    const form = new FormData();
    form.append("first_name", updatedFirstName);
    form.append("last_name", updatedLastName);
    form.append("gender", formData.gender);
    form.append("email", formData.email);
    form.append("date_of_birth", formattedDob);

    const loadingToast = toast("Updating your details...", {
      description: "Please wait while we process your update.",
    });

    updateUser([userId, form], {
      onSuccess: () => {
        setOriginalData({ ...formData });
        toast.success("User details updated successfully!", { closeButton: true });
        toast.dismiss(loadingToast);
      },
      onError: () => {
        toast.error("Failed to update user details.", { closeButton: true });
        toast.dismiss(loadingToast);
      },
    });
  };

  const handleReset = () => {
    setFormData({ ...originalData });
  };

  const hasChanges = () => JSON.stringify(formData) !== JSON.stringify(originalData);

  if (isLoading) return <div>{loadingText}</div>;
  if (error) return <div className="text-red-500">{errorText}</div>;

  return (
    <div>
      <h2 className="text-sm font-bold mb-6">{accountInfoLabel}</h2>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
          <EditableField
            label={fullNameLabel}
            value={translatedFullName}
            type="text"
            onChange={(value) => handleChange("fullName", value)}
          />
          <EditableField
            label={countryLabel}
            value={translatedCountry}
            type="country"
            onChange={(value) => handleChange("country", value)}
          />
          <EditableField
            label={genderLabel}
            value={translatedGender}
            type="gender"
            onChange={(value) => handleChange("gender", value)}
          />
          <EditableField
            label={languageLabel}
            value={translatedLanguage}
            type="language"
            onChange={(value) => handleChange("language", value)}
          />
          <EditableField
            label={dobLabel}
            value={translatedDateOfBirth}
            type="date"
            onChange={(value) => handleChange("date_of_birth", value)}
          />
          <EditableField
            label={emailLabel}
            value={translatedEmail}
            type="email"
            onChange={(value) => handleChange("email", value)}
          />
        </div>
      </div>

      {/* Deactivation and Deletion */}
      <div className="mt-12">
        <h2 className="text-sm font-bold mb-6">{deactivationDeletionLabel}</h2>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {/* Deactivate Section */}
          <h3 className="text-xs font-semibold mb-2">{deactivateAccountLabel}</h3>
          <div className="grid grid-cols-2 gap-10">
            <div>
              <p className="text-gray-600 text-[11px] mb-2">{deactivateDesc}</p>
              <p className="text-[10px] text-gray-400 italic">{deactivateNote}</p>
            </div>
            <button
              onClick={() => setShowDeactivatePopup(true)}
              className="bg-gray-200 font-medium text-[10px] hover:bg-gray-300 text-gray-800 rounded-sm w-32 h-9"
            >
              {deactivateBtn}
            </button>
          </div>

          {/* Delete Section */}
          <div className="mt-8">
            <h3 className="text-xs font-semibold mb-2">{deleteAccountLabel}</h3>
            <div className="grid grid-cols-2 gap-10">
              <p className="text-gray-600 mb-4 text-[11px]">{deleteDesc}</p>
              <button
                onClick={() => setShowDeletePopup(true)}
                className="bg-gray-200 font-medium text-[10px] hover:bg-gray-300 text-gray-800 rounded-sm w-32 h-9"
              >
                {deleteBtn}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ActionButtons hasChanges={hasChanges()} onSave={handleSave} onReset={handleReset} />

      {/* Popups */}
      <DeactivateConfirmationPopup
        isOpen={showDeactivatePopup}
        onCancel={() => setShowDeactivatePopup(false)}
        onConfirm={() => {
          setShowDeactivatePopup(false);

          deactivateAccount({
            userId,
            data: {
              user_status: "deactivated",
              deactivated_at: new Date().toISOString(),
            },
          });
        }}
        user={{ userStatus: userStatus }}
        setUser={(updatedUser) => {
          if (updatedUser.userStatus === "active") {
            deactivateAccount(
              {
                userId,
                data: {
                  user_status: "active",
                  deactivated_at: undefined,
                },
              },
              {
                onSuccess: () => {
                  setShowDeactivatePopup(false);
                },
                onError: () => {
                  // Error handling is done in the hook
                },
              }
            );
          }
        }}
      />

      <DeleteConfirmationPopup
        isOpen={showDeletePopup}
        onCancel={() => setShowDeletePopup(false)}
        onConfirm={() => {
          toast.success("Your account has been deleted successfully.", { closeButton: true });
          setShowDeletePopup(false);
        }}
      />
    </div>
  );
};

export default AccountDetails;
