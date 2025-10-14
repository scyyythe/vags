import { useChat } from "@/context/ChatContext";
import { toast } from "sonner";

export const useAutomaticMessage = () => {
  const { openChat } = useChat();
  const userId = localStorage.getItem("user_id")!;
  const userName = localStorage.getItem("username")!;
  const userAvatar = localStorage.getItem("avatar_url") || undefined;

  const findExistingConversation = async (sellerId: string) => {
    try {
      const { db } = await import("@/firebase/firebaseConfig");
      const { collection, query, where, getDocs } = await import("firebase/firestore");

      // Query for existing conversation between current user and seller
      const q = query(collection(db, "conversations"), where("participants", "array-contains", userId));

      const snapshot = await getDocs(q);

      for (const doc of snapshot.docs) {
        const data = doc.data();
        if (
          data.participants &&
          data.participants.length === 2 &&
          data.participants.includes(userId) &&
          data.participants.includes(sellerId)
        ) {
          return doc.id;
        }
      }

      console.log("No existing conversation found for seller:", sellerId);
      return null; // No existing conversation found
    } catch (error) {
      console.error("Error finding existing conversation:", error);
      return null;
    }
  };

  const sendAutomaticMessage = async (
    sellerId: string,
    artist: string,
    title: string,
    orderId: string,
    conversationId?: string
  ) => {
    if (!sellerId) return;

    try {
      const { db } = await import("@/firebase/firebaseConfig");
      const { collection, addDoc, serverTimestamp, doc, setDoc, updateDoc, increment, getDoc } = await import(
        "firebase/firestore"
      );

      let convoId = conversationId;

      // Create new conversation if missing
      if (!convoId) {
        // Double-check if conversation was created by another process
        const doubleCheckId = await findExistingConversation(sellerId);
        if (doubleCheckId) {
          console.log("Conversation found on double-check, using existing:", doubleCheckId);
          convoId = doubleCheckId;
        } else {
          console.log("Creating new conversation for seller:", sellerId);
          const newConvoRef = doc(collection(db, "conversations"));
          await setDoc(newConvoRef, {
            participants: [userId, sellerId],
            lastMessage: "",
            lastMessageTime: serverTimestamp(),
            lastMessageSenderId: "",
            unread: { [sellerId]: 0 },
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
          console.log("Created new conversation:", convoId);
        }
      }

      const message = {
        text: "",
        content: "",
        senderId: userId,
        receiverId: sellerId,
        senderName: userName,
        senderAvatar: userAvatar || null,
        timestamp: serverTimestamp(),
        isRead: false,
        type: "automatic",
        reactions: {},
        automaticMessageData: {
          sellerName: artist,
          artworkTitle: title,
          buyerName: userName,
          orderId: orderId,
        },
      };

      // Before sending the message, check if the receiver had deleted this conversation
      const convDoc = await getDoc(doc(db, "conversations", convoId));
      if (convDoc.exists()) {
        const convData = convDoc.data();
        const deletedBy = convData.deletedBy || [];
        const deletedAt = convData.deletedAt || {};

        // Only restore the conversation for the receiver (seller) if they deleted it
        // Don't restore it for the sender (current user) if they deleted it
        if (deletedBy.includes(sellerId)) {
          const updatedDeletedBy = deletedBy.filter((id: string) => id !== sellerId);
          const updatedDeletedAt = { ...deletedAt };
          delete updatedDeletedAt[sellerId];

          await updateDoc(doc(db, "conversations", convoId), {
            deletedBy: updatedDeletedBy,
            deletedAt: updatedDeletedAt,
          });
        }

        // If the current user (sender) had deleted this conversation, keep it deleted for them
        // This means the conversation won't appear in their chat list
        // The conversation will remain deleted for the sender, so they won't see it in their chat list
        // Only the receiver (seller) will see the conversation if they didn't delete it
      }

      const msgRef = await addDoc(collection(db, "conversations", convoId, "messages"), message);

      // Update conversation metadata
      await updateDoc(doc(db, "conversations", convoId), {
        lastMessage: "📦 New order received",
        lastMessageTime: serverTimestamp(),
        lastMessageSenderId: userId,
        [`unread.${sellerId}`]: increment(1),
        updatedAt: serverTimestamp(),
      });

      return { messageId: msgRef.id, conversationId: convoId };
    } catch (error) {
      console.error("Failed to send automatic message:", error);
      return null;
    }
  };

  const handleContactWithAutoMessage = async (artistId: string, artist: string, title: string, orderId: string) => {
    if (!artistId) {
      console.error("Artist ID not available");
      toast.error("Unable to contact seller - seller ID not found");
      return;
    }

    // Show loading toast
    toast.loading(`Contacting ${artist}...`, { id: "contacting-seller" });

    try {
      // First, try to find existing conversation
      const existingConversationId = await findExistingConversation(String(artistId));

      if (existingConversationId) {
        // If conversation exists, just send the message
        await sendAutomaticMessage(String(artistId), artist, title, orderId, existingConversationId);
        // Open the chat with the existing conversation
        openChat(String(artistId), artist, undefined, true);
        // toast.success(`Opened conversation with ${artist}`, { id: "contacting-seller" });
      } else {
        // If no conversation exists, create one and send message
        const result = await sendAutomaticMessage(String(artistId), artist, title, orderId);
        if (result?.conversationId) {
          // Open the chat with the newly created conversation
          openChat(String(artistId), artist, undefined, true);
          toast.success(`Started conversation with ${artist}`, { id: "contacting-seller" });
        } else {
          toast.error("Failed to create conversation", { id: "contacting-seller" });
        }
      }
    } catch (error) {
      console.error("Error contacting seller:", error);
      toast.error("Failed to contact seller", { id: "contacting-seller" });
    }
  };

  return {
    handleContactWithAutoMessage,
    sendAutomaticMessage,
    findExistingConversation,
  };
};
