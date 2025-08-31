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
        const otherUserId = data.participants.find((id: string) => id !== userId);

        let participantName = "Unknown";
        let participantAvatar = undefined;

        if (otherUserId) {
          try {
            const res = await apiClient.get(`/user/${otherUserId}/`);
            participantName = `${res.data.first_name} ${res.data.last_name}`;
            participantAvatar = res.data.profile_picture;
          } catch (err) {
            console.error("❌ Failed to fetch user from API:", err);
          }
        }

        const messagesQuery = query(
          collection(db, "conversations", docSnap.id, "messages"),
          orderBy("createdAt", "asc")
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        const messages: Message[] = messagesSnapshot.docs.map((m) => ({
          id: m.id,
          ...(m.data() as Omit<Message, "id">),
          createdAt: m.data().createdAt?.toDate?.() ?? new Date(),
        }));

        convs.push({
          id: docSnap.id,
          participantId: otherUserId,
          participantName,
          participantAvatar,
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
