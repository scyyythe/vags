import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Eye, Heart, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ExhibitMenu from "@/components/user_dashboard/Exhibit/menu/ExhibitMenu";
import Menu from "@/components/user_dashboard/own_profile/menu/exhibit_card/Menu";
import useExhibitReport from "@/hooks/mutate/report/useExhibitReport";
import { useDeleteExhibit } from "@/hooks/exhibit/useDeleteExhibit";
import { useRestoreExhibit } from "@/hooks/exhibit/useRestoreExhibit";
import { getLoggedInUserId } from "@/auth/decode";
import useExhibitReportStatus from "@/hooks/mutate/report/useExhibitReportStatus";
import { useToggleHideExhibit } from "@/hooks/exhibit/useToggleHideExhibit";
import { useToggleVisibilityExhibit } from "@/hooks/exhibit/useToggleVisibilityExhibit";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
interface ExhibitProps {
  exhibit: {
    id: string;
    title: string;
    description: string;
    image: string;
    category: string;
    likes: number;
    views: number;
    isSolo: boolean;
    isShared: boolean;
    startDate?: string;
    endDate?: string;
    ownerId: string;
    visibility?: string;
    userRole?: "owner" | "collaborator" | null;
    targetUserRole?: "owner" | "collaborator" | null;
    collaborators?: {
      id: string;
      name: string;
      avatar?: string;
    }[];
  };
  onClick?: () => void;
  isOwnProfile?: boolean;
}

