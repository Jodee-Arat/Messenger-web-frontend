"use client";

import { useMemo, useState } from "react";
import { Bookmark, MessageSquare, Pin, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Card, CardContent } from "@/components/ui/common/Card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/common/ContextMenu";
import { Input } from "@/components/ui/common/Input";
import { Skeleton } from "@/components/ui/common/Skeleton";
import EmptyStateCard from "@/components/ui/elements/EmptyStateCard";
import EntityAvatar from "@/components/ui/elements/EntityAvatar";

import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useDirectChats } from "@/shared/hooks/useDirectChats";
import { useUser } from "@/shared/hooks/useUser";
import { getChatRoute } from "@/shared/utils/chat-route";
import {
  getDirectChatDisplayAvatar,
  getDirectChatDisplayName,
} from "@/shared/utils/direct-chat";

const DirectMessages = () => {
  const { userId } = useUser();
  const t = useTranslations("dm");
  const tChats = useTranslations("chats");
  const tCommon = useTranslations("common");
  const tMessages = useTranslations("messages");
  const tSaved = useTranslations("saved");
  const {
    pinnedChats,
    unpinnedChats,
    isLoading,
    handleDelete,
    handlePin,
    handleUnpin,
  } = useDirectChats();

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);

  const filteredPinned = useMemo(() => {
    if (!debouncedQuery) return pinnedChats;
    const lower = debouncedQuery.toLowerCase();
    return pinnedChats.filter((chat) => {
      const displayName = getDirectChatDisplayName(chat, userId);
      return displayName.toLowerCase().includes(lower);
    });
  }, [debouncedQuery, pinnedChats, userId]);

  const filteredUnpinned = useMemo(() => {
    if (!debouncedQuery) return unpinnedChats;
    const lower = debouncedQuery.toLowerCase();
    return unpinnedChats.filter((chat) => {
      const displayName = getDirectChatDisplayName(chat, userId);
      return displayName.toLowerCase().includes(lower);
    });
  }, [debouncedQuery, unpinnedChats, userId]);

  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-3">
        <h1 className="mb-4 text-2xl font-bold">{t("title")}</h1>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="size-9 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const DMItem = ({
    chat,
    isPinned,
  }: {
    chat: (typeof pinnedChats)[0];
    isPinned: boolean;
  }) => {
    const displayName = getDirectChatDisplayName(chat, userId);
    const displayAvatar = getDirectChatDisplayAvatar(chat, userId);
    const draft = chat.draftMessages?.[0];
    const lastMessage = chat.lastMessage;
    const draftFilesCount = draft?.files?.length ?? 0;
    const lastFilesCount = lastMessage?.files?.length ?? 0;
    const hasDraft = !!draft && (!!draft.text || draftFilesCount > 0);

    const previewContent = hasDraft ? (
      <>
        <span className="mr-1 font-medium text-destructive">
          [{tMessages("draft")}]
        </span>
        <span>{draft?.text || `${draftFilesCount} ${tMessages("files")}`}</span>
      </>
    ) : lastMessage?.text ? (
      <>
        <span className="mr-1 font-medium text-primary">
          {lastMessage.user.username}:
        </span>
        <span>{lastMessage.text}</span>
      </>
    ) : lastFilesCount > 0 ? (
      <>
        <span className="mr-1 font-medium text-primary">
          {lastMessage?.user.username}:
        </span>
        <span className="text-blue-400">
          {lastFilesCount} {tMessages("files")}
        </span>
      </>
    ) : (
      <span>{tMessages("noMessages")}</span>
    );

    return (
        <ContextMenu>
          <ContextMenuTrigger>
          <Link
            href={getChatRoute({
              chatId: chat.id,
              groupId: chat.groupId,
              isGroup: chat.isGroup,
            })}
          >
            <Card className="cursor-pointer transition-colors hover:bg-primary/10">
              <CardContent className="flex items-center gap-3 p-3">
                <EntityAvatar name={displayName} avatarUrl={displayAvatar} />
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-semibold">{displayName}</p>
                  <p
                    className={`truncate text-xs ${
                      hasDraft ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {previewContent}
                  </p>
                </div>
                <div className="ml-2 flex flex-col items-end gap-1">
                  <span className="text-[10px] text-muted-foreground">
                    {formatTime(chat.lastMessageAt || chat.updatedAt)}
                  </span>
                  {isPinned && (
                    <Pin className="size-3 rotate-45 text-muted-foreground" />
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {isPinned ? (
            <ContextMenuItem onClick={() => handleUnpin(chat.id)}>
              <Pin className="mr-2 size-4" />
              {t("unpin")}
            </ContextMenuItem>
          ) : (
            <ContextMenuItem onClick={() => handlePin(chat.id)}>
              <Pin className="mr-2 size-4" />
              {t("pin")}
            </ContextMenuItem>
          )}
          <ContextMenuItem
            className="text-destructive"
            onClick={() => handleDelete(chat.id)}
          >
            <Trash2 className="mr-2 size-4" />
            {t("delete")}
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={tChats("search")}
            className="bg-background pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <Link href="/dm/saved" className="mb-4 block">
        <Card className="border-primary/20 bg-primary/6 transition-colors hover:bg-primary/10">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-full">
              <Bookmark className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{tSaved("title")}</p>
              <p className="text-muted-foreground truncate text-xs">
                {tSaved("sidebarDescription")}
              </p>
            </div>
          </CardContent>
        </Card>
      </Link>

      {filteredPinned.length > 0 && (
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase text-muted-foreground">
            <Pin className="size-3" />
            {t("pinned")}
          </div>
          <div className="space-y-1">
            {filteredPinned.map((chat) => (
              <DMItem key={chat.id} chat={chat} isPinned />
            ))}
          </div>
        </div>
      )}

      {filteredUnpinned.length > 0 && (
        <div className="space-y-1">
          {filteredPinned.length > 0 && (
            <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              {t("allMessages")}
            </div>
          )}
          {filteredUnpinned.map((chat) => (
            <DMItem key={chat.id} chat={chat} isPinned={false} />
          ))}
        </div>
      )}

      {filteredPinned.length === 0 && filteredUnpinned.length === 0 && (
        <EmptyStateCard
          icon={MessageSquare}
          title={
            debouncedQuery.length > 0 ? tCommon("noResults") : t("emptyTitle")
          }
          description={
            debouncedQuery.length > 0
              ? tCommon("tryDifferentQuery")
              : t("emptyDescription")
          }
          className="mt-2"
        />
      )}
    </div>
  );
};

export default DirectMessages;
