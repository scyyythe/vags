// hooks/useChatMessages.ts
import { db } from "@/firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from "firebase/firestore";

export const useChatMessages = () => {
  const sendMessage = async (
    conversationId: string,
    senderId: string,
    senderEmail: string,
    content: string,
    replyTo?: string
  ) => {
    // Before sending the message, check if the conversation was deleted by either user
    const convDoc = await getDoc(doc(db, "conversations", conversationId));
    if (convDoc.exists()) {
      const convData = convDoc.data();
      const deletedBy = convData.deletedBy || [];
      const deletedAt = convData.deletedAt || {};
      const participants = convData.participants || [];

      // Find the receiver (the other participant)
      const receiverId = participants.find((id: string) => id !== senderId);

      if (receiverId) {
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
      }
    }

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
