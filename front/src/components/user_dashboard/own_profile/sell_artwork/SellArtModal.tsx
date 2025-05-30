import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface SellArtworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSellArtwork: (data: SellArtworkData) => void;
  artworkTitle?: string;
  resetTrigger?: number; 
}

export interface SellArtworkData {
  additionalImages: File[];
  price: string;
  yearCreated: string;
  edition: string;
  quantity: string;
}

interface ValidationErrors {
  price?: string;
  yearCreated?: string;
  quantity?: string;
}

const SellArtworkModal: React.FC<SellArtworkModalProps> = ({
  isOpen,
  onClose,
  onSellArtwork,
  artworkTitle = "TITLE/HEADER"
}) => {
  const [formData, setFormData] = useState<SellArtworkData>({
    additionalImages: [],
    price: '',
    yearCreated: '',
    edition: 'Original (1 of 1)',
    quantity: '1'
  });

  const [imageSlots, setImageSlots] = useState<(File | null)[]>([null, null, null, null]);
  const [errors, setErrors] = useState<ValidationErrors>({});

  if (!isOpen) return null;

  const isQuantityVisible = formData.edition !== 'Original (1 of 1)';

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Price validation
    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }

    // Year validation
    if (!formData.yearCreated.trim()) {
      newErrors.yearCreated = 'Year created is required';
    } else {
      const year = Number(formData.yearCreated);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1000 || year > currentYear) {
        newErrors.yearCreated = `Please enter a valid year (1000-${currentYear})`;
      }
    }

    // Quantity validation (only if visible)
    if (isQuantityVisible) {
      if (!formData.quantity.trim()) {
        newErrors.quantity = 'Quantity is required';
      } else if (isNaN(Number(formData.quantity)) || Number(formData.quantity) < 1) {
        newErrors.quantity = 'Quantity must be at least 1';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (index: number, file: File | null) => {
    const newSlots = [...imageSlots];
    newSlots[index] = file;
    setImageSlots(newSlots);
    
    setFormData(prev => ({
      ...prev,
      additionalImages: newSlots.filter(slot => slot !== null) as File[]
    }));
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSellArtwork(formData);
    } else {
      toast.error('Please fix the errors before submitting');
    }
  };

  const handleInputChange = (field: keyof SellArtworkData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleEditionChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      edition: value,
      quantity: value === 'Original (1 of 1)' ? '1' : prev.quantity
    }));
    if (errors.quantity) {
      setErrors(prev => ({ ...prev, quantity: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg px-10 py-6 w-ful max-w-sm relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={15} />
        </button>

        {/* Header */}
        <div className="text-left mb-6">
          <p className="text-lg text-black font-bold text-left">{artworkTitle}</p>
          <p className="text-[10px] text-black mt-1">Set your artwork details and pricing</p>
        </div>

        {/* Add more pictures */}
        <div className="mb-6">
        <h3 className="text-[11px] font-medium text-gray-900 mb-3">Add more pictures (Optional)</h3>

        <div className="grid grid-cols-4 gap-3">
            {imageSlots.map((slot, index) => (
                <div
                    key={index}
                    className="relative w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden group"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (!file || !file.type.startsWith("image/")) return;
                    handleImageUpload(index, file);
                    }}
                    onClick={() => document.getElementById(`file-input-${index}`)?.click()}
                >
                    {slot ? (
                    <>
                        <img
                            src={URL.createObjectURL(slot)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                        />
                        {/* Show only on this hovered container */}
                        <div
                            className="absolute inset-0 bg-black bg-opacity-60 text-white text-[9px] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                                e.stopPropagation(); 
                                handleImageUpload(index, null); 
                            }}
                            >
                            Remove
                        </div>
                    </>
                    ) : (
                        <i className="bx bx-images text-gray-300 text-2xl"></i>
                    )}

                    <input
                        id={`file-input-${index}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            handleImageUpload(index, file);
                        }}
                    />
                </div>
                ))}
            </div>
        </div>

        {/* Set price */}
        <div className="mb-4">
          <label className="block text-[11px] font-medium text-gray-900 mb-2">
            Set price 
          </label>
          <Input
            type="text"
            placeholder="Enter amount (e.g., 1000)"
            value={formData.price}
            onChange={(e) => handleInputChange('price', e.target.value)}
            className={`w-full h-8 ${errors.price ? '' : ''}`}
            style={{fontSize: "10px"}}
          />
          {errors.price && <p className="text-red-500 mt-1 text-[10px]">{errors.price}</p>}
        </div>

        {/* Year Created */}
        <div className="mb-4">
          <label className="block text-[11px] font-medium text-gray-900 mb-2">
            Year Created
          </label>
          <Input
            type="text"
            placeholder="Enter year (e.g., 2023)"
            value={formData.yearCreated}
            onChange={(e) => handleInputChange('yearCreated', e.target.value)}
            className={`w-full h-8 ${errors.yearCreated ? '' : ''}`}
            style={{fontSize: "10px"}}
          />
          {errors.yearCreated && <p className="text-red-500 text-[10px] mt-1">{errors.yearCreated}</p>}
        </div>

        {/* Edition and Quantity */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-[11px] font-medium text-gray-900 mb-2">Select Edition</label>
            <Select
              value={formData.edition}
              onValueChange={handleEditionChange}
            >
              <SelectTrigger className="w-full text-[10px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Original (1 of 1)" className='text-[10px]'>Original (1 of 1)</SelectItem>
                <SelectItem value="Limited Edition" className='text-[10px]'>Limited Edition</SelectItem>
                <SelectItem value="Open Edition" className='text-[10px]'>Open Edition</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isQuantityVisible && (
            <div>
              <label className="block text-[11px] font-medium text-gray-900 mb-2">
                Set quantity
              </label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                className={`w-full h-8 ${errors.quantity ? 'border-red-500' : ''}`}
                min="1"
                style={{fontSize:"10px"}}
              />
              {errors.quantity && <p className="text-red-500 text-[10px] mt-1">{errors.quantity}</p>}
            </div>
          )}
        </div>

        {/* Sell Artwork Button */}
        <Button
          onClick={handleSubmit}
          className="w-full h-8 bg-red-800 hover:bg-red-700 text-white text-xs py-3 rounded-full"
        >
          List Artwork for Sale
        </Button>
      </div>
    </div>
  );
};

export default SellArtworkModal;
