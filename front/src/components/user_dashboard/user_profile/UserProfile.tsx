import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/user_dashboard/navbar/Header";
import { Footer } from "@/components/user_dashboard/footer/Footer";
import ProfileHeader from "@/components/user_dashboard/user_profile/components/ProfileHeader";
import ProfileTabs from "@/components/user_dashboard/user_profile/components/ProfileTabs";
import ArtGrid from "@/components/user_dashboard/user_profile/components/ArtGrid";
import useUserDetails from "@/hooks/users/useUserDetails";
import useArtworks from "@/hooks/artworks/fetch_artworks/useArtworks";
import useOwnedArtworksCount from "@/hooks/artworks/fetch_artworks/useOwnedArtworksCount ";
const Index = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("created");
  const { firstName, lastName, profilePicture, cover_photo } = useUserDetails(id);
  const userName = `${firstName} ${lastName}`;
  const ownedArtworksCount = useOwnedArtworksCount(id!);
  const { data, isLoading } = useArtworks(1, id, true, "specific-user");

  return (
    <>
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 pt-20">
          <ProfileHeader
            cover={cover_photo}
            profileImage={profilePicture}
            name={userName}
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
