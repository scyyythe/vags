import { ArrowLeft, Phone, Pin, MoreVertical, X, Search, Archive, CheckCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from "@/components/ui/menubar";
import { Conversation } from "./types/types";

interface ChatHeaderProps {
  selectedConversation: string | null;
  selectedConv: Conversation | undefined;
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
}

export const ChatHeader = ({
  selectedConversation,
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
  onSearchChange
}: ChatHeaderProps) => {
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {(showArchived || selectedConversation) && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft size={16} />
            </Button>
          )}
          <h3 className="font-semibold text-gray-900">
            {selectedConversation 
              ? selectedConv?.participantName 
              : showArchived 
                ? "Archived" 
                : "Messages"
            }
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          {selectedConversation && selectedConv && (
            <>
              <Button variant="ghost" size="sm" onClick={onCall}>
                <Phone size={16} />
              </Button>
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
                  <Button variant="ghost" size="sm">
                    <MoreVertical size={16} />
                  </Button>
                </MenubarTrigger>
                <MenubarContent>
                  <MenubarItem onClick={onToggleArchived}>
                    <Archive className="mr-2 h-4 w-4" />
                    {showArchived ? 'Show Active' : 'Show Archived'}
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem onClick={onMarkAllAsRead}>
                    <CheckCheck className="mr-2 h-4 w-4" />
                    Mark All as Read
                  </MenubarItem>
                  <MenubarItem onClick={onMarkAllAsUnread}>
                    <Check className="mr-2 h-4 w-4" />
                    Mark All as Unread
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          )}
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={18} />
          </button>
        </div>
      </div>
      
      {!selectedConversation && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-9 text-sm"
          />
        </div>
      )}

      {selectedConversation && selectedConv && (
        <div className="flex items-center space-x-3 mt-2">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedConv.participantAvatar} />
              <AvatarFallback className="text-sm">
                {selectedConv.participantName.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            {selectedConv.isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{selectedConv.participantName}</p>
            <p className="text-xs text-gray-500">
              {selectedConv.isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
