"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useUser } from "./useUser";

import {
  FindAllChatsByUserQuery,
  useChatDeletedSubscription,
  useChatUpdatedSubscription,
  useDeleteChatMutation,
  useFindAllChatsByUserQuery,
  usePinChatMutation,
  useUnPinChatMutation,
  useUpdatePinnedChatsOrderMutation,
} from "@/shared/graphql/generated/output";
import { useTranslations } from "next-intl";
import {
  forgetStartedDirectChat,
  loadStartedDirectChats,
  markDirectChatStarted,
} from "@/shared/utils/direct-chat-visibility";
import { getDirectChatCounterpartKey } from "@/shared/utils/direct-chat";

type Chat = FindAllChatsByUserQuery["findAllChatsByUser"][0];

const hasDirectChatActivity = (chat: Chat) =>
  !!chat.lastMessage || !!chat.draftMessages?.length;

const isVisibleDirectChat = (chat: Chat, startedDirectChatIds: string[]) =>
  !chat.isGroup &&
  !chat.isSecret &&
  (hasDirectChatActivity(chat) || startedDirectChatIds.includes(chat.id));

const getDirectChatActivityTimestamp = (chat: Chat) => {
  const activityAt = chat.lastMessageAt ?? chat.updatedAt;
  return activityAt ? new Date(activityAt).getTime() : 0;
};

const compareDirectChats = (left: Chat, right: Chat) => {
  if (!!left.isPinned !== !!right.isPinned) {
    return left.isPinned ? -1 : 1;
  }

  const leftHasMessage = !!left.lastMessageAt;
  const rightHasMessage = !!right.lastMessageAt;

  if (leftHasMessage !== rightHasMessage) {
    return leftHasMessage ? -1 : 1;
  }

  return (
    getDirectChatActivityTimestamp(right) - getDirectChatActivityTimestamp(left)
  );
};

const dedupeDirectChats = (chats: Chat[], currentUserId?: string) => {
  const uniqueChats = new Map<string, Chat>();

  [...chats].sort(compareDirectChats).forEach((chat) => {
    const counterpartId = getDirectChatCounterpartKey(chat, currentUserId);

    if (!uniqueChats.has(counterpartId)) {
      uniqueChats.set(counterpartId, chat);
    }
  });

  return Array.from(uniqueChats.values());
};

export function useDirectChats() {
  const tChats = useTranslations("chats");
  const { userId } = useUser();

  const { data, loading, refetch } = useFindAllChatsByUserQuery({
    variables: { filters: {} },
    skip: !userId,
    fetchPolicy: "cache-and-network",
  });

  const [chats, setChats] = useState<Chat[]>([]);
  const [startedDirectChatIds, setStartedDirectChatIds] = useState<string[]>(
    [],
  );

  useEffect(() => {
    setChats([]);
    setStartedDirectChatIds([]);
  }, [userId]);

  useEffect(() => {
    setStartedDirectChatIds(loadStartedDirectChats(userId));
  }, [userId]);

  useEffect(() => {
    if (!data?.findAllChatsByUser) return;
    setChats(
      data.findAllChatsByUser.filter((chat) =>
        isVisibleDirectChat(chat, startedDirectChatIds),
      ),
    );
  }, [data, startedDirectChatIds]);

  // ── Subscription ──
  const { data: updatedData } = useChatUpdatedSubscription({
    variables: { userId },
    skip: !userId,
  });

  const { data: deletedData } = useChatDeletedSubscription({
    variables: { userId, groupId: "" },
    skip: !userId,
  });

  useEffect(() => {
    if (!updatedData?.chatUpdated) return;
    const updated = updatedData.chatUpdated;
    if (updated.isGroup) return;

    const nextStartedDirectChatIds =
      userId && !startedDirectChatIds.includes(updated.id)
        ? [...startedDirectChatIds, updated.id]
        : startedDirectChatIds;

    if (userId && !startedDirectChatIds.includes(updated.id)) {
      setStartedDirectChatIds(nextStartedDirectChatIds);
      markDirectChatStarted(userId, updated.id);
    }

    setChats((prev) => {
      const previousChat = prev.find((chat) => chat.id === updated.id);
      const without = prev.filter((c) => c.id !== updated.id);

      if (!previousChat) {
        void refetch();
      }

      if (!isVisibleDirectChat(updated as Chat, nextStartedDirectChatIds)) {
        return without;
      }

      return [updated as Chat, ...without];
    });
  }, [refetch, startedDirectChatIds, updatedData, userId]);

  useEffect(() => {
    if (!deletedData?.chatDeleted) return;

    setChats((prev) =>
      prev.filter((chat) => chat.id !== deletedData.chatDeleted.id),
    );
  }, [deletedData]);

  // ── Mutations ──
  const [deleteChat] = useDeleteChatMutation({
    onCompleted: () => toast.success(tChats("chatDeleted")),
    onError: (e) => toast.error(e.message),
  });

  const [pinChat] = usePinChatMutation();
  const [unpinChat] = useUnPinChatMutation();
  const [updateOrder] = useUpdatePinnedChatsOrderMutation();

  const handleDelete = async (chatId: string) => {
    await deleteChat({ variables: { chatId } });
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    forgetStartedDirectChat(userId, chatId);
    setStartedDirectChatIds((prev) => prev.filter((id) => id !== chatId));
  };

  const handlePin = async (chatId: string) => {
    await pinChat({
      variables: { chatId },
      refetchQueries: ["FindAllChatsByUser"],
    });
  };

  const handleUnpin = async (chatId: string) => {
    await unpinChat({
      variables: { chatId },
      refetchQueries: ["FindAllChatsByUser"],
    });
  };

  const visibleChats = dedupeDirectChats(
    chats.filter((chat) => isVisibleDirectChat(chat, startedDirectChatIds)),
    userId,
  );

  const pinnedChats = visibleChats
    .filter((c) => c.isPinned)
    .sort((a, b) => (a.pinnedOrder ?? 0) - (b.pinnedOrder ?? 0));

  const visibleUnpinnedChats = visibleChats
    .filter((c) => !c.isPinned)
    .sort(compareDirectChats);

  return {
    chats: visibleChats,
    pinnedChats,
    unpinnedChats: visibleUnpinnedChats,
    isLoading: loading,
    handleDelete,
    handlePin,
    handleUnpin,
  };
}
