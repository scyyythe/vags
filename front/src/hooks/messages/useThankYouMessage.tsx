import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useChat } from "@/context/ChatContext";
import { getLoggedInUserId } from "@/auth/decode";

interface UserData {
  userId: string;
  userName: string;
  userAvatar?: string;
}

export const useThankYouMessage = (userData?: UserData) => {
  const [isSending, setIsSending] = useState(false);
  const { openChat } = useChat();

  // Use only the data provided from OnSaleTab, no localStorage fallbacks
  const { userId, userName, userAvatar } = useMemo(() => {
    if (!userData) {
      console.error("No userData provided to useThankYouMessage");
      return {
        userId: "",
        userName: "Artist",
        userAvatar: undefined,
      };
    }

    return {
      userId: userData.userId,
      userName: userData.userName,
      userAvatar: userData.userAvatar,
    };
  }, [userData]);

  const findExistingConversation = async (buyerId: string) => {
    try {
      const { db } = await import("@/firebase/firebaseConfig");
      const { collection, query, where, getDocs } = await import("firebase/firestore");

      // Query for existing conversation between current user and buyer
      const q = query(collection(db, "conversations"), where("participants", "array-contains", userId));

      const snapshot = await getDocs(q);

      for (const doc of snapshot.docs) {
        const data = doc.data();
        if (
          data.participants &&
          data.participants.length === 2 &&
          data.participants.includes(userId) &&
          data.participants.includes(buyerId)
        ) {
          return doc.id;
        }
      }

      return null; // No existing conversation found
    } catch (error) {
      console.error("Error finding existing conversation:", error);
      return null;
    }
  };

  const sendThankYouMessage = async (
    buyerId: string,
    buyerName: string,
    title: string,
    conversationId?: string,
    orderId?: string
  ) => {
    if (!buyerId) return;

    try {
      const { db } = await import("@/firebase/firebaseConfig");
      const { collection, addDoc, serverTimestamp, doc, setDoc, updateDoc, increment, getDoc } = await import(
        "firebase/firestore"
      );

      let convoId = conversationId;

      // Create new conversation if missing
      if (!convoId) {
        // Double-check if conversation was created by another process
        const doubleCheckId = await findExistingConversation(buyerId);
        if (doubleCheckId) {
          convoId = doubleCheckId;
        } else {
          const newConvoRef = doc(collection(db, "conversations"));
          await setDoc(newConvoRef, {
            participants: [userId, buyerId],
            lastMessage: "",
            lastMessageTime: serverTimestamp(),
            lastMessageSenderId: "",
            unread: { [buyerId]: 0 },
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
      }

      const finalSenderName = userName || "Artist";
      const finalBuyerName = buyerName || "Buyer";

      const message = {
        text: "",
        content: "",
        senderId: userId,
        receiverId: buyerId,
        senderName: finalSenderName,
        senderAvatar: userAvatar || null,
        timestamp: serverTimestamp(),
        isRead: false,
        type: "automatic",
        reactions: {},
        automaticMessageData: {
          sellerName: finalSenderName,
          artworkTitle: title,
          buyerName: finalBuyerName,
          messageType: "thankYou",
          orderId: orderId,
        },
      };

      // Before sending the message, check if the receiver had deleted this conversation
      const convDoc = await getDoc(doc(db, "conversations", convoId));
      if (convDoc.exists()) {
        const convData = convDoc.data();
        const deletedBy = convData.deletedBy || [];
        const deletedAt = convData.deletedAt || {};

        if (deletedBy.includes(buyerId)) {
          const updatedDeletedBy = deletedBy.filter((id: string) => id !== buyerId);
          const updatedDeletedAt = { ...deletedAt };
          delete updatedDeletedAt[buyerId];

          await updateDoc(doc(db, "conversations", convoId), {
            deletedBy: updatedDeletedBy,
            deletedAt: updatedDeletedAt,
          });
        }
      }

      const msgRef = await addDoc(collection(db, "conversations", convoId, "messages"), message);

      // Update conversation metadata
      await updateDoc(doc(db, "conversations", convoId), {
        lastMessage: "💝 Thank you message sent",
        lastMessageTime: serverTimestamp(),
        lastMessageSenderId: userId,
        [`unread.${buyerId}`]: increment(1),
        updatedAt: serverTimestamp(),
      });

      return { messageId: msgRef.id, conversationId: convoId };
    } catch (error) {
      console.error("Failed to send thank you message:", error);
      return null;
    }
  };

  const handleThankYouWithAutoMessage = async (artwork: any) => {
    setIsSending(true);

    try {
      const currentUserId = getLoggedInUserId();

      if (!currentUserId) {
        console.log("❌ No current user ID found");
        toast.error("Please log in to send messages.");
        return;
      }

      const buyerId = artwork.buyer_id;
      const buyerName = artwork.buyer_name || artwork.buyer;

      console.log("Extracted buyer info:", { buyerId, buyerName });

      if (!buyerId) {
        console.log("Missing buyerId. Available artwork fields:", Object.keys(artwork));
        toast.error("Unable to contact buyer - buyer ID not found");
        return;
      }

      if (!buyerName) {
        console.log("Missing buyerName. Available artwork fields:", Object.keys(artwork));
        toast.error("Unable to contact buyer - buyer name not found");
        return;
      }

      const artworkTitle = artwork.artwork_title || artwork.title || "my artwork";
      const orderId = artwork.id || artwork.order_id || artwork.purchase_id;
      console.log("Final values:", { buyerId, buyerName, artworkTitle, userName, orderId });

      toast.loading(`Sending thank you message to ${buyerName}...`, { id: "thanking-buyer" });

      const existingConversationId = await findExistingConversation(String(buyerId));

      if (existingConversationId) {
        // If conversation exists, just send the message
        await sendThankYouMessage(String(buyerId), buyerName, artworkTitle, existingConversationId, orderId);
        // Open the chat with the existing conversation
        openChat(String(buyerId), buyerName, undefined, true);
        toast.success(`Thank you message sent to ${buyerName}`, { id: "thanking-buyer" });
      } else {
        const result = await sendThankYouMessage(String(buyerId), buyerName, artworkTitle, undefined, orderId);
        if (result?.conversationId) {
          openChat(String(buyerId), buyerName, undefined, true);
          toast.success(`Thank you message sent to ${buyerName}`, { id: "thanking-buyer" });
        } else {
          toast.error("Failed to send thank you message", { id: "thanking-buyer" });
        }
      }
    } catch (error) {
      console.error("Error sending thank you message:", error);
      toast.error("Failed to send thank you message", { id: "thanking-buyer" });
    } finally {
      setIsSending(false);
    }
  };

  return {
    handleThankYouWithAutoMessage,
    sendThankYouMessage,
    findExistingConversation,
    isSending,
  };
};
