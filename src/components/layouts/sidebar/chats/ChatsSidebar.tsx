"use client";

import { Settings2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/common/Button";

import {
  FindAllChatsByGroupQuery,
  FindAllChatsByUserQuery,
  useChatAddedSubscription,
  useChatDeletedSubscription,
  useChatUpdatedSubscription,
  useDeleteChatMutation,
  useFindAllChatsByGroupQuery,
} from "@/graphql/generated/output";

import { useCurrentUser } from "@/hooks/useCurrentUser";

import { cn } from "@/utils/tw-merge";

import Search from "../../../ui/elements/Search";

import ChatsSidebarDropdownTrigger from "./ChatDropdownTrigger";
import CreateChat from "./CreateChatModal";

export interface ChatsType {
  id: string;
  chatName?: string | null;
}

export interface ChatsSidebarProps {
  groupId: string;
}

const ChatsSidebar = ({ groupId }: ChatsSidebarProps) => {
  const [allChats, setAllChats] = useState<
    FindAllChatsByGroupQuery["findAllChatsByGroup"]
  >([]);

  const { user } = useCurrentUser();

  const { data: allChatsData, loading: isLoadingFindAllChats } =
    useFindAllChatsByGroupQuery({
      variables: {
        filters: {},
        groupId: groupId ?? "",
      },
    });

  const { data: newChatData } = useChatAddedSubscription({
    variables: { userId: user?.id ?? "", groupId: groupId ?? "" },
    skip: !user?.id,
  });

  const { data: deletedChatData } = useChatDeletedSubscription({
    variables: { userId: user?.id ?? "", groupId: groupId ?? "" },
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
    if (!allChatsData || !allChatsData.findAllChatsByGroup) return;

    setAllChats(allChatsData.findAllChatsByGroup || []);
  }, [allChatsData]);

  useEffect(() => {
    if (!newChatData || !newChatData.chatAdded) return;

    setAllChats((prevChats) => [newChatData.chatAdded, ...prevChats]);
  }, [newChatData]);

  useEffect(() => {
    if (!deletedChatData || !deletedChatData.chatDeleted) return;

    setAllChats((prevChats) =>
      prevChats.filter((chat) => chat.id !== deletedChatData.chatDeleted.id)
    );
  }, [deletedChatData]);

  useEffect(() => {
    if (!updateChatData || !updateChatData.chatUpdated) return;

    const prevChats = allChats.filter(
      (chat) => chat.id !== updateChatData.chatUpdated.id
    );
    setAllChats([updateChatData.chatUpdated, ...prevChats]);
  }, [updateChatData]);

  if (isLoadingFindAllChats) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {!isLoadingFindAllChats && (
        <aside
          className={cn(
            "bg-card border-border ml-[50px] mt-[80px] flex w-[350px] flex-col space-y-2 rounded-xl border p-3"
            // isCollapsed ? "w-16" : "w-64"
          )}
        >
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Chats</h1>

            <CreateChat groupId={groupId} />
          </div>
          <Search />

          <div className="flex h-max flex-col space-y-2">
            {allChats.map((chat, index) => (
              <ChatsSidebarDropdownTrigger
                chat={chat}
                key={index}
                deleteChat={handleDeleteChat}
              />
            ))}
          </div>
          <div className="flex h-full items-end justify-end">
            <Button className="" size="icon" variant="default">
              <Link href={`/group/${groupId}/settings`}>
                <Settings2 />
              </Link>
            </Button>
          </div>
          {/* <SidebarHeader /> */}
          {/* {isDashboardPage ? <DashboardNav /> : <UserNav />} */}
        </aside>
      )}
    </>
  );
};

export default ChatsSidebar;
