import React, { useState } from "react";
import { Star, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";

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
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

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
        className="max-w-lg text-xs review-modal-scroll-hidden"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-sm">Leave a Review</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Artwork Info */}
          <div className="flex gap-4 p-4 bg-muted rounded-lg">
            <img src={artwork.artworkImage} alt={artwork.title} className="w-16 h-16 rounded-md object-cover" />
            <div>
              <h3 className="font-semibold text-[11px]">{artwork.title}</h3>
              <p className="text-[10px] text-muted-foreground">by {artwork.artist}</p>
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Rating</Label>
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
            <Label className="text-xs font-medium">Your Review</Label>
            <Textarea
              placeholder="Share your experience with this artwork..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px] resize-none text-[10px]"
            />
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Add Photos (Optional)</Label>
            <div className="flex flex-wrap gap-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img src={photo} alt={`Review photo ${index + 1}`} className="w-16 h-16 rounded-md object-cover" />
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
            <p className="text-[10px] text-muted-foreground">Add up to 5 photos to help other buyers</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 text-[10px]">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={rating === 0 || isSubmitting} className="flex-1 text-[10px]">
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;
