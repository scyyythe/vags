// hooks/useFirebaseChat.ts
import { useEffect, useState, useCallback } from "react";
import { db } from "@/firebase/firebaseConfig";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  updateDoc,
  increment,
} from "firebase/firestore";

export interface Message {
  id?: string;
  text: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: any;
  isRead?: boolean;
}

export const useFirebaseChat = (conversationId: string, currentUserId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 🔹 Real-time listener for messages
  useEffect(() => {
    if (!conversationId) return;

    const q = query(collection(db, "conversations", conversationId, "messages"), orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(msgs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [conversationId]);

  // 🔹 Send a new message + update conversation metadata
  const sendMessage = useCallback(
    async (text: string, receiverId: string, senderName: string, senderAvatar?: string) => {
      if (!text.trim() || !conversationId) return null;

      const newMessage: Message = {
        text,
        senderId: currentUserId,
        receiverId,
        senderName,
        senderAvatar: senderAvatar || null,
        timestamp: serverTimestamp(),
        isRead: false,
      };

      try {
        // Add message
        const docRef = await addDoc(collection(db, "conversations", conversationId, "messages"), newMessage);

        // ✅ Update conversation metadata (instead of overwriting everything)
        await setDoc(
          doc(db, "conversations", conversationId),
          {
            lastMessage: text,
            lastMessageTime: serverTimestamp(),
            participants: [currentUserId, receiverId],
            updatedAt: serverTimestamp(),
            isArchived: false,
            isPinned: false,
            isMuted: false,
          },
          { merge: true }
        );

        // ✅ Increment unread count for receiver
        await updateDoc(doc(db, "conversations", conversationId), {
          [`unread.${receiverId}`]: increment(1), // e.g. { unread: { userA: 0, userB: 3 } }
        });

        return docRef.id;
      } catch (err) {
        console.error("Error sending message:", err);
        return null;
      }
    },
    [conversationId, currentUserId]
  );

  return { messages, loading, sendMessage };
};
