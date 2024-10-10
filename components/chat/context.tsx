"use client";

import { GetUsers200ResponseOneOfInner } from "auth0";
import React, { createContext, ReactNode, useContext, useState } from "react";

interface ChatContextProps {
  chatId?: string;
  readOnly: boolean;
  hasMessages: boolean;
  ownerProfile?: GetUsers200ResponseOneOfInner;
  setChatId: (id?: string) => void;
  setHasMessages: (has: boolean) => void;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider = ({
  chatId: initialChatId,
  hasMessages: initialHasMessages = false,
  readOnly = true,
  ownerProfile,
  children,
}: {
  chatId?: string;
  hasMessages?: boolean;
  readOnly?: boolean;
  ownerProfile?: GetUsers200ResponseOneOfInner;
  children: ReactNode;
}) => {
  const [chatId, setChatId] = useState(initialChatId);
  const [hasMessages, setHasMessages] = useState(initialHasMessages);

  return (
    <ChatContext.Provider value={{ chatId, readOnly, ownerProfile, hasMessages, setChatId, setHasMessages }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
