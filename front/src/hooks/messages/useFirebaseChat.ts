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
  getDoc,
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

export const useFirebaseChat = (conversationId: string | null, currentUserId: string) => {
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

  const sendMessage = useCallback(
    async (
      text: string,
      receiverId: string,
      senderName: string,
      senderAvatar?: string,
      existingConvoId?: string // pass existing conversation ID
    ) => {
      if (!text.trim() || !currentUserId) return null;

      try {
        let convoId = existingConvoId || conversationId;

        // If conversation doesn't exist, create it
        if (!convoId) {
          const newConvoRef = doc(collection(db, "conversations"));
          await setDoc(newConvoRef, {
            participants: [currentUserId, receiverId],
            lastMessage: "",
            lastMessageTime: serverTimestamp(),
            unread: { [receiverId]: 0 },
            isArchived: false,
            isPinned: false,
            isMuted: false,
            createdAt: serverTimestamp(),
          });
          convoId = newConvoRef.id;
        }

        const message: Message = {
          text,
          senderId: currentUserId,
          receiverId,
          senderName,
          senderAvatar: senderAvatar || null,
          timestamp: serverTimestamp(),
          isRead: false,
        };

        const msgRef = await addDoc(collection(db, "conversations", convoId, "messages"), message);

        // Update conversation metadata
        await updateDoc(doc(db, "conversations", convoId), {
          lastMessage: text,
          lastMessageTime: serverTimestamp(),
          [`unread.${receiverId}`]: increment(1),
          updatedAt: serverTimestamp(),
        });

        return { messageId: msgRef.id, conversationId: convoId };
      } catch (err) {
        console.error("Error sending message:", err);
        return null;
      }
    },
    [conversationId, currentUserId]
  );

  return { messages, loading, sendMessage };
};
