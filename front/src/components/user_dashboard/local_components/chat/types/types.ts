export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  isStarred: boolean;
  type: 'text' | 'image' | 'file' | 'voice';
  reactions?: { emoji: string; users: string[] }[];
  replyTo?: string;
  imageUrl?: string;
  fileName?: string;
  voiceDuration?: number;
  deliveryStatus: 'sent' | 'delivered' | 'seen';
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
}
