import React, { useState } from "react";
import { Star, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

// Helper component for translating dynamic text
const TranslatedText: React.FC<{ text: string }> = ({ text }) => {
  const { language } = useLanguage();
  const translatedText = useAutoTranslation(text, language);
  return <>{translatedText}</>;
};

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (review: { artworkId: string; rating: number; comment: string; photos: string[] }) => void;
  artwork: {
    artworkId: string;
    artworkImage: string;
    title: string;
    artist: string;
  };
  isSubmitting: boolean;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onSubmit, artwork, isSubmitting }) => {
  const { language } = useLanguage();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  // Translation hooks
  const leaveReviewText = useAutoTranslation("Leave a Review", language);
  const byText = useAutoTranslation("by", language);
  const ratingText = useAutoTranslation("Rating", language);
  const yourReviewText = useAutoTranslation("Your Review", language);
  const shareExperienceText = useAutoTranslation("Share your experience with this artwork...", language);
  const addPhotosText = useAutoTranslation("Add Photos (Optional)", language);
  const reviewPhotoText = useAutoTranslation("Review photo", language);
  const addPhotosHelpText = useAutoTranslation("Add up to 5 photos to help other buyers", language);
  const cancelText = useAutoTranslation("Cancel", language);
  const submitReviewText = useAutoTranslation("Submit Review", language);
  const submittingText = useAutoTranslation("Submitting...", language);

  const handleSubmit = () => {
    if (rating === 0) return;

    onSubmit({
      artworkId: artwork.artworkId,
      rating,
      comment,
      photos,
    });
  };
  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setHoveredRating(0);
      setComment("");
      setPhotos([]);
    }
  }, [isOpen]);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPhotos = Array.from(files).map((file) => URL.createObjectURL(file));
      setPhotos((prev) => [...prev, ...newPhotos].slice(0, 5));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-lg text-xs review-modal-scroll-hidden bg-white dark:bg-gray-800"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-sm text-gray-900 dark:text-gray-100">{leaveReviewText}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Artwork Info */}
          <div className="flex gap-4 p-4 bg-muted rounded-lg">
            <img src={artwork.artworkImage} alt={artwork.title} className="w-16 h-16 rounded-md object-cover" />
            <div>
              <h3 className="font-semibold text-[11px]">
                <TranslatedText text={artwork.title} />
              </h3>
              <p className="text-[10px] text-muted-foreground">
                {byText} <TranslatedText text={artwork.artist} />
              </p>
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">{ratingText}</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-colors"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= (hoveredRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">{yourReviewText}</Label>
            <Textarea
              placeholder={shareExperienceText}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px] resize-none text-[10px]"
            />
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">{addPhotosText}</Label>
            <div className="flex flex-wrap gap-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img src={photo} alt={`${reviewPhotoText} ${index + 1}`} className="w-16 h-16 rounded-md object-cover" />
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-[10px]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {photos.length < 5 && (
                <label className="w-16 h-16 border-2 border-dashed border-border rounded-md flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                  <Camera className="w-4 h-4 text-muted-foreground" />
                  <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
                </label>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">{addPhotosHelpText}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={rating === 0 || isSubmitting} className="flex-1 text-[10px] rounded-full">
              {isSubmitting ? submittingText : submitReviewText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;
