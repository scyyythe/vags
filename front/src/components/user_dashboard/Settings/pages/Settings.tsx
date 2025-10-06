import React from "react"; 
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/user_dashboard/navbar/Header";
import ProfileHeader from "../components/ProfileHeader";
import SettingsTabs from "../components/SettingsTabs";
import { Footer } from "@/components/user_dashboard/footer/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { language: selectedLanguage } = useLanguage();
  const profileSettingsLabel = useAutoTranslation("Profile Settings", selectedLanguage);

  React.useEffect(() => {
    if (location.pathname === "/settings") {
      navigate("/settings/account-details");
    }
  }, [navigate, location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="pt-20 pb-6 border">

        <main className="container">
          <h1 className="text-lg font-bold mb-4 text-left">{profileSettingsLabel}</h1>

          <ProfileHeader
            name="Angel Canete"
            email="angelcanete5@gmail.com"
            imageUrl="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3"
          />

          <div className="mt-6">
            <SettingsTabs />
          </div>

          <div className="mt-6">
            <Outlet />
          </div>
        </main>

      </div>

      <Footer />
    </div>
  );
};

export default Settings;
