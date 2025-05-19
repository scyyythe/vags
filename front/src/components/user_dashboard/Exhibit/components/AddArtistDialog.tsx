import { useState } from "react";
import { Search, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

type Artist = {
  id: number;
  name: string;
  avatar: string;
};

interface AddArtistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (artist: Artist) => void;
  selectedArtists: Artist[];
}

const AddArtistDialog = ({ open, onOpenChange, onSelect, selectedArtists }: AddArtistDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock mutual friends data
  const mutualFriends: Artist[] = [
    { id: 101, name: "Alex Johnson", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80" },
    { id: 102, name: "Morgan Smith", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80" },
    { id: 103, name: "Casey Taylor", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80" },
    { id: 104, name: "Jordan Lee", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80" },
    { id: 105, name: "Riley Wilson", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80" },
  ];

  // Filter friends based on search query
  const filteredFriends = mutualFriends.filter((friend) => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedArtists.some(artist => artist.id === friend.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold mb-4">Add Collaborator</DialogTitle>
        </DialogHeader>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => (
              <div 
                key={friend.id}
                className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                onClick={() => {
                  onSelect(friend);
                  onOpenChange(false);
                }}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <img src={friend.avatar} alt={friend.name} className="rounded-full" />
                  </Avatar>
                  <span>{friend.name}</span>
                </div>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No matching artists found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddArtistDialog;
