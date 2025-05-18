import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, UserMinus, Users } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type UserData = {
  id: string;
  name: string;
  profileImage?: string;
  isFollowing?: boolean;
  items?: number;
};

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: "Followers" | "Following";
  users: UserData[];
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
  onRemove?: (userId: string) => void;
}

const UserListModal: React.FC<UserListModalProps> = ({
  isOpen,
  onClose,
  title,
  users,
  onFollow,
  onUnfollow,
  onRemove,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogTitle className="text-center text-xl font-bold p-4 border-b">{title}</DialogTitle>
        
        {/* Search Bar */}
        <div className="relative px-4 pt-4">
          <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search users"
            className="pl-10 pr-4 py-2 w-full rounded-full border border-gray-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* User List - Using ScrollArea with visible scrolling functionality */}
        <ScrollArea className="flex-1 h-[400px] mt-4 px-4 overflow-auto">
          <div className="pr-2">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center">
                    <Avatar className="h-12 w-12 mr-3">
                      <AvatarImage src={user.profileImage} alt={user.name} />
                      <AvatarFallback className="bg-gray-200 text-gray-700">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <span className="font-medium">{user.name}</span>
                        {title === "Followers" && user.isFollowing === false && (
                          <button 
                            onClick={() => onFollow && onFollow(user.id)} 
                            className="text-xs text-red-600 ml-2 hover:underline font-medium cursor-pointer"
                          >
                            • Follow
                          </button>
                        )}
                      </div>
                      {title === "Following" && (
                        <span className="text-xs text-gray-500">{user.items} items</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {title === "Followers" ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs px-4 py-1 h-8 rounded-full hover:bg-gray-100 flex items-center gap-1"
                        onClick={() => onRemove && onRemove(user.id)}
                      >
                        <UserMinus className="h-3 w-3" />
                        <span>Remove</span>
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs px-4 py-1 h-8 rounded-full text-red-800 border-red-800 hover:bg-red-50 flex items-center gap-1"
                        onClick={() => onUnfollow && onUnfollow(user.id)}
                      >
                        <UserMinus className="h-3 w-3" />
                        <span>Unfollow</span>
                      </Button>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-horizontal">
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="19" cy="12" r="1"></circle>
                            <circle cx="5" cy="12" r="1"></circle>
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem className="text-xs cursor-pointer">View Profile</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs cursor-pointer">Block User</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs cursor-pointer text-red-600">Report</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">No users found</div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default UserListModal;
