import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

// Artist type definition
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

const AddArtistDialog = ({
  open,
  onOpenChange,
  onSelect,
  selectedArtists,
}: AddArtistDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock artists data
  const mockArtists: Artist[] = [
    {
      id: 201,
      name: "Jane Artist",
      avatar: "https://images.unsplash.com/photo-1520810627419-35e362c5dc07?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80"
    },
    {
      id: 202,
      name: "Sam Creator",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80"
    },
    {
      id: 203,
      name: "Pat Edwards",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80"
    },
    {
      id: 204,
      name: "Taylor Jones",
      avatar: "https://images.unsplash.com/photo-1492681290082-e932832941e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80"
    }
  ];

  // Filter artists based on search query and exclude already selected artists
  const filteredArtists = mockArtists.filter(
    (artist) => 
      artist.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
      !selectedArtists.some(selected => selected.id === artist.id)
  );

  const handleSelect = (artist: Artist) => {
    onSelect(artist);
    onOpenChange(false);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-sm">Add Collaborator</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <Input
            placeholder="Search artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs"
          />
          
          {filteredArtists.length > 0 ? (
            <div className="max-h-[240px] overflow-y-auto">
              {filteredArtists.map((artist) => (
                <div
                  key={artist.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                  onClick={() => handleSelect(artist)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <img src={artist.avatar} alt={artist.name} />
                    </Avatar>
                    <span className="text-xs">{artist.name}</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 w-6 p-0"
                  >
                    <i className="bx bx-plus text-xs"></i>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500 text-xs">
              {searchQuery ? "No artists found" : "No available artists"}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            className="w-full text-xs"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddArtistDialog;
