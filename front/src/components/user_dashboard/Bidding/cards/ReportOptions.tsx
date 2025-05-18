import React, { useState } from "react";
import { X, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

const reportCategories: ReportCategory[] = [
  {
    id: "inappropriate",
    title: "Inappropriate Content",
    description: "Report content that you find offensive or inappropriate",
    options: [
      { id: "nudity", text: "Nudity or sexual content", additionalInfo: "Content that contains explicit material" },
      { id: "hate", text: "Hate speech or symbols", additionalInfo: "Content that promotes hate or discrimination" },
      { id: "violence", text: "Violence or dangerous acts", additionalInfo: "Content that depicts extreme violence or encourages harmful behavior" },
      { id: "harassment", text: "Harassment or bullying", additionalInfo: "Content that targets individuals for abuse" },
    ],
  },
  {
    id: "intellectual",
    title: "Intellectual Property Violation",
    description: "Report content that infringes on your intellectual property rights",
    options: [
      { id: "copyright", text: "Copyright infringement", additionalInfo: "Content that uses your copyrighted work without permission" },
      { id: "trademark", text: "Trademark violation", additionalInfo: "Content that misuses your registered trademark" },
    ],
  },
  {
    id: "fraud",
    title: "Scam or Fraud",
    description: "Report content that may be deceptive or fraudulent",
    options: [
      { id: "fake", text: "Fake engagement", additionalInfo: "Content with artificially inflated metrics" },
      { id: "scam", text: "Scam or misleading content", additionalInfo: "Content designed to deceive or defraud users" },
    ],
  },
  {
    id: "other",
    title: "Something Else",
    description: "Report any other issues not covered by the categories above",
  },
];

const ReportOptionsPopup: React.FC<ReportOptionsPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | null>(null);
  const [selectedOption, setSelectedOption] = useState<ReportOption | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCategorySelect = (category: ReportCategory) => {
    setSelectedCategory(category);
    setSelectedOption(null);
    if (!category.options || category.options.length === 0) {
      // Instead of submitting directly, show confirmation
      setShowConfirmation(true);
    }
  };

  const handleOptionSelect = (option: ReportOption) => {
    setSelectedOption(option);
    setShowDetails(true);
  };

  const handleSubmit = (categoryId: string, optionId?: string) => {
    setShowConfirmation(false);
    onSubmit(categoryId, optionId);
    toast.success("Report submitted successfully. Thank you for your feedback.");
    onClose();
  };

  const openConfirmation = () => {
    setShowConfirmation(true);
  };

  const closeConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleBack = () => {
    if (showDetails) {
      setShowDetails(false);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    } else {
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-md mx-4 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">
              {showDetails ? "Additional Information" : 
                selectedCategory ? selectedCategory.title : "Report Content"}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 max-h-[60vh] overflow-y-auto">
            {showDetails && selectedOption ? (
              <div>
                <p className="text-gray-700 mb-4">{selectedOption.additionalInfo}</p>
                <button
                  onClick={openConfirmation}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
                >
                  Submit Report
                </button>
              </div>
            ) : selectedCategory ? (
              <>
                <p className="text-gray-600 mb-4">{selectedCategory.description}</p>
                {selectedCategory.options?.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(option)}
                    className="w-full text-left p-3 mb-2 bg-gray-50 hover:bg-gray-100 rounded flex items-center justify-between"
                  >
                    <span>{option.text}</span>
                    <span className="text-gray-400">›</span>
                  </button>
                ))}
                {!selectedCategory.options && (
                  <button
                    onClick={openConfirmation}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
                  >
                    Submit Report
                  </button>
                )}
              </>
            ) : (
              reportCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category)}
                  className="w-full text-left p-3 mb-2 bg-gray-50 hover:bg-gray-100 rounded flex items-center justify-between"
                >
                  <span>{category.title}</span>
                  <span className="text-gray-400">›</span>
                </button>
              ))
            )}
          </div>

          <div className="p-4 border-t">
            <button
              onClick={handleBack}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded transition-colors"
            >
              {selectedCategory ? "Back" : "Cancel"}
            </button>
          </div>
        </div>
      </div>

      <Dialog open={showConfirmation} onOpenChange={closeConfirmation}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-red-500" />
              Confirm Report Submission
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to report this content? This action cannot be easily undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="outline" onClick={closeConfirmation}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => handleSubmit(
                selectedCategory?.id || "", 
                selectedOption?.id
              )}
            >
              Yes, Report Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReportOptionsPopup;
