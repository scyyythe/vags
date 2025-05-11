import React, { useState, useEffect } from "react";
import EditableField from "../components/EditableField";
import ActionButtons from "../components/ActionButtons";
import useUserDetails from "@/hooks/users/useUserDetails";
import { getLoggedInUserId } from "@/auth/decode";
import useUpdateUserDetails from "@/hooks/mutate/users/useUserMutate";

const AccountDetails = () => {
  const userId = getLoggedInUserId();
  const { firstName, lastName, gender, address, dateOfBirth, email, isLoading, error } = useUserDetails(userId);
  const { mutate: updateUser } = useUpdateUserDetails();

  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    country: "Philippines",
    date_of_birth: "",
    language: "English",
    email: "",
  });

  const [originalData, setOriginalData] = useState({ ...formData });
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
        date_of_birth: formattedDob || "Unknown",
        email: email || "Unknown",
        country: "Philippines",
        language: "English",
      };

      setFormData(newFormData);
      setOriginalData(newFormData);
    }
  }, [firstName, lastName, gender, dateOfBirth, email, isLoading, error]);

  const handleChange = (field: string, value: string | Date) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (!formData) return;

    const [updatedFirstName, ...rest] = formData.fullName.split(" ");
    const updatedLastName = rest.join(" ");

    const formattedDob = formData.date_of_birth;

    updateUser([
      userId,
      {
        first_name: updatedFirstName,
        last_name: updatedLastName,
        gender: formData.gender,
        email: formData.email,
        date_of_birth: formattedDob,
      },
    ]);

    setOriginalData({ ...formData });
  };

  const handleReset = () => {
    setFormData({ ...originalData });
  };

  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  if (isLoading) {
    return <div>Loading user details...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error fetching user details.</div>;
  }

  return (
    <div>
      <h2 className="text-sm font-bold mb-6">Account Information</h2>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
          <EditableField
            label="Full name"
            value={formData.fullName}
            type="text"
            onChange={(value) => handleChange("fullName", value)}
          />

          <EditableField
            label="Country"
            value={formData.country}
            type="country"
            onChange={(value) => handleChange("country", value)}
          />

          <EditableField
            label="Gender"
            value={formData.gender}
            type="gender"
            onChange={(value) => handleChange("gender", value)}
          />

          <EditableField
            label="Language"
            value={formData.language}
            type="language"
            onChange={(value) => handleChange("language", value)}
          />

          <EditableField
            label="Date of Birth"
            value={formData.date_of_birth}
            type="date"
            onChange={(value) => handleChange("date_of_birth", value)}
          />

          <EditableField
            label="Email Address"
            value={formData.email}
            type="email"
            onChange={(value) => handleChange("email", value)}
          />
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-sm font-bold mb-6">Deactivation and Deletion</h2>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xs font-semibold mb-2">Deactivate account</h3>
          <div className="grid grid-cols-2 gap-10">
            <p className="text-gray-600 mb-4 text-[11px]">
              Temporarily hide your profile, uploaded artworks, and activity within the gallery. While deactivated, your
              content won't be visible to other users, but your data will be saved and can be restored at any time by
              reactivating your account.
            </p>
            <button className="bg-gray-200 font-medium text-[10px] hover:bg-gray-300 text-gray-800 p-none rounded-sm w-32 h-9 whitespace-nowrap">
              Deactivate Account
            </button>
          </div>

          <div>
            <h3 className="text-xs font-semibold mb-2">Delete your data and account</h3>
            <div className="grid grid-cols-2 gap-10">
              <p className="text-gray-600 mb-4 text-[11px]">
                Permanently remove your account from the system, including all uploaded artworks, favorites, exhibition
                history, and profile details. This action is irreversible and your data cannot be recovered once
                deleted.
              </p>
              <button className="bg-gray-200 font-medium text-[10px] hover:bg-gray-300 text-gray-800 rounded-sm w-32 h-9">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      <ActionButtons hasChanges={hasChanges()} onSave={handleSave} onReset={handleReset} />
    </div>
  );
};

export default AccountDetails;
