import type { Conversation } from "./data";
import { conversations } from "./data";

const DRAFTS_STORAGE_KEY = "chat-drafts";
const UNREAD_STORAGE_KEY = "chat-unread-state";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function safeGetItem(key: string): string | null {
  if (!isBrowser()) return null;
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function getDefaultDrafts(): Record<Conversation["id"], string> {
  return conversations.reduce<Record<Conversation["id"], string>>((acc, conv) => {
    acc[conv.id] = "";
    return acc;
  }, {});
}

function getDefaultUnreadState(): Record<Conversation["id"], { isUnread: boolean; unreadCount: number }> {
  return conversations.reduce<Record<Conversation["id"], { isUnread: boolean; unreadCount: number }>>((acc, conv) => {
    acc[conv.id] = { isUnread: conv.isUnread, unreadCount: conv.unreadCount };
    return acc;
  }, {});
}

export function loadDrafts(): Record<Conversation["id"], string> {
  const stored = safeGetItem(DRAFTS_STORAGE_KEY);
  if (!stored) return getDefaultDrafts();

  try {
    const parsed = JSON.parse(stored) as Record<string, string>;
    return conversations.reduce<Record<Conversation["id"], string>>((acc, conv) => {
      acc[conv.id] = parsed[conv.id] ?? "";
      return acc;
    }, {});
  } catch {
    return getDefaultDrafts();
  }
}

export function saveDrafts(drafts: Record<Conversation["id"], string>): void {
  safeSetItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
}

export function loadUnreadState(): Record<Conversation["id"], { isUnread: boolean; unreadCount: number }> {
  const stored = safeGetItem(UNREAD_STORAGE_KEY);
  if (!stored) return getDefaultUnreadState();

  try {
    const parsed = JSON.parse(stored) as Record<string, { isUnread: boolean; unreadCount: number }>;
    return conversations.reduce<Record<Conversation["id"], { isUnread: boolean; unreadCount: number }>>((acc, conv) => {
      acc[conv.id] = parsed[conv.id] ?? {
        isUnread: conv.isUnread,
        unreadCount: conv.unreadCount,
      };
      return acc;
    }, {});
  } catch {
    return getDefaultUnreadState();
  }
}

export function saveUnreadState(
  unreadState: Record<Conversation["id"], { isUnread: boolean; unreadCount: number }>,
): void {
  safeSetItem(UNREAD_STORAGE_KEY, JSON.stringify(unreadState));
}
