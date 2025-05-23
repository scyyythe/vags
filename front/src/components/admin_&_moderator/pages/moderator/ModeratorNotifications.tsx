import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "system" | "user" | "report" | "alert";
  status: "unread" | "read" | "archived";
  createdAt: string;
  relatedId?: string;
}

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
});

const mockNotifications: Notification[] = [
  {
    id: "notif1",
    title: "New Report: Inappropriate Content",
    message: "A new report has been submitted for artwork 'Dark Shadows'. Please review as soon as possible.",
    type: "report",
    status: "unread",
    createdAt: "2023-06-22T10:30:00",
    relatedId: "art12345",
  },
  {
    id: "notif2",
    title: "User Warning Issued",
    message: "You issued a warning to user @creative456 for harassment. The warning has been successfully delivered.",
    type: "user",
    status: "unread",
    createdAt: "2023-06-22T09:15:00",
    relatedId: "user456",
  },
  {
    id: "notif3",
    title: "Content Removed Automatically",
    message: "The system has automatically removed a comment from post #5678 due to prohibited language.",
    type: "system",
    status: "read",
    createdAt: "2023-06-21T15:45:00",
    relatedId: "comment789",
  },
  {
    id: "notif4",
    title: "High Priority: Copyright Strike",
    message: "A DMCA takedown notice has been received for artwork 'Blue Waves'. Immediate action required.",
    type: "alert",
    status: "unread",
    createdAt: "2023-06-21T14:20:00",
    relatedId: "art56789",
  },
  {
    id: "notif5",
    title: "Multiple Reports for User",
    message: "User @pixelmaster has received 5 reports in the last 24 hours. Please investigate their recent activity.",
    type: "report",
    status: "read",
    createdAt: "2023-06-20T11:10:00",
    relatedId: "user789",
  },
  {
    id: "notif6",
    title: "System Maintenance Complete",
    message: "The scheduled maintenance has been completed successfully. All moderation tools are now fully operational.",
    type: "system",
    status: "archived",
    createdAt: "2023-06-19T09:30:00",
  },
];

const ModeratorNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      message: "",
    },
  });

  const handleCreateNotification = (data: z.infer<typeof formSchema>) => {
    const newNotification: Notification = {
      id: `notif${notifications.length + 1}`,
      title: data.title,
      message: data.message,
      type: "system",
      status: "unread",
      createdAt: new Date().toISOString(),
    };

    setNotifications([newNotification, ...notifications]);
    toast.success("System notification created");
    setCreateDialogOpen(false);
    form.reset();
  };

  const handleViewNotification = (notification: Notification) => {
    const updatedNotifications = notifications.map(n => {
      if (n.id === notification.id && n.status === "unread") {
        return { ...n, status: "read" as const };
      }
      return n;
    }) as Notification[];
    setNotifications(updatedNotifications);
    setSelectedNotification(notification);
    setViewDialogOpen(true);
  };

  const handleArchiveNotification = (id: string) => {
    const updatedNotifications = notifications.map(n => {
      if (n.id === id) {
        return { ...n, status: "archived" as const };
      }
      return n;
    }) as Notification[];
    setNotifications(updatedNotifications);
    toast.success("Notification archived");
    setViewDialogOpen(false);
  };

  const handleMarkAllAsRead = () => {
    const updatedNotifications = notifications.map(n => {
      if (n.status === "unread") {
        return { ...n, status: "read" as const };
      }
      return n;
    }) as Notification[];
    setNotifications(updatedNotifications);
    toast.success("All notifications marked as read");
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const filteredNotifications = notifications
    .filter(n => n.status !== "archived" && n.title.toLowerCase().includes(searchQuery.toLowerCase()));
  
  const unreadCount = notifications.filter(n => n.status === "unread").length;

  const getTypeIcon = (type: Notification["type"]) => {
    switch (type) {
      case "system":
        return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
      case "user":
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case "report":
        return <div className="w-2 h-2 bg-amber-500 rounded-full"></div>;
      case "alert":
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Notifications</h1>
          <p className="text-xs text-muted-foreground">
            View and manage system and user notifications
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            disabled={unreadCount === 0}
            onClick={handleMarkAllAsRead}
          >
            Mark All as Read
          </Button>
          <Button
            size="sm"
            className="text-xs"
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Notification
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <Badge className="bg-primary">{unreadCount}</Badge>
          <span className="text-xs font-medium">Unread Notifications</span>
        </div>
        <div className="relative w-64">
          <Input
            placeholder="Search notifications..."
            className="text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Notification Center</CardTitle>
          <CardDescription className="text-xs">
            Recent system messages and alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length > 0 ? (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border rounded-md p-3 cursor-pointer hover:bg-muted/50 ${
                    notification.status === "unread" ? "bg-muted/20 border-l-4 border-l-primary" : ""
                  }`}
                  onClick={() => handleViewNotification(notification)}
                >
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(notification.type)}
                      <h3 className={`text-xs ${notification.status === "unread" ? "font-semibold" : ""}`}>
                        {notification.title}
                      </h3>
                    </div>
                    <span className="text-3xs text-muted-foreground">
                      {formatDateTime(notification.createdAt)}
                    </span>
                  </div>
                  <p className="text-2xs text-muted-foreground mt-1 line-clamp-1">
                    {notification.message}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">No notifications found</p>
              <p className="text-xs text-muted-foreground">
                {searchQuery ? "Try adjusting your search terms" : "You're all caught up!"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-sm">Create System Notification</DialogTitle>
            <DialogDescription className="text-xs">
              Create a new notification to be sent to all moderators
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(handleCreateNotification)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Notification Title</FormLabel>
                    <FormControl>
                      <Input className="text-xs" placeholder="Enter notification title" {...field} />
                    </FormControl>
                    <FormMessage className="text-2xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Message</FormLabel>
                    <FormControl>
                      <Textarea
                        className="w-full h-24 p-2 text-xs border rounded-md"
                        placeholder="Enter notification message"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-3xs">
                      This message will be visible to all system moderators.
                    </FormDescription>
                    <FormMessage className="text-2xs" />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="text-xs">
                  Create Notification
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {selectedNotification?.title}
            </DialogTitle>
            {selectedNotification && (
              <DialogDescription className="text-xs flex justify-between">
                <span>
                  {selectedNotification.type.charAt(0).toUpperCase() + selectedNotification.type.slice(1)} Notification
                </span>
                <span>
                  {formatDateTime(selectedNotification.createdAt)}
                </span>
              </DialogDescription>
            )}
          </DialogHeader>

          {selectedNotification && (
            <div className="space-y-4">
              <div className="bg-muted/20 p-3 rounded-md">
                <p className="text-xs">{selectedNotification.message}</p>
              </div>

              {selectedNotification.relatedId && (
                <div>
                  <p className="text-2xs text-muted-foreground">
                    Reference ID: {selectedNotification.relatedId}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleArchiveNotification(selectedNotification.id)}
                >
                  Archive
                </Button>
                {selectedNotification.relatedId && (
                  <Button
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      toast.success("Opening related content");
                      setViewDialogOpen(false);
                    }}
                  >
                    View Related Content
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModeratorNotifications;
