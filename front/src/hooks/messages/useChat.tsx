import { useEffect, useState, useCallback } from "react";
import { db } from "@/firebase/firebaseConfig";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";

export interface Message {
  id?: string;
  text: string;
  senderId: string;
  receiverId: string;
  createdAt: any;
}

export function useChat(conversationId: string, currentUserId: string) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!conversationId) return;

    const q = query(collection(db, "conversations", conversationId, "messages"), orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [conversationId]);

  const sendMessage = useCallback(
    async (text: string, receiverId: string) => {
      if (!conversationId || !text.trim()) return;

      await addDoc(collection(db, "conversations", conversationId, "messages"), {
        text,
        senderId: currentUserId,
        receiverId,
        createdAt: serverTimestamp(),
      });
    },
    [conversationId, currentUserId]
  );

  return { messages, sendMessage };
}
