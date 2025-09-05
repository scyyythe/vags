import { useRef, useState, useEffect } from "react";
import { Send, Smile, Paperclip, X, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Message } from "./types/types";

interface MessageInputProps {
  messageInput: string;
  replyingTo: Message | null;
  isRecording: boolean;
  showEmojiPicker: boolean;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onFileSelect: (file: File) => void;
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
  onFileSelect,
  onVoiceRecord,
  onEmojiClick,
  onSetShowEmojiPicker,
  onCancelReply,
  onCameraCapture,
}: MessageInputProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [warning, setWarning] = useState("");

  const handleFileClick = () => {
    if (attachedFiles.length >= 5) {
      setWarning("You cannot add more than 5 attachments.");
      setTimeout(() => setWarning(""), 10000); // hide after 10s
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (attachedFiles.length >= 5) {
        setWarning("You cannot add more than 5 attachments.");
        setTimeout(() => setWarning(""), 10000);
        return;
      }
      setAttachedFiles([...attachedFiles, file]);
      onFileSelect(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const clearAttachment = (index: number) => {
    const newFiles = [...attachedFiles];
    newFiles.splice(index, 1);
    setAttachedFiles(newFiles);
  };

  const handleFileClickPreview = (file: File) => {
    const url = URL.createObjectURL(file);

    if (
      file.type.startsWith("image/") ||
      file.type === "application/pdf" ||
      file.type.startsWith("text/")
    ) {
      window.open(url, "_blank");
    }
  };

  return (
    <>
      {replyingTo && (
        <div className="px-4 py-2 bg-blue-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Reply size={14} className="text-blue-600" />
              <span className="text-[11px] text-blue-600">
                Replying to {replyingTo.senderName}
              </span>
            </div>
            <button onClick={onCancelReply}>
              <X size={12} className="text-gray-500" />
            </button>
          </div>
          <p className="text-[10px] text-gray-600 truncate mt-1">{replyingTo.content}</p>
        </div>
      )}

      <div className="p-4 border-t border-gray-200">
        {/* Warning message */}
        {warning && (
          <div className="mb-2 text-[11px] text-red-600">{warning}</div>
        )}

        {/* File previews above input */}
        {attachedFiles.length > 0 && (
          <div className="flex space-x-2 overflow-x-auto scrollbar-hide mb-2">
            {attachedFiles.map((file, index) => (
              <div
                key={index}
                onClick={() => handleFileClickPreview(file)}
                className="flex items-center px-3 py-1 rounded-md text-[11px] bg-gray-100 whitespace-nowrap flex-shrink-0 cursor-pointer hover:bg-gray-200"
                title="Click to preview"
              >
                <span className="truncate max-w-[120px]">{file.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAttachment(index);
                  }}
                  className="ml-2"
                >
                  <X size={12} className="text-gray-500 hover:text-black" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative">
          <div className="flex items-center space-x-2 absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
            {/* File attach */}
            <button onClick={handleFileClick} className="pr-1">
              <Paperclip size={13} className="text-gray-500 hover:text-black" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />

            <Popover open={showEmojiPicker} onOpenChange={onSetShowEmojiPicker}>
              <PopoverTrigger asChild>
                <button>
                  <Smile size={13} className="text-gray-500 hover:text-black" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                {/* Emoji picker can go here */}
              </PopoverContent>
            </Popover>
          </div>

          <Input
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && onSendMessage()}
            className="pl-16 pr-12"
            style={{ fontSize: "11px" }}
            disabled={isRecording}
          />

          <Button
            onClick={onSendMessage}
            size="sm"
            disabled={(!messageInput.trim() && attachedFiles.length === 0) || isRecording}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <Send size={15} />
          </Button>
        </div>
      </div>
    </>
  );
};
