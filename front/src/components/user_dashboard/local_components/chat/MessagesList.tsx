import { Reply, Star, Copy, Forward, Edit, Trash2, Smile, Check, CheckCheck, Paperclip, Mic, Plus, Clock, Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator } from "@/components/ui/context-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Message, Conversation } from "./types/types";

interface MessagesListProps {
  conversation: Conversation;
  selectedMessage: string | null;
  showReactionPicker: string | null;
  onSelectMessage: (messageId: string | null) => void;
  onReplyToMessage: (message: Message) => void;
  onStarMessage: (messageId: string) => void;
  onDeleteMessage: (messageId: string) => void;
//   onAddReaction: (messageId: string, emoji: string) => void;
  onSetReactionPicker: (messageId: string | null) => void;
}

export const MessagesList = ({
  conversation,
  selectedMessage,
  showReactionPicker,
  onSelectMessage,
  onReplyToMessage,
  onStarMessage,
  onDeleteMessage,
//   onAddReaction,
  onSetReactionPicker
}: MessagesListProps) => {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const formatFullDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const findRepliedMessage = (replyToId: string): Message | null => {
    return conversation.messages.find(msg => msg.id === replyToId) || null;
  };

  const renderDeliveryStatus = (message: Message) => {
    if (message.senderId !== "currentUser") return null;
    
    switch (message.deliveryStatus) {
      case 'sent':
        return <Clock size={12} className="text-gray-400" />;
      case 'delivered':
        return <Check size={12} className="text-gray-400" />;
      case 'seen':
        return <CheckCheck size={12} className="text-blue-400" />;
      default:
        return <Clock size={12} className="text-gray-400" />;
    }
  };

  return (
    <div className="p-4">
      <div className="space-y-6">
        {conversation.messages.map((message) => {
          const repliedMessage = message.replyTo ? findRepliedMessage(message.replyTo) : null;
          
          return (
            <ContextMenu key={message.id}>
              <ContextMenuTrigger>
                <div className={`flex ${message.senderId === "currentUser" ? "justify-end" : "justify-start"} mb-6`}>
                  <div className="relative group max-w-[80%]">
                    {message.senderId !== "currentUser" && (
                      <div className="flex items-center space-x-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={conversation.participantAvatar} />
                          <AvatarFallback className="text-[11px]">
                            {message.senderName.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[11px] font-medium text-gray-700">{message.senderName}</span>
                      </div>
                    )}
                    
                    <div
                      className={`rounded-lg px-4 py-3 ${
                        message.senderId === "currentUser"
                          ? "bg-blue-600 text-white text-[10px]"
                          : "bg-gray-100 text-gray-900 text-[10px]"
                      } ${selectedMessage === message.id ? "ring-2 ring-blue-300" : ""}`}
                      onClick={() => onSelectMessage(selectedMessage === message.id ? null : message.id)}
                    >
                      {repliedMessage && (
                        <div className={`text-[10px] mb-2 border-l-2 pl-2 ${
                          message.senderId === "currentUser" 
                            ? "border-blue-300 bg-blue-500 bg-opacity-20" 
                            : "border-gray-300 bg-gray-200"
                        } rounded p-2`}>
                          <div className="flex items-center space-x-1 mb-1">
                            <Reply size={10} />
                            <span className="font-medium">{repliedMessage.senderName}</span>
                          </div>
                          <div className="opacity-80 truncate max-w-[200px] text-[10px]">
                            {repliedMessage.type === 'image' && 'Image'}
                            {repliedMessage.type === 'file' && `${repliedMessage.fileName}`}
                            {repliedMessage.type === 'voice' && 'Voice message'}
                            {repliedMessage.type === 'text' && repliedMessage.content}
                          </div>
                        </div>
                      )}
                      {message.isStarred && (
                        <Star size={12} className="inline mr-1 text-yellow-400 fill-current" />
                      )}
                      
                      {message.type === 'image' && message.imageUrl && (
                        <div className="mb-2">
                          <img 
                            src={message.imageUrl} 
                            alt="Shared image" 
                            className="max-w-full h-auto rounded"
                            style={{ maxHeight: '200px' }}
                          />
                        </div>
                      )}
                      
                      {message.type === 'file' && (
                        <div className="flex items-center space-x-2 mb-1">
                          <Paperclip size={13} />
                          <span className="text-sm">{message.fileName}</span>
                        </div>
                      )}

                      {message.type === 'voice' && (
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-3 py-1">
                            <Mic size={13} />
                            <span className="text-[11px]">{message.voiceDuration}s</span>
                            <div className="w-20 h-1 bg-white bg-opacity-30 rounded-full">
                              <div className="w-1/3 h-full bg-white rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <p className="text-[11px]">{message.content}</p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <p className={`text-[9px] ${
                          message.senderId === "currentUser" 
                            ? "text-blue-100" 
                            : "text-gray-500"
                        }`}>
                          {formatFullDateTime(message.timestamp)}
                        </p>
                        {message.senderId === "currentUser" && (
                          <div className="flex items-center space-x-1">
                            {renderDeliveryStatus(message)}
                          </div>
                        )}
                      </div>
                      
                      {message.reactions && message.reactions.length > 0 && (
                        <div className="flex items-center space-x-1 mt-2">
                          {message.reactions.map((reaction, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-[10px] px-2 py-1 bg-white hover:bg-gray-50 cursor-pointer border-gray-200"
                            //   onClick={() => onAddReaction(message.id, reaction.emoji)}
                            >
                              <span className="mr-1">{reaction.emoji}</span>
                              <span className="text-gray-600">{reaction.users.length}</span>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
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
                        
                        <Popover open={showReactionPicker === message.id} onOpenChange={(open) => onSetReactionPicker(open ? message.id : null)}>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 bg-white">
                              <Smile size={12} />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-2" align="center">
                            <div className="flex space-x-1">
                              {['👍', '❤️', '😂', '😮', '😢', '😡'].map((emoji) => (
                                <button
                                  key={emoji}
                                //   onClick={() => onAddReaction(message.id, emoji)}
                                  className="text-lg hover:bg-gray-100 rounded p-1"
                                >
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
              <ContextMenuContent>
                {/* <ContextMenuItem onClick={() => onReplyToMessage(message)} className="text-[10px]">
                  <Reply className="mr-2 h-3 w-3" />
                  Reply
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onSetReactionPicker(message.id)} className="text-[10px]">
                  <Smile className="mr-2 h-3 w-3" />
                  React
                </ContextMenuItem> */}
                <ContextMenuItem onClick={() => onStarMessage(message.id)} className="text-[10px]">
                  <Star className="mr-2 h-3 w-3" />
                  {message.isStarred ? 'Unstar' : 'Star'}
                </ContextMenuItem>
                <ContextMenuItem onClick={() => navigator.clipboard.writeText(message.content)} className="text-[10px]">
                  <Copy className="mr-2 h-3 w-3" />
                  Copy
                </ContextMenuItem>
                <ContextMenuItem className="text-[10px]">
                  <Forward className="mr-2 h-3 w-3" />
                  Forward
                </ContextMenuItem>
                {message.senderId === "currentUser" && (
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
      </div>
    </div>
  );
};
