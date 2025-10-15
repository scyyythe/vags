import { Pin, VolumeX, CheckCheck, Check, Archive, Trash2, MoreVertical, Circle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Conversation } from "./types/types";

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  onSelectConversation: (convId: string) => void;
  onMarkAsRead: (convId: string) => void;
  onMarkAsUnread: (convId: string) => void;
  onTogglePin: (convId: string) => void;
  onToggleMute: (convId: string) => void;
  onToggleArchive: (convId: string) => void;
  onDeleteConversation: (convId: string) => void;
}

export const ConversationList = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  onMarkAsRead,
  onMarkAsUnread,
  onTogglePin,
  onToggleMute,
  onToggleArchive,
  onDeleteConversation,
}: ConversationListProps) => {
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

  if (conversations.length === 0) {
    return <div className="p-4 text-center text-gray-500 text-sm">No conversations found</div>;
  }

  return (
    <>
      {conversations
        .sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
        })
        .map((conversation) => {
          const isUnread = conversation.unreadCount > 0;

          return (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={`p-3 cursor-pointer border-b border-gray-100 relative group transition-colors
                ${selectedConversation === conversation.id ? "bg-blue-50" : ""}
                ${conversation.isMuted ? "opacity-60" : ""}
                ${isUnread ? "bg-gray-100" : "hover:bg-gray-50"}`}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={conversation.participantAvatar} />
                    <AvatarFallback className="text-xs">
                      {conversation.participantName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.isOnline && (
                    <div className="absolute -bottom-0.5 -right-1 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {conversation.isPinned && <Pin size={10} className="text-blue-600" />}
                      {conversation.isMuted && <VolumeX size={10} className="text-gray-500" />}
                      <p
                        className={`text-xs truncate ${
                          isUnread ? "font-bold text-gray-900" : "font-medium text-gray-900"
                        }`}
                      >
                        {conversation.participantName}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] ${
                        isUnread ? "text-blue-500 font-semibold" : "text-gray-500"
                      }`}
                    >
                      {formatTime(conversation.lastMessageTime)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p
                      className={`text-[10px] truncate pr-2 ${
                        isUnread ? "font-semibold text-gray-800" : "text-gray-600"
                      }`}
                    >
                      {conversation.lastMessage}
                    </p>

                    {/* Unread indicator (dot + count) */}
                    {isUnread && (
                      <div className="flex items-center gap-1">
                        <Circle size={6} className="text-blue-500 fill-blue-500" />
                        <span className="text-[9px] text-blue-500 font-semibold">
                          {conversation.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* MENU ICON */}
                <div
                  className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="p-1 bg-gray-200 rounded-full shadow-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-4 h-4 text-black" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkAsRead(conversation.id);
                        }}
                        className="text-[10px]"
                      >
                        <CheckCheck className="mr-2 h-3 w-3" />
                        Mark as Read
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkAsUnread(conversation.id);
                        }}
                        className="text-[10px]"
                      >
                        <Check className="mr-2 h-3 w-3" />
                        Mark as Unread
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePin(conversation.id);
                        }}
                        className="text-[10px]"
                      >
                        <Pin className="mr-2 h-3 w-3" />
                        {conversation.isPinned ? "Unpin" : "Pin"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleMute(conversation.id);
                        }}
                        className="text-[10px]"
                      >
                        <VolumeX className="mr-2 h-3 w-3" />
                        {conversation.isMuted ? "Unmute" : "Mute"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleArchive(conversation.id);
                        }}
                        className="text-[10px]"
                      >
                        <Archive className="mr-2 h-3 w-3" />
                        {conversation.isArchived ? "Unarchive" : "Archive"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conversation.id);
                        }}
                        className="text-red-600 text-[10px]"
                      >
                        <Trash2 className="mr-2 h-3 w-3" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          );
        })}
    </>
  );
};
