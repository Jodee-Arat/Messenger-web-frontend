"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useUser } from "./useUser";

import {
  FindAllChatsByGroupQuery,
  useChatAddedSubscription,
  useChatDeletedSubscription,
  useChatUpdatedSubscription,
  useDeleteChatMutation,
  useFindAllChatsByGroupQuery,
  usePinChatMutation,
  useUnPinChatMutation,
} from "@/shared/graphql/generated/output";

type Chat = FindAllChatsByGroupQuery["findAllChatsByGroup"][0];

export function useGroupChats(groupId: string) {
  const { userId } = useUser();

  const { data, loading } = useFindAllChatsByGroupQuery({
    variables: { filters: {}, groupId },
    skip: !groupId,
    fetchPolicy: "cache-and-network",
  });

  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    if (!data?.findAllChatsByGroup) return;
    setChats(data.findAllChatsByGroup.filter(c => !c.isSecret));
  }, [data]);

  // ── Subscriptions ──
  const { data: addedData } = useChatAddedSubscription({
    variables: { userId, groupId },
    skip: !userId || !groupId,
  });

  const { data: deletedData } = useChatDeletedSubscription({
    variables: { userId, groupId },
    skip: !userId || !groupId,
  });

  const { data: updatedData } = useChatUpdatedSubscription({
    variables: { userId },
    skip: !userId,
  });

  useEffect(() => {
    if (!addedData?.chatAdded) return;
    const added = addedData.chatAdded;
    if (added.isSecret) return;
    setChats(prev =>
      prev.some(c => c.id === added.id) ? prev : [added as Chat, ...prev],
    );
  }, [addedData]);

  useEffect(() => {
    if (!deletedData?.chatDeleted) return;
    setChats(prev => prev.filter(c => c.id !== deletedData.chatDeleted.id));
  }, [deletedData]);

  useEffect(() => {
    if (!updatedData?.chatUpdated) return;
    const updated = updatedData.chatUpdated;
    if (updated.isSecret) return;
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

  const handleDelete = async (chatId: string) => {
    await deleteChat({ variables: { chatId } });
    setChats(prev => prev.filter(c => c.id !== chatId));
  };

  const handlePin = async (chatId: string) => {
    await pinChat({
      variables: { chatId },
      refetchQueries: ["FindAllChatsByGroup"],
    });
  };

  const handleUnpin = async (chatId: string) => {
    await unpinChat({
      variables: { chatId },
      refetchQueries: ["FindAllChatsByGroup"],
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
