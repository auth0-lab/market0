"use client";

import React, { createContext, ReactNode, useContext, useState } from "react";

interface ChatContextProps {
  chatId?: string;
  setChatId: (id?: string) => void;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider = ({ chatId: initialChatId, children }: { chatId?: string; children: ReactNode }) => {
  const [chatId, setChatId] = useState(initialChatId);

  return <ChatContext.Provider value={{ chatId, setChatId }}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
