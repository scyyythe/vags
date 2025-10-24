import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import Header from "@/components/user_dashboard/navbar/Header";
import { Footer } from "@/components/user_dashboard/footer/Footer";
import ProfileHeader from "@/components/user_dashboard/user_profile/components/ProfileHeader";
import ProfileTabs from "@/components/user_dashboard/user_profile/components/ProfileTabs";
import ArtGrid from "@/components/user_dashboard/user_profile/components/ArtGrid";
import useUserDetails from "@/hooks/users/useUserDetails";
import useArtworks from "@/hooks/artworks/fetch_artworks/useArtworks";
import useOwnedArtworksCount from "@/hooks/artworks/fetch_artworks/useOwnedArtworksCount ";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

const Index = () => {
  const { id } = useParams();
  const location = useLocation();

  // Initialize with saved tab or default to "created"
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem("lastActiveTab") || "created";
  });

  // Language and translation
  const { language } = useLanguage();

  const { firstName, lastName, profilePicture, cover_photo, email } = useUserDetails(id);
  
  // Translation for fetched user data
  const translatedFirstName = useAutoTranslation(firstName || "", language);
  const translatedLastName = useAutoTranslation(lastName || "", language);
  const userName = `${translatedFirstName} ${translatedLastName}`;
  
  const ownedArtworksCount = useOwnedArtworksCount(id!);
  const { data, isLoading } = useArtworks(1, id, true, "specific-user");
  const [createdArtworksCount, setCreatedArtworksCount] = useState(0);

  useEffect(() => {
    if (!isLoading && data) {
      const userArtworks = data.filter(
        (artwork) => artwork.artistId === id && artwork.visibility === "public"
      );
      setCreatedArtworksCount(userArtworks.length);
    }
  }, [id, data, isLoading]);

  // Update tab if redirected with a specific tab
  useEffect(() => {
    const { state } = location as { state?: { activeTab?: string } };
    if (state?.activeTab) {
      setActiveTab(state.activeTab);
    }
  }, [location.state]);

  // Save the last active tab before leaving
  useEffect(() => {
    sessionStorage.setItem("lastActiveTab", activeTab);
  }, [activeTab]);

  return (
    <>
      <div className="min-h-screen flex flex-col dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 pt-20">
          <ProfileHeader
            cover={cover_photo}
            profileImage={profilePicture}
            name={userName}
            email={email}
            items={ownedArtworksCount}
            profileUserId={id}
          />
          <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          <ArtGrid activeTab={activeTab} />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Index;
