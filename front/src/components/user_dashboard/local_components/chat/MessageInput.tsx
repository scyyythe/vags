import { useRef, useState } from "react";
import { Send, Smile, Paperclip, X, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { Message } from "./types/types";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface MessageInputProps {
  messageInput: string;
  replyingTo: Message | null;
  isRecording: boolean;
  uploadingFile?: boolean;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onFileSelect: (file: File) => void;
  onSetShowEmojiPicker: (show: boolean) => void;
  showEmojiPicker: boolean;
  onCancelReply: () => void;
  onCameraCapture: () => void;
  onVoiceRecord: () => void;
  onEmojiClick: (emoji: any) => void;
}

export const MessageInput = ({
  messageInput,
  replyingTo,
  isRecording,
  uploadingFile = false,
  onMessageChange,
  onSendMessage,
  onFileSelect,
  showEmojiPicker,
  onSetShowEmojiPicker,
  onCancelReply,
  onCameraCapture,
  onVoiceRecord,
}: MessageInputProps) => {
  const { language } = useLanguage();

  const replyingToText = useAutoTranslation("Replying to", language);
  const typeMessageText = useAutoTranslation("Type a message...", language);
  const attachmentWarningText = useAutoTranslation("You cannot add more than 5 attachments.", language);
  const replyingMessageText = useAutoTranslation(replyingTo ? (replyingTo.content || replyingTo.text || "") : "", language);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [warning, setWarning] = useState("");

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (attachedFiles.length >= 5) {
        setWarning(attachmentWarningText);
        setTimeout(() => setWarning(""), 10000);
        return;
      }
      setAttachedFiles((prev) => [...prev, file]);
      onFileSelect(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEmojiSelect = (emoji: any) => {
    onMessageChange(messageInput + emoji.native);
    onSetShowEmojiPicker(false);
  };

  return (
    <div className="p-4 border-t border-gray-200 relative">
      {replyingTo && (
        <div className="px-4 py-2 bg-blue-50 border-b border-gray-200 mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Reply size={14} className="text-blue-600" />
              <span className="text-[11px] text-blue-600">{replyingToText} {replyingTo.senderName}</span>
            </div>
            <button onClick={onCancelReply}>
              <X size={12} className="text-gray-500" />
            </button>
          </div>
          <p className="text-[10px] text-gray-600 truncate mt-1">{replyingMessageText}</p>
        </div>
      )}

      {/* Warning message */}
      {warning && <div className="text-[11px] text-red-600 mb-2">{warning}</div>}

      {/* Attached files preview */}
      {attachedFiles.length > 0 && (
        <div className="flex overflow-x-auto space-x-2 mb-2 hide-scrollbar">
          {attachedFiles.map((file, i) => (
            <div
              key={i}
              className="flex items-center bg-gray-100 rounded px-2 py-1 text-[11px] whitespace-nowrap cursor-pointer"
              onClick={() => {
                const url = URL.createObjectURL(file);
                window.open(url);
              }}
            >
              <span className="truncate max-w-[120px]">{file.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(i);
                }}
                className="ml-1"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative">
        <div className="flex items-center space-x-2 absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
          {/* File attach */}
          <button onClick={handleFileClick}>
            <Paperclip size={13} className="text-gray-500 hover:text-black" />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />

          {/* Emoji picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => onSetShowEmojiPicker(!showEmojiPicker)}
              className="text-gray-500 hover:text-black"
            >
              <Smile size={13} />
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-10 right-0 z-50 scale-75 origin-bottom-right">
                <Picker
                  data={data}
                  onEmojiSelect={handleEmojiSelect}
                  theme="light"
                  maxFrequentRows={0}
                  previewPosition="none"
                  skinTonePosition="none"
                  searchPosition="none"
                />
              </div>
            )}
          </div>
        </div>

        <Input
          placeholder={typeMessageText}
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
          disabled={(!messageInput.trim() && attachedFiles.length === 0) || isRecording || uploadingFile}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
        >
          {uploadingFile ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Send size={15} />
          )}
        </Button>
      </div>
    </div>
  );
};
