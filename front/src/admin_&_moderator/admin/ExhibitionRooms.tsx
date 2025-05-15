import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Pencil, Trash, Plus, Eye, Image } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

// Mock data for virtual rooms
const mockRooms = [
  {
    id: "room1",
    name: "The Grand Hall",
    description: "A spacious virtual hall perfect for larger installations and sculpture displays.",
    theme: "Modern Expressionism",
    exhibitionId: "ex1",
    exhibitionName: "Contemporary Masters",
    capacity: 50,
    artworkCount: 12,
    imageUrl: "https://via.placeholder.com/400x300?text=Grand+Hall",
  },
  {
    id: "room2",
    name: "Digital Dome",
    description: "An immersive 360° environment for digital art and interactive experiences.",
    theme: "Digital Art & NFTs",
    exhibitionId: "ex2",
    exhibitionName: "Digital Revolution",
    capacity: 30,
    artworkCount: 8,
    imageUrl: "https://via.placeholder.com/400x300?text=Digital+Dome",
  },
  {
    id: "room3",
    name: "Renaissance Wing",
    description: "Traditional gallery space with period-appropriate styling for classical works.",
    theme: "Classical Revival",
    exhibitionId: "ex3",
    exhibitionName: "Renaissance Revisited",
    capacity: 40,
    artworkCount: 15,
    imageUrl: "https://via.placeholder.com/400x300?text=Renaissance+Wing",
  },
  {
    id: "room4",
    name: "Abstract Corridor",
    description: "Long hallway gallery perfect for sequential viewing experiences.",
    theme: "Abstract Expressionism",
    exhibitionId: "ex4",
    exhibitionName: "Abstract Wonders",
    capacity: 25,
    artworkCount: 10,
    imageUrl: "https://via.placeholder.com/400x300?text=Abstract+Corridor",
  },
  {
    id: "room5",
    name: "Photography Studio",
    description: "Minimalist space with perfect lighting for photographic works.",
    theme: "Documentary Photography",
    exhibitionId: "ex5",
    exhibitionName: "Photography Masters",
    capacity: 35,
    artworkCount: 20,
    imageUrl: "https://via.placeholder.com/400x300?text=Photography+Studio",
  },
];

// Mock exhibition data for dropdown
const mockExhibitions = [
  { id: "ex1", name: "Contemporary Masters" },
  { id: "ex2", name: "Digital Revolution" },
  { id: "ex3", name: "Renaissance Revisited" },
  { id: "ex4", name: "Abstract Wonders" },
  { id: "ex5", name: "Photography Masters" },
];

// Mock theme data for dropdown
const mockThemes = [
  { id: "theme1", name: "Modern Expressionism" },
  { id: "theme2", name: "Digital Art & NFTs" },
  { id: "theme3", name: "Classical Revival" },
  { id: "theme4", name: "Abstract Expressionism" },
  { id: "theme5", name: "Documentary Photography" },
];

