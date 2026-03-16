"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useUser } from "./useUser";

import {
  FindAllChatsByUserQuery,
  useChatUpdatedSubscription,
  useDeleteChatMutation,
  useFindAllChatsByUserQuery,
  usePinChatMutation,
  useUnPinChatMutation,
  useUpdatePinnedChatsOrderMutation,
} from "@/shared/graphql/generated/output";

type Chat = FindAllChatsByUserQuery["findAllChatsByUser"][0];

export function useDirectChats() {
  const { userId } = useUser();

  const { data, loading } = useFindAllChatsByUserQuery({
    variables: { filters: {} },
    fetchPolicy: "cache-and-network",
  });

  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    if (!data?.findAllChatsByUser) return;
    // only non-group, non-secret chats (DMs)
    setChats(data.findAllChatsByUser.filter(c => !c.isGroup && !c.isSecret));
  }, [data]);

  // ── Subscription ──
  const { data: updatedData } = useChatUpdatedSubscription({
    variables: { userId },
    skip: !userId,
  });

  useEffect(() => {
    if (!updatedData?.chatUpdated) return;
    const updated = updatedData.chatUpdated;
    if (updated.isGroup || updated.isSecret) return;

    setChats(prev => {
      const without = prev.filter(c => c.id !== updated.id);
      return [updated as Chat, ...without];
    });
  }, [updatedData]);

  // ── Mutations ──
  const [deleteChat] = useDeleteChatMutation({
    onCompleted: () => toast.success("Chat deleted"),
    onError: e => toast.error(e.message),
  });

  const [pinChat] = usePinChatMutation();
  const [unpinChat] = useUnPinChatMutation();
  const [updateOrder] = useUpdatePinnedChatsOrderMutation();

  const handleDelete = async (chatId: string) => {
    await deleteChat({ variables: { chatId } });
    setChats(prev => prev.filter(c => c.id !== chatId));
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

  const pinnedChats = chats
    .filter(c => c.isPinned)
    .sort((a, b) => (a.pinnedOrder ?? 0) - (b.pinnedOrder ?? 0));

  const unpinnedChats = chats.filter(c => !c.isPinned);

  return {
    chats,
    pinnedChats,
    unpinnedChats,
    isLoading: loading,
    handleDelete,
    handlePin,
    handleUnpin,
  };
}
