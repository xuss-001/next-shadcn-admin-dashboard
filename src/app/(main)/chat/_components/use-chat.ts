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

const DRAFTS_STORAGE_KEY = "chat-drafts";
const UNREAD_STORAGE_KEY = "chat-unread-state";

function loadDraftsFromStorage(): Record<Conversation["id"], string> {
  if (typeof window === "undefined") {
    return conversations.reduce<Record<Conversation["id"], string>>((acc, conv) => {
      acc[conv.id] = "";
      return acc;
    }, {});
  }

  try {
    const stored = window.sessionStorage.getItem(DRAFTS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Record<string, string>;
      return conversations.reduce<Record<Conversation["id"], string>>((acc, conv) => {
        acc[conv.id] = parsed[conv.id] ?? "";
        return acc;
      }, {});
    }
  } catch {
    // ignore
  }

  return conversations.reduce<Record<Conversation["id"], string>>((acc, conv) => {
    acc[conv.id] = "";
    return acc;
  }, {});
}

function saveDraftsToStorage(drafts: Record<Conversation["id"], string>): void {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
  } catch {
    // ignore
  }
}

function loadUnreadStateFromStorage(): Record<Conversation["id"], { isUnread: boolean; unreadCount: number }> {
  if (typeof window === "undefined") {
    return conversations.reduce<Record<Conversation["id"], { isUnread: boolean; unreadCount: number }>>((acc, conv) => {
      acc[conv.id] = { isUnread: conv.isUnread, unreadCount: conv.unreadCount };
      return acc;
    }, {});
  }

  try {
    const stored = window.sessionStorage.getItem(UNREAD_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Record<string, { isUnread: boolean; unreadCount: number }>;
      return conversations.reduce<Record<Conversation["id"], { isUnread: boolean; unreadCount: number }>>(
        (acc, conv) => {
          acc[conv.id] = parsed[conv.id] ?? { isUnread: conv.isUnread, unreadCount: conv.unreadCount };
          return acc;
        },
        {},
      );
    }
  } catch {
    // ignore
  }

  return conversations.reduce<Record<Conversation["id"], { isUnread: boolean; unreadCount: number }>>((acc, conv) => {
    acc[conv.id] = { isUnread: conv.isUnread, unreadCount: conv.unreadCount };
    return acc;
  }, {});
}

function saveUnreadStateToStorage(
  unreadState: Record<Conversation["id"], { isUnread: boolean; unreadCount: number }>,
): void {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(UNREAD_STORAGE_KEY, JSON.stringify(unreadState));
  } catch {
    // ignore
  }
}

const initialUnreadState = loadUnreadStateFromStorage();

const initialDrafts = loadDraftsFromStorage();

const useChatStore = create<ChatStore>((set) => ({
  chat: {
    selected: conversations[0].id,
  },
  drafts: initialDrafts,
  unreadState: initialUnreadState,
  setChat: (chat) => set({ chat }),
  setDraft: (conversationId, draft) =>
    set((state) => {
      const newDrafts = { ...state.drafts, [conversationId]: draft };
      saveDraftsToStorage(newDrafts);
      return { drafts: newDrafts };
    }),
  clearUnread: (conversationId) =>
    set((state) => {
      const newUnreadState = {
        ...state.unreadState,
        [conversationId]: { isUnread: false, unreadCount: 0 },
      };
      saveUnreadStateToStorage(newUnreadState);
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
