import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/user_dashboard/navbar/Header";
import { Footer } from "@/components/user_dashboard/footer/Footer";
import ProfileHeader from "@/components/user_dashboard/user_profile/components/ProfileHeader";
import ProfileTabs from "@/components/user_dashboard/user_profile/components/ProfileTabs";
import ArtGrid from "@/components/user_dashboard/user_profile/components/ArtGrid";
import useUserDetails from "@/hooks/users/useUserDetails";
import useArtworks from "@/hooks/artworks/fetch_artworks/useArtworks";

const Index = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("created");
  const { firstName, lastName, profilePicture, cover_photo } = useUserDetails(id);
  const userName = `${firstName} ${lastName}`;

  const { data, isLoading } = useArtworks(1, id, true, "specific-user");
  const [createdArtworksCount, setCreatedArtworksCount] = useState(0);

  useEffect(() => {
    if (!isLoading && data) {
      const userArtworks = data.filter((artwork) => artwork.artistId === id && artwork.visibility === "public");
      setCreatedArtworksCount(userArtworks.length);
    }
  }, [id, data, isLoading]);
  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 pt-20">
        <ProfileHeader
          cover={cover_photo}
          profileImage={profilePicture}
          name={userName}
          items={createdArtworksCount}
          profileUserId={id}
        />
        <ProfileTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setCreatedArtworksCount={setCreatedArtworksCount}
        />
        <ArtGrid activeTab={activeTab} />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
