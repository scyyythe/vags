import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, Search, Pencil, Trash2, Image as ImageIcon } from "lucide-react";

export interface Environment {
  id: string;
  name: string;
  slots: number;
  previewUrl: string;
  isActive: boolean;
  createdAt: string;
}

const EnvironmentSettings = () => {
  const [environments, setEnvironments] = useState<Environment[]>([
    {
      id: "1",
      name: "Modern Gallery",
      slots: 12,
      previewUrl: "/placeholder.svg",
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Classic Museum",
      slots: 20,
      previewUrl: "/placeholder.svg",
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "3",
      name: "Outdoor Space",
      slots: 8,
      previewUrl: "/placeholder.svg",
      isActive: false,
      createdAt: new Date().toISOString(),
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(null);

  // Form states
  const [newEnvName, setNewEnvName] = useState("");
  const [newEnvSlots, setNewEnvSlots] = useState("");
  const [newEnvFile, setNewEnvFile] = useState<File | null>(null);

  const filteredEnvironments = environments.filter((env) =>
    env.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleStatus = (id: string) => {
    setEnvironments((prev) =>
      prev.map((env) =>
        env.id === id ? { ...env, isActive: !env.isActive } : env
      )
    );
    toast.success("Environment status updated");
  };

  const handleDelete = (id: string) => {
    setEnvironments((prev) => prev.filter((env) => env.id !== id));
    toast.success("Environment deleted successfully");
  };

  const handleEdit = (environment: Environment) => {
    setSelectedEnvironment(environment);
    setNewEnvName(environment.name);
    setNewEnvSlots(environment.slots.toString());
    setEditDialogOpen(true);
  };

  const handleUpload = () => {
    if (!newEnvName || !newEnvSlots) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newEnvironment: Environment = {
      id: Date.now().toString(),
      name: newEnvName,
      slots: parseInt(newEnvSlots),
      previewUrl: "/placeholder.svg",
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setEnvironments((prev) => [...prev, newEnvironment]);
    toast.success("Environment uploaded successfully");

    // Reset form
    setNewEnvName("");
    setNewEnvSlots("");
    setNewEnvFile(null);
    setUploadDialogOpen(false);
  };

  const handleUpdate = () => {
    if (!selectedEnvironment || !newEnvName || !newEnvSlots) {
      toast.error("Please fill in all required fields");
      return;
    }

    setEnvironments((prev) =>
      prev.map((env) =>
        env.id === selectedEnvironment.id
          ? { ...env, name: newEnvName, slots: parseInt(newEnvSlots) }
          : env
      )
    );

    toast.success("Environment updated successfully");
    setEditDialogOpen(false);
    setSelectedEnvironment(null);
    setNewEnvName("");
    setNewEnvSlots("");
  };

  return (
    <Card className="p-6">
      <div className="space-y-6 text-xs">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xs font-semibold">3D Environment Management</h2>
            <p className="text-[11px] text-muted-foreground">
              Manage exhibition environments and their configurations
            </p>
          </div>
          <Button
            onClick={() => setUploadDialogOpen(true)}
            className="w-full sm:w-auto text-[10px] rounded-full h-8"
          >
            <Upload className="mr-2 h-3 w-3" />
            Upload New Environment
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search environments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-[10px] h-8 rounded-full"
            style={{ fontSize: "11px" }}
          />
        </div>

        {/* Environments Table with fixed header and scrollable body */}
        <div className="rounded-md border">
          {/* Fixed header */}
          <Table>
            <TableHeader>
              <TableRow className="text-[11px]">
                <TableHead>Preview</TableHead>
                <TableHead>Environment Name</TableHead>
                <TableHead>Slots</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
          </Table>

          {/* Scrollable body only */}
          <div className="max-h-[350px] overflow-auto">
            <Table>
              <TableBody>
                {filteredEnvironments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-[11px] text-muted-foreground"
                    >
                      No environments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEnvironments.map((env) => (
                    <TableRow key={env.id} className="text-[11px]">
                      <TableCell>
                        <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-muted">
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{env.name}</TableCell>
                      <TableCell>
                        <span className="text-[11px] text-muted-foreground">
                          {env.slots} artworks
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={env.isActive}
                            onCheckedChange={() => handleToggleStatus(env.id)}
                            className="scale-75"
                          />
                          <span className="text-[11px]">
                            {env.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(env)}
                            className="h-6 w-6"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(env.id)}
                            className="h-6 w-6"
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="text-xs max-w-[400px] rounded-md">
          <DialogHeader>
            <DialogTitle className="text-xs">Upload New Environment</DialogTitle>
            <DialogDescription className="text-[10px]">
              Add a new 3D environment for exhibitions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-[10px]">
            <div className="space-y-2">
              <Label htmlFor="env-name" className="text-[10px]">
                Environment Name
              </Label>
              <Input
                id="env-name"
                placeholder="e.g., Modern Gallery"
                value={newEnvName}
                onChange={(e) => setNewEnvName(e.target.value)}
                className="text-[10px] h-7"
                style={{ fontSize: "10px" }}

              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="env-slots" className="text-[10px]">
                Number of Slots
              </Label>
              <Input
                id="env-slots"
                type="number"
                placeholder="e.g., 12"
                value={newEnvSlots}
                onChange={(e) => setNewEnvSlots(e.target.value)}
                className="text-[10px] h-7"
                style={{ fontSize: "10px" }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="env-file" className="text-[10px]">
                3D Environment File
              </Label>
              <Input
                id="env-file"
                type="file"
                accept=".glb,.gltf,.obj,.fbx"
                onChange={(e) => setNewEnvFile(e.target.files?.[0] || null)}
                className="h-10"
                style={{ fontSize: "10px" }}
              />
              <p className="text-[10px] text-muted-foreground">
                Supported formats: GLB, GLTF, OBJ, FBX
              </p>
            </div>
          </div>
          <DialogFooter>
            {/* <Button variant="outline" onClick={() => setUploadDialogOpen(false)} className="text-[10px] h-7">
              Cancel
            </Button> */}
            <Button onClick={handleUpload} className="text-[10px] rounded-full h-7">
              Upload Environment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="text-xs">
          <DialogHeader>
            <DialogTitle className="text-[11px]">Edit Environment</DialogTitle>
            <DialogDescription className="text-[10px]">
              Update environment details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-[10px]">
            <div className="space-y-2">
              <Label htmlFor="edit-env-name" className="text-[10px]">
                Environment Name
              </Label>
              <Input
                id="edit-env-name"
                placeholder="e.g., Modern Gallery"
                value={newEnvName}
                onChange={(e) => setNewEnvName(e.target.value)}
                className="text-[10px] h-7"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-env-slots" className="text-[10px]">
                Number of Slots
              </Label>
              <Input
                id="edit-env-slots"
                type="number"
                placeholder="e.g., 12"
                value={newEnvSlots}
                onChange={(e) => setNewEnvSlots(e.target.value)}
                className="text-[10px] h-7"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="text-[10px] h-7">
              Cancel
            </Button>
            <Button onClick={handleUpdate} className="text-[10px] h-7">
              Update Environment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default EnvironmentSettings;
