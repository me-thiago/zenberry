"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ChatbotContextType {
  isOpen: boolean;
  openChatbot: () => void;
  openChatbotWithMessage: (message: string, category?: string) => void;
  closeChatbot: () => void;
  toggleChatbot: () => void;
  initialMessage: string | null;
  initialCategory: string | null;
  clearInitialMessage: () => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export function ChatbotProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState<string | null>(null);
  const [initialCategory, setInitialCategory] = useState<string | null>(null);

  const openChatbot = () => setIsOpen(true);
  const openChatbotWithMessage = (message: string, category?: string) => {
    setInitialMessage(message);
    setInitialCategory(category || null);
    setIsOpen(true);
  };
  const closeChatbot = () => setIsOpen(false);
  const toggleChatbot = () => setIsOpen((prev) => !prev);
  const clearInitialMessage = () => {
    setInitialMessage(null);
    setInitialCategory(null);
  };

  return (
    <ChatbotContext.Provider
      value={{
        isOpen,
        openChatbot,
        openChatbotWithMessage,
        closeChatbot,
        toggleChatbot,
        initialMessage,
        initialCategory,
        clearInitialMessage,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
}

export function useChatbot() {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error("useChatbot must be used within a ChatbotProvider");
  }
  return context;
}