const ExhibitCard: React.FC<ExhibitProps> = ({ exhibit, onClick, isOwnProfile = false }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const { language } = useLanguage();

  // Translation hooks for all text content
  const exhibitNotAvailableText = useAutoTranslation("Exhibit not available yet", language);
  const endedText = useAutoTranslation("ENDED", language);
  const dayText = useAutoTranslation("day", language);
  const daysText = useAutoTranslation("days", language);
  const leftText = useAutoTranslation("left", language);
  const ongoingText = useAutoTranslation("ONGOING", language);
  const ownerText = useAutoTranslation("Owner", language);
  const collaboratorText = useAutoTranslation("Collaborator", language);
  const deleteConfirmText = useAutoTranslation("Are you sure you want to delete this exhibit?", language);
  const movedToTrashText = useAutoTranslation("Exhibit moved to trash", language);
  const permanentlyDeletedText = useAutoTranslation("Exhibit permanently deleted", language);
  const deletedSuccessfullyText = useAutoTranslation("Exhibit deleted successfully", language);
  const alreadyReportedText = useAutoTranslation("You have already reported this exhibit.", language);
  const inappropriateContentText = useAutoTranslation("Inappropriate Content", language);
  const prohibitedContentText = useAutoTranslation("The exhibit contains prohibited content", language);

  // Translation hooks for dynamic content
  const translatedTitle = useAutoTranslation(exhibit.title, language);
  const translatedDescription = useAutoTranslation(exhibit.description, language);
  const translatedCategory = useAutoTranslation(exhibit.category, language);

  // Debug logging
  console.log("ExhibitCard Debug:", {
    title: exhibit.title,
    isShared: exhibit.isShared,
    isOwnProfile,
    userRole: exhibit.userRole,
    targetUserRole: exhibit.targetUserRole,
    shouldShowBadge:
      exhibit.isShared &&
      ((isOwnProfile && exhibit.userRole === "collaborator") || (!isOwnProfile && exhibit.targetUserRole)),
  });

  const navigate = useNavigate();

  const { mutate: deleteExhibit } = useDeleteExhibit();
  const { mutate: restoreExhibit } = useRestoreExhibit();
  const { mutate: submitExhibitReport } = useExhibitReport();
  const { mutate: toggleHideExhibit } = useToggleHideExhibit();
  const { mutate: toggleVisibilityExhibit } = useToggleVisibilityExhibit();

  const { data: reportStatusData } = useExhibitReportStatus(exhibit.id);
  const isReported = reportStatusData?.reported;
  const isOwner = getLoggedInUserId() === exhibit.ownerId;

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
    return num.toString();
  };

  const collaborators = exhibit.collaborators || [];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  };

  const isNotStartedYet = () => {
    const now = new Date();
    const start = exhibit.startDate ? new Date(exhibit.startDate) : null;
    return start && now < start;
  };

  const getDurationLabel = () => {
    const now = new Date();
    const start = exhibit.startDate ? new Date(exhibit.startDate) : null;
    const end = exhibit.endDate ? new Date(exhibit.endDate) : null;

    if (start && now < start) {
      const startFormatted = start.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" });
      const endFormatted = end?.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" });
      return `${startFormatted} - ${endFormatted}`;
    }

    if (end && now > end) return endedText;

    if (start && end && now >= start && now <= end) {
      const timeDiff = end.getTime() - now.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      return daysLeft <= 5 ? `${daysLeft} ${daysLeft > 1 ? daysText : dayText} ${leftText}` : ongoingText;
    }

    return ongoingText;
  };

  return (
    <div
      className={`relative w-full rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 transition-all duration-300 ${
        isNotStartedYet() ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:shadow-lg"
      }`}
      onClick={() => {
        if (!isNotStartedYet() && onClick) onClick();
      }}
      onMouseEnter={() => isNotStartedYet() && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {showTooltip && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-gray-800 dark:bg-gray-900 text-white text-[10px] px-2 py-1 rounded-md shadow-md whitespace-nowrap">
          {exhibitNotAvailableText}
        </div>
      )}

      <div className="relative">
        <img src={exhibit.image} alt={exhibit.title} className="w-full h-40 object-cover rounded-lg" />

        <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 rounded-full px-2 pb-0.5">
          <span className="text-[10px] font-medium text-gray-900 dark:text-gray-100">{translatedCategory}</span>
        </div>

        {!exhibit.isSolo && (
          <div className="absolute top-3 left-3 flex -space-x-2">
            {collaborators.slice(0, 3).map((collaborator) => (
              <Avatar key={collaborator.id} className="border border-white h-5 w-5">
                <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                <AvatarFallback>{getInitials(collaborator.name)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        )}

        <div className="absolute bottom-3 left-3 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 rounded-full px-2 py-1 flex items-center gap-1">
          <span className="text-[9px] font-semibold text-red-600 dark:text-red-400">{getDurationLabel()}</span>
        </div>

        <div className="absolute bottom-3 right-3 flex gap-2">
          <div className="flex items-center bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 rounded-full px-2 py-1">
            <Eye size={11} className="text-gray-700 dark:text-gray-300 mr-1" />
            <span className="text-[9px] font-medium text-gray-900 dark:text-gray-100">{formatNumber(exhibit.views)}</span>
          </div>
          <div className="flex items-center bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 rounded-full px-2 py-1">
            <Heart size={10} className="text-gray-700 dark:text-gray-300 mr-1" />
            <span className="text-[9px] font-medium text-gray-900 dark:text-gray-100">{formatNumber(exhibit.likes)}</span>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 rounded-b-lg">
        <div className="flex justify-between items-start relative">
          <div className="flex flex-col">
            <h2 className="font-semibold text-xs text-gray-900 dark:text-gray-100">"{translatedTitle}"</h2>
            {exhibit.isShared &&
              ((isOwnProfile && exhibit.userRole === "collaborator") || (!isOwnProfile && exhibit.targetUserRole)) && (
                <span
                  className={`text-[8px] px-1.5 py-0.5 rounded-full mt-1 inline-block w-fit ${
                    (isOwnProfile ? exhibit.userRole : exhibit.targetUserRole) === "owner"
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      : "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                  }`}
                >
                  {(isOwnProfile ? exhibit.userRole : exhibit.targetUserRole) === "owner" ? ownerText : collaboratorText}
                </span>
              )}
          </div>

          <div className="relative bottom-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <MoreHorizontal size={13} className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white" />
            </button>

            {menuOpen &&
              (isOwner ? (
                <Menu
                  isOpen={menuOpen}
                  artworkId={exhibit.id}
                  artworkTitle={exhibit.title}
                  isShared={false}
                  isPublic={true}
                  visibility={exhibit.visibility}
                  onEdit={(id) => {
                    const searchParams = new URLSearchParams({ mode: "edit" });
                    navigate(`/edit-exhibit/${id}?${searchParams.toString()}`);
                  }}
                  onToggleVisibility={(newVisibility, id) => {
                    toggleVisibilityExhibit(id);
                  }}
                  onViewInsights={(id) => console.log("View insights for:", id)}
                  onDelete={(id) => {
                    if (confirm(deleteConfirmText)) {
                      deleteExhibit(id, {
                        onSuccess: (data: { detail: string }) => {
                          if (data.detail.includes("trash")) {
                            toast.success(movedToTrashText);
                          } else if (data.detail.includes("permanently")) {
                            toast.success(permanentlyDeletedText);
                          } else {
                            toast.success(deletedSuccessfullyText);
                          }
                        },
                      });
                    }
                  }}
                  onRestore={(id) => {
                    restoreExhibit(id);
                  }}
                  className="-left-1.5 top-5"
                />
              ) : (
                <ExhibitMenu
                  exhibitId={exhibit.id}
                  isOpen={menuOpen}
                  onHide={() => {
                    toggleHideExhibit(exhibit.id, {
                      onSuccess: () => {
                        setMenuOpen(false);
                      },
                    });
                  }}
                  onReport={() => {
                    if (reportStatusData?.reported) {
                      toast.error(alreadyReportedText, { closeButton: true });
                    } else {
                      submitExhibitReport({
                        exhibit_id: exhibit.id,
                        category: inappropriateContentText,
                        description: prohibitedContentText,
                      });
                    }
                    setMenuOpen(false);
                  }}
                  isShared={exhibit.isShared}
                  isHidden={false}
                  isReported={isReported}
                  className="-right-1.5 top-5"
                />
              ))}
          </div>
        </div>

        <p className="text-[9px] text-gray-600 dark:text-gray-300 line-clamp-2">{translatedDescription}</p>
      </div>
    </div>
  );
};

export default ExhibitCard;
