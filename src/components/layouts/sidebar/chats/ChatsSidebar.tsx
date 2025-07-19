"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  FindAllChatsByUserQuery,
  useChatAddedSubscription,
  useChatUpdatedSubscription,
  useDeleteChatMutation,
  useFindAllChatsByUserQuery,
} from "@/graphql/generated/output";

import { useCurrent } from "@/hooks/useCurrent";

import { cn } from "@/utils/tw-merge";

import Search from "../../../ui/elements/Search";

import ChatsSidebarItem from "./ChatDropdownTrigger";
import CreateChat from "./CreateChatModal";

export interface ChatsType {
  id: string;
  chatName?: string | null;
}

const ChatsSidebar = () => {
  const [allChats, setAllChats] = useState<
    FindAllChatsByUserQuery["findAllChatsByUser"]
  >([]);

  const { user } = useCurrent();

  const { data: allChatsData, loading: isLoadingFindAllChats } =
    useFindAllChatsByUserQuery({
      variables: {
        filters: {},
      },
    });

  const { data: newChatData } = useChatAddedSubscription({
    variables: { userId: user?.id ?? "" },
    skip: !user?.id,
  });

  const { data: updateChatData } = useChatUpdatedSubscription({
    variables: { userId: user?.id ?? "" },
    skip: !user?.id,
  });

  const [deleteChat, { loading: isLoadingDeleteChat }] = useDeleteChatMutation({
    onCompleted() {
      toast.success("Chat deleted successfully.");
    },
    onError(err) {
      toast.error("Failed to delete chat: " + err.message);
    },
  });

  const handleDeleteChat = (chatId: string) => {
    deleteChat({
      variables: {
        chatId,
      },
    });
    setAllChats((prevAllChats) =>
      prevAllChats.filter((chat) => chat.id !== chatId)
    );
  };

  useEffect(() => {
    if (!allChatsData || !allChatsData.findAllChatsByUser) return;

    setAllChats(allChatsData.findAllChatsByUser);
  }, [allChatsData]);

  useEffect(() => {
    if (!newChatData || !newChatData.chatAdded) return;

    setAllChats((prevChats) => [newChatData.chatAdded, ...prevChats]);
  }, [newChatData]);

  useEffect(() => {
    if (!updateChatData || !updateChatData.chatUpdated) return;

    const prevChats = allChats.filter(
      (chat) => chat.id !== updateChatData.chatUpdated.id
    );
    setAllChats([updateChatData.chatUpdated, ...prevChats]);
  }, [updateChatData]);

  return (
    <>
      {!isLoadingFindAllChats && (
        <aside
          className={cn(
            "bg-card border-border mt-[75px] flex w-[350px] flex-col space-y-2 rounded-xl border p-3"
            // isCollapsed ? "w-16" : "w-64"
          )}
        >
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Chats</h1>

            <CreateChat />
          </div>
          <Search />
          {allChats.map((chat, index) => (
            <ChatsSidebarItem
              chat={chat}
              key={index}
              deleteChat={handleDeleteChat}
            />
          ))}

          {/* <SidebarHeader /> */}
          {/* {isDashboardPage ? <DashboardNav /> : <UserNav />} */}
        </aside>
      )}
    </>
  );
};

export default ChatsSidebar;
