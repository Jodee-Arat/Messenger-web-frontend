import {
  FindAllChatsByGroupQuery,
  FindAllChatsByUserQuery,
} from "@/shared/graphql/generated/output";

export type DirectChatLike =
  | FindAllChatsByUserQuery["findAllChatsByUser"][0]
  | FindAllChatsByGroupQuery["findAllChatsByGroup"][0];

type DirectChatUser = DirectChatLike["members"][number]["user"];

export const getDirectChatCounterpart = (
  chat: DirectChatLike,
  currentUserId?: string | null,
): DirectChatUser | null => {
  if (chat.isGroup || !currentUserId) {
    return null;
  }

  return (
    chat.members.find(member => member.user.id !== currentUserId)?.user ?? null
  );
};

export const getDirectChatDisplayName = (
  chat: DirectChatLike,
  currentUserId?: string | null,
) => {
  return getDirectChatCounterpart(chat, currentUserId)?.username ||
    chat.chatName ||
    "Chat";
};

export const getDirectChatDisplayAvatar = (
  chat: DirectChatLike,
  currentUserId?: string | null,
) => {
  return (
    getDirectChatCounterpart(chat, currentUserId)?.avatarUrl ||
    chat.avatarUrl ||
    null
  );
};

export const getDirectChatCounterpartKey = (
  chat: DirectChatLike,
  currentUserId?: string | null,
) => {
  if (!currentUserId) {
    return chat.id;
  }

  return getDirectChatCounterpart(chat, currentUserId)?.id || chat.id;
};
