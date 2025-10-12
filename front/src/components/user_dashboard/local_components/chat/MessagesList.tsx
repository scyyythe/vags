import { Reply, Star, Copy, Forward, Edit, Trash2, Smile, Paperclip, Mic } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Message, Conversation } from "./types/types";
import { useEffect, useRef } from "react";
interface MessagesListProps {
  conversation: Conversation;
  selectedMessage: string | null;
  showReactionPicker: string | null;
  currentUserId: string;
  onSelectMessage: (messageId: string | null) => void;
  onReplyToMessage: (message: Message) => void;
  onStarMessage: (messageId: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onSetReactionPicker: (messageId: string | null) => void;
}

export const MessagesList = ({
  conversation,
  selectedMessage,
  showReactionPicker,
  onSelectMessage,
  onReplyToMessage,
  currentUserId,
  onStarMessage,
  onDeleteMessage,
  onSetReactionPicker,
}: MessagesListProps) => {
  const formatFullDateTime = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };
  const findRepliedMessage = (replyToId: string): Message | null => {
    return conversation.messages.find((msg) => msg.id === replyToId) || null;
  };
  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);
  const renderDeliveryText = (message: Message) => {
    if (message.senderId !== currentUserId) return null;

    let statusText = "Sent";
    switch (message.deliveryStatus) {
      case "sent":
        statusText = "Sent";
        break;
      case "delivered":
        statusText = "Delivered";
        break;
      case "seen":
        statusText = "Seen";
        break;
      default:
        statusText = "Sent";
    }

    return (
      <div className="relative flex justify-end items-center group">
        {/* Sender date-time hovering LEFT outside bubble */}
        <span className="absolute left-[-60px] top-1/2 -translate-y-1/2 bg-gray-700 text-white text-[8px] px-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
          {formatFullDateTime(message.timestamp)}
        </span>

        {/* Delivery status text */}
        <span className="text-[9px] text-gray-500 ml-1">{statusText}</span>
      </div>
    );
  };
  const uniqueMessages = Array.from(new Map(conversation.messages.map((m) => [m.id, m])).values());
  const getSenderName = (senderId: string) => {
    if (senderId === currentUserId) return "You";
    return conversation?.participantName || "Unknown";
  };

  return (
    <div className="p-4">
      <div className="space-y-6">
        {conversation.messages.map((message) => {
          if (message.replyTo) {
            console.log("💬 Message has replyTo:", message.id, message.replyTo);
          }
          const repliedMessage = message.replyTo ? findRepliedMessage(message.replyTo.messageId) : null;

          return (
            <ContextMenu key={message.id}>
              <ContextMenuTrigger>
                <div
                  className={`flex ${
                    message.senderId === currentUserId ? "justify-end" : "justify-start"
                  } mb-2 relative group`}
                >
                  <div className="relative max-w-[80%]">
                    {message.senderId !== currentUserId && (
                      <div className="flex items-center space-x-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={conversation.participantAvatar} />
                          <AvatarFallback className="text-[11px]">
                            {(message.senderName || "Unknown")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[11px] font-medium text-gray-700">{conversation.participantName}</span>
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`rounded-lg px-4 py-3 ${
                        message.senderId === currentUserId
                          ? "bg-blue-600 text-white text-[10px]"
                          : "bg-gray-100 text-gray-900 text-[10px]"
                      } ${selectedMessage === message.id ? "ring-2 ring-blue-300" : ""}`}
                      onClick={() => onSelectMessage(selectedMessage === message.id ? null : message.id)}
                    >
                      {message.replyTo && (
                        <div
                          className={`text-[10px] mb-2 border-l-2 pl-2 ${
                            message.senderId === currentUserId
                              ? "border-blue-300 bg-blue-500 bg-opacity-20"
                              : "border-gray-300 bg-gray-200"
                          } rounded p-2`}
                        >
                          <div className="flex items-center space-x-1 mb-1">
                            <Reply size={10} />
                          </div>
                          <div className="opacity-80 truncate max-w-[200px] text-[10px]">
                            {message.replyTo.type === "image" && "Image"}
                            {message.replyTo.type === "file" && message.replyTo.fileName}
                            {message.replyTo.type === "voice" && "Voice message"}
                            {message.replyTo.type === "text" && message.replyTo.content}
                          </div>
                        </div>
                      )}

                      {message.isStarred && <Star size={12} className="inline mr-1 text-yellow-400 fill-current" />}

                      {message.type === "image" && message.imageUrl && (
                        <div className="mb-2">
                          <img
                            src={message.imageUrl}
                            alt="Shared image"
                            className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            style={{ maxHeight: "300px", maxWidth: "250px" }}
                            onClick={() => window.open(message.imageUrl, "_blank")}
                          />
                        </div>
                      )}

                      {message.type === "file" && (
                        <div className="flex items-center space-x-2 mb-1">
                          <Paperclip size={13} />
                          <span className="text-sm">{message.fileName}</span>
                        </div>
                      )}

                      {/* {message.type === "voice" && (
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-3 py-1">
                            <Mic size={13} />
                            <span className="text-[11px]">{message.voiceDuration}s</span>
                            <div className="w-20 h-1 bg-white bg-opacity-30 rounded-full">
                              <div className="w-1/3 h-full bg-white rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      )} */}

                      {/* Only show text content if it's not an image message or if there's actual content */}
                      {message.type !== "image" && message.content && <p className="text-[11px]">{message.content}</p>}

                      {message.reactions && message.reactions.length > 0 && (
                        <div className="flex items-center space-x-1 mt-2">
                          {message.reactions.map((reaction, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-[10px] px-2 py-1 bg-white hover:bg-gray-50 cursor-pointer border-gray-200"
                            >
                              <span className="mr-1">{reaction.emoji}</span>
                              <span className="text-gray-600">{reaction.users.length}</span>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Sender Delivery Status Text */}
                    {message.senderId === currentUserId && (
                      <div className="mt-1 flex justify-end">{renderDeliveryText(message)}</div>
                    )}

                    {/* Receiver date-time below bubble */}
                    {message.senderId !== currentUserId && (
                      <div className="relative flex justify-start mt-5 group">
                        <span className="absolute bottom-full mb-1 bg-gray-700 text-white text-[8px] px-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                          {formatFullDateTime(message.timestamp)}
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="absolute -right-16 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onReplyToMessage(message)}
                          className="h-5 w-5 p-0 bg-white"
                        >
                          <Reply size={12} />
                        </Button>

                        <Popover
                          open={showReactionPicker === message.id}
                          onOpenChange={(open) => onSetReactionPicker(open ? message.id : null)}
                        >
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 bg-white">
                              <Smile size={12} />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-2" align="center">
                            <div className="flex space-x-1">
                              {["👍", "❤️", "😂", "😮", "😢", "😡"].map((emoji) => (
                                <button key={emoji} className="text-lg hover:bg-gray-100 rounded p-1">
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                </div>
              </ContextMenuTrigger>

              {/* Context Menu Items */}
              <ContextMenuContent>
                <ContextMenuItem onClick={() => onStarMessage(message.id)} className="text-[10px]">
                  <Star className="mr-2 h-3 w-3" />
                  {message.isStarred ? "Unstar" : "Star"}
                </ContextMenuItem>
                <ContextMenuItem onClick={() => navigator.clipboard.writeText(message.content)} className="text-[10px]">
                  <Copy className="mr-2 h-3 w-3" />
                  Copy
                </ContextMenuItem>
                <ContextMenuItem className="text-[10px]">
                  <Forward className="mr-2 h-3 w-3" />
                  Forward
                </ContextMenuItem>
                {message.senderId === currentUserId && (
                  <>
                    <ContextMenuSeparator />
                    <ContextMenuItem className="text-[10px]">
                      <Edit className="mr-2 h-3 w-3" />
                      Edit
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => onDeleteMessage(message.id)} className="text-red-600 text-[10px]">
                      <Trash2 className="mr-2 h-3 w-3" />
                      Delete
                    </ContextMenuItem>
                  </>
                )}
              </ContextMenuContent>
            </ContextMenu>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
