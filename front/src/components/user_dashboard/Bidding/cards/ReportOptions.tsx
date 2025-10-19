import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

type ReportCategory = {
  id: string;
  title: string;
  description: string;
  options?: ReportOption[];
};

export type ReportOption = {
  id: string;
  text: string;
  additionalInfo?: string;
};

interface ReportOptionsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (category: string, option?: ReportOption | string) => void;
}

export const normalizeReportType = (optionId: string | undefined, categoryId: string): string => {
  const map: Record<string, string> = {
    Nudity: "Inappropriate",
    Hate: "Inappropriate",
    Violence: "Inappropriate",
    Harassment: "Inappropriate",
    Copyright: "Intellectual",
    Trademark: "Intellectual",
    Plagiarism: "Intellectual",
    Fake: "Fraud",
    Scam: "Fraud",
    SpamContent: "Spam",
    SomethingElse: "Other",
  };

  if (categoryId === "Other") return "Other";

  return optionId ? map[optionId] || "Other" : categoryId;
};

export const reportCategories: ReportCategory[] = [
  {
    id: "Inappropriate",
    title: "Inappropriate Content",
    description: "Report content that you find offensive or inappropriate",
    options: [
      { id: "Nudity", text: "Nudity or sexual content", additionalInfo: "Content that contains explicit material" },
      { id: "Hate", text: "Hate speech or symbols", additionalInfo: "Content that promotes hate or discrimination" },
      {
        id: "Violence",
        text: "Violence or dangerous acts",
        additionalInfo: "Content that depicts extreme violence or encourages harmful behavior",
      },
      {
        id: "Harassment",
        text: "Harassment or bullying",
        additionalInfo: "Content that targets individuals for abuse",
      },
    ],
  },
  {
    id: "Intellectual",
    title: "Intellectual Property Violation",
    description: "Report content that infringes on your intellectual property rights",
    options: [
      {
        id: "Copyright",
        text: "Copyright infringement",
        additionalInfo: "Content that uses your copyrighted work without permission",
      },
      {
        id: "Trademark",
        text: "Trademark violation",
        additionalInfo: "Content that misuses your registered trademark",
      },
      {
        id: "Plagiarism",
        text: "Plagiarism",
        additionalInfo: "Content that copies or closely imitates another's work or ideas without proper attribution",
      },
    ],
  },
  {
    id: "Fraud",
    title: "Scam or Fraud",
    description: "Report content that may be deceptive or fraudulent",
    options: [
      { id: "Fake", text: "Fake engagement", additionalInfo: "Content with artificially inflated metrics" },
      {
        id: "Scam",
        text: "Scam or misleading content",
        additionalInfo: "Content designed to deceive or defraud users",
      },
    ],
  },
  {
    id: "Spam",
    title: "Spam",
    description: "Report irrelevant or repetitive content",
    options: [
      {
        id: "SpamContent",
        text: "Spam or misleading promotion",
        additionalInfo: "Content that appears irrelevant, repetitive, or promotional",
      },
    ],
  },
  {
    id: "Other",
    title: "Something Else",
    description: "Report any other issues not covered by the categories above",
  },
];

