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
  getDoc,
  updateDoc,
} from "firebase/firestore";

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

      // Before sending the message, check if the conversation was deleted by either user
      const convDoc = await getDoc(doc(db, "conversations", conversationId));
      if (convDoc.exists()) {
        const convData = convDoc.data();
        const deletedBy = convData.deletedBy || [];
        const deletedAt = convData.deletedAt || {};

        // Only restore the conversation for the receiver if they deleted it
        // Don't restore it for the sender (current user) if they deleted it
        if (deletedBy.includes(receiverId)) {
          const updatedDeletedBy = deletedBy.filter((id: string) => id !== receiverId);
          const updatedDeletedAt = { ...deletedAt };
          delete updatedDeletedAt[receiverId];

          await updateDoc(doc(db, "conversations", conversationId), {
            deletedBy: updatedDeletedBy,
            deletedAt: updatedDeletedAt,
          });
        }

        // If the current user (sender) had deleted this conversation, keep it deleted for them
        // This means the conversation won't appear in their chat list
        // The conversation will remain deleted for the sender, so they won't see it in their chat list
        // Only the receiver will see the conversation if they didn't delete it
      }

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
