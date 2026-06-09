import { create } from "zustand";

import { type Conversation, conversations } from "./data";

type Config = {
  selected: Conversation["id"] | null;
};

type ChatStore = {
  chat: Config;
  drafts: Record<Conversation["id"], string>;
  unreadState: Record<Conversation["id"], { isUnread: boolean; unreadCount: number }>;
  setChat: (chat: Config) => void;
  setDraft: (conversationId: Conversation["id"], draft: string) => void;
  clearUnread: (conversationId: Conversation["id"]) => void;
  selectConversation: (conversationId: Conversation["id"]) => void;
};

const initialUnreadState = conversations.reduce<Record<Conversation["id"], { isUnread: boolean; unreadCount: number }>>(
  (acc, conv) => {
    acc[conv.id] = { isUnread: conv.isUnread, unreadCount: conv.unreadCount };
    return acc;
  },
  {},
);

const initialDrafts = conversations.reduce<Record<Conversation["id"], string>>((acc, conv) => {
  acc[conv.id] = "";
  return acc;
}, {});

const useChatStore = create<ChatStore>((set) => ({
  chat: {
    selected: conversations[0].id,
  },
  drafts: initialDrafts,
  unreadState: initialUnreadState,
  setChat: (chat) => set({ chat }),
  setDraft: (conversationId, draft) =>
    set((state) => ({
      drafts: { ...state.drafts, [conversationId]: draft },
    })),
  clearUnread: (conversationId) =>
    set((state) => ({
      unreadState: {
        ...state.unreadState,
        [conversationId]: { isUnread: false, unreadCount: 0 },
      },
    })),
  selectConversation: (conversationId) =>
    set((state) => ({
      chat: { selected: conversationId },
      unreadState: {
        ...state.unreadState,
        [conversationId]: { isUnread: false, unreadCount: 0 },
      },
    })),
}));

export function useChat() {
  const chat = useChatStore((state) => state.chat);
  const drafts = useChatStore((state) => state.drafts);
  const unreadState = useChatStore((state) => state.unreadState);
  const setChat = useChatStore((state) => state.setChat);
  const setDraft = useChatStore((state) => state.setDraft);
  const clearUnread = useChatStore((state) => state.clearUnread);
  const selectConversation = useChatStore((state) => state.selectConversation);

  return [chat, setChat, drafts, setDraft, unreadState, clearUnread, selectConversation] as const;
}
