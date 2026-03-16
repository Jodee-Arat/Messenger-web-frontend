"use client";

import { MessageSquare, Pin, Trash2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Card, CardContent } from "@/components/ui/common/Card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/common/ContextMenu";
import { Skeleton } from "@/components/ui/common/Skeleton";
import EntityAvatar from "@/components/ui/elements/EntityAvatar";

import { useDirectChats } from "@/shared/hooks/useDirectChats";
import { useUser } from "@/shared/hooks/useUser";

const DirectMessages = () => {
  const { userId } = useUser();
  const t = useTranslations("dm");
  const {
    pinnedChats,
    unpinnedChats,
    isLoading,
    handleDelete,
    handlePin,
    handleUnpin,
  } = useDirectChats();

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
    const otherUser = chat.members?.find(m => m.user.id !== userId)?.user;
    const displayName = chat.chatName || otherUser?.username || "Chat";

    return (
      <ContextMenu>
        <ContextMenuTrigger>
          <Link href={`/group/${chat.groupId}/${chat.id}`}>
            <Card className="hover:bg-primary/10 cursor-pointer transition-colors">
              <CardContent className="flex items-center gap-3 p-3">
                <EntityAvatar
                  name={displayName}
                  avatarUrl={chat.avatarUrl || otherUser?.avatarUrl}
                />
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-semibold">{displayName}</p>
                  {chat.lastMessage && (
                    <p className="text-muted-foreground truncate text-xs">
                      {chat.lastMessage.text}
                    </p>
                  )}
                </div>
                {isPinned && (
                  <Pin className="text-muted-foreground size-3 rotate-45" />
                )}
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
      <h1 className="mb-4 text-2xl font-bold">{t("title")}</h1>

      {pinnedChats.length > 0 && (
        <div className="mb-4">
          <div className="text-muted-foreground mb-2 flex items-center gap-1 text-xs font-semibold uppercase">
            <Pin className="size-3" />
            {t("pinned")}
          </div>
          <div className="space-y-1">
            {pinnedChats.map(chat => (
              <DMItem key={chat.id} chat={chat} isPinned />
            ))}
          </div>
        </div>
      )}

      {unpinnedChats.length > 0 && (
        <div className="space-y-1">
          {pinnedChats.length > 0 && (
            <div className="text-muted-foreground mb-2 text-xs font-semibold uppercase">
              {t("allMessages")}
            </div>
          )}
          {unpinnedChats.map(chat => (
            <DMItem key={chat.id} chat={chat} isPinned={false} />
          ))}
        </div>
      )}

      {pinnedChats.length === 0 && unpinnedChats.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <MessageSquare className="text-muted-foreground mb-2 size-10" />
            <p className="text-muted-foreground">{t("noDMs")}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DirectMessages;
