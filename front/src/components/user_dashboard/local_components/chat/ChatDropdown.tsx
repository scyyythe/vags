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
  const [uploadingFile, setUploadingFile] = useState(false);
  const userId = localStorage.getItem("user_id")!;
  const userName = localStorage.getItem("username")!;
  const userAvatarLocal = localStorage.getItem("avatar_url") || undefined;
  const [conversations, setConversations, isLoadingConversations] = useUserConversations(userId);
  const conversationsLoaded = !isLoadingConversations;
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

  // Reset conversation selection when chat opens
  useEffect(() => {
    if (isOpen) {
      setSelectedConversation(null);
    }
  }, [isOpen]);

  const creatingRef = useRef(false);
  const createConv = async (
    targetId: string,
    targetName: string,
    targetAvatar: string | null
  ): Promise<Conversation | null> => {
    try {
      // First check if conversation already exists in local state
      const existingLocal = conversations.find((c) => c.participantId === targetId);
      if (existingLocal) {
        return existingLocal;
      }

      // Then check Firestore for existing conversation
      const q = query(collection(db, "conversations"), where("participants", "array-contains", userId));
      const snapshot = await getDocs(q);

      const existing = snapshot.docs.find((doc) => {
        const data = doc.data();
        const isDeletedByUser = data.deletedBy?.includes(userId) || false;

        return (
          Array.isArray(data.participants) &&
          data.participants.length === 2 &&
          data.participants.includes(userId) &&
          data.participants.includes(targetId) &&
          !isDeletedByUser // Don't return conversations deleted by current user
        );
      });

      if (existing) {
        // If conversation exists but was deleted by current user, restore it
        const existingData = existing.data();
        const currentDeletedBy = existingData.deletedBy || [];

        if (currentDeletedBy.includes(userId)) {
          // Remove current user from deletedBy array to restore the conversation
          const updatedDeletedBy = currentDeletedBy.filter((id: string) => id !== userId);

          try {
            await updateDoc(doc(db, "conversations", existing.id), {
              deletedBy: updatedDeletedBy,
            });
          } catch (err) {
            // Error handling
          }
        }

        return {
          id: existing.id,
          participantId: targetId,
          participantName: existingData.participantName || targetName,
          participantAvatar: existingData.participantAvatar || targetAvatar || null,
          lastMessage: existingData.lastMessage ?? "",
          lastMessageTime: existingData.lastMessageTime?.toDate ? existingData.lastMessageTime.toDate() : new Date(),
          unreadCount: existingData.unreadCount || 0,
          isOnline: existingData.isOnline || false,
          isArchived: existingData.isArchived || false,
          isPinned: existingData.isPinned || false,
          isMuted: existingData.isMuted || false,
          messages: existingData.messages || [],
          deletedBy: existingData.deletedBy || [],
        };
      }

      // --- create new if not exists ---
      const newConv = {
        participants: [userId, targetId],
        participantId: targetId,
        participantName: targetName,
        participantAvatar: targetAvatar || null, // Use null instead of undefined for Firebase
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

      return {
        ...newConv,
        id: docRef.id,
        lastMessageTime: new Date(),
      };
    } catch (err) {
      return null;
    }
  };

  useEffect(() => {
    if (!isOpen || !participantId || !conversationsLoaded) {
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
      return false;
    }

    const matchesSearch = conv.participantName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArchive = showArchived ? conv.isArchived : !conv.isArchived;
    return matchesSearch && matchesArchive;
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
      // Error handling
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
          // Error handling
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
      // Error handling
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
      // Error handling
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
      // Error handling
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
      // Error handling
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
      // Error handling
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
      }
    } catch (err) {
      // Error handling
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
    } catch (err) {
      // Error handling
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
