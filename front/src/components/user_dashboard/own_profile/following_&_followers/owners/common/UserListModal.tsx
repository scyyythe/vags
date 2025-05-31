import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import useUserQuery from "@/hooks/users/useUserQuery";
import { User } from "@/hooks/users/useUserQuery";
import useFollowStatus from "@/hooks/follow/useFollowStatus";
import useOwnedArtworksCount from "@/hooks/artworks/fetch_artworks/useOwnedArtworksCount ";
import { useParams, useNavigate } from "react-router-dom";
import { fetchOwnedArtworksCount } from "@/hooks/artworks/fetch_artworks/useArtworks";

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: "Followers" | "Following";
  users: User[];
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
  onRemove?: (userId: string) => void;
  isOwner: boolean; // <-- NEW PROP
}

const UserListModal: React.FC<UserListModalProps> = ({
  isOpen,
  onClose,
  title,
  users,
  onFollow,
  onUnfollow,
  onRemove,
  isOwner, // <-- NEW PROP
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { data: selectedUser, isLoading } = useUserQuery(selectedUserId || "");
  const { id } = useParams();
  const [artworksCounts, setArtworksCounts] = useState<Record<string, number>>({});
  const navigate = useNavigate();
  useEffect(() => {
    async function fetchAllCounts() {
      if (!users || users.length === 0) {
        setArtworksCounts({});
        return;
      }

      const counts = await Promise.all(
        users.map(async (user) => {
          const count = await fetchOwnedArtworksCount(user.id);
          return { userId: user.id, count };
        })
      );

      const countsMap = counts.reduce((acc, { userId, count }) => {
        acc[userId] = count;
        return acc;
      }, {} as Record<string, number>);

      setArtworksCounts(countsMap);
    }

    fetchAllCounts();
  }, [users]);

  const usersWithNames = users.map((user) => {
    return {
      ...user,
      name: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
    };
  });

  const filteredUsers = usersWithNames.filter((user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Helper for button rendering (for non-owner POV)
  // const renderFollowButton = (user: User) => {
  //   if (isFollowing) {
  //     return (
  //       <Button
  //         variant="outline"
  //         size="sm"
  //         className="text-[10px] px-4 h-5 rounded-full border border-gray-300 text-gray-700 bg-white hover:bg-gray-100"
  //         disabled
  //       >
  //         Following
  //       </Button>
  //     );
  //   }
  //   return (
  //     <Button
  //       variant="outline"
  //       size="sm"
  //       className="text-[10px] px-4 h-5 rounded-full border border-red-600 text-red-600 bg-white hover:bg-red-50"
  //       onClick={() => onFollow && onFollow(user.id)}
  //     >
  //       Follow
  //     </Button>
  //   );
  // };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-sm h-[70%] rounded-lg flex flex-col p-0 gap-0 overflow-hidden">
        <DialogTitle className="text-center text-md font-bold p-4">{title}</DialogTitle>
        {/* Search Bar */}
        <div className="relative px-8">
          <Search className="absolute left-12 top-3.5 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
          <Input
            placeholder="Search users"
            className="pl-10 pr-4 w-full h-7 rounded-full border border-gray-300 focus:outline-none focus:ring-0 focus:border-transparent"
            style={{ fontSize: "10px" }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {/* User List */}
        <ScrollArea className="flex-1 h-[350px] mt-4 px-8 overflow-auto">
          <div className="pr-2">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const { data: isFollowing } = useFollowStatus({ profileUserId: user.id });
                return (
                  <div key={user.id} className="flex items-center justify-between py-2 border-gray-100 last:border-0">
                    <div className="flex items-center">
                      <Avatar className="h-7 w-7 mr-3">
                        <AvatarImage src={user.profile_picture} alt={user.name} />
                        <AvatarFallback className="bg-gray-200 text-gray-700 ">{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <span className="font-medium text-[11px]">{user.name}</span>
                          {/* For non-owner, show '• Follow' for followers list if not following */}
                          {!isOwner && title === "Followers" && isFollowing === false && (
                            <button
                              onClick={() => onFollow && onFollow(user.id)}
                              className="text-[10px] text-red-600 ml-2 hover:underline cursor-pointer"
                            >
                              • Follow
                            </button>
                          )}
                        </div>
                        {title === "Following" && (
                          <span className="text-[10px] text-gray-500">{artworksCounts[user.id] ?? 0}items</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* BUTTONS LOGIC */}
                      {isOwner ? (
                        // OWNER POV: Show Remove (Followers) or Unfollow (Following)
                        title === "Followers" ? (
                          <button
                            className="text-[9px] px-4 h-5 rounded-full border hover:bg-gray-100 flex items-center gap-1"
                            onClick={() => onRemove && onRemove(user.id)}
                          >
                            <span>Remove</span>
                          </button>
                        ) : (
                          <button
                            className="text-[9px] border px-4 py-1 h-5 rounded-full text-red-800 border-red-800 hover:bg-red-50 flex items-center gap-1"
                            onClick={() => onUnfollow && onUnfollow(user.id)}
                          >
                            <span>Unfollow</span>
                          </button>
                        )
                      ) : (
                        // OTHER USERS POV: Show Follow/Following/Unfollow buttons as per screenshots
                        <>
                          {(title === "Followers" || title === "Following") &&
                            (isFollowing ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-[10px] px-4 h-5 rounded-full border border-gray-300 text-gray-700 bg-white hover:bg-gray-100"
                                disabled
                              >
                                Following
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-[10px] px-4 h-5 rounded-full border border-red-600 text-red-600 bg-white hover:bg-red-50"
                                onClick={() => onFollow && onFollow(user.id)}
                              >
                                Follow
                              </Button>
                            ))}
                        </>
                      )}

                      {/* Dropdown menu always visible */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-more-horizontal"
                            >
                              <circle cx="12" cy="12" r="1"></circle>
                              <circle cx="19" cy="12" r="1"></circle>
                              <circle cx="5" cy="12" r="1"></circle>
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-10">
                          <DropdownMenuItem
                            className="text-[9px] cursor-pointer"
                            onClick={() => {
                              navigate(`/userprofile/${user.id}`);
                            }}
                          >
                            View Profile
                          </DropdownMenuItem>

                          <DropdownMenuItem className="text-[9px] cursor-pointer">Block User</DropdownMenuItem>
                          <DropdownMenuItem className="text-[9px] cursor-pointer text-red-600">Report</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })
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
