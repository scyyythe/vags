import { createContext, useContext, useState, ReactNode } from "react";

interface ChatContextType {
  isChatOpen: boolean;
  participantId: string | null;
  participantName: string | null;
  participantAvatar: string | null;
  directMessageMode: boolean;
  selectedConversationId: string | null; // ✅ NEW
  openChat: (id?: string, name?: string, avatar?: string, direct?: boolean) => void;
  closeChat: () => void;
  setSelectedConversationId: (id: string | null) => void; // ✅ NEW
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState<string | null>(null);
  const [participantAvatar, setParticipantAvatar] = useState<string | null>(null);
  const [directMessageMode, setDirectMessageMode] = useState(false);

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const openChat = (id?: string, name?: string, avatar?: string, direct = false) => {
    setParticipantId(id || null);
    setParticipantName(name || null);
    setParticipantAvatar(avatar || null);
    setDirectMessageMode(direct);

    if (id) {
      setSelectedConversationId(id);
    } else {
      setSelectedConversationId(null);
    }

    setIsChatOpen(true);
  };

  const closeChat = () => {
    setParticipantId(null);
    setParticipantName(null);
    setParticipantAvatar(null);
    setDirectMessageMode(false);
    setSelectedConversationId(null);
    setIsChatOpen(false);
  };

  return (
    <ChatContext.Provider
      value={{
        isChatOpen,
        participantId,
        participantName,
        participantAvatar,
        directMessageMode,
        selectedConversationId,
        openChat,
        closeChat,
        setSelectedConversationId,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within ChatProvider");
  return context;
};
