import {
  Pin,
  VolumeX,
  CheckCheck,
  Check,
  Archive,
  Trash2,
  MoreVertical,
  Circle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Conversation } from "./types/types";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

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
    const diffSecs = Math.floor(diffMs / 1000);

    if (diffSecs < 60) return `${diffSecs}s`;
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d`;
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths}mo`;
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
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            selectedConversation={selectedConversation}
            onSelectConversation={onSelectConversation}
            onMarkAsRead={onMarkAsRead}
            onMarkAsUnread={onMarkAsUnread}
            onTogglePin={onTogglePin}
            onToggleMute={onToggleMute}
            onToggleArchive={onToggleArchive}
            onDeleteConversation={onDeleteConversation}
            formatTime={formatTime}
          />
        ))}
    </>
  );
};

// ---------------------- Child component ----------------------
const ConversationItem = ({
  conversation,
  selectedConversation,
  onSelectConversation,
  onMarkAsRead,
  onMarkAsUnread,
  onTogglePin,
  onToggleMute,
  onToggleArchive,
  onDeleteConversation,
  formatTime,
}: any) => {
  const { language } = useLanguage();

  // Apply auto-translation safely here
  const translatedName = useAutoTranslation(conversation.participantName || "", language);
  const translatedMessage = useAutoTranslation(conversation.lastMessage || "", language);

  const rawTime = formatTime(conversation.lastMessageTime);
  const translatedTime = useAutoTranslation(rawTime, language);

  // Menu text translations
  const markAsReadText = useAutoTranslation("Mark as Read", language);
  const markAsUnreadText = useAutoTranslation("Mark as Unread", language);
  const pinText = useAutoTranslation("Pin", language);
  const unpinText = useAutoTranslation("Unpin", language);
  const muteText = useAutoTranslation("Mute", language);
  const unmuteText = useAutoTranslation("Unmute", language);
  const archiveText = useAutoTranslation("Archive", language);
  const unarchiveText = useAutoTranslation("Unarchive", language);
  const deleteText = useAutoTranslation("Delete", language);

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
                {translatedName}
              </p>
            </div>
            <span
              className={`text-[10px] ${
                isUnread ? "text-blue-500 font-semibold" : "text-gray-500"
              }`}
            >
              {translatedTime}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <p
              className={`text-[10px] truncate pr-2 ${
                isUnread ? "font-semibold text-gray-800" : "text-gray-600"
              }`}
            >
              {translatedMessage}
            </p>

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
                {markAsReadText}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsUnread(conversation.id);
                }}
                className="text-[10px]"
              >
                <Check className="mr-2 h-3 w-3" />
                {markAsUnreadText}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin(conversation.id);
                }}
                className="text-[10px]"
              >
                <Pin className="mr-2 h-3 w-3" />
                {conversation.isPinned ? unpinText : pinText}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMute(conversation.id);
                }}
                className="text-[10px]"
              >
                <VolumeX className="mr-2 h-3 w-3" />
                {conversation.isMuted ? unmuteText : muteText}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleArchive(conversation.id);
                }}
                className="text-[10px]"
              >
                <Archive className="mr-2 h-3 w-3" />
                {conversation.isArchived ? unarchiveText : archiveText}
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
                {deleteText}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
