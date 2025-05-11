import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/user_dashboard/navbar/Header";
import { Footer } from "@/components/user_dashboard/footer/Footer";
import ProfileHeader from "@/components/user_dashboard/user_profile/components/ProfileHeader";
import ProfileTabs from "@/components/user_dashboard/user_profile/components/ProfileTabs";
import ArtGrid from "@/components/user_dashboard/user_profile/components/ArtGrid";
import useUserDetails from "@/hooks/users/useUserDetails";

const Index = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("created");
  const { firstName, lastName, profilePicture } = useUserDetails(id);
  const userName = `${firstName} ${lastName}`;
  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 pt-20">
        <ProfileHeader
          bannerImage="/lovable-uploads/91de0ca2-cd8a-42fb-8dbe-bad642960399.png"
          profileImage={profilePicture}
          name={userName}
          followers={99}
          following={50}
          items={15}
        />
        <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <ArtGrid activeTab={activeTab} />
      </div>
        <div>
          <Footer />
        </div>
    </div>
  );
};

export default Index;
