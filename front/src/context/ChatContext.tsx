// context/ChatContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

interface ChatContextType {
  isChatOpen: boolean;
  participantId: string | null;
  participantName: string | null;
  openChat: (id: string, name: string) => void;
  closeChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState<string | null>(null);

  const openChat = (id: string, name: string) => {
    setParticipantId(id);
    setParticipantName(name);
    setIsChatOpen(true);
  };

  const closeChat = () => setIsChatOpen(false);

  return (
    <ChatContext.Provider value={{ isChatOpen, participantId, participantName, openChat, closeChat }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
};
