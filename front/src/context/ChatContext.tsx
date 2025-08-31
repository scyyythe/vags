import { createContext, useContext, useState, ReactNode } from "react";

interface ChatContextType {
  isChatOpen: boolean;
  participantId: string | null;
  participantName: string | null;
  participantAvatar: string | null;
  directMessageMode: boolean;
  openChat: (id: string, name: string, avatar?: string, direct?: boolean) => void;
  closeChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState<string | null>(null);
  const [participantAvatar, setParticipantAvatar] = useState<string | null>(null);
  const [directMessageMode, setDirectMessageMode] = useState(false);

  const openChat = (id: string, name: string, avatar?: string, direct = false) => {
    setParticipantId(id);
    setParticipantName(name);
    setParticipantAvatar(avatar || null);
    setDirectMessageMode(direct);
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setParticipantId(null);
    setParticipantName(null);
    setParticipantAvatar(null);
    setDirectMessageMode(false);
    setIsChatOpen(false);
  };

  return (
    <ChatContext.Provider
      value={{ isChatOpen, participantId, participantName, participantAvatar, directMessageMode, openChat, closeChat }}
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
