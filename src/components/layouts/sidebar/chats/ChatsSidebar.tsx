"use client";

import {
  FindAllChatsByGroupQuery,
  FindAllChatsByUserQuery,
  GroupPermissionEnum,
  useChatAddedSubscription,
  useChatDeletedSubscription,
  useChatUpdatedSubscription,
  useDeleteChatMutation,
  useFindAllChatsByGroupQuery,
  useGetMemberRoleQuery,
} from "@/shared/graphql/generated/output";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import { Settings2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/common/Button";

import Search from "../../../ui/elements/Search";

import UserPanel from "../UserPanel";

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
  const t = useTranslations("chats");

  const { data: allChatsData, loading: isLoadingFindAllChats } =
    useFindAllChatsByGroupQuery({
      variables: {
        filters: {},
        groupId: groupId ?? "",
      },
    });

  const { data: roleData } = useGetMemberRoleQuery({
    variables: { groupId },
  });

  const currentRole = roleData?.getMemberRole;
  const isCreator = !!currentRole?.isCreator;
  const perms = (currentRole?.permissions ?? []) as GroupPermissionEnum[];
  const canCreateChats =
    isCreator || perms.includes(GroupPermissionEnum.CreateChats);
  const canDeleteChats =
    isCreator || perms.includes(GroupPermissionEnum.DeleteChats);

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
      toast.success(t("chatDeleted"));
    },
    onError(err) {
      toast.error(err.message);
    },
  });

  const handleDeleteChat = (chatId: string) => {
    deleteChat({
      variables: {
        chatId,
      },
    });
    setAllChats(prevAllChats =>
      prevAllChats.filter(chat => chat.id !== chatId),
    );
  };

  useEffect(() => {
    if (!allChatsData || !allChatsData.findAllChatsByGroup) return;

    setAllChats(
      (allChatsData.findAllChatsByGroup || []).filter(c => !c.isSecret),
    );
  }, [allChatsData]);

  useEffect(() => {
    if (!newChatData || !newChatData.chatAdded) return;

    if (newChatData.chatAdded.isSecret) return;
    setAllChats(prevChats => [newChatData.chatAdded, ...prevChats]);
  }, [newChatData]);

  useEffect(() => {
    if (!deletedChatData || !deletedChatData.chatDeleted) return;

    setAllChats(prevChats =>
      prevChats.filter(chat => chat.id !== deletedChatData.chatDeleted.id),
    );
  }, [deletedChatData]);

  useEffect(() => {
    if (!updateChatData || !updateChatData.chatUpdated) return;

    const prevChats = allChats.filter(
      chat => chat.id !== updateChatData.chatUpdated.id,
    );
    setAllChats([updateChatData.chatUpdated, ...prevChats]);
  }, [updateChatData]);

  if (isLoadingFindAllChats) {
    return (
      <aside className="flex w-72 flex-col border-r border-border bg-card">
        <div className="flex h-12 items-center border-b border-border px-4 shadow-sm">
          <h2 className="text-base font-semibold">{t("loading")}</h2>
        </div>
      </aside>
    );
  }

  return (
    <>
      {!isLoadingFindAllChats && (
        <aside className="flex w-72 flex-shrink-0 flex-col border-r border-border bg-card">
          {/* Header */}
          <div className="flex h-12 items-center justify-between border-b border-border px-4 shadow-sm">
            <h2 className="truncate text-base font-semibold">{t("title")}</h2>
            {canCreateChats && <CreateChat groupId={groupId} />}
          </div>

          {/* Search */}
          <div className="px-2 pt-2">
            <Search />
          </div>

          {/* Chat list - scrollable */}
          <div className="scrollbar-thin flex-1 space-y-0.5 overflow-y-auto px-2 py-2">
            {allChats.map((chat, index) => (
              <ChatsSidebarDropdownTrigger
                chat={chat}
                key={index}
                deleteChat={handleDeleteChat}
                canDelete={canDeleteChats}
              />
            ))}
          </div>

          {/* Bottom: Settings button + User panel */}
          <div className="border-t border-border px-2 py-1">
            <Button
              className="w-full justify-start"
              size="sm"
              variant="ghost"
              asChild
            >
              <Link href={`/group/${groupId}/settings`}>
                <Settings2 className="mr-2 size-4" />
                {t("groupSettings")}
              </Link>
            </Button>
          </div>
          <UserPanel />
        </aside>
      )}
    </>
  );
};

export default ChatsSidebar;