const ReportOptionsPopup: React.FC<ReportOptionsPopupProps> = ({ isOpen, onClose, onSubmit }) => {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | null>(null);
  const [selectedOption, setSelectedOption] = useState<ReportOption | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [customReason, setCustomReason] = useState<string>("");

  // Translation hooks - Main UI
  const reportContentText = useAutoTranslation("Report Content", language);
  const additionalInfoText = useAutoTranslation("Additional Information", language);
  const backText = useAutoTranslation("Back", language);
  const closeText = useAutoTranslation("Close", language);
  const submitReportText = useAutoTranslation("Submit Report", language);
  const describeIssueText = useAutoTranslation("Describe the issue...", language);
  const confirmReportText = useAutoTranslation("Confirm Report Submission", language);
  const confirmDescText = useAutoTranslation("Are you sure you want to report this content? This action cannot be easily undone.", language);
  const selectCategoryText = useAutoTranslation("Please select a category.", language);
  const provideReasonText = useAutoTranslation("Please provide a reason for reporting.", language);
  const failedSubmitText = useAutoTranslation("Failed to submit report. Please try again.", language);

  // Translation hooks - Report Categories
  const inappropriateContentText = useAutoTranslation("Inappropriate Content", language);
  const inappropriateDescText = useAutoTranslation("Report content that you find offensive or inappropriate", language);
  const intellectualPropertyText = useAutoTranslation("Intellectual Property Violation", language);
  const intellectualDescText = useAutoTranslation("Report content that infringes on your intellectual property rights", language);
  const scamOrFraudText = useAutoTranslation("Scam or Fraud", language);
  const scamDescText = useAutoTranslation("Report content that may be deceptive or fraudulent", language);
  const spamText = useAutoTranslation("Spam", language);
  const spamDescText = useAutoTranslation("Report irrelevant or repetitive content", language);
  const somethingElseText = useAutoTranslation("Something Else", language);
  const somethingElseDescText = useAutoTranslation("Report any other issues not covered by the categories above", language);

  // Translation hooks - Report Options
  const nudityText = useAutoTranslation("Nudity or sexual content", language);
  const nudityInfoText = useAutoTranslation("Content that contains explicit material", language);
  const hateText = useAutoTranslation("Hate speech or symbols", language);
  const hateInfoText = useAutoTranslation("Content that promotes hate or discrimination", language);
  const violenceText = useAutoTranslation("Violence or dangerous acts", language);
  const violenceInfoText = useAutoTranslation("Content that depicts extreme violence or encourages harmful behavior", language);
  const harassmentText = useAutoTranslation("Harassment or bullying", language);
  const harassmentInfoText = useAutoTranslation("Content that targets individuals for abuse", language);
  const copyrightText = useAutoTranslation("Copyright infringement", language);
  const copyrightInfoText = useAutoTranslation("Content that uses your copyrighted work without permission", language);
  const trademarkText = useAutoTranslation("Trademark violation", language);
  const trademarkInfoText = useAutoTranslation("Content that misuses your registered trademark", language);
  const plagiarismText = useAutoTranslation("Plagiarism", language);
  const plagiarismInfoText = useAutoTranslation("Content that copies or closely imitates another's work or ideas without proper attribution", language);
  const fakeEngagementText = useAutoTranslation("Fake engagement", language);
  const fakeEngagementInfoText = useAutoTranslation("Content with artificially inflated metrics", language);
  const scamContentText = useAutoTranslation("Scam or misleading content", language);
  const scamContentInfoText = useAutoTranslation("Content designed to deceive or defraud users", language);
  const spamPromotionText = useAutoTranslation("Spam or misleading promotion", language);
  const spamPromotionInfoText = useAutoTranslation("Content that appears irrelevant, repetitive, or promotional", language);

  // Disable page scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCategorySelect = (category: ReportCategory) => {
    setSelectedCategory(category);
    setSelectedOption(null);
    if (!category.options || category.options.length === 0) {
      setShowDetails(true);
    }
  };

  const handleOptionSelect = (option: ReportOption) => {
    setSelectedOption(option);
    setShowDetails(true);
  };

  // Helper function to get translated category
  const getCategoryTranslation = (category: ReportCategory) => {
    switch (category.id) {
      case "Inappropriate":
        return { title: inappropriateContentText, description: inappropriateDescText };
      case "Intellectual":
        return { title: intellectualPropertyText, description: intellectualDescText };
      case "Fraud":
        return { title: scamOrFraudText, description: scamDescText };
      case "Spam":
        return { title: spamText, description: spamDescText };
      case "Other":
        return { title: somethingElseText, description: somethingElseDescText };
      default:
        return { title: category.title, description: category.description };
    }
  };

  // Helper function to get translated option
  const getOptionTranslation = (option: ReportOption) => {
    switch (option.id) {
      case "Nudity":
        return { text: nudityText, additionalInfo: nudityInfoText };
      case "Hate":
        return { text: hateText, additionalInfo: hateInfoText };
      case "Violence":
        return { text: violenceText, additionalInfo: violenceInfoText };
      case "Harassment":
        return { text: harassmentText, additionalInfo: harassmentInfoText };
      case "Copyright":
        return { text: copyrightText, additionalInfo: copyrightInfoText };
      case "Trademark":
        return { text: trademarkText, additionalInfo: trademarkInfoText };
      case "Plagiarism":
        return { text: plagiarismText, additionalInfo: plagiarismInfoText };
      case "Fake":
        return { text: fakeEngagementText, additionalInfo: fakeEngagementInfoText };
      case "Scam":
        return { text: scamContentText, additionalInfo: scamContentInfoText };
      case "SpamContent":
        return { text: spamPromotionText, additionalInfo: spamPromotionInfoText };
      default:
        return { text: option.text, additionalInfo: option.additionalInfo || "" };
    }
  };

  const handleSubmit = async () => {
    if (!selectedCategory) {
      toast.error(selectCategoryText, { closeButton: true })
      return;
    }

    if (selectedCategory.id === "Other" && !customReason.trim()) {
      toast.error(provideReasonText, { closeButton: true })
      return;
    }

    const categoryId = selectedCategory.id;
    const optionId = selectedOption?.id;

    const finalOptionId = categoryId === "Other" && customReason.trim() ? customReason.trim() : optionId;
    const normalizedType = normalizeReportType(optionId, categoryId);

    try {
      await onSubmit(normalizedType, finalOptionId);

      onClose();
      setCustomReason("");
    } catch {
      toast.error(failedSubmitText, { closeButton: true })
    } finally {
      setShowConfirmation(false);
    }
  };

  const openConfirmation = () => {
    setShowConfirmation(true);
  };

  const closeConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleBack = () => {
    if (showDetails) {
      if (selectedCategory?.id === "Other") {
        setShowDetails(false);
        setSelectedCategory(null);
        setCustomReason("");
      } else {
        setShowDetails(false);
      }
    } else if (selectedCategory) {
      setSelectedCategory(null);
    } else {
      onClose();
    }
  };

  return (
    <>
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <div className="bg-white rounded-lg w-full max-w-md mx-4 overflow-hidden">
          <div className="flex items-center justify-between p-4 -mb-4">
            <div className="flex items-center gap-2">
              {(selectedCategory || showDetails) && (
                <button
                  onClick={handleBack}
                  className="px-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label={backText}
                >
                  <i className="bx bx-chevron-left text-sm text-black"></i>
                </button>
              )}
              <h2 className="text-xs text-black font-semibold">
                {showDetails ? additionalInfoText : selectedCategory ? getCategoryTranslation(selectedCategory).title : reportContentText}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors"
              aria-label={closeText}
            >
              <X size={15} />
            </button>
          </div>

          <div className="p-4 max-h-[60vh] overflow-y-auto">
            {showDetails && selectedOption ? (
              <div>
                <p className="text-black text-[10px] mb-4">{getOptionTranslation(selectedOption).additionalInfo}</p>
                <button
                  onClick={openConfirmation}
                  className="w-full bg-red-800 hover:bg-red-700 text-white text-[10px] py-2 px-4 rounded-full transition-colors"
                >
                  {submitReportText}
                </button>
              </div>
            ) : selectedCategory ? (
              <>
                <p className="text-black text-[10px] mb-4">{getCategoryTranslation(selectedCategory).description}</p>
                {selectedCategory.options?.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(option)}
                    className="w-full text-left text-[10px] text-black p-3 mb-2 bg-gray-50 hover:bg-gray-100 rounded flex items-center justify-between"
                  >
                    <span>{getOptionTranslation(option).text}</span>
                    <span className="text-black text-sm">›</span>
                  </button>
                ))}
                {!selectedCategory.options && (
                  <div className="space-y-2">
                    <textarea
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder={describeIssueText}
                      className="w-full p-2 text-[10px] border rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300"
                      rows={3}
                    />
                    <button
                      onClick={openConfirmation}
                      disabled={!customReason.trim()}
                      className="w-full bg-red-800 hover:bg-red-700 text-white text-[10px] py-2 px-4 rounded-full transition-colors disabled:opacity-50"
                    >
                      {submitReportText}
                    </button>
                  </div>
                )}
              </>
            ) : (
              reportCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category)}
                  className="w-full text-left text-[10px] text-black p-3 mb-2 bg-gray-50 hover:bg-gray-100 rounded flex items-center justify-between"
                >
                  <span>{getCategoryTranslation(category).title}</span>
                  <span className="text-black text-sm">›</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <Dialog open={showConfirmation} onOpenChange={closeConfirmation}>
        <DialogContent className="w-full max-w-lg rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-center mb-1 text-xs">{confirmReportText}</DialogTitle>
            <DialogDescription className="w-full max-w-[450px] text-[10px] text-center text-black">
              {confirmDescText}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="w-full">
              {/* <button className="border border-gray-600 rounded-full py-1 px-4 text-[10px]" onClick={closeConfirmation}>
                Cancel
              </button> */}
              <button
                className="w-full bg-red-800 hover:bg-red-700 rounded-full py-1.5 px-4 text-white text-[10px] whitespace-nowrap"
                onClick={() => handleSubmit()}
              >
                {reportContentText}
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReportOptionsPopup;