const ExhibitionRooms = () => {
  const [rooms, setRooms] = useState(mockRooms);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<{
    id?: string;
    name: string;
    description: string;
    theme: string;
    exhibitionId: string;
    capacity: number;
    imageUrl: string;
  }>({
    name: "",
    description: "",
    theme: "",
    exhibitionId: "",
    capacity: 30,
    imageUrl: "",
  });
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);

  const handleCreateRoom = () => {
    setCurrentRoom({
      name: "",
      description: "",
      theme: "",
      exhibitionId: "",
      capacity: 30,
      imageUrl: "",
    });
    setIsCreating(true);
  };

  const handleEditRoom = (room: typeof mockRooms[0]) => {
    setCurrentRoom({
      id: room.id,
      name: room.name,
      description: room.description,
      theme: room.theme,
      exhibitionId: room.exhibitionId,
      capacity: room.capacity,
      imageUrl: room.imageUrl,
    });
    setIsEditing(true);
  };

  const handleViewRoom = (room: typeof mockRooms[0]) => {
    setCurrentRoom({
      id: room.id,
      name: room.name,
      description: room.description,
      theme: room.theme,
      exhibitionId: room.exhibitionId,
      capacity: room.capacity,
      imageUrl: room.imageUrl,
    });
    setIsViewing(true);
  };

  const handleDeleteRoom = (id: string) => {
    setRoomToDelete(id);
  };

  const confirmDelete = () => {
    if (roomToDelete) {
      setRooms(rooms.filter((room) => room.id !== roomToDelete));
      toast({
        title: "Room deleted",
        description: "The virtual room has been successfully deleted.",
      });
      setRoomToDelete(null);
    }
  };

  const handleSaveRoom = () => {
    // Find exhibition name from ID
    const exhibition = mockExhibitions.find(ex => ex.id === currentRoom.exhibitionId);
    
    if (isCreating) {
      const newId = `room${rooms.length + 1}`;
      setRooms([...rooms, {
        id: newId,
        name: currentRoom.name,
        description: currentRoom.description,
        theme: currentRoom.theme,
        exhibitionId: currentRoom.exhibitionId,
        exhibitionName: exhibition?.name || "Unknown Exhibition",
        capacity: currentRoom.capacity,
        artworkCount: 0,
        imageUrl: currentRoom.imageUrl || "https://via.placeholder.com/400x300?text=New+Room",
      }]);
      toast({
        title: "Room created",
        description: "The virtual room has been successfully created.",
      });
      setIsCreating(false);
    } else if (isEditing && currentRoom.id) {
      setRooms(rooms.map(room => 
        room.id === currentRoom.id 
          ? { 
              ...room, 
              name: currentRoom.name, 
              description: currentRoom.description, 
              theme: currentRoom.theme,
              exhibitionId: currentRoom.exhibitionId,
              exhibitionName: exhibition?.name || room.exhibitionName,
              capacity: currentRoom.capacity,
              imageUrl: currentRoom.imageUrl
            }
          : room
      ));
      toast({
        title: "Room updated",
        description: "The virtual room has been successfully updated.",
      });
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Virtual Rooms</h2>
        <Button onClick={handleCreateRoom} className="flex items-center gap-2">
          <Plus size={16} />
          Create Room
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <Card key={room.id} className="overflow-hidden">
            <div className="relative">
              <AspectRatio ratio={4/3}>
                <img
                  src={room.imageUrl}
                  alt={room.name}
                  className="object-cover w-full h-full"
                />
              </AspectRatio>
              <Badge className="absolute top-2 right-2 bg-white/70 text-black">
                {room.artworkCount} artworks
              </Badge>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                {room.name}
                <Badge variant="outline">{room.theme}</Badge>
              </CardTitle>
              <CardDescription>
                Part of: {room.exhibitionName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">{room.description}</p>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <div className="text-sm text-muted-foreground">
                Capacity: {room.capacity} visitors
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => handleViewRoom(room)}>
                  <Eye size={16} className="mr-2" /> View
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleEditRoom(room)}>
                  <Pencil size={16} className="mr-2" /> Edit
                </Button>
                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteRoom(room.id)}>
                  <Trash size={16} />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Create/Edit Room Dialog */}
      <Dialog open={isCreating || isEditing} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false);
          setIsEditing(false);
        }
      }}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{isCreating ? "Create New Virtual Room" : "Edit Virtual Room"}</DialogTitle>
            <DialogDescription>
              {isCreating ? "Add a new virtual room to an exhibition." : "Modify the details of this virtual room."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Room Name</Label>
              <Input
                id="name"
                value={currentRoom.name}
                onChange={(e) => setCurrentRoom({ ...currentRoom, name: e.target.value })}
                placeholder="e.g., The Grand Hall"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={currentRoom.description}
                onChange={(e) => setCurrentRoom({ ...currentRoom, description: e.target.value })}
                placeholder="Describe the virtual room..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="exhibition">Exhibition</Label>
                <Select 
                  value={currentRoom.exhibitionId} 
                  onValueChange={(value) => setCurrentRoom({ ...currentRoom, exhibitionId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Exhibition" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockExhibitions.map((exhibition) => (
                      <SelectItem key={exhibition.id} value={exhibition.id}>
                        {exhibition.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="theme">Theme</Label>
                <Select 
                  value={currentRoom.theme} 
                  onValueChange={(value) => setCurrentRoom({ ...currentRoom, theme: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockThemes.map((theme) => (
                      <SelectItem key={theme.id} value={theme.name}>
                        {theme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="capacity">Visitor Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={currentRoom.capacity}
                onChange={(e) => setCurrentRoom({ ...currentRoom, capacity: parseInt(e.target.value) || 0 })}
                min="1"
                max="100"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <div className="flex gap-2">
                <Input
                  id="imageUrl"
                  value={currentRoom.imageUrl}
                  onChange={(e) => setCurrentRoom({ ...currentRoom, imageUrl: e.target.value })}
                  placeholder="https://example.com/room.jpg"
                  className="flex-1"
                />
                <Button variant="outline" size="icon">
                  <Image size={16} />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreating(false);
              setIsEditing(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveRoom}>{isCreating ? "Create" : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Room Dialog */}
      <Dialog open={isViewing} onOpenChange={setIsViewing}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{currentRoom.name}</DialogTitle>
            <DialogDescription>
              Virtual room in {mockExhibitions.find(ex => ex.id === currentRoom.exhibitionId)?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="aspect-video overflow-hidden rounded-md">
              <img
                src={currentRoom.imageUrl}
                alt={currentRoom.name}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="grid gap-2">
              <h3 className="font-medium">Description</h3>
              <p className="text-sm text-muted-foreground">{currentRoom.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium">Theme</h3>
                <p className="text-sm text-muted-foreground">{currentRoom.theme}</p>
              </div>
              <div>
                <h3 className="font-medium">Visitor Capacity</h3>
                <p className="text-sm text-muted-foreground">{currentRoom.capacity} visitors</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewing(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!roomToDelete} onOpenChange={(open) => {
        if (!open) setRoomToDelete(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this virtual room? This action cannot be undone and may affect exhibitions and artwork arrangements.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoomToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExhibitionRooms;
