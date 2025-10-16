export type DeliveryStatus = "sending" | "sent" | "delivered" | "seen" | "failed";

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  isStarred: boolean;
  type: "text" | "image" | "file" | "voice" | "automatic";
  deliveryStatus: DeliveryStatus;

  imageUrl?: string;
  text?: string;
  fileName?: string;
  voiceDuration?: number;
  isMine?: boolean;
  senderAvatar?: string;

  // Automatic message specific fields
  automaticMessageData?: {
    sellerName: string;
    artworkTitle: string;
    buyerName: string;
    orderId?: string;
    messageType?: "newOrder" | "thankYou";
  };

  replyTo?: {
    messageId: string;
    senderId: string;
    senderName: string;
    type: "text" | "image" | "file" | "voice" | "automatic";
    content?: string;
    fileName?: string;
    imageUrl?: string;
    voiceDuration?: number;
    translatedContent?: string | null;
  } | null;

  reactions?: {
    emoji: string;
    users: string[];
  }[];

  participantName?: string;
  translatedContent?: string | null;
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
  mutedBy?: string[]; // Array of user IDs who have muted this conversation
  pinnedBy?: string[]; // Array of user IDs who have pinned this conversation
  archivedBy?: string[]; // Array of user IDs who have archived this conversation
  isRevived?: boolean; // Flag to indicate this conversation was deleted but has new messages
}
