import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { User } from "@/hooks/users/useUserQuery";
import useAllUsersQuery from "@/hooks/users/useAllUsersQuery";

interface AddArtistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (artist: User) => void;
  selectedArtists: User[];
}

const AddArtistDialog = ({ open, onOpenChange, onSelect, selectedArtists }: AddArtistDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: users = [], isLoading, isError } = useAllUsersQuery();

  const filteredArtists = users.filter(
    (user) =>
      (user.first_name?.toLowerCase() + " " + user.last_name?.toLowerCase() || user.username.toLowerCase()).includes(
        searchQuery.toLowerCase()
      ) && !selectedArtists.some((selected) => selected.id === user.id)
  );

  const handleSelect = (artist: User) => {
    onSelect(artist);
    onOpenChange(false);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-xs">Add Collaborator</DialogTitle>
        </DialogHeader>

        <div className="w-full max-w-sm space-y-4 py-0.5">
          <Input
            placeholder="Search artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ fontSize: "10px" }}
            className="rounded-full"
          />

          {isLoading ? (
            <div className="py-4 text-center text-xs text-gray-500">Loading artists...</div>
          ) : isError ? (
            <div className="py-4 text-center text-xs text-red-500">Failed to load artists</div>
          ) : filteredArtists.length > 0 ? (
            <div className="max-h-[240px] overflow-y-auto">
              {filteredArtists.map((artist) => (
                <div
                  key={artist.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                  onClick={() => handleSelect(artist)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-5 w-5 text-[10px] font-semibold bg-gray-300 text-white flex items-center justify-center overflow-hidden">
                      {artist.profile_picture ? (
                        <img
                          src={artist.profile_picture}
                          alt={artist.username}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>
                          {artist.first_name?.charAt(0).toUpperCase() || artist.username?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </Avatar>
                    <span className="text-[10px]">
                      {artist.first_name || ""} {artist.last_name || artist.username}
                    </span>
                  </div>

                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <i className="bx bx-plus text-xs"></i>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-gray-500">
              {searchQuery ? "No artists found" : "No available artists"}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddArtistDialog;
