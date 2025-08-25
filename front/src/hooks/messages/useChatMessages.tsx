// hooks/useChatMessages.ts
import { db } from "@/firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const useChatMessages = () => {
  const sendMessage = async (
    conversationId: string,
    senderId: string,
    senderEmail: string,
    content: string,
    replyTo?: string
  ) => {
    const newMessage = {
      senderId,
      senderEmail,
      content,
      timestamp: serverTimestamp(),
      isRead: false,
      type: "text",
      deliveryStatus: "sent",
      replyTo: replyTo || null,
    };

    const docRef = await addDoc(collection(db, "conversations", conversationId, "messages"), newMessage);

    await fetch("/api/chat/saveMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        messageId: docRef.id,
        ...newMessage,
      }),
    });

    return docRef.id;
  };

  return { sendMessage };
};
