// ChatDropdown.tsx
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatHeader } from "./ChatHeader";
import { ConversationList } from "./ConversationList";
import { MessagesList } from "./MessagesList";
import { MessageInput } from "./MessageInput";
import { Conversation, Message } from "./types/types";
import { InviteFriends } from "./InviteFriends";
import { db } from "@/firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { useFirebaseChat } from "@/hooks/messages/useFirebaseChat";

interface ChatDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  participantId?: string;
  participantName?: string;
  participantAvatar?: string;
}

const ChatDropdown = ({ isOpen, onClose, participantId, participantName, participantAvatar }: ChatDropdownProps) => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const userId = localStorage.getItem("user_id")!;
  const userName = localStorage.getItem("username")!;
  const userAvatarLocal = localStorage.getItem("avatar_url") || undefined;

  const {
    messages: firebaseMessages,
    loading,
    sendMessage: sendFirebaseMessage,
  } = useFirebaseChat(selectedConversation || "", userId);
  useEffect(() => {
    if (!isOpen) return;

    const q = query(
      collection(db, "conversations"),
      // Assuming each conversation has a 'participants' array
      where("participants", "array-contains", userId),
      orderBy("lastMessageTime", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Conversation[];

      setConversations(convs);
    });

    return () => unsubscribe();
  }, [isOpen]);
  // Listen for changes in the selected conversation to update messages
  useEffect(() => {
    if (!selectedConversation) return;

    const q = query(collection(db, "conversations", selectedConversation, "messages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];

      setConversations((prev) =>
        prev.map((conv) => (conv.id === selectedConversation ? { ...conv, messages: msgs } : conv))
      );
    });

    return () => unsubscribe();
  }, [selectedConversation]);

  // Open or create conversation if a participant is passed
  useEffect(() => {
    if (isOpen && participantId) {
      setConversations((prev) => {
        let targetConv = prev.find((c) => c.participantId === participantId);

        if (targetConv) {
          setSelectedConversation(targetConv.id);
          markAsRead(targetConv.id);
          return prev;
        }

        // Create new conversation
        const newConv: Conversation = {
          id: Date.now().toString(),
          participantId,
          participantName: participantName || "New Seller",
          participantAvatar: participantAvatar,
          lastMessage: "",
          lastMessageTime: new Date(),
          unreadCount: 0,
          isOnline: false,
          isArchived: false,
          isPinned: false,
          isMuted: false,
          messages: [],
        };

        setSelectedConversation(newConv.id);
        return [...prev, newConv];
      });
    }
  }, [isOpen, participantId, participantName, participantAvatar]);

  const filteredConversations = conversations.filter((conv) => {
    const matchesUser = conv.participantId === userId || conv.messages.some((m) => m.senderId === userId);
    const matchesSearch = conv.participantName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArchive = showArchived ? conv.isArchived : !conv.isArchived;
    return matchesUser && matchesSearch && matchesArchive;
  });

  const selectedConv = conversations.find((conv) => conv.id === selectedConversation);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || !participantId) return;

    const messageId = await sendFirebaseMessage(messageInput, participantId, userName, userAvatarLocal);

    if (messageId) {
      console.log("Message successfully inserted with ID:", messageId);
      setMessageInput("");
    } else {
      console.log("Failed to insert message.");
    }
  };

  // File, camera, voice, emoji handlers
  const handleFileAttachment = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*,.pdf,.doc,.docx,.txt";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && selectedConversation) {
        const fileMessage: Message = {
          id: `m${Date.now()}`,
          senderId: userId,
          senderName: userName,
          content: file.type.startsWith("image/") ? "Sent an image" : `Sent ${file.name}`,
          timestamp: new Date(),
          isRead: true,
          isStarred: false,
          type: file.type.startsWith("image/") ? "image" : "file",
          imageUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
          fileName: file.name,
          deliveryStatus: "sent",
        };

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedConversation
              ? {
                  ...conv,
                  messages: [...conv.messages, fileMessage],
                  lastMessage: fileMessage.content,
                  lastMessageTime: new Date(),
                }
              : conv
          )
        );
      }
    };
    input.click();
  };

  const handleCameraCapture = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*";
    input.capture = "environment";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && selectedConversation) {
        const isVideo = file.type.startsWith("video/");
        const cameraMessage: Message = {
          id: `m${Date.now()}`,
          senderId: userId,
          senderName: userName,
          content: isVideo ? "Sent a video" : "Sent a photo",
          timestamp: new Date(),
          isRead: true,
          isStarred: false,
          type: "image",
          imageUrl: URL.createObjectURL(file),
          fileName: file.name,
          deliveryStatus: "sent",
        };

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedConversation
              ? {
                  ...conv,
                  messages: [...conv.messages, cameraMessage],
                  lastMessage: cameraMessage.content,
                  lastMessageTime: new Date(),
                }
              : conv
          )
        );
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
        const voiceMessage: Message = {
          id: `m${Date.now()}`,
          senderId: userId,
          senderName: userName,
          content: "Voice message",
          timestamp: new Date(),
          isRead: true,
          isStarred: false,
          type: "voice",
          voiceDuration: 5,
          deliveryStatus: "sent",
        };

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedConversation
              ? {
                  ...conv,
                  messages: [...conv.messages, voiceMessage],
                  lastMessage: voiceMessage.content,
                  lastMessageTime: new Date(),
                }
              : conv
          )
        );
      }, 2000);
    } else {
      setIsRecording(false);
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    setMessageInput((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleCall = () => {
    if (selectedConv) {
      alert(`Initiating voice call with ${selectedConv.participantName}...`);
    }
  };

  // Mark as read/unread, pin, mute, archive, delete
  const markAsRead = (convId: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === convId
          ? {
              ...conv,
              unreadCount: 0,
              messages: conv.messages.map((msg) => ({ ...msg, isRead: true })),
            }
          : conv
      )
    );
  };

  const markAsUnread = (convId: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === convId
          ? {
              ...conv,
              unreadCount: Math.max(1, conv.unreadCount),
              messages: conv.messages.map((msg, index) =>
                index === conv.messages.length - 1 ? { ...msg, isRead: false } : msg
              ),
            }
          : conv
      )
    );
  };

  const togglePin = (convId: string) => {
    setConversations((prev) => prev.map((conv) => (conv.id === convId ? { ...conv, isPinned: !conv.isPinned } : conv)));
  };

  const toggleMute = (convId: string) => {
    setConversations((prev) => prev.map((conv) => (conv.id === convId ? { ...conv, isMuted: !conv.isMuted } : conv)));
  };

  const toggleArchive = (convId: string) => {
    setConversations((prev) =>
      prev.map((conv) => (conv.id === convId ? { ...conv, isArchived: !conv.isArchived } : conv))
    );
  };

  const deleteConversation = (convId: string) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== convId));
    if (selectedConversation === convId) {
      setSelectedConversation(null);
    }
  };

  const starMessage = (messageId: string) => {
    if (!selectedConversation) return;

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversation
          ? {
              ...conv,
              messages: conv.messages.map((msg) =>
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
          ? {
              ...conv,
              messages: conv.messages.filter((msg) => msg.id !== messageId),
            }
          : conv
      )
    );
  };

  const replyToMessage = (message: Message) => {
    setReplyingTo(message);
  };

  const addReactionToMessage = (messageId: string, emoji: string) => {
    if (!selectedConversation) return;

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversation
          ? {
              ...conv,
              messages: conv.messages.map((msg) => {
                if (msg.id === messageId) {
                  const existingReactions = msg.reactions || [];
                  const existingReaction = existingReactions.find((r) => r.emoji === emoji);

                  if (existingReaction) {
                    const userIndex = existingReaction.users.indexOf(userId);
                    if (userIndex > -1) {
                      existingReaction.users.splice(userIndex, 1);
                      if (existingReaction.users.length === 0) {
                        return {
                          ...msg,
                          reactions: existingReactions.filter((r) => r.emoji !== emoji),
                        };
                      }
                    } else {
                      existingReaction.users.push(userId);
                    }
                    return { ...msg, reactions: existingReactions };
                  } else {
                    return {
                      ...msg,
                      reactions: [...existingReactions, { emoji, users: [userId] }],
                    };
                  }
                }
                return msg;
              }),
            }
          : conv
      )
    );
    setShowReactionPicker(null);
  };

  return (
    <div className="absolute right-4 md:right-0.5 bg-white rounded-2xl shadow-xl z-50 w-[330px] md:w-[330px] h-[534px]">
      <div className="flex h-full">
        <div className="w-full flex flex-col">
          <ChatHeader
            selectedConversation={selectedConversation}
            selectedConv={selectedConv}
            showArchived={showArchived}
            searchQuery={searchQuery}
            onBack={() => {
              if (selectedConversation) setSelectedConversation(null);
              else setShowArchived(false);
            }}
            onClose={onClose}
            onCall={handleCall}
            onTogglePin={togglePin}
            onToggleArchived={() => setShowArchived(!showArchived)}
            onMarkAllAsRead={() => conversations.forEach((c) => markAsRead(c.id))}
            onMarkAllAsUnread={() => conversations.forEach((c) => markAsUnread(c.id))}
            onSearchChange={setSearchQuery}
          />

          <ScrollArea className="flex-1">
            {selectedConversation && selectedConv ? (
              <MessagesList
                conversation={{
                  ...selectedConv,
                  messages: firebaseMessages.map((msg: any) => ({
                    id: msg.id,
                    senderId: msg.senderId,
                    senderName: msg.senderName || "Unknown",
                    content: msg.content || msg.text || "",
                    timestamp: msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(),
                    isRead: msg.isRead || false,
                    isStarred: msg.isStarred || false,
                    type: msg.type || "text",
                    deliveryStatus: msg.deliveryStatus || "sent",
                    reactions: msg.reactions || [],
                    imageUrl: msg.imageUrl || undefined,
                    fileName: msg.fileName || undefined,
                    voiceDuration: msg.voiceDuration || undefined,
                    isMine: msg.senderId === userId,
                  })) as Message[],
                }}
                selectedMessage={selectedMessage}
                showReactionPicker={showReactionPicker}
                onSelectMessage={setSelectedMessage}
                onReplyToMessage={replyToMessage}
                onStarMessage={starMessage}
                onDeleteMessage={deleteMessage}
                onSetReactionPicker={setShowReactionPicker}
              />
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

                <div className="mt-auto">
                  <InviteFriends />
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
              onFileAttachment={handleFileAttachment}
              onVoiceRecord={handleVoiceRecord}
              onCameraCapture={handleCameraCapture}
              onEmojiClick={handleEmojiClick}
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
