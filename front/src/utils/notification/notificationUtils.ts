import { toast } from "sonner";

type CollaboratorNotification = {
  collaboratorId: string;
  collaboratorName: string;
  exhibitId: number;
  exhibitTitle: string;
};

// Function to send notifications to collaborators
export const sendCollaboratorNotifications = (notifications: CollaboratorNotification[]) => {
  // In a real app, this would make an API call to store notifications
  console.log("Sending notifications to collaborators:", notifications);

  // Store notifications in localStorage for demo purposes
  const storedNotifications = localStorage.getItem("collaboratorNotifications") || "[]";
  const existingNotifications = JSON.parse(storedNotifications);

  const updatedNotifications = [
    ...existingNotifications,
    ...notifications.map((notif) => ({
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      type: "exhibit_invitation",
      title: "Collaboration Request",
      message: `You've been invited to collaborate on '${notif.exhibitTitle}'`,
      exhibitId: notif.exhibitId,
      collaboratorId: notif.collaboratorId,
      timestamp: new Date().toISOString(),
      read: false,
    })),
  ];

  localStorage.setItem("collaboratorNotifications", JSON.stringify(updatedNotifications));

  return notifications.length;
};

// Function to get notifications for a specific collaborator
export const getCollaboratorNotifications = (collaboratorId: number) => {
  const storedNotifications = localStorage.getItem("collaboratorNotifications") || "[]";
  const notifications = JSON.parse(storedNotifications);

  return notifications.filter((notif: any) => notif.collaboratorId === collaboratorId);
};

// Function to mark notification as read
export const markNotificationAsRead = (notificationId: string) => {
  const storedNotifications = localStorage.getItem("collaboratorNotifications") || "[]";
  const notifications = JSON.parse(storedNotifications);

  const updatedNotifications = notifications.map((notif: any) =>
    notif.id === notificationId ? { ...notif, read: true } : notif
  );

  localStorage.setItem("collaboratorNotifications", JSON.stringify(updatedNotifications));
};

// Function to show collaborator notification toast
export const showCollaboratorNotification = (count: number) => {
  toast(`Invitations sent to ${count} collaborator${count > 1 ? "s" : ""}`, {
    description: "They will receive a notification to add their artwork",
    action: {
      label: "Dismiss",
      onClick: () => {},
    },
  });
};
