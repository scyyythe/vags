// hooks/useFirebaseChat.ts
import { useEffect, useState, useCallback } from "react";
import { db } from "@/firebase/firebaseConfig";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, setDoc } from "firebase/firestore";

export interface Message {
  id?: string;
  text: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: any;
}

export const useFirebaseChat = (conversationId: string, currentUserId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Listen for messages in real-time
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
      console.log("Messages updated:", msgs); // ✅ see all messages
    });

    return () => unsubscribe();
  }, [conversationId]);

  // Send a new message
  const sendMessage = useCallback(
    async (text: string, receiverId: string, senderName: string, senderAvatar?: string) => {
      if (!text.trim() || !conversationId) return null;

      const newMessage = {
        text,
        senderId: currentUserId,
        receiverId,
        senderName,
        senderAvatar: senderAvatar || null,
        timestamp: serverTimestamp(),
      };

      try {
        const docRef = await addDoc(collection(db, "conversations", conversationId, "messages"), newMessage);

        console.log("Message inserted with ID:", docRef.id);

        await setDoc(
          doc(db, "conversations", conversationId),
          {
            lastMessage: text,
            lastMessageTime: serverTimestamp(),
            participants: [currentUserId, receiverId],
          },
          { merge: true }
        );

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
