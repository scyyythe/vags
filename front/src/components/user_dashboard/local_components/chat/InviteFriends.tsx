import { UserPlus, Copy, Share2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export const InviteFriends = () => {
  const [copied, setCopied] = useState(false);
  const inviteLink = "https://chat.example.com/invite/abc123";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    const text = "Join me on this chat platform!";
    const url = inviteLink;
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
    };

    const shareUrl = shareUrls[platform as keyof typeof shareUrls];
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-[300px] m-4 mb-2 flex items-center space-x-2 bg-gray-50 hover:bg-gray-100"
        >
          <UserPlus size={11} />
          <span className="text-[11px]">Invite your friends</span>
          {/* <span className="text-sm text-gray-500">Connect to start chatting</span> */}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-xl max-w-sm" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {/* <UserPlus size={15} /> */}
            <span className="text-sm">Invite Friends</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-xs text-gray-600">
            Share this link with your friends to invite them to chat
          </div>
          
          <div className="flex items-center space-x-2">
            <Input
              value={inviteLink}
              readOnly
              className="bg-gray-50"
              style={{fontSize: "11px"}}
            />
            <Button onClick={handleCopyLink} size="sm">
              <i className='bx bx-copy' ></i>
              <span className="text-[10px]">{copied ? "Copied!" : "Copy"}</span>
            </Button>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-700">Share on social platforms:</div>
            <div className="grid grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('facebook')}
                className="flex items-center space-x-2"
              >
                <div className="w-4 h-4 bg-blue-600 rounded"></div>
                <span className="text-[9px]">Facebook</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('twitter')}
                className="flex items-center space-x-2"
              >
                <div className="w-4 h-4 bg-blue-400 rounded"></div>
                <span className="text-[9px]">Twitter</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('whatsapp')}
                className="flex items-center space-x-2"
              >
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-[9px]">WhatsApp</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('telegram')}
                className="flex items-center space-x-2"
              >
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-[9px]">Telegram</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
