import React from "react";
import ReactDOM from "react-dom";
import { toast } from "sonner";
import { X } from "lucide-react";
import {
  FaFacebookF,
  FaXTwitter,
  FaWhatsapp,
  FaTelegram,
  FaLinkedinIn,
} from "react-icons/fa6";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkToShare: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, linkToShare }) => {
  if (!isOpen) return null;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(linkToShare);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(linkToShare)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(linkToShare)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(linkToShare)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(linkToShare)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(linkToShare)}`
  };

  const iconStyle = "w-4 h-4 text-white";
  const platforms = [
    { name: "Facebook", icon: <FaFacebookF className={iconStyle} />, color: "#1877F2", link: shareLinks.facebook },
    { name: "X", icon: <FaXTwitter className={iconStyle} />, color: "#000000", link: shareLinks.twitter },
    { name: "Whatsapp", icon: <FaWhatsapp className={iconStyle} />, color: "#25D366", link: shareLinks.whatsapp },
    { name: "Telegram", icon: <FaTelegram className={iconStyle} />, color: "#0088cc", link: shareLinks.telegram },
    { name: "Linkedin", icon: <FaLinkedinIn className={iconStyle} />, color: "#0A66C2", link: shareLinks.linkedin },
  ];

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[100] bg-black bg-opacity-60 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl max-w-xs shadow-xl relative">
        <button onClick={onClose} className="absolute top-3 right-3">
          <X className="w-4 h-4 text-gray-500 hover:text-black" />
        </button>

        <div className="flex flex-col">
          <h2 className="text-black text-sm text-center font-bold mb-1">Share with Friends</h2>
          <p className="text-[10px] text-center text-gray-500 mb-4">
            Share this piece and let your friends discover new artists!
          </p>

          <span className="text-black text-[10px] text-left font-medium mb-1">Copy link</span>
          <div className="w-full mb-4 flex items-center justify-between bg-gray-100 rounded-lg px-3 py-2">
            <span className="text-[10px] text-gray-600 truncate">{linkToShare}</span>
            <button onClick={copyToClipboard}>
              <i className='bx bx-copy text-xs text-gray-600 hover:text-black'></i>
            </button>
          </div>

          <div className="text-[10px] text-black font-medium mb-2">Share to</div>

          <div className="flex justify-between">
            {platforms.map((platform) => (
              <a
                key={platform.name}
                href={platform.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center space-y-1 text-[10px]"
              >
                <div
                  className="rounded-full p-2"
                  style={{ backgroundColor: platform.color }}
                >
                  {platform.icon}
                </div>
                <span className="text-gray-600 text-[8px]">{platform.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ShareModal;
