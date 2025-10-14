import { Reply, Star, Copy, Forward, Edit, Trash2, Smile, Paperclip, MoreVertical } from "lucide-react";
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
import AutomaticMessageBubble from "../../Marketplace/my_purchase/card/AutomaticMessageBubble";

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
  onAddReaction: (messageId: string, emoji: string) => void;
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
  onAddReaction,
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
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  const findRepliedMessage = (replyToId: string): Message | null =>
    conversation.messages.find((msg) => msg.id === replyToId) || null;

  useEffect(() => {
    const prevCount = prevMessageCountRef.current;
    const currentCount = conversation.messages.length;

    // Only scroll if a new message was added
    if (currentCount > prevCount) {
      scrollToBottom();
    }

    prevMessageCountRef.current = currentCount;
  }, [conversation.messages]);

  const prevMessageCountRef = useRef(conversation.messages.length);

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
    }
    return (
      <div className="relative flex justify-end items-center group">
        <span className="absolute left-[-60px] top-1/2 -translate-y-1/2 bg-gray-700 text-white text-[8px] px-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
          {formatFullDateTime(message.timestamp)}
        </span>
        <span className="text-[9px] text-gray-500 ml-1">{statusText}</span>
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="space-y-6">
        {conversation.messages.map((message) => {
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
                    {/* Avatar + Sender */}
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

                    {/* IMAGE MESSAGE */}
                    {message.type === "image" && message.imageUrl ? (
                      <div className="relative group">
                        <img
                          src={message.imageUrl}
                          alt="Shared image"
                          className="rounded-lg cursor-pointer hover:opacity-90 transition-opacity object-contain"
                          style={{
                            width: "auto",
                            maxWidth: "250px",
                            maxHeight: "300px",
                            height: "auto",
                            display: "block",
                            marginBottom: "4px",
                          }}
                          onClick={() => window.open(message.imageUrl, "_blank")}
                        />
                      </div>
                    ) : (
                      /* TEXT/FILE MESSAGES */
                    <div className="relative group">
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
                        {message.type === "file" && (
                          <div className="flex items-center space-x-2 mb-1">
                            <Paperclip size={13} />
                            <span className="text-sm">{message.fileName}</span>
                          </div>
                        )}
                        {message.type === "automatic" && message.automaticMessageData ? (
                          <AutomaticMessageBubble
                            sellerName={message.automaticMessageData.sellerName}
                            artworkTitle={message.automaticMessageData.artworkTitle}
                            buyerName={message.automaticMessageData.buyerName}
                            orderId={message.automaticMessageData.orderId}
                          />
                        ) : (
                          message.content && <p className="text-[11px]">{message.content}</p>
                        )}
                      </div>

                      {/* REACTIONS OUTSIDE THE BUBBLE */}
                      {message.reactions && message.reactions.length > 0 && (
                        <div
                          className={`absolute flex space-x-1 mt-1 ${
                            message.senderId === currentUserId
                              ? "left-2 -bottom-4 justify-end"
                              : "right-2 -bottom-4 justify-start"
                          }`}
                        >
                          {message.reactions.map((reaction, idx) => {
                            const hasUserReacted = reaction.users.includes(currentUserId);
                            return (
                              <div
                                key={idx}
                                onClick={() => onAddReaction(message.id, reaction.emoji)}
                                className={`text-[12px] cursor-pointer px-2 py-[1px] rounded-full shadow-sm border ${
                                  hasUserReacted
                                    ? "bg-gray-100 border-gray-300"
                                    : "bg-white border-gray-300"
                                }`}
                              >
                                {reaction.emoji}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    )}

                    {/* REPLY + REACT + MENU buttons on hover */}
                    <div
                      className={`absolute flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -translate-y-1/2 ${
                        message.senderId === currentUserId
                          ? "right-full mr-2 top-[40%] justify-end" // sender: icons on the left side of bubble
                          : "left-full ml-2 top-[55%] justify-start" // receiver: icons on the right side of bubble
                      }`}
                    >
                      <div className="flex space-x-1">
                        {/* Reply button (only for receiver messages) */}
                        {message.senderId !== currentUserId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onReplyToMessage(message)}
                            className="h-5 w-5 p-0 bg-white"
                          >
                            <Reply size={12} />
                          </Button>
                        )}

                        {/* Reaction Button */}
                        {message.senderId !== currentUserId && (
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
                                  <button
                                    key={emoji}
                                    onClick={() => {
                                      onAddReaction(message.id, emoji);
                                      onSetReactionPicker(null); // Close the picker after selecting
                                    }}
                                    className="text-lg hover:bg-gray-100 rounded p-1 transition-colors"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}

                        {/* Menu Icon beside React */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 bg-white shadow-sm hover:bg-gray-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical size={14} />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-32 p-1 text-[10px]">
                            <div
                              onClick={() => onStarMessage(message.id)}
                              className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 cursor-pointer rounded"
                            >
                              <Star className="h-3 w-3" />
                              {message.isStarred ? "Unstar" : "Star"}
                            </div>
                            {message.content && (
                              <div
                                onClick={() => navigator.clipboard.writeText(message.content)}
                                className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 cursor-pointer rounded"
                              >
                                <Copy className="h-3 w-3" /> Copy
                              </div>
                            )}
                            <div className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 cursor-pointer rounded">
                              <Forward className="h-3 w-3" /> Forward
                            </div>
                            {message.senderId === currentUserId && (
                              <>
                                <div className="border-t border-gray-200 my-1" />
                                <div className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 cursor-pointer rounded">
                                  <Edit className="h-3 w-3" /> Edit
                                </div>
                                <div
                                  onClick={() => onDeleteMessage(message.id)}
                                  className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 cursor-pointer rounded text-red-600"
                                >
                                  <Trash2 className="h-3 w-3" /> Delete
                                </div>
                              </>
                            )}
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Delivery/Date Info */}
                    {message.senderId === currentUserId && (
                      <div className="mt-1 flex justify-end">{renderDeliveryText(message)}</div>
                    )}
                    {message.senderId !== currentUserId && (
                      <div className="relative flex justify-start mt-5 group">
                        <span className="absolute bottom-full mb-1 bg-gray-700 text-white text-[8px] px-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                          {formatFullDateTime(message.timestamp)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </ContextMenuTrigger>

              {/* Context Menu */}
              <ContextMenuContent>
                <ContextMenuItem onClick={() => onStarMessage(message.id)} className="text-[10px]">
                  <Star className="mr-2 h-3 w-3" />
                  {message.isStarred ? "Unstar" : "Star"}
                </ContextMenuItem>
                {message.content && (
                  <ContextMenuItem
                    onClick={() => navigator.clipboard.writeText(message.content)}
                    className="text-[10px]"
                  >
                    <Copy className="mr-2 h-3 w-3" />
                    Copy
                  </ContextMenuItem>
                )}
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
