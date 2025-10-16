import { ArrowLeft, Pin, MoreVertical, Search, Archive, CheckCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Conversation } from "./types/types";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface ChatHeaderProps {
  selectedConversation: string | null;
  selectedConv: Conversation | undefined;
  participantName?: string;
  showArchived: boolean;
  searchQuery: string;
  onBack: () => void;
  onClose: () => void;
  onCall: () => void;
  onTogglePin: (convId: string) => void;
  onToggleArchived: () => void;
  onMarkAllAsRead: () => void;
  onMarkAllAsUnread: () => void;
  onSearchChange: (query: string) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
}

export const ChatHeader = ({
  selectedConversation,
  participantName,
  selectedConv,
  showArchived,
  searchQuery,
  onBack,
  onClose,
  onCall,
  onTogglePin,
  onToggleArchived,
  onMarkAllAsRead,
  onMarkAllAsUnread,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
}: ChatHeaderProps) => {
  const { language } = useLanguage();

  const archived = useAutoTranslation("Archived", language);
  const messages = useAutoTranslation("Messages", language);
  const showActiveText = useAutoTranslation("Show Active", language);
  const showArchivedText = useAutoTranslation("Show Archived", language);
  const markAllAsRead = useAutoTranslation("Mark All as Read", language);
  const markAllAsUnread = useAutoTranslation("Mark All as Unread", language);
  const searchPlaceholder = useAutoTranslation("Search conversations...", language);
  const online = useAutoTranslation("Online", language);
  const offline = useAutoTranslation("Offline", language);

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {(showArchived || selectedConversation) && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft size={16} />
            </Button>
          )}
          <h3 className="font-semibold text-gray-900 text-sm">
            {selectedConversation ? selectedConv?.participantName : showArchived ? archived : messages}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          {selectedConversation && selectedConv && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTogglePin(selectedConv.id)}
                className={selectedConv.isPinned ? "text-blue-600" : ""}
              >
                <Pin size={16} />
              </Button>
            </>
          )}
          {!selectedConversation && (
            <Menubar>
              <MenubarMenu>
                <MenubarTrigger asChild>
                  <button>
                    <MoreVertical size={11} />
                  </button>
                </MenubarTrigger>
                <MenubarContent className="mr-5" >
                  <MenubarItem onClick={onToggleArchived} className="text-[10px]">
                    <Archive className="mr-2 h-3 w-3" />
                    {showArchived ? showActiveText : showArchivedText}
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem onClick={onMarkAllAsRead} className="text-[10px]">
                    <CheckCheck className="mr-2 h-3 w-3" />
                    {markAllAsRead}
                  </MenubarItem>
                  <MenubarItem onClick={onMarkAllAsUnread} className="text-[10px]">
                    <Check className="mr-2 h-3 w-3" />
                    {markAllAsUnread}
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          )}
        </div>
      </div>

      {!selectedConversation && (
        <div className="relative search-container">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={11} />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            className="pl-10 h-9 rounded-full"
            style={{ fontSize: "11px" }}
          />
        </div>
      )}

      {selectedConversation && selectedConv && (
        <div className="flex items-center space-x-3 mt-2">
          <div className="relative">
            <Avatar className="h-8 w-8">
              <AvatarImage src={selectedConv.participantAvatar} />
              <AvatarFallback className="text-[11px]">
                {selectedConv?.participantName
                  ? selectedConv.participantName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                  : "?"}
              </AvatarFallback>
            </Avatar>
            {selectedConv.isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900 text-[11px]">{selectedConv.participantName}</p>
            <p className="text-[10px] text-gray-500">{selectedConv.isOnline ? online : offline}</p>
          </div>
        </div>
      )}
    </div>
  );
};
