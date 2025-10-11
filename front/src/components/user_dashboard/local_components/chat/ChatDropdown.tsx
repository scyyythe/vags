import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatHeader } from "./ChatHeader";
import { ConversationList } from "./ConversationList";
import { MessagesList } from "./MessagesList";
import { MessageInput } from "./MessageInput";
import { Conversation, Message } from "./types/types";
import ShareModal from "@/components/user_dashboard/local_components/share/ShareModal";
import { InviteFriends } from "./InviteFriends";
import { db } from "@/firebase/firebaseConfig";
import { collection, query, orderBy, where, onSnapshot } from "firebase/firestore";
import { useFirebaseChat } from "@/hooks/messages/useFirebaseChat";
import { useUserConversations } from "@/hooks/messages/useUserConversations";
import { useChat } from "@/context/ChatContext";
import { addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { uploadChatImageToCloudinary, uploadChatFileToCloudinary } from "@/utils/chatCloudinaryUpload";
interface ChatDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  participantId?: string;
  participantName?: string;
  participantAvatar?: string;
}

const ChatDropdown = ({ isOpen, onClose, participantId, participantName, participantAvatar }: ChatDropdownProps) => {
  const { directMessageMode } = useChat();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [conversationsLoaded, setConversationsLoaded] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const userId = localStorage.getItem("user_id")!;
  const userName = localStorage.getItem("username")!;
  const userAvatarLocal = localStorage.getItem("avatar_url") || undefined;
  const [conversations, setConversations, isLoadingConversations] = useUserConversations(userId);
  const [headerName, setHeaderName] = useState(participantName || "Unknown");
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const { messages: firebaseMessages, sendMessage: sendFirebaseMessage } = useFirebaseChat(
    selectedConversation || "",
    userId
  );

  useEffect(() => {
    if (!isOpen || !participantId || !conversationsLoaded) return;

    const targetConv = conversations.find((c) => c.participantId === participantId);

    if (targetConv && selectedConversation !== targetConv.id) {
      setSelectedConversation(targetConv.id);
      markAsRead(targetConv.id);
    }
  }, [conversations, participantId, isOpen, conversationsLoaded]);

  useEffect(() => {
    if (isOpen) {
      setConversationsLoaded(false);
      const q = query(
        collection(db, "conversations"),
        where("participants", "array-contains", userId),
        orderBy("lastMessageTime", "desc")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const convs: Conversation[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          const existingConv = conversations.find((c) => c.id === doc.id);

          return {
            ...existingConv,
            id: doc.id,
            participantId: data.participants.find((m) => m !== userId) || "",
            participantName: existingConv?.participantName || data.participantName || "Unknown",

            participantAvatar: existingConv?.participantAvatar || data.participantAvatar,
            lastMessage: data.lastMessage ?? existingConv?.lastMessage ?? "",
            lastMessageTime: data.lastMessageTime?.toDate ? data.lastMessageTime.toDate() : new Date(),
            unreadCount: data.unreadCount ?? existingConv?.unreadCount ?? 0,
            isOnline: data.isOnline ?? existingConv?.isOnline ?? false,
            isArchived: data.isArchived ?? existingConv?.isArchived ?? false,
            isPinned: data.isPinned ?? existingConv?.isPinned ?? false,
            isMuted: data.isMuted ?? existingConv?.isMuted ?? false,
            messages: (() => {
              const messageMap = new Map();

              (existingConv?.messages || []).forEach((msg) => {
                messageMap.set(msg.id, msg);
              });

              (data.messages || []).forEach((msg) => {
                messageMap.set(msg.id, msg);
              });

              return Array.from(messageMap.values()).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            })(),
          };
        });

        setConversations(convs);
        setConversationsLoaded(true);
      });

      return () => unsubscribe();
    }
  }, [isOpen, userId]);

  const creatingRef = useRef(false);
  const createConv = async (
    targetId: string,
    targetName: string,
    targetAvatar: string | null
  ): Promise<Conversation | null> => {
    try {
      console.log("🔍 Creating conversation for:", { targetId, targetName, userId });

      // First check if conversation already exists in local state
      const existingLocal = conversations.find((c) => c.participantId === targetId);
      if (existingLocal) {
        console.log("✅ Found existing conversation in local state:", existingLocal.id);
        return existingLocal;
      }

      // Then check Firestore for existing conversation
      const q = query(collection(db, "conversations"), where("participants", "array-contains", userId));
      const snapshot = await getDocs(q);

      const existing = snapshot.docs.find((doc) => {
        const data = doc.data();
        return (
          Array.isArray(data.participants) &&
          data.participants.length === 2 &&
          data.participants.includes(userId) &&
          data.participants.includes(targetId)
        );
      });

      if (existing) {
        console.log("✅ Found existing conversation in Firestore:", existing.id);
        return {
          id: existing.id,
          participantId: targetId,
          participantName: existing.data().participantName || targetName,
          participantAvatar: existing.data().participantAvatar || targetAvatar || undefined,
          lastMessage: existing.data().lastMessage ?? "",
          lastMessageTime: existing.data().lastMessageTime?.toDate
            ? existing.data().lastMessageTime.toDate()
            : new Date(),
          unreadCount: existing.data().unreadCount || 0,
          isOnline: existing.data().isOnline || false,
          isArchived: existing.data().isArchived || false,
          isPinned: existing.data().isPinned || false,
          isMuted: existing.data().isMuted || false,
          messages: existing.data().messages || [],
          deletedBy: existing.data().deletedBy || [],
        };
      }

      // --- create new if not exists ---
      console.log("🆕 Creating new conversation...");
      const newConv = {
        participants: [userId, targetId],
        participantId: targetId,
        participantName: targetName,
        participantAvatar: targetAvatar || undefined,
        lastMessage: "",
        lastMessageTime: serverTimestamp(),
        unreadCount: 0,
        isOnline: false,
        isArchived: false,
        isPinned: false,
        isMuted: false,
        messages: [] as Message[],
        deletedBy: [], // Initialize empty deletedBy array
      };

      const docRef = await addDoc(collection(db, "conversations"), newConv);
      console.log("✅ Created new conversation:", docRef.id);

      return {
        ...newConv,
        id: docRef.id,
        lastMessageTime: new Date(),
      };
    } catch (err) {
      console.error("❌ Error creating conversation:", err);
      return null;
    }
  };

  useEffect(() => {
    console.log("🔄 useEffect triggered:", {
      isOpen,
      participantId,
      conversationsLoaded,
      creatingRef: creatingRef.current,
    });

    if (!isOpen || !participantId || !conversationsLoaded) {
      console.log("❌ Early return:", { isOpen, participantId, conversationsLoaded });
      return;
    }

    const targetConv = conversations.find((c) => c.participantId === participantId);

    if (targetConv) {
      setSelectedConversation(targetConv.id);
      markAsRead(targetConv.id);
      setLoadingConversation(false); // Clear loading state for existing conversations
    } else if (!creatingRef.current && conversationsLoaded) {
      creatingRef.current = true;
      setLoadingConversation(true);

      createConv(participantId, participantName || "Unknown", participantAvatar || null)
        .then((newConv) => {
          console.log("📝 Conversation creation result:", newConv ? "SUCCESS" : "FAILED");
          if (newConv) {
            setSelectedConversation(newConv.id);
            markAsRead(newConv.id);
            // Add the new conversation to local state immediately
            setConversations((prev) => [newConv, ...prev]);
          }
          // Always clear loading state
          setLoadingConversation(false);
        })
        .catch((error) => {
          console.error("Failed to create conversation:", error);
          setLoadingConversation(false);
        })
        .finally(() => {
          creatingRef.current = false;
        });
    }
  }, [isOpen, participantId, conversationsLoaded]); // Removed conversations dependency to prevent race condition

  const filteredConversations = conversations.filter((conv) => {
    // Additional safety check: filter out conversations deleted by current user
    const isDeletedByUser = conv.deletedBy?.includes(userId) || false;
    if (isDeletedByUser) {
      console.log(`🚫 Filtering out deleted conversation ${conv.id} for user ${userId}`);
      return false;
    }

    const matchesSearch = conv.participantName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArchive = showArchived ? conv.isArchived : !conv.isArchived;
    return matchesSearch && matchesArchive;
  });

  // Debug logging
  console.log(`📋 ChatDropdown conversations:`, {
    isLoading: isLoadingConversations,
    totalConversations: conversations.length,
    filteredConversations: filteredConversations.length,
    userId: userId,
    conversations: conversations.map((conv) => ({
      id: conv.id,
      name: conv.participantName,
      deletedBy: conv.deletedBy,
      isDeleted: conv.deletedBy?.includes(userId) || false,
    })),
    filteredDetails: filteredConversations.map((conv) => ({
      id: conv.id,
      name: conv.participantName,
      deletedBy: conv.deletedBy,
    })),
  });

  const selectedConv = conversations.find((conv) => conv.id === selectedConversation);
  useEffect(() => {
    if (selectedConv) {
      setHeaderName(selectedConv.participantName || participantName || "Unknown");
    }
  }, [selectedConv, participantName]);

  // Add a message safely
  const addMessageToConversation = (convId: string, message: Partial<Message>) => {
    const newMessage: Message = {
      id: `m${Date.now()}`,
      senderId: userId,
      senderName: userName,
      content: message.content || "",
      timestamp: new Date(),
      isRead: true,
      isStarred: false,
      type: message.type || "text",
      imageUrl: message.imageUrl,
      fileName: message.fileName,
      voiceDuration: message.voiceDuration,
      deliveryStatus: "sent",
      isMine: true,
      reactions: [],
      replyTo: message.replyTo || null,
    };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === convId
          ? {
              ...conv,
              messages: [...(conv.messages || []), newMessage],
              lastMessage: newMessage.content,
              lastMessageTime: new Date(),
            }
          : conv
      )
    );

    setTimeout(() => {
      const chatContainer = document.getElementById("chat-container");
      if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 50);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const replyData = replyingTo
      ? {
          messageId: replyingTo.id!,
          senderId: replyingTo.senderId,
          senderName: replyingTo.senderName,
          type: replyingTo.type,
          content: replyingTo.content,
          ...(replyingTo.fileName && { fileName: replyingTo.fileName }),
          ...(replyingTo.imageUrl && { imageUrl: replyingTo.imageUrl }),
          ...(replyingTo.voiceDuration && { voiceDuration: replyingTo.voiceDuration }),
        }
      : null;

    // Store the message input before clearing it
    const messageText = messageInput;
    setMessageInput("");
    setReplyingTo(null);

    // Send message to Firebase - the subscription will handle adding it to the UI
    await sendFirebaseMessage(
      {
        text: messageText,
        type: "text",
        replyTo: replyData,
      },
      participantId || selectedConv?.participantId,
      userName,
      userAvatarLocal,
      selectedConversation
    );

    // Don't add message locally - let Firebase subscription handle it
    // This prevents duplicate messages
  };

  const handleFileAttachment = async (file: File) => {
    if (!file || !selectedConversation) return;

    setUploadingFile(true);
    try {
      // Upload to Cloudinary
      const cloudinaryUrl = file.type.startsWith("image/")
        ? await uploadChatImageToCloudinary(file)
        : await uploadChatFileToCloudinary(file);

      // Send message to Firebase with Cloudinary URL
      await sendFirebaseMessage(
        {
          text: file.type.startsWith("image/") ? "" : `Sent ${file.name}`, // No text for images
          type: file.type.startsWith("image/") ? "image" : "file",
          fileUrl: cloudinaryUrl,
          fileName: file.name,
        },
        participantId || selectedConv?.participantId,
        userName,
        userAvatarLocal,
        selectedConversation
      );
    } catch (error) {
      console.error("Failed to upload file:", error);
      // You could show a toast error here
    } finally {
      setUploadingFile(false);
    }
  };

  const handleCameraCapture = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*";
    input.capture = "environment";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && selectedConversation) {
        setUploadingFile(true);
        try {
          // Upload to Cloudinary
          const cloudinaryUrl = await uploadChatImageToCloudinary(file);

          // Send to Firebase with Cloudinary URL
          await sendFirebaseMessage(
            {
              text: "", // No text for images
              type: "image",
              fileUrl: cloudinaryUrl,
              fileName: file.name,
            },
            participantId || selectedConv?.participantId,
            userName,
            userAvatarLocal,
            selectedConversation
          );
        } catch (error) {
          console.error("Failed to upload camera capture:", error);
        } finally {
          setUploadingFile(false);
        }
      }
    };
    input.click();
  };

  const handleVoiceRecord = () => {
    if (!selectedConversation) return;
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(async () => {
        setIsRecording(false);
        // Send voice message to Firebase - subscription will handle adding to UI
        await sendFirebaseMessage(
          {
            text: "Voice message",
            type: "voice",
            voiceDuration: 5,
          },
          participantId || selectedConv?.participantId,
          userName,
          userAvatarLocal,
          selectedConversation
        );
      }, 2000);
    } else setIsRecording(false);
  };

  const handleEmojiClick = (emojiData: any) => {
    setMessageInput((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleCall = () => {
    if (selectedConv) alert(`Initiating voice call with ${selectedConv.participantName}...`);
  };

  // Conversation utilities
  const markAsRead = async (convId: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === convId
          ? { ...conv, unreadCount: 0, messages: (conv.messages || []).map((msg) => ({ ...msg, isRead: true })) }
          : conv
      )
    );

    try {
      const convRef = doc(db, "conversations", convId);
      await updateDoc(convRef, {
        unreadCount: 0,
        isArchived: false, // optional
        lastMessageTime: serverTimestamp(),
      });

      // Optionally mark all messages as read
      const msgsRef = collection(db, "conversations", convId, "messages");
      const snapshot = await getDocs(msgsRef);
      snapshot.forEach(async (docSnap) => {
        await updateDoc(doc(db, "conversations", convId, "messages", docSnap.id), { isRead: true });
      });
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  // Mark as unread
  const markAsUnread = async (convId: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === convId
          ? {
              ...conv,
              unreadCount: Math.max(1, conv.unreadCount),
              messages: (conv.messages || []).map((msg, idx) =>
                idx === (conv.messages?.length || 0) - 1 ? { ...msg, isRead: false } : msg
              ),
            }
          : conv
      )
    );

    try {
      const convRef = doc(db, "conversations", convId);
      await updateDoc(convRef, { unreadCount: 1 });
    } catch (err) {
      console.error("Error marking as unread:", err);
    }
  };

  // Toggle pin
  const togglePin = async (convId: string) => {
    const conv = conversations.find((c) => c.id === convId);
    if (!conv) return;

    const newVal = !conv.isPinned;
    setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, isPinned: newVal } : c)));

    try {
      await updateDoc(doc(db, "conversations", convId), { isPinned: newVal });
    } catch (err) {
      console.error("Error toggling pin:", err);
    }
  };
  // Toggle mute
  const toggleMute = async (convId: string) => {
    const conv = conversations.find((c) => c.id === convId);
    if (!conv) return;

    const newVal = !conv.isMuted;
    setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, isMuted: newVal } : c)));

    try {
      await updateDoc(doc(db, "conversations", convId), { isMuted: newVal });
    } catch (err) {
      console.error("Error toggling mute:", err);
    }
  };
  // Toggle archive
  const toggleArchive = async (convId: string) => {
    const conv = conversations.find((c) => c.id === convId);
    if (!conv) return;

    const newVal = !conv.isArchived;
    setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, isArchived: newVal } : c)));

    try {
      await updateDoc(doc(db, "conversations", convId), { isArchived: newVal });
    } catch (err) {
      console.error("Error toggling archive:", err);
    }
  };
  // Delete conversation (soft delete - only removes from current user's view)
  const deleteConversation = async (convId: string) => {
    // Close the conversation if it's currently selected
    if (selectedConversation === convId) setSelectedConversation(null);

    try {
      // Get current conversation data
      const conv = conversations.find((c) => c.id === convId);
      if (!conv) {
        console.error("Conversation not found:", convId);
        return;
      }

      // Get current deletedBy array or initialize empty array
      const currentDeletedBy = conv.deletedBy || [];

      // Add current user to deletedBy array if not already there
      if (!currentDeletedBy.includes(userId)) {
        const updatedDeletedBy = [...currentDeletedBy, userId];

        // Update the conversation document with new deletedBy array
        await updateDoc(doc(db, "conversations", convId), {
          deletedBy: updatedDeletedBy,
        });

        console.log("✅ Conversation soft deleted for user:", userId);
      } else {
        console.log("⚠️ Conversation already deleted by user:", userId);
      }
    } catch (err) {
      console.error("❌ Error deleting conversation:", err);
    }
  };

  // Restore conversation (remove current user from deletedBy array)
  const restoreConversation = async (convId: string) => {
    try {
      // Get current deletedBy array
      const conv = conversations.find((c) => c.id === convId);
      if (!conv) return;

      const currentDeletedBy = conv.deletedBy || [];

      // Remove current user from deletedBy array
      const updatedDeletedBy = currentDeletedBy.filter((id) => id !== userId);

      // Update the conversation document
      await updateDoc(doc(db, "conversations", convId), {
        deletedBy: updatedDeletedBy,
      });

      console.log("Conversation restored for user:", userId);
    } catch (err) {
      console.error("Error restoring conversation:", err);
    }
  };

  const starMessage = (messageId: string) => {
    if (!selectedConversation) return;
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversation
          ? {
              ...conv,
              messages: (conv.messages || []).map((msg) =>
                msg.id === messageId ? { ...msg, isStarred: !msg.isStarred } : msg
              ),
            }
          : conv
      )
    );
  };

  const deleteMessage = (messageId: string) => {
    if (!selectedConversation) return;
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversation
          ? { ...conv, messages: (conv.messages || []).filter((msg) => msg.id !== messageId) }
          : conv
      )
    );
  };

  const replyToMessage = (message: Message) => {
    console.log("📨 Setting replyToMessage:", message);
    setReplyingTo(message);
  };

  return (
    <div className="absolute right-4 md:right-0.5 bg-white rounded-2xl shadow-xl z-50 w-[330px] md:w-[330px] h-[534px]">
      <div className="flex h-full">
        <div className="w-full flex flex-col">
          <ChatHeader
            participantName={headerName}
            selectedConversation={selectedConversation}
            selectedConv={selectedConv}
            showArchived={showArchived}
            searchQuery={searchQuery}
            onBack={() => (selectedConversation ? setSelectedConversation(null) : setShowArchived(false))}
            onClose={onClose}
            onCall={handleCall}
            onTogglePin={togglePin}
            onToggleArchived={() => setShowArchived(!showArchived)}
            onMarkAllAsRead={() => conversations.forEach((c) => markAsRead(c.id))}
            onMarkAllAsUnread={() => conversations.forEach((c) => markAsUnread(c.id))}
            onSearchChange={setSearchQuery}
          />
          <ScrollArea className="flex-1">
            {loadingConversation ? (
              <div className="flex items-center justify-center flex-1 text-gray-500 text-xs">Opening chat...</div>
            ) : selectedConversation && selectedConv ? (
              <MessagesList
                conversation={{
                  ...selectedConv,
                  messages: (() => {
                    // Create a map to deduplicate messages by ID
                    const messageMap = new Map();

                    // Add local messages first
                    (selectedConv.messages || []).forEach((msg) => {
                      messageMap.set(msg.id, msg);
                    });

                    // Add Firebase messages, overriding local ones if they exist
                    (firebaseMessages || []).forEach((msg: any) => {
                      const message = {
                        id: msg.id,
                        senderId: msg.senderId,
                        senderName: msg.senderName || selectedConv.participantName || participantName || "Unknown",
                        content: msg.content || msg.text || "",
                        timestamp: msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(),
                        isRead: msg.isRead || false,
                        isStarred: msg.isStarred || false,
                        type: msg.type || "text",
                        deliveryStatus: msg.deliveryStatus || "sent",
                        reactions: msg.reactions || [],
                        imageUrl: msg.imageUrl || msg.fileUrl, // Use fileUrl from Cloudinary
                        fileName: msg.fileName,
                        voiceDuration: msg.voiceDuration,
                        isMine: String(msg.senderId) === String(userId),
                        replyTo: msg.replyTo || null,
                      };
                      messageMap.set(msg.id, message);
                    });

                    // Convert map to array and sort by timestamp
                    return Array.from(messageMap.values()).sort(
                      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
                    );
                  })(),
                }}
                currentUserId={userId}
                selectedMessage={selectedMessage}
                showReactionPicker={showReactionPicker}
                onSelectMessage={setSelectedMessage}
                onReplyToMessage={replyToMessage}
                onStarMessage={starMessage}
                onDeleteMessage={deleteMessage}
                onSetReactionPicker={setShowReactionPicker}
              />
            ) : directMessageMode ? (
              <div className="flex items-center justify-center flex-1 text-gray-500 text-xs">
                Loading conversation...
              </div>
            ) : (
              <div className="flex flex-col h-full">
                {isLoadingConversations ? (
                  <div className="flex items-center justify-center flex-1 text-gray-500 text-xs">
                    Loading conversations...
                  </div>
                ) : filteredConversations.length > 0 ? (
                  <ConversationList
                    conversations={filteredConversations}
                    selectedConversation={selectedConversation}
                    onSelectConversation={(convId) => {
                      setSelectedConversation(convId);
                      markAsRead(convId);
                    }}
                    onMarkAsRead={markAsRead}
                    onMarkAsUnread={markAsUnread}
                    onTogglePin={togglePin}
                    onToggleMute={toggleMute}
                    onToggleArchive={toggleArchive}
                    onDeleteConversation={deleteConversation}
                  />
                ) : (
                  <div className="flex items-center justify-center flex-1 text-gray-500 text-xs">No messages yet</div>
                )}
                {/* <div className="mt-auto">
                  <InviteFriends />
                </div> */}
                <div className="mt-auto mb-4 px-4 space-y-2">
                  <button
                    onClick={() => setShareModalOpen(true)}
                    className="w-full bg-black text-white py-2 rounded-lg text-[10px] hover:bg-gray-800 transition"
                  >
                    Share with Friends
                  </button>

                  <ShareModal
                    isOpen={shareModalOpen}
                    onClose={() => setShareModalOpen(false)}
                    linkToShare={window.location.href}
                  />
                </div>
              </div>
            )}
          </ScrollArea>

          {selectedConversation && (
            <MessageInput
              messageInput={messageInput}
              replyingTo={replyingTo}
              isRecording={isRecording}
              uploadingFile={uploadingFile}
              showEmojiPicker={showEmojiPicker}
              onMessageChange={setMessageInput}
              onSendMessage={handleSendMessage}
              onFileSelect={(file) => handleFileAttachment(file)}
              onVoiceRecord={handleVoiceRecord}
              onCameraCapture={handleCameraCapture}
              onEmojiClick={(emoji) => {
                setMessageInput((prev) => prev + emoji.native);
                setShowEmojiPicker(false);
              }}
              onSetShowEmojiPicker={setShowEmojiPicker}
              onCancelReply={() => setReplyingTo(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatDropdown;
