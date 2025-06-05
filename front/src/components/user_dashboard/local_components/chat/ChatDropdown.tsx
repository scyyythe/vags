import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatHeader } from "./ChatHeader";
import { ConversationList } from "./ConversationList";
import { MessagesList } from "./MessagesList";
import { MessageInput } from "./MessageInput";
import { Conversation, Message } from "./types/types";
import { InviteFriends } from "./InviteFriends";

interface ChatDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatDropdown = ({ isOpen, onClose }: ChatDropdownProps) => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);

  // Mock data with complete Message properties including deliveryStatus
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      participantId: "user1",
      participantName: "Alice Johnson",
      participantAvatar: undefined,
      lastMessage: "Hey! Are you interested in my latest artwork?",
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 5),
      unreadCount: 2,
      isOnline: true,
      isArchived: false,
      isPinned: true,
      isMuted: false,
      messages: [
        {
          id: "m1",
          senderId: "user1",
          senderName: "Alice Johnson",
          content: "Hi there! I saw you liked my painting.",
          timestamp: new Date(Date.now() - 1000 * 60 * 10),
          isRead: true,
          isStarred: false,
          type: 'text',
          reactions: [{ emoji: '👍', users: ['currentUser'] }],
          deliveryStatus: 'seen'
        },
        {
          id: "m2",
          senderId: "user1",
          senderName: "Alice Johnson",
          content: "Hey! Are you interested in my latest artwork?",
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          isRead: false,
          isStarred: true,
          type: 'text',
          deliveryStatus: 'delivered'
        },
      ],
    },
    {
      id: "2",
      participantId: "user2",
      participantName: "Bob Smith",
      participantAvatar: undefined,
      lastMessage: "Thanks for the purchase! 🎨",
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
      unreadCount: 0,
      isOnline: false,
      isArchived: false,
      isPinned: false,
      isMuted: false,
      messages: [
        {
          id: "m3",
          senderId: "user2",
          senderName: "Bob Smith",
          content: "I'll ship your artwork tomorrow.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
          isRead: true,
          isStarred: false,
          type: 'text',
          deliveryStatus: 'seen'
        },
        {
          id: "m4",
          senderId: "user2",
          senderName: "Bob Smith",
          content: "Thanks for the purchase! 🎨",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          isRead: true,
          isStarred: false,
          type: 'text',
          deliveryStatus: 'seen'
        },
      ],
    },
    {
      id: "3",
      participantId: "user3",
      participantName: "Carol Wilson",
      participantAvatar: undefined,
      lastMessage: "When is the next exhibition?",
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
      unreadCount: 1,
      isOnline: true,
      isArchived: false,
      isPinned: false,
      isMuted: false,
      messages: [
        {
          id: "m5",
          senderId: "user3",
          senderName: "Carol Wilson",
          content: "When is the next exhibition?",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
          isRead: false,
          isStarred: false,
          type: 'text',
          deliveryStatus: 'delivered'
        },
      ],
    },
  ]);

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = conv.participantName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArchive = showArchived ? conv.isArchived : !conv.isArchived;
    return matchesSearch && matchesArchive;
  });

  const selectedConv = conversations.find((conv) => conv.id === selectedConversation);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: `m${Date.now()}`,
      senderId: "currentUser",
      senderName: "You",
      content: messageInput,
      timestamp: new Date(),
      isRead: true,
      isStarred: false,
      type: 'text',
      replyTo: replyingTo?.id,
      deliveryStatus: 'sent'
    };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversation
          ? {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastMessage: messageInput,
              lastMessageTime: new Date(),
            }
          : conv
      )
    );

    setMessageInput("");
    setReplyingTo(null);
  };

  const handleFileAttachment = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*,.pdf,.doc,.docx,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && selectedConversation) {
        const fileMessage: Message = {
          id: `m${Date.now()}`,
          senderId: "currentUser",
          senderName: "You",
          content: file.type.startsWith('image/') ? 'Sent an image' : `Sent ${file.name}`,
          timestamp: new Date(),
          isRead: true,
          isStarred: false,
          type: file.type.startsWith('image/') ? 'image' : 'file',
          imageUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
          fileName: file.name,
          deliveryStatus: 'sent'
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

  const handleEmojiClick = (emojiData: any) => {
    setMessageInput(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleVoiceRecord = () => {
    if (!selectedConversation) return;

    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        
        const voiceMessage: Message = {
          id: `m${Date.now()}`,
          senderId: "currentUser",
          senderName: "You",
          content: "Voice message",
          timestamp: new Date(),
          isRead: true,
          isStarred: false,
          type: 'voice',
          voiceDuration: 5,
          deliveryStatus: 'sent'
        };

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedConversation
              ? {
                  ...conv,
                  messages: [...conv.messages, voiceMessage],
                  lastMessage: "Voice message",
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

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.capture = 'environment'; 
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && selectedConversation) {
        const isVideo = file.type.startsWith('video/');
        const cameraMessage: Message = {
          id: `m${Date.now()}`,
          senderId: "currentUser",
          senderName: "You",
          content: isVideo ? 'Sent a video' : 'Sent a photo',
          timestamp: new Date(),
          isRead: true,
          isStarred: false,
          type: 'image',
          imageUrl: URL.createObjectURL(file),
          fileName: file.name,
          deliveryStatus: 'sent'
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

  const toggleArchive = (convId: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === convId ? { ...conv, isArchived: !conv.isArchived } : conv
      )
    );
  };

  const markAsRead = (convId: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === convId 
          ? { 
              ...conv, 
              unreadCount: 0,
              messages: conv.messages.map(msg => ({ ...msg, isRead: true }))
            } 
          : conv
      )
    );
  };

  const markAsUnread = (convId: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === convId 
          ? { 
              ...conv, 
              unreadCount: Math.max(1, conv.unreadCount),
              messages: conv.messages.map((msg, index) => 
                index === conv.messages.length - 1 ? { ...msg, isRead: false } : msg
              )
            } 
          : conv
      )
    );
  };

  const markAllAsRead = () => {
    setConversations(prev =>
      prev.map(conv => ({
        ...conv,
        unreadCount: 0,
        messages: conv.messages.map(msg => ({ ...msg, isRead: true }))
      }))
    );
  };

  const markAllAsUnread = () => {
    setConversations(prev =>
      prev.map(conv => ({
        ...conv,
        unreadCount: Math.max(1, conv.unreadCount),
        messages: conv.messages.map((msg, index) => 
          index === conv.messages.length - 1 ? { ...msg, isRead: false } : msg
        )
      }))
    );
  };

  const togglePin = (convId: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === convId ? { ...conv, isPinned: !conv.isPinned } : conv
      )
    );
  };

  const toggleMute = (convId: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === convId ? { ...conv, isMuted: !conv.isMuted } : conv
      )
    );
  };

  const deleteConversation = (convId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== convId));
    if (selectedConversation === convId) {
      setSelectedConversation(null);
    }
  };

  const starMessage = (messageId: string) => {
    if (!selectedConversation) return;
    
    setConversations(prev =>
      prev.map(conv =>
        conv.id === selectedConversation
          ? {
              ...conv,
              messages: conv.messages.map(msg =>
                msg.id === messageId ? { ...msg, isStarred: !msg.isStarred } : msg
              )
            }
          : conv
      )
    );
  };

  const deleteMessage = (messageId: string) => {
    if (!selectedConversation) return;
    
    setConversations(prev =>
      prev.map(conv =>
        conv.id === selectedConversation
          ? {
              ...conv,
              messages: conv.messages.filter(msg => msg.id !== messageId)
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
    
    setConversations(prev =>
      prev.map(conv =>
        conv.id === selectedConversation
          ? {
              ...conv,
              messages: conv.messages.map(msg => {
                if (msg.id === messageId) {
                  const existingReactions = msg.reactions || [];
                  const existingReaction = existingReactions.find(r => r.emoji === emoji);
                  
                  if (existingReaction) {
                    const userIndex = existingReaction.users.indexOf('currentUser');
                    if (userIndex > -1) {
                      existingReaction.users.splice(userIndex, 1);
                      if (existingReaction.users.length === 0) {
                        return {
                          ...msg,
                          reactions: existingReactions.filter(r => r.emoji !== emoji)
                        };
                      }
                    } else {
                      existingReaction.users.push('currentUser');
                    }
                    return { ...msg, reactions: existingReactions };
                  } else {
                    return {
                      ...msg,
                      reactions: [...existingReactions, { emoji, users: ['currentUser'] }]
                    };
                  }
                }
                return msg;
              })
            }
          : conv
      )
    );
    setShowReactionPicker(null);
  };

  const handleCall = () => {
    if (selectedConv) {
      alert(`Initiating voice call with ${selectedConv.participantName}...`);
    }
  };

  return (
    <div
        className="absolute right-1.5 bg-white rounded-2xl shadow-xl z-50 w-[330px] h-[534px]"
      >
        <div className="flex h-full">
          <div className="w-full flex flex-col">
            <ChatHeader
              selectedConversation={selectedConversation}
              selectedConv={selectedConv}
              showArchived={showArchived}
              searchQuery={searchQuery}
              onBack={() => {
                if (selectedConversation) {
                  setSelectedConversation(null);
                } else {
                  setShowArchived(false);
                }
              }}
              onClose={onClose}
              onCall={handleCall}
              onTogglePin={togglePin}
              onToggleArchived={() => setShowArchived(!showArchived)}
              onMarkAllAsRead={markAllAsRead}
              onMarkAllAsUnread={markAllAsUnread}
              onSearchChange={setSearchQuery}
            />

            <ScrollArea className="flex-1">
              {selectedConversation && selectedConv ? (
                <MessagesList
                  conversation={selectedConv}
                  selectedMessage={selectedMessage}
                  showReactionPicker={showReactionPicker}
                  onSelectMessage={setSelectedMessage}
                  onReplyToMessage={replyToMessage}
                  onStarMessage={starMessage}
                  onDeleteMessage={deleteMessage}
                //   onAddReaction={addReactionToMessage}
                  onSetReactionPicker={setShowReactionPicker}
                />
              ) : (
                <div className="flex flex-col h-full">
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
                onEmojiClick={handleEmojiClick}
                onSetShowEmojiPicker={setShowEmojiPicker}
                onCancelReply={() => setReplyingTo(null)}
                onCameraCapture={handleCameraCapture}
              />
            )}
          </div>
        </div>
      </div>
  );
};

export default ChatDropdown;
