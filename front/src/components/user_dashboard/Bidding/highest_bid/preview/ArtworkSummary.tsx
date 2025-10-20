import { useParams } from "react-router-dom";
import { useFetchBiddingArtworkById } from "@/hooks/auction/useFetchAuctionDetails";
import { format } from "date-fns";
import ArtworkSummarySkeleton from "@/components/skeletons/artworks/ArtworkSummarySkeleton";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

// Helper component for translating dynamic text
const TranslatedText: React.FC<{ text: string }> = ({ text }) => {
  const { language } = useLanguage();
  const translatedText = useAutoTranslation(text, language);
  return <>{translatedText}</>;
};

export const ArtworkSummary: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: artworkData, error, isLoading } = useFetchBiddingArtworkById(id);
  const { language } = useLanguage();

  // Translation hooks for static text
  const errorLoadingArtworkText = useAutoTranslation("Error loading artwork", language);
  const noArtworkFoundText = useAutoTranslation("No artwork found", language);
  const byText = useAutoTranslation("by", language);
  const finalArtworkAmountText = useAutoTranslation("Final artwork amount", language);
  const auctionEndedText = useAutoTranslation("Auction ended", language);

  if (isLoading) {
    return <ArtworkSummarySkeleton />;
  }
  if (error) {
    return <div className="text-red-600">{errorLoadingArtworkText}: {error.message}</div>;
  }
  if (!artworkData) {
    return (
      <div className="flex flex-col items-center justify-center col-span-full text-center p-4">
        <img src="/pics/empty.png" alt="No artwork" className="w-48 h-48 mb-4 opacity-80" />
        <p className="text-xs text-gray-500">{noArtworkFoundText}</p>
      </div>
    );
  }
  const formattedDate = format(new Date(artworkData.end_time), "MMMM d, yyyy 'at' h:mm a");
  return (
    <div className="overflow-hidden flex justify-center items-center w-full">
      <div className="flex flex-col md:flex-row justify-center items-center p-4 md:pl-32">
        <div className="w-full md:w-[600px] h-72 md:h-[260px] relative rounded-xl md:mr-6">
          <img
            src={Array.isArray(artworkData.artwork.image_url) ? artworkData.artwork.image_url[0] : artworkData.artwork.image_url}
            alt={artworkData.artwork.title}
            className="object-cover w-full h-full rounded-xl shadow-md"
          />
        </div>

        <div className="w-full md:w-2/3 px-4 py-5 text-center md:text-left">
          <h2 className="text-sm md:text-lg font-bold text-gray-900 mb-0.5">
            <TranslatedText text={artworkData.artwork.title} />
          </h2>
          <p className="text-[10px] text-gray-600">
            {byText} <TranslatedText text={artworkData.artwork.artist} />
          </p>

          {artworkData.artwork.description && (
            <div className="mt-4 text-gray-600">
              <p className="text-[11px] line-clamp-3">
                "<TranslatedText text={artworkData.artwork.description} />"
              </p>
            </div>
          )}

          <div className="my-6">
            <p className="text-[11px] text-gray-500 mb-1">{finalArtworkAmountText}</p>
            <p className="text-lg font-bold text-red-700">₱ {artworkData.highest_bid.amount.toLocaleString()}</p>
          </div>

          <div className="my-4">
            <p className="text-[11px] text-gray-500 mb-1">{auctionEndedText}</p>
            <p className="text-xs text-gray-700">{formattedDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
