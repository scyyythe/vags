import { Send, Smile, Paperclip, Mic, MicOff, X, Reply, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Message } from "./types/types";
// import EmojiPicker from "emoji-picker-react";

interface MessageInputProps {
  messageInput: string;
  replyingTo: Message | null;
  isRecording: boolean;
  showEmojiPicker: boolean;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onFileAttachment: () => void;
  onVoiceRecord: () => void;
  onEmojiClick: (emojiData: any) => void;
  onSetShowEmojiPicker: (show: boolean) => void;
  onCancelReply: () => void;
  onCameraCapture: () => void;
}

export const MessageInput = ({
  messageInput,
  replyingTo,
  isRecording,
  showEmojiPicker,
  onMessageChange,
  onSendMessage,
  onFileAttachment,
  onVoiceRecord,
  onEmojiClick,
  onSetShowEmojiPicker,
  onCancelReply,
  onCameraCapture
}: MessageInputProps) => {
  return (
    <>
      {replyingTo && (
        <div className="px-4 py-2 bg-blue-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Reply size={14} className="text-blue-600" />
              <span className="text-[11px] text-blue-600">Replying to {replyingTo.senderName}</span>
            </div>
            <button onClick={onCancelReply}>
              <X size={12} className="text-gray-500" />
            </button>
          </div>
          <p className="text-[10px] text-gray-600 truncate mt-1">{replyingTo.content}</p>
        </div>
      )}

      <div className="p-4 border-t border-gray-200">
        <div className="relative">
          <div className="flex items-center space-x-2 absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
            <button onClick={onFileAttachment} className="pr-1">
              <Paperclip size={13} className="text-gray-500 hover:text-black" />
            </button>
            
            {/* <button onClick={onCameraCapture} className="pr-1">
              <Camera size={13} className="text-gray-500 hover:text-black" />
            </button> */}
            
            <button 
              onClick={onVoiceRecord}
              className={` ${isRecording ? "bg-red-100 text-red-600" : "text-gray-500 hover:text-black"}`}
            >
              {isRecording ? <MicOff size={13} /> : <Mic size={13} />}
            </button>
            
            <Popover open={showEmojiPicker} onOpenChange={onSetShowEmojiPicker}>
              <PopoverTrigger asChild>
                <button>
                  <Smile size={13} className="text-gray-500 hover:text-black" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                {/* <EmojiPicker onEmojiClick={onEmojiClick} /> */}
              </PopoverContent>
            </Popover>
          </div>
          
          <Input
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && onSendMessage()}
            className="pl-20 pr-12"
            style={{ fontSize: "11px" }}
            disabled={isRecording}
          />
          
          <Button 
            onClick={onSendMessage} 
            size="sm" 
            disabled={!messageInput.trim() || isRecording}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <Send size={15} />
          </Button>
        </div>
        {isRecording && (
          <div className="mt-2 text-center text-[11px] text-red-600">
            Recording voice message...
          </div>
        )}
      </div>
    </>
  );
};
