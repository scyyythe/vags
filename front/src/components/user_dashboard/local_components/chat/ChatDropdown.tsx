import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatHeader } from "./ChatHeader";
import { ConversationList } from "./ConversationList";
import { ConversationListSkeleton, ConversationLoadingSkeleton } from "../../../skeletons/ConversationListSkeleton";
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
import useAllUsersQuery from "@/hooks/users/useAllUsersQuery";
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
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const { data: allUsers = [], isLoading: isLoadingUsers } = useAllUsersQuery();

  const { messages: firebaseMessages, sendMessage: sendFirebaseMessage } = useFirebaseChat(
    selectedConversation || "",
    userId
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedConversation(null);
    }
  }, [isOpen]);

  const creatingRef = useRef(false);

  const markAsRead = useCallback(
    async (convId: string, updateTimestamp: boolean = false) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === convId
            ? { ...conv, unreadCount: 0, messages: (conv.messages || []).map((msg) => ({ ...msg, isRead: true })) }
            : conv
        )
      );

      try {
        const convRef = doc(db, "conversations", convId);
        const updateData: any = {
          unreadCount: 0,
          isArchived: false,
        };

        if (updateTimestamp) {
          updateData.lastMessageTime = serverTimestamp();
        }

        await updateDoc(convRef, updateData);

        const msgsRef = collection(db, "conversations", convId, "messages");
        const snapshot = await getDocs(msgsRef);
        snapshot.forEach(async (docSnap) => {
          await updateDoc(doc(db, "conversations", convId, "messages", docSnap.id), { isRead: true });
        });
      } catch (err) {}
    },
    [userId]
  );

  const createConv = async (
    targetId: string,
    targetName: string,
    targetAvatar: string | null
  ): Promise<Conversation | null> => {
    try {
      const existingLocal = conversations.find((c) => c.participantId === targetId);
      if (existingLocal) {
        return existingLocal;
      }

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
          !isDeletedByUser
        );
      });

      if (existing) {
        const existingData = existing.data();
        const currentDeletedBy = existingData.deletedBy || [];

        if (currentDeletedBy.includes(userId)) {
          const updatedDeletedBy = currentDeletedBy.filter((id: string) => id !== userId);

          try {
            await updateDoc(doc(db, "conversations", existing.id), {
              deletedBy: updatedDeletedBy,
            });
          } catch (err) {}
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

      const newConv = {
        participants: [userId, targetId],
        participantId: targetId,
        participantName: targetName,
        participantAvatar: targetAvatar || null,
        lastMessage: "",
        lastMessageTime: serverTimestamp(),
        unreadCount: 0,
        isOnline: false,
        isArchived: false,
        isPinned: false,
        isMuted: false,
        messages: [] as Message[],
        deletedBy: [],
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
      markAsRead(targetConv.id, false);
      setLoadingConversation(false);
    } else if (!creatingRef.current && conversationsLoaded) {
      creatingRef.current = true;
      setLoadingConversation(true);

      createConv(participantId, participantName || "Unknown", participantAvatar || null)
        .then((newConv) => {
          if (newConv) {
            setSelectedConversation(newConv.id);
            markAsRead(newConv.id, false);
            setConversations((prev) => [newConv, ...prev]);
          }
          setLoadingConversation(false);
        })
        .catch((error) => {
          setLoadingConversation(false);
        })
        .finally(() => {
          creatingRef.current = false;
        });
    }
  }, [isOpen, participantId, conversationsLoaded, markAsRead, participantName, participantAvatar]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      const isDeletedByUser = conv.deletedBy?.includes(userId) || false;
      if (isDeletedByUser) {
        return false;
      }

      const matchesSearch = conv.participantName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesArchive = showArchived ? conv.isArchived : !conv.isArchived;
      return matchesSearch && matchesArchive;
    });
  }, [conversations, searchQuery, showArchived, userId]);

  const filteredUsers = useMemo(() => {
    return allUsers
      .filter((user) => {
        if (user.id === userId) return false;
        const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
        const username = user.username || "";
        const email = user.email || "";

        const searchLower = searchQuery.toLowerCase();
        return (
          fullName.toLowerCase().includes(searchLower) ||
          username.toLowerCase().includes(searchLower) ||
          email.toLowerCase().includes(searchLower)
        );
      })
      .slice(0, 5);
  }, [allUsers, searchQuery, userId]);

  const handleUserSelect = async (selectedUser: any) => {
    setSearchQuery("");
    setShowUserDropdown(false);

    const existingConv = conversations.find((conv) => conv.participantId === selectedUser.id);

    if (existingConv) {
      setSelectedConversation(existingConv.id);
      markAsRead(existingConv.id, false);
    } else {
      const newConv = await createConv(
        selectedUser.id,
        `${selectedUser.first_name || ""} ${selectedUser.last_name || ""}`.trim() ||
          selectedUser.username ||
          selectedUser.email,
        selectedUser.profile_picture || null
      );

      if (newConv) {
        setSelectedConversation(newConv.id);
        markAsRead(newConv.id, false);
        setConversations((prev) => [newConv, ...prev]);
      }
    }
  };

  const selectedConv = useMemo(
    () => conversations.find((conv) => conv.id === selectedConversation),
    [conversations, selectedConversation]
  );
  useEffect(() => {
    if (selectedConv) {
      setHeaderName(selectedConv.participantName || participantName || "Unknown");
    }
  }, [selectedConv, participantName]);

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

    const messageText = messageInput;
    setMessageInput("");
    setReplyingTo(null);

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
  };

  const handleFileAttachment = async (file: File) => {
    if (!file || !selectedConversation) return;

    setUploadingFile(true);
    try {
      const cloudinaryUrl = file.type.startsWith("image/")
        ? await uploadChatImageToCloudinary(file)
        : await uploadChatFileToCloudinary(file);

      await sendFirebaseMessage(
        {
          text: file.type.startsWith("image/") ? "" : `Sent ${file.name}`,
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
          const cloudinaryUrl = await uploadChatImageToCloudinary(file);

          await sendFirebaseMessage(
            {
              text: "",
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
    } catch (err) {}
  };

  const togglePin = async (convId: string) => {
    const conv = conversations.find((c) => c.id === convId);
    if (!conv) return;

    const newVal = !conv.isPinned;
    setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, isPinned: newVal } : c)));

    try {
      await updateDoc(doc(db, "conversations", convId), { isPinned: newVal });
    } catch (err) {}
  };
  const toggleMute = async (convId: string) => {
    const conv = conversations.find((c) => c.id === convId);
    if (!conv) return;

    const newVal = !conv.isMuted;
    setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, isMuted: newVal } : c)));

    try {
      await updateDoc(doc(db, "conversations", convId), { isMuted: newVal });
    } catch (err) {}
  };
  const toggleArchive = async (convId: string) => {
    const conv = conversations.find((c) => c.id === convId);
    if (!conv) return;

    const newVal = !conv.isArchived;
    setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, isArchived: newVal } : c)));

    try {
      await updateDoc(doc(db, "conversations", convId), { isArchived: newVal });
    } catch (err) {}
  };
  const deleteConversation = async (convId: string) => {
    if (selectedConversation === convId) setSelectedConversation(null);

    try {
      const conv = conversations.find((c) => c.id === convId);
      if (!conv) {
        return;
      }

      const currentDeletedBy = conv.deletedBy || [];

      if (!currentDeletedBy.includes(userId)) {
        const updatedDeletedBy = [...currentDeletedBy, userId];

        await updateDoc(doc(db, "conversations", convId), {
          deletedBy: updatedDeletedBy,
        });
      }
    } catch (err) {}
  };

  const restoreConversation = async (convId: string) => {
    try {
      const conv = conversations.find((c) => c.id === convId);
      if (!conv) return;

      const currentDeletedBy = conv.deletedBy || [];

      const updatedDeletedBy = currentDeletedBy.filter((id) => id !== userId);

      await updateDoc(doc(db, "conversations", convId), {
        deletedBy: updatedDeletedBy,
      });
    } catch (err) {}
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

  useEffect(() => {
    const handleClickOutside = () => {
      setShowUserDropdown(false);
    };

    if (showUserDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showUserDropdown]);

  return (
    <div className="absolute right-4 md:right-1.5 bg-white rounded-2xl shadow-xl z-50 w-[360px] md:w-[360px] h-[534px]">
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
            onMarkAllAsRead={() => conversations.forEach((c) => markAsRead(c.id, true))}
            onMarkAllAsUnread={() => conversations.forEach((c) => markAsUnread(c.id))}
            onSearchChange={(query) => {
              setSearchQuery(query);
              setShowUserDropdown(query.length > 0);
            }}
          />
          <ScrollArea className="flex-1">
            {loadingConversation ? (
              <div className="flex flex-col items-center justify-center flex-1 p-4 space-y-4">
                <div className="flex items-center space-x-3 w-full">
                  <motion.div
                    className="h-8 w-8 bg-gray-200 rounded-full"
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <div className="flex-1 space-y-2">
                    <motion.div
                      className="h-4 bg-gray-200 rounded w-24"
                      animate={{
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.2,
                      }}
                    />
                    <motion.div
                      className="h-3 bg-gray-200 rounded w-32"
                      animate={{
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.4,
                      }}
                    />
                  </div>
                </div>
                <div className="text-gray-500 text-xs">Opening chat...</div>
              </div>
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
            ) : directMessageMode && loadingConversation ? (
              <ConversationLoadingSkeleton />
            ) : (
              <div className="flex flex-col h-full relative">
                {showUserDropdown && searchQuery.length > 0 && (
                  <div
                    className="absolute top-0 left-0 right-0 z-10 bg-white border-b border-gray-200 max-h-48 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isLoadingUsers ? (
                      <div className="p-3 text-center text-gray-500 text-xs">Loading users...</div>
                    ) : filteredUsers.length > 0 ? (
                      <div className="py-1">
                        <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                          Start or continue conversation
                        </div>
                        {filteredUsers.map((user) => {
                          const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
                          const displayName = fullName || user.username || user.email;
                          const existingConv = conversations.find((conv) => conv.participantId === user.id);

                          return (
                            <div
                              key={user.id}
                              onClick={() => handleUserSelect(user)}
                              className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="relative">
                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                  {user.profile_picture ? (
                                    <img
                                      src={user.profile_picture}
                                      alt={displayName}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-xs font-medium text-gray-600">
                                      {displayName.charAt(0).toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <div className="absolute -bottom-0.5 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                                  {existingConv && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800">
                                      Chat
                                    </span>
                                  )}
                                </div>
                                {user.username && <p className="text-xs text-gray-500 truncate">@{user.username}</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-3 text-center text-gray-500 text-xs">No users found for "{searchQuery}"</div>
                    )}
                  </div>
                )}

                <div className={`${showUserDropdown && searchQuery.length > 0 ? "pt-48" : ""}`}>
                  {isLoadingConversations ? (
                    <ConversationListSkeleton count={6} />
                  ) : filteredConversations.length > 0 ? (
                    <ConversationList
                      conversations={filteredConversations}
                      selectedConversation={selectedConversation}
                      onSelectConversation={(convId) => {
                        setSelectedConversation(convId);
                        markAsRead(convId, false);
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
                </div>
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
