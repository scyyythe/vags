import { Pin, VolumeX, CheckCheck, Check, Archive, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator } from "@/components/ui/context-menu";
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
  onDeleteConversation
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
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        No conversations found
      </div>
    );
  }

  return (
    <>
      {conversations
        .sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
        })
        .map((conversation) => (
          <ContextMenu key={conversation.id}>
            <ContextMenuTrigger>
              <div
                onClick={() => onSelectConversation(conversation.id)}
                className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                  selectedConversation === conversation.id ? "bg-blue-50" : ""
                } ${conversation.isMuted ? "opacity-60" : ""}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={conversation.participantAvatar} />
                      <AvatarFallback className="text-xs">
                        {conversation.participantName.split(" ").map(n => n[0]).join("")}
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
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {conversation.participantName}
                        </p>
                      </div>
                      <span className="text-[10px] text-gray-500">
                        {formatTime(conversation.lastMessageTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-gray-600 truncate pr-2">
                        {conversation.lastMessage}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center px-2 py-1 text-[10px] font-semibold leading-none text-white bg-blue-600 rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => onMarkAsRead(conversation.id)}>
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark as Read
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onMarkAsUnread(conversation.id)}>
                <Check className="mr-2 h-4 w-4" />
                Mark as Unread
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onTogglePin(conversation.id)}>
                <Pin className="mr-2 h-4 w-4" />
                {conversation.isPinned ? 'Unpin' : 'Pin'}
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onToggleMute(conversation.id)}>
                <VolumeX className="mr-2 h-4 w-4" />
                {conversation.isMuted ? 'Unmute' : 'Mute'}
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onToggleArchive(conversation.id)}>
                <Archive className="mr-2 h-4 w-4" />
                {conversation.isArchived ? 'Unarchive' : 'Archive'}
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => onDeleteConversation(conversation.id)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
    </>
  );
};
