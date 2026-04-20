const getStartedDirectChatsStorageKey = (userId: string) =>
  `started-direct-chats:${userId}`;

export const loadStartedDirectChats = (userId?: string | null): string[] => {
  if (!userId || typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(
      getStartedDirectChatsStorageKey(userId),
    );
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
};

export const markDirectChatStarted = (
  userId?: string | null,
  chatId?: string | null,
) => {
  if (!userId || !chatId || typeof window === "undefined") return;

  try {
    const current = new Set(loadStartedDirectChats(userId));
    current.add(chatId);
    window.localStorage.setItem(
      getStartedDirectChatsStorageKey(userId),
      JSON.stringify([...current]),
    );
  } catch {}
};

export const forgetStartedDirectChat = (
  userId?: string | null,
  chatId?: string | null,
) => {
  if (!userId || !chatId || typeof window === "undefined") return;

  try {
    const current = new Set(loadStartedDirectChats(userId));
    if (!current.has(chatId)) return;

    current.delete(chatId);
    window.localStorage.setItem(
      getStartedDirectChatsStorageKey(userId),
      JSON.stringify([...current]),
    );
  } catch {}
};
