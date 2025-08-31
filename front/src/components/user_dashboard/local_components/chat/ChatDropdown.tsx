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
import { collection, query, orderBy, where, onSnapshot } from "firebase/firestore";
import { useFirebaseChat } from "@/hooks/messages/useFirebaseChat";
import { useUserConversations } from "@/hooks/messages/useUserConversations";

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

  const userId = localStorage.getItem("user_id")!;
  const userName = localStorage.getItem("username")!;
  const userAvatarLocal = localStorage.getItem("avatar_url") || undefined;
  const [conversations, setConversations] = useUserConversations(userId);

  const { messages: firebaseMessages, sendMessage: sendFirebaseMessage } = useFirebaseChat(
    selectedConversation || "",
    userId // must match exactly
  );

  // Fetch user conversations on open
  useEffect(() => {
    if (!isOpen) return;

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", userId),
      orderBy("lastMessageTime", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs: Conversation[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          participantId: data.participantId || "",
          participantName: data.participantName || "Unknown",
          participantAvatar: data.participantAvatar,
          lastMessage: data.lastMessage || "",
          lastMessageTime: data.lastMessageTime?.toDate ? data.lastMessageTime.toDate() : new Date(),
          unreadCount: data.unreadCount || 0,
          isOnline: data.isOnline || false,
          isArchived: data.isArchived || false,
          isPinned: data.isPinned || false,
          isMuted: data.isMuted || false,
          messages: data.messages || [], // ✅ default to empty array
        };
      });
      setConversations(convs);
    });

    return () => unsubscribe();
  }, [isOpen]);

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
    const matchesSearch = conv.participantName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArchive = showArchived ? conv.isArchived : !conv.isArchived;
    return matchesSearch && matchesArchive;
  });

  const selectedConv = conversations.find((conv) => conv.id === selectedConversation);

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
    };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === convId
          ? {
              ...conv,
              messages: [...(conv.messages || []), newMessage], // ✅ safeguard
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

    await sendFirebaseMessage(
      messageInput,
      participantId || selectedConv?.participantId,
      userName,
      userAvatarLocal,
      selectedConversation
    );

    addMessageToConversation(selectedConversation, { content: messageInput, type: "text" });

    setMessageInput("");
    setReplyingTo(null);
  };

  const handleFileAttachment = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*,.pdf,.doc,.docx,.txt";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && selectedConversation) {
        addMessageToConversation(selectedConversation, {
          content: file.type.startsWith("image/") ? "Sent an image" : `Sent ${file.name}`,
          type: file.type.startsWith("image/") ? "image" : "file",
          imageUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
          fileName: file.name,
        });
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
  const markAsRead = (convId: string) =>
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === convId
          ? { ...conv, unreadCount: 0, messages: (conv.messages || []).map((msg) => ({ ...msg, isRead: true })) }
          : conv
      )
    );

  const markAsUnread = (convId: string) =>
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

  const togglePin = (convId: string) =>
    setConversations((prev) => prev.map((conv) => (conv.id === convId ? { ...conv, isPinned: !conv.isPinned } : conv)));
  const toggleMute = (convId: string) =>
    setConversations((prev) => prev.map((conv) => (conv.id === convId ? { ...conv, isMuted: !conv.isMuted } : conv)));
  const toggleArchive = (convId: string) =>
    setConversations((prev) =>
      prev.map((conv) => (conv.id === convId ? { ...conv, isArchived: !conv.isArchived } : conv))
    );
  const deleteConversation = (convId: string) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== convId));
    if (selectedConversation === convId) setSelectedConversation(null);
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

  const replyToMessage = (message: Message) => setReplyingTo(message);

  return (
    <div className="absolute right-4 md:right-0.5 bg-white rounded-2xl shadow-xl z-50 w-[330px] md:w-[330px] h-[534px]">
      <div className="flex h-full">
        <div className="w-full flex flex-col">
          <ChatHeader
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
            {selectedConversation && selectedConv ? (
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
                        senderName: msg.senderName || "Unknown",
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
