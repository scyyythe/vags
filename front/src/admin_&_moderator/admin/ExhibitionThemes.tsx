import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash, Plus, Image } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { toast } from "@/hooks/use-toast";

// Mock theme data
const mockThemes = [
  {
    id: "theme1",
    name: "Modern Expressionism",
    description: "Bold colors and dynamic compositions that evoke emotion and movement.",
    imageUrl: "https://via.placeholder.com/300x200?text=Modern+Expressionism",
    exhibitionsCount: 3,
  },
  {
    id: "theme2",
    name: "Digital Art & NFTs",
    description: "Explore the intersection of technology and creativity in the digital era.",
    imageUrl: "https://via.placeholder.com/300x200?text=Digital+Art",
    exhibitionsCount: 2,
  },
  {
    id: "theme3",
    name: "Classical Revival",
    description: "Rediscover the techniques and aesthetics of Renaissance and classical art.",
    imageUrl: "https://via.placeholder.com/300x200?text=Classical+Revival",
    exhibitionsCount: 5,
  },
  {
    id: "theme4",
    name: "Abstract Expressionism",
    description: "Spontaneous and subconscious creation emphasizing emotional intensity.",
    imageUrl: "https://via.placeholder.com/300x200?text=Abstract+Expressionism",
    exhibitionsCount: 1,
  },
  {
    id: "theme5",
    name: "Documentary Photography",
    description: "Visual storytelling that captures real-life events and social narratives.",
    imageUrl: "https://via.placeholder.com/300x200?text=Documentary+Photography",
    exhibitionsCount: 4,
  },
];

const ExhibitionThemes = () => {
  const [themes, setThemes] = useState(mockThemes);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<{
    id?: string;
    name: string;
    description: string;
    imageUrl: string;
  }>({
    name: "",
    description: "",
    imageUrl: "",
  });
  const [themeToDelete, setThemeToDelete] = useState<string | null>(null);

  const handleCreateTheme = () => {
    setCurrentTheme({
      name: "",
      description: "",
      imageUrl: "",
    });
    setIsCreating(true);
  };

  const handleEditTheme = (theme: typeof mockThemes[0]) => {
    setCurrentTheme({
      id: theme.id,
      name: theme.name,
      description: theme.description,
      imageUrl: theme.imageUrl,
    });
    setIsEditing(true);
  };

  const handleDeleteTheme = (id: string) => {
    setThemeToDelete(id);
  };

  const confirmDelete = () => {
    if (themeToDelete) {
      setThemes(themes.filter((theme) => theme.id !== themeToDelete));
      toast({
        title: "Theme deleted",
        description: "The theme has been successfully deleted.",
      });
      setThemeToDelete(null);
    }
  };

  const handleSaveTheme = () => {
    if (isCreating) {
      const newId = `theme${themes.length + 1}`;
      setThemes([...themes, {
        id: newId,
        name: currentTheme.name,
        description: currentTheme.description,
        imageUrl: currentTheme.imageUrl || "https://via.placeholder.com/300x200?text=New+Theme",
        exhibitionsCount: 0,
      }]);
      toast({
        title: "Theme created",
        description: "The new theme has been successfully created.",
      });
      setIsCreating(false);
    } else if (isEditing && currentTheme.id) {
      setThemes(themes.map(theme => 
        theme.id === currentTheme.id 
          ? { ...theme, name: currentTheme.name, description: currentTheme.description, imageUrl: currentTheme.imageUrl }
          : theme
      ));
      toast({
        title: "Theme updated",
        description: "The theme has been successfully updated.",
      });
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Exhibition Themes</h2>
        <Button onClick={handleCreateTheme} className="flex items-center gap-2">
          <Plus size={16} />
          Create Theme
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <Card key={theme.id} className="overflow-hidden">
            <div className="relative">
              <AspectRatio ratio={16 / 9}>
                <img
                  src={theme.imageUrl}
                  alt={theme.name}
                  className="object-cover w-full h-full"
                />
              </AspectRatio>
            </div>
            <CardHeader className="pb-2">
              <CardTitle>{theme.name}</CardTitle>
              <CardDescription>{theme.exhibitionsCount} exhibitions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">{theme.description}</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t pt-4">
              <Button size="sm" variant="ghost" onClick={() => handleEditTheme(theme)}>
                <Pencil size={16} className="mr-2" /> Edit
              </Button>
              <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteTheme(theme.id)}>
                <Trash size={16} className="mr-2" /> Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Create/Edit Theme Dialog */}
      <Dialog open={isCreating || isEditing} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false);
          setIsEditing(false);
        }
      }}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{isCreating ? "Create New Theme" : "Edit Theme"}</DialogTitle>
            <DialogDescription>
              {isCreating ? "Add a new exhibition theme to the gallery." : "Modify the details of this exhibition theme."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Theme Name</Label>
              <Input
                id="name"
                value={currentTheme.name}
                onChange={(e) => setCurrentTheme({ ...currentTheme, name: e.target.value })}
                placeholder="e.g., Modern Expressionism"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={currentTheme.description}
                onChange={(e) => setCurrentTheme({ ...currentTheme, description: e.target.value })}
                placeholder="Describe the theme..."
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <div className="flex gap-2">
                <Input
                  id="imageUrl"
                  value={currentTheme.imageUrl}
                  onChange={(e) => setCurrentTheme({ ...currentTheme, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
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
            <Button onClick={handleSaveTheme}>{isCreating ? "Create" : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!themeToDelete} onOpenChange={(open) => {
        if (!open) setThemeToDelete(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this theme? This action cannot be undone and may affect exhibitions using this theme.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setThemeToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Theme
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExhibitionThemes;
