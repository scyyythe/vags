import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
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
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
interface ChatDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  participantId?: string;
  participantName?: string;
  participantAvatar?: string;
}

const ChatDropdown = ({ isOpen, onClose, participantId, participantName, participantAvatar }: ChatDropdownProps) => {
  const { directMessageMode } = useChat();
  const storage = getStorage();
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
  const userId = localStorage.getItem("user_id")!;
  const userName = localStorage.getItem("username")!;
  const userAvatarLocal = localStorage.getItem("avatar_url") || undefined;
  const [conversations, setConversations] = useUserConversations(userId);
  const [headerName, setHeaderName] = useState(participantName || "Unknown");
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const { messages: firebaseMessages, sendMessage: sendFirebaseMessage } = useFirebaseChat(
    selectedConversation || "",
    userId
  );
  const mergeMessages = (local: Message[], remote: Message[]) => {
    const ids = new Set(remote.map((m) => m.id));
    return [...local, ...remote.filter((m) => !ids.has(m.id))];
  };

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
            messages: mergeMessages(existingConv?.messages || [], data.messages || []),
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
        };
      }

      // --- create new if not exists ---
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
      };

      const docRef = await addDoc(collection(db, "conversations"), newConv);

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
    if (!isOpen || !participantId || !conversationsLoaded) return;

    const targetConv = conversations.find((c) => c.participantId === participantId);

    if (targetConv) {
      setSelectedConversation(targetConv.id);
      markAsRead(targetConv.id);
    } else if (!creatingRef.current && conversationsLoaded) {
      // 👈 ensure snapshot is ready
      creatingRef.current = true;
      setLoadingConversation(true);

      createConv(participantId, participantName || "Unknown", participantAvatar || null)
        .then((newConv) => {
          if (newConv) {
            setSelectedConversation(newConv.id);
            markAsRead(newConv.id);
          }
        })
        .finally(() => {
          creatingRef.current = false;
          setLoadingConversation(false);
        });
    }
  }, [isOpen, participantId, conversationsLoaded, conversations]);

  const filteredConversations = conversations.filter((conv) => {
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

    await sendFirebaseMessage(
      {
        text: messageInput,
        type: "text",
        replyTo: replyData,
      },
      participantId || selectedConv?.participantId,
      userName,
      userAvatarLocal,
      selectedConversation
    );

    addMessageToConversation(selectedConversation, {
      content: messageInput,
      type: "text",
      replyTo: replyData,
      senderName: userName,
      senderId: userId,
      isMine: true,
    });

    setMessageInput("");
    setReplyingTo(null);
  };

  const handleFileAttachment = (file: File) => {
    if (!file || !selectedConversation) return;

    const storageRef = ref(storage, `chat_uploads/${selectedConversation}/${Date.now()}_${file.name}`);

    uploadBytes(storageRef, file).then(async (snapshot) => {
      const downloadURL = await getDownloadURL(snapshot.ref);

      addMessageToConversation(selectedConversation, {
        content: file.type.startsWith("image/") ? "Sent an image" : `Sent ${file.name}`,
        type: file.type.startsWith("image/") ? "image" : "file",
        imageUrl: file.type.startsWith("image/") ? downloadURL : undefined,
        fileName: file.name,
      });

      await sendFirebaseMessage(
        {
          text: file.type.startsWith("image/") ? "Sent an image" : `Sent ${file.name}`,
          type: file.type.startsWith("image/") ? "image" : "file",
          fileUrl: downloadURL,
          fileName: file.name,
        },
        participantId || selectedConv?.participantId,
        userName,
        userAvatarLocal,
        selectedConversation
      );
    });
  };

  const handleCameraCapture = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*";
    input.capture = "environment";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && selectedConversation) {
        addMessageToConversation(selectedConversation, {
          content: file.type.startsWith("video/") ? "Sent a video" : "Sent a photo",
          type: "image",
          imageUrl: URL.createObjectURL(file),
          fileName: file.name,
        });
      }
    };
    input.click();
  };

  const handleVoiceRecord = () => {
    if (!selectedConversation) return;
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        addMessageToConversation(selectedConversation, {
          content: "Voice message",
          type: "voice",
          voiceDuration: 5,
        });
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
  // Delete conversation
  const deleteConversation = async (convId: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    if (selectedConversation === convId) setSelectedConversation(null);

    try {
      await deleteDoc(doc(db, "conversations", convId));
    } catch (err) {
      console.error("Error deleting conversation:", err);
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
                  messages: [
                    ...(selectedConv.messages || []),
                    ...(firebaseMessages || [])
                      .filter((fmsg: any) => !(selectedConv.messages || []).some((m) => m.id === fmsg.id))
                      .map((msg: any) => ({
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
                        imageUrl: msg.imageUrl,
                        fileName: msg.fileName,
                        voiceDuration: msg.voiceDuration,
                        isMine: String(msg.senderId) === String(userId),
                        replyTo: msg.replyTo || null,
                      })),
                  ],
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
                {filteredConversations.length > 0 ? (
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
