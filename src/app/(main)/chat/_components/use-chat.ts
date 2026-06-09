import { create } from "zustand";

import { loadDrafts, loadUnreadState, saveDrafts, saveUnreadState } from "./chat-storage";
import type { Conversation } from "./data";
import { conversations } from "./data";

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

const useChatStore = create<ChatStore>((set) => ({
  chat: {
    selected: conversations[0].id,
  },
  drafts: loadDrafts(),
  unreadState: loadUnreadState(),
  setChat: (chat) => set({ chat }),
  setDraft: (conversationId, draft) =>
    set((state) => {
      const newDrafts = { ...state.drafts, [conversationId]: draft };
      saveDrafts(newDrafts);
      return { drafts: newDrafts };
    }),
  clearUnread: (conversationId) =>
    set((state) => {
      const newUnreadState = {
        ...state.unreadState,
        [conversationId]: { isUnread: false, unreadCount: 0 },
      };
      saveUnreadState(newUnreadState);
      return { unreadState: newUnreadState };
    }),
  selectConversation: (conversationId) =>
    set({
      chat: { selected: conversationId },
    }),
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
