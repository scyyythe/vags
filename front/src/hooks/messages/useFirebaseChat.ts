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
  text?: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: any;
  isRead?: boolean;
  type?: "text" | "image" | "file" | "voice" | "video";
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  voiceDuration?: number;

  replyTo?: {
    messageId: string;
    text?: string;
    senderName?: string;
  } | null;

  reactions?: {
    [userId: string]: string;
  };
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
  const addReaction = async (convoId: string, messageId: string, userId: string, emoji: string) => {
    const msgRef = doc(db, "conversations", convoId, "messages", messageId);
    await updateDoc(msgRef, {
      [`reactions.${userId}`]: emoji,
    });
  };

  const sendMessage = useCallback(
    async (
      payload: {
        text?: string;
        type?: "text" | "image" | "file" | "voice" | "video";
        fileUrl?: string;
        fileName?: string;
        fileSize?: number;
        voiceDuration?: number;

        replyTo?: {
          messageId: string;
          text?: string;
          senderName?: string;
        } | null;
      },
      receiverId: string,
      senderName: string,
      senderAvatar?: string,
      existingConvoId?: string
    ) => {
      if ((!payload.text && !payload.fileUrl) || !currentUserId) return null;

      try {
        let convoId = existingConvoId || conversationId;

        // Create new conversation if missing
        if (!convoId) {
          const newConvoRef = doc(collection(db, "conversations"));
          await setDoc(newConvoRef, {
            participants: [currentUserId, receiverId],
            lastMessage: "",
            lastMessageTime: serverTimestamp(),
            lastMessageSenderId: "",
            unread: { [receiverId]: 0 },
            createdAt: serverTimestamp(),
            isArchived: false,
            isPinned: false,
            isMuted: false,
            deletedBy: [],
            deletedAt: {},
            mutedBy: [],
            pinnedBy: [],
            archivedBy: [],
          });
          convoId = newConvoRef.id;
        }

        const message: Message = {
          ...payload,
          senderId: currentUserId,
          receiverId,
          senderName,
          senderAvatar: senderAvatar || null,
          timestamp: serverTimestamp(),
          isRead: false,
          replyTo: payload.replyTo || null,
          reactions: {},
        };

        // Before sending the message, check if the receiver had deleted this conversation
        const convDoc = await getDoc(doc(db, "conversations", convoId));
        if (convDoc.exists()) {
          const convData = convDoc.data();
          const deletedBy = convData.deletedBy || [];
          const deletedAt = convData.deletedAt || {};

          // If the receiver had deleted this conversation, restore it for them
          if (deletedBy.includes(receiverId)) {
            const updatedDeletedBy = deletedBy.filter((id: string) => id !== receiverId);
            const updatedDeletedAt = { ...deletedAt };
            delete updatedDeletedAt[receiverId];

            await updateDoc(doc(db, "conversations", convoId), {
              deletedBy: updatedDeletedBy,
              deletedAt: updatedDeletedAt,
            });
          }
        }

        const msgRef = await addDoc(collection(db, "conversations", convoId, "messages"), message);
        message.id = msgRef.id;
        // Update conversation metadata
        await updateDoc(doc(db, "conversations", convoId), {
          lastMessage: payload.text || payload.fileName || "📎 Attachment",
          lastMessageTime: serverTimestamp(),
          lastMessageSenderId: currentUserId, // Track who sent the last message
          [`unread.${receiverId}`]: increment(1),
          updatedAt: serverTimestamp(),
        });

        return { messageId: msgRef.id, conversationId: convoId };
      } catch (err) {
        console.error("❌ Error sending message:", err);
        return null;
      }
    },
    [conversationId, currentUserId]
  );

  return { messages, loading, sendMessage };
};
