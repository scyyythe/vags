import React, { useState } from "react";
import { X, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ReportCategory = {
  id: string;
  title: string;
  description: string;
  options?: ReportOption[];
};

type ReportOption = {
  id: string;
  text: string;
  additionalInfo?: string;
};

interface ReportOptionsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (category: string, option?: string) => void;
}

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
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | null>(null);
  const [selectedOption, setSelectedOption] = useState<ReportOption | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [customReason, setCustomReason] = useState<string>("");


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

  const normalizeReportType = (optionId: string | undefined, categoryId: string): string => {
    const map: Record<string, string> = {
      Nudity: "offensive",
      Hate: "offensive",
      Violence: "offensive",
      Harassment: "offensive",
      Copyright: "plagiarism",
      Trademark: "plagiarism",
      Plagiarism: "plagiarism",
      Fake: "fraud",
      Scam: "fraud",
      SpamContent: "spam",
      SomethingElse: "other",
    };

    if (categoryId === "Other") return "other";

    return optionId ? (map[optionId] || "other") : categoryId.toLowerCase();
  };

  const handleSubmit = async (categoryId: string, optionId?: string) => {
    try {
      const finalOptionId =
        categoryId === "Other" && customReason.trim() ? customReason.trim() : optionId;

      const normalizedType = normalizeReportType(optionId, categoryId);
      await onSubmit(normalizedType, finalOptionId);

      toast.success("Report submitted successfully. Thank you for your feedback.");
      onClose();
      setCustomReason("");
    } catch (error) {
      toast.error("Failed to submit report. Please try again.");
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
        <div className="bg-white rounded-lg w-full max-w-xs mx-4 overflow-hidden">
          <div className="flex items-center justify-between p-4 -mb-4">
            <div className="flex items-center gap-2">
              {(selectedCategory || showDetails) && (
                <button
                  onClick={handleBack}
                  className="px-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Back"
                >
                  <i className="bx bx-chevron-left text-sm text-black"></i>
                </button>
              )}
              <h2 className="text-xs text-black font-semibold">
                {showDetails ? "Additional Information" : selectedCategory ? selectedCategory.title : "Report Content"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors"
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>

          <div className="p-4 max-h-[60vh] overflow-y-auto">
            {showDetails && selectedOption ? (
              <div>
                <p className="text-black text-[10px] mb-4">{selectedOption.additionalInfo}</p>
                <button
                  onClick={openConfirmation}
                  className="w-full bg-red-800 hover:bg-red-700 text-white text-[10px] py-2 px-4 rounded-full transition-colors"
                >
                  Submit Report
                </button>
              </div>
            ) : selectedCategory ? (
              <>
                <p className="text-black text-[10px] mb-4">{selectedCategory.description}</p>
                {selectedCategory.options?.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(option)}
                    className="w-full text-left text-[10px] text-black p-3 mb-2 bg-gray-50 hover:bg-gray-100 rounded flex items-center justify-between"
                  >
                    <span>{option.text}</span>
                    <span className="text-black text-sm">›</span>
                  </button>
                ))}
                {!selectedCategory.options && (
                  <div className="space-y-2">
                    <textarea
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Describe the issue..."
                      className="w-full p-2 text-[10px] border rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300"
                      rows={3}
                    />
                    <button
                      onClick={openConfirmation}
                      disabled={!customReason.trim()}
                      className="w-full bg-red-800 hover:bg-red-700 text-white text-[10px] py-2 px-4 rounded-full transition-colors disabled:opacity-50"
                    >
                      Submit Report
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
                  <span>{category.title}</span>
                  <span className="text-black text-sm">›</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <Dialog open={showConfirmation} onOpenChange={closeConfirmation}>
        <DialogContent className="w-full max-w-xs rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center mb-1 text-xs">Confirm Report Submission</DialogTitle>
            <DialogDescription className="w-full max-w-[270px] text-[10px] text-center text-black">
              Are you sure you want to report this content? This action cannot be easily undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="w-full max-w-xs flex justify-between items-center gap-6">
              <button className="border border-gray-600 rounded-full py-1 px-4 text-[10px]" onClick={closeConfirmation}>
                Cancel
              </button>
              <button
                className="bg-red-800 hover:bg-red-700 rounded-full py-1.5 px-4 text-white text-[10px] whitespace-nowrap"
                onClick={() => handleSubmit(selectedCategory?.id || "", selectedOption?.id)}
              >
                Report Content
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReportOptionsPopup;
