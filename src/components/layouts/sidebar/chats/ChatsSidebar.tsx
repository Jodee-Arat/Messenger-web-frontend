"use client";

import {
  FindAllChatsByGroupQuery,
  GroupPermissionEnum,
  useChatAddedSubscription,
  useChatDeletedSubscription,
  useChatUpdatedSubscription,
  useDeleteChatMutation,
  useFindAllChatsByGroupQuery,
  useGetMemberRoleQuery,
} from "@/shared/graphql/generated/output";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useDirectChats } from "@/shared/hooks/useDirectChats";
import { getDirectChatDisplayName } from "@/shared/utils/direct-chat";
import { Loader, SearchIcon, Settings2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/common/Button";
import { Input } from "@/components/ui/common/Input";

import UserPanel from "../UserPanel";

import ChatsSidebarDropdownTrigger from "./ChatDropdownTrigger";
import CreateChat from "./CreateChatModal";
import { SidebarChat } from "./ChatsSidebarItem";

export interface ChatsSidebarProps {
  groupId: string;
}

const filterChatsByQuery = (
  chats: SidebarChat[],
  query: string,
  currentUserId?: string,
) => {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return chats;
  }

  return chats.filter((chat) => {
    const searchTarget = [
      chat.isGroup
        ? chat.chatName
        : getDirectChatDisplayName(chat, currentUserId),
      chat.lastMessage?.text,
      chat.draftMessages?.[0]?.text,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchTarget.includes(normalized);
  });
};

const ChatsSidebar = ({ groupId }: ChatsSidebarProps) => {
  const isDirectRoute = groupId === "null";
  const [allChats, setAllChats] = useState<
    FindAllChatsByGroupQuery["findAllChatsByGroup"]
  >([]);

  const { user } = useCurrentUser();
  const tChats = useTranslations("chats");
  const tDm = useTranslations("dm");

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);

  const {
    chats: directChats,
    isLoading: isLoadingDirectChats,
    handleDelete: handleDeleteDirectChat,
  } = useDirectChats();

  const filteredDirectChats = useMemo(
    () => filterChatsByQuery(directChats, debouncedQuery, user?.id),
    [debouncedQuery, directChats, user?.id],
  );

  const filteredGroupChats = useMemo(
    () => filterChatsByQuery(allChats, debouncedQuery, user?.id),
    [allChats, debouncedQuery, user?.id],
  );

  const { data: allChatsData, loading: isLoadingFindAllChats } =
    useFindAllChatsByGroupQuery({
      variables: {
        filters: {},
        groupId: groupId ?? "",
      },
      skip: isDirectRoute,
    });

  const { data: roleData } = useGetMemberRoleQuery({
    variables: { groupId },
    skip: isDirectRoute,
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
    skip: isDirectRoute || !user?.id,
  });

  const { data: deletedChatData } = useChatDeletedSubscription({
    variables: { userId: user?.id ?? "", groupId: groupId ?? "" },
    skip: isDirectRoute || !user?.id,
  });

  const { data: updateChatData } = useChatUpdatedSubscription({
    variables: { userId: user?.id ?? "" },
    skip: isDirectRoute || !user?.id,
  });

  const [deleteChat] = useDeleteChatMutation({
    onCompleted() {
      toast.success(tChats("chatDeleted"));
    },
    onError(err) {
      toast.error(err.message);
    },
  });

  const handleDeleteGroupChat = (chatId: string) => {
    deleteChat({
      variables: {
        chatId,
      },
    });
    setAllChats((prevAllChats) =>
      prevAllChats.filter((chat) => chat.id !== chatId),
    );
  };

  useEffect(() => {
    if (!allChatsData?.findAllChatsByGroup) return;

    setAllChats(
      allChatsData.findAllChatsByGroup.filter((chat) => !chat.isSecret),
    );
  }, [allChatsData]);

  useEffect(() => {
    if (!newChatData?.chatAdded || newChatData.chatAdded.isSecret) return;

    setAllChats((prevChats) => {
      const existingIndex = prevChats.findIndex(
        (chat) => chat.id === newChatData.chatAdded.id,
      );

      if (existingIndex === -1) {
        return [newChatData.chatAdded, ...prevChats];
      }

      return prevChats.map((chat) =>
        chat.id === newChatData.chatAdded.id ? newChatData.chatAdded : chat,
      );
    });
  }, [newChatData]);

  useEffect(() => {
    if (!deletedChatData?.chatDeleted) return;

    setAllChats((prevChats) =>
      prevChats.filter((chat) => chat.id !== deletedChatData.chatDeleted.id),
    );
  }, [deletedChatData]);

  useEffect(() => {
    if (!updateChatData?.chatUpdated || updateChatData.chatUpdated.isSecret) {
      return;
    }

    setAllChats((prevChats) => {
      const prevWithoutUpdated = prevChats.filter(
        (chat) => chat.id !== updateChatData.chatUpdated.id,
      );
      return [updateChatData.chatUpdated, ...prevWithoutUpdated];
    });
  }, [updateChatData]);

  const sidebarTitle = isDirectRoute ? tDm("title") : tChats("title");
  const visibleChats = isDirectRoute ? filteredDirectChats : filteredGroupChats;
  const isLoadingSidebar = isDirectRoute
    ? isLoadingDirectChats
    : isLoadingFindAllChats;

  if (isLoadingSidebar) {
    return (
      <aside className="flex w-80 shrink-0 flex-col border-r border-border/60 bg-card/95">
        <div className="flex h-16 items-center px-4">
          <Loader className="text-muted-foreground size-4 animate-spin" />
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex w-80 shrink-0 flex-col border-r border-border/60 bg-card/95 backdrop-blur">
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="truncate px-1 text-lg font-semibold">
            {sidebarTitle}
          </h2>
          {!isDirectRoute && canCreateChats && <CreateChat groupId={groupId} />}
        </div>
      </div>

      <div className="px-3 pb-2">
        <div className="relative flex items-center">
          <Input
            placeholder={tChats("search")}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-12 rounded-[22px] border-border/60 bg-background/60 pr-10"
          />
          <div className="absolute right-2 flex items-center">
            {query ? (
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-full text-muted-foreground hover:bg-transparent hover:text-foreground"
                onClick={() => setQuery("")}
              >
                <X className="size-4" />
              </Button>
            ) : (
              <SearchIcon className="mr-1 size-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      <div className="scrollbar-thin flex-1 space-y-2 overflow-y-auto px-3 pb-3">
        {visibleChats.map((chat) => (
          <ChatsSidebarDropdownTrigger
            chat={chat}
            key={chat.id}
            deleteChat={
              isDirectRoute ? handleDeleteDirectChat : handleDeleteGroupChat
            }
            canDelete={isDirectRoute || canDeleteChats}
          />
        ))}

        {visibleChats.length === 0 && (
          <p className="rounded-[22px] border border-dashed border-border/60 px-4 py-5 text-center text-xs text-muted-foreground">
            {isDirectRoute ? tDm("noDMs") : tChats("noChatsFound")}
          </p>
        )}
      </div>

      {!isDirectRoute && !debouncedQuery && (
        <div className="border-t border-border/60 px-3 py-2">
          <Button
            className="h-11 w-full justify-start rounded-[18px]"
            size="sm"
            variant="ghost"
            asChild
          >
            <Link href={`/group/${groupId}/settings`}>
              <Settings2 className="mr-2 size-4" />
              {tChats("groupSettings")}
            </Link>
          </Button>
        </div>
      )}

      <UserPanel />
    </aside>
  );
};

export default ChatsSidebar;
