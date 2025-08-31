import { useEffect, useState } from "react";
import { db } from "@/firebase/firebaseConfig";
import { collection, query, where, orderBy, onSnapshot, getDocs } from "firebase/firestore";
import apiClient from "@/utils/apiClient";
import { Message, Conversation } from "@/components/user_dashboard/local_components/chat/types/types";

export const useUserConversations = (userId: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", userId),
      orderBy("lastMessageTime", "desc")
    );

    const unsub = onSnapshot(q, async (snapshot) => {
      const convs: Conversation[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
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

        const messages: Message[] = messagesSnapshot.docs.map((m) => {
          const msgData = m.data();
          const senderId = msgData.senderId as string;
          const senderInfo = userCache[senderId] || { name: "Unknown", avatar: undefined };

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
            timestamp: msgData.createdAt?.toDate?.() ?? new Date(),
            isRead: msgData.isRead || false,
          };
        });

        const firstParticipant = participantIds[0];
        convs.push({
          id: docSnap.id,
          participantId: firstParticipant,
          participantName: userCache[firstParticipant]?.name || "Unknown",
          participantAvatar: userCache[firstParticipant]?.avatar,
          lastMessage: data.lastMessage,
          lastMessageTime: data.lastMessageTime?.toDate?.() ?? new Date(),
          unreadCount: data.unreadCount || 0,
          isArchived: data.isArchived || false,
          isPinned: data.isPinned || false,
          isMuted: data.isMuted || false,
          isOnline: true,
          messages,
        });
      }

      setConversations(convs);
    });

    return () => unsub();
  }, [userId]);

  return [conversations, setConversations] as const;
};
