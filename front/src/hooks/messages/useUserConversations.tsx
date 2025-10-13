import { useEffect, useState } from "react";
import { db } from "@/firebase/firebaseConfig";
import { collection, query, where, orderBy, onSnapshot, getDocs } from "firebase/firestore";
import apiClient from "@/utils/apiClient";
import { Message, Conversation } from "@/components/user_dashboard/local_components/chat/types/types";

export const useUserConversations = (userId: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    // Create a query that excludes conversations deleted by the current user
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", userId),
      orderBy("lastMessageTime", "desc")
    );

    const unsub = onSnapshot(q, async (snapshot) => {
      setIsLoading(true);
      const convs: Conversation[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();

        // Check if current user has deleted this conversation
        const deletedBy = data.deletedBy || [];
        const isDeletedByUser = deletedBy.includes(userId);

        // If user deleted the conversation, check if there are new messages since deletion
        if (isDeletedByUser) {
          // Get the deletion timestamp for this user
          const deletedAt = data.deletedAt || {};
          const userDeletedAt = deletedAt[userId]?.toDate?.() ?? null;

          // If user deleted the conversation, only show it if there are messages AFTER deletion
          if (userDeletedAt) {
            const lastMessageTime = data.lastMessageTime?.toDate?.() ?? new Date();

            // Only show the conversation if the last message was sent AFTER the user deleted it
            if (lastMessageTime <= userDeletedAt) {
              continue; // Skip conversations with no new messages since deletion
            }

            // Also check if the last message was sent by the current user
            // If so, don't show it as a "revived" conversation
            const lastMessageSenderId = data.lastMessageSenderId;
            if (lastMessageSenderId === userId) {
              continue; // Skip if the last message was sent by the current user
            }
          } else {
            // If no deletion timestamp, skip the conversation (shouldn't happen but safety check)
            continue;
          }
        }

        const participantIds: string[] = data.participants.filter((id: string) => id !== userId);

        const userCache: Record<string, { name: string; avatar?: string }> = {};

        for (const pid of participantIds) {
          try {
            const res = await apiClient.get(`/user/${pid}/`);
            userCache[pid] = {
              name: `${res.data.first_name} ${res.data.last_name}`,
              avatar: res.data.profile_picture,
            };
          } catch (err) {
            console.error("❌ Failed to fetch user:", err);
            userCache[pid] = { name: "Unknown" };
          }
        }

        // Fetch messages
        const messagesQuery = query(
          collection(db, "conversations", docSnap.id, "messages"),
          orderBy("createdAt", "asc")
        );
        const messagesSnapshot = await getDocs(messagesQuery);

        // Get the deletion timestamp for this user
        const deletedAt = data.deletedAt || {};
        const userDeletedAt = deletedAt[userId]?.toDate?.() ?? null;

        const messages: Message[] = messagesSnapshot.docs
          .map((m) => {
            const msgData = m.data();
            const senderId = msgData.senderId as string;
            const senderInfo = userCache[senderId] || { name: "Unknown", avatar: undefined };
            const messageTimestamp = msgData.createdAt?.toDate?.() ?? new Date();

            return {
              id: m.id,
              senderId,
              senderName: senderInfo.name,
              senderAvatar: senderInfo.avatar,
              content: msgData.content || "",
              type: msgData.type || "text",
              fileName: msgData.fileName,
              imageUrl: msgData.imageUrl,
              voiceDuration: msgData.voiceDuration,
              isStarred: msgData.isStarred || false,
              reactions: msgData.reactions || [],
              deliveryStatus: msgData.deliveryStatus || "sent",
              replyTo: msgData.replyTo || null,
              timestamp: messageTimestamp,
              isRead: msgData.isRead || false,
            };
          })
          .filter((message) => {
            // If user deleted the conversation, only show messages sent after deletion
            if (userDeletedAt && isDeletedByUser) {
              return message.timestamp > userDeletedAt;
            }
            // If user didn't delete the conversation, show all messages
            return true;
          });

        const firstParticipant = participantIds[0];

        // Check if this is a revived conversation (was deleted by user but has new activity)
        const isRevivedConversation = isDeletedByUser;

        // Get the unread count for this specific user
        const userUnreadCount = data.unread && data.unread[userId] ? data.unread[userId] : 0;

        convs.push({
          id: docSnap.id,
          participantId: firstParticipant,
          participantName: userCache[firstParticipant]?.name || "Unknown",
          participantAvatar: userCache[firstParticipant]?.avatar,
          lastMessage: isRevivedConversation ? "New message" : data.lastMessage,
          lastMessageTime: data.lastMessageTime?.toDate?.() ?? new Date(),
          unreadCount: isRevivedConversation ? 1 : userUnreadCount,
          isArchived: data.isArchived || false,
          isPinned: data.isPinned || false,
          isMuted: data.isMuted || false,
          isOnline: true,
          messages: messages, // Messages are already filtered based on deletion timestamp
          deletedBy: deletedBy,
          deletedAt: data.deletedAt || {},
          isRevived: isRevivedConversation, // Add flag to indicate this is a revived conversation
        });
      }

      setConversations(convs);
      setIsLoading(false);
    });

    return () => {
      unsub();
    };
  }, [userId]);

  return [conversations, setConversations, isLoading] as const;
};
