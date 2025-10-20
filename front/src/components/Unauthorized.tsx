import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { autoTranslate } from "@/utils/autoTranslate";

const ErrorPage = () => {
  const location = useLocation();
  const errorState = location.state || {};
  const { language } = useLanguage();

  const errorCode = errorState.code || 404;
  let errorMessage = errorState.message || "Not Found"; 

  if (errorCode === 401) {
    errorMessage = "You are unauthorized. Please login to access this page.";
  }

  // State for translated error message
  const [translatedErrorMessage, setTranslatedErrorMessage] = useState(errorMessage);

  // Translation hooks for static text
  const returnToGalleryText = useAutoTranslation("Return to Gallery", language);

  // Effect to translate error message
  useEffect(() => {
    const translateErrorMessage = async () => {
      try {
        if (language.toLowerCase() !== "en") {
          const translated = await autoTranslate(errorMessage, language.toLowerCase());
          setTranslatedErrorMessage(translated);
        } else {
          setTranslatedErrorMessage(errorMessage);
        }
      } catch (error) {
        console.warn("Failed to translate error message:", error);
        // Fallback to original message
        setTranslatedErrorMessage(errorMessage);
      }
    };

    translateErrorMessage();
  }, [errorMessage, language]);

  useEffect(() => {
    console.error(`${errorCode} Error: ${errorMessage} on route:`, location.pathname);
  }, [location.pathname, errorCode, errorMessage]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <div className="text-center max-w-md">
        <div className="mb-4 inline-block">
          <img src="/pics/logo.png" alt="logo" className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold mb-4">{errorCode}</h1>
        <p className="text-xs text-gray-400 mb-8">{translatedErrorMessage}</p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 bg-white text-black text-xs px-6 py-3 rounded-lg font-medium transition-all hover:bg-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{returnToGalleryText}</span>
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;
