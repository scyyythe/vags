export type DeliveryStatus = "sending" | "sent" | "delivered" | "seen" | "failed";

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  isStarred: boolean;
  type: "text" | "image" | "file" | "voice";
  deliveryStatus: DeliveryStatus;

  imageUrl?: string;
  text?: string;
  fileName?: string;
  voiceDuration?: number;
  isMine?: boolean;
  senderAvatar?: string;

  replyTo?: {
    messageId: string;
    senderId: string;
    senderName: string;
    type: "text" | "image" | "file" | "voice";
    content?: string;
    fileName?: string;
    imageUrl?: string;
    voiceDuration?: number;
  } | null;

  reactions?: {
    emoji: string;
    users: string[];
  }[];

  participantName?: string;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
  isArchived: boolean;
  isPinned: boolean;
  isMuted: boolean;
  messages: Message[];
  deletedBy?: string[]; // Array of user IDs who have deleted this conversation
  deletedAt?: { [userId: string]: Date }; // Track when each user deleted the conversation
  isRevived?: boolean; // Flag to indicate this conversation was deleted but has new messages
}
