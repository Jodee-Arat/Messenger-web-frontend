"use client";

import { useMemo } from "react";

import { useAuth } from "@/shared/hooks/useAuth";
import { useDirectChats } from "@/shared/hooks/useDirectChats";
import { useFriends } from "@/shared/hooks/useFriends";
import { useUser } from "@/shared/hooks/useUser";
import { getChatRoute } from "@/shared/utils/chat-route";
import {
  getDirectChatDisplayAvatar,
  getDirectChatDisplayName,
} from "@/shared/utils/direct-chat";
import { cn } from "@/shared/utils/tw-merge";
import { Bookmark, Loader, LogIn, MessageSquare, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/common/Button";
import BrandMark from "@/components/ui/elements/BrandMark";
import EmptyStateCard from "@/components/ui/elements/EmptyStateCard";
import EntityAvatar from "@/components/ui/elements/EntityAvatar";

import UserPanel from "./UserPanel";

const DirectMessagesSidebarContent = ({ pathname }: { pathname: string }) => {
  const { userId } = useUser();
  const { pinnedChats, unpinnedChats, isLoading } = useDirectChats();
  const tDm = useTranslations("dm");
  const tSaved = useTranslations("saved");

  const allDMs = [...pinnedChats, ...unpinnedChats];
  const isSavedActive = pathname === "/dm/saved";

  return (
    <>
      <div className="flex items-center justify-between px-4 pt-4 pb-1">
        <span className="text-muted-foreground text-xs font-semibold uppercase">
          {tDm("title")}
        </span>
      </div>

      <div className="scrollbar-thin flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
        <Link
          href="/dm/saved"
          className={cn(
            "mb-2 flex items-center gap-2 rounded-xl border px-2.5 py-2 text-sm transition-colors",
            isSavedActive
              ? "border-primary/20 bg-primary/12 text-primary"
              : "border-border/60 text-muted-foreground hover:bg-primary/10 hover:text-foreground",
          )}
        >
          <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full">
            <Bookmark className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{tSaved("title")}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {tSaved("sidebarDescription")}
            </p>
          </div>
        </Link>

        {isLoading ? (
          <div className="flex items-center justify-center px-3 py-4">
            <Loader className="text-muted-foreground size-4 animate-spin" />
          </div>
        ) : allDMs.length === 0 ? (
          <EmptyStateCard
            icon={MessageSquare}
            title={tDm("emptyTitle")}
            description={tDm("emptyDescription")}
            size="sm"
            className="mx-1 mt-1"
          />
        ) : (
          allDMs.map(chat => {
            const displayName = getDirectChatDisplayName(chat, userId);
            const displayAvatar = getDirectChatDisplayAvatar(chat, userId);
            const chatPath = getChatRoute({
              chatId: chat.id,
              groupId: chat.groupId,
              isGroup: chat.isGroup,
            });
            const isActive =
              pathname === chatPath || pathname.startsWith(`${chatPath}/`);

            return (
              <Link
                key={chat.id}
                href={chatPath}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-primary/10 hover:text-foreground",
                )}
              >
                <EntityAvatar
                  name={displayName}
                  avatarUrl={displayAvatar}
                  size="sm"
                />
                <span className="min-w-0 flex-1 truncate">{displayName}</span>
              </Link>
            );
          })
        )}
      </div>
    </>
  );
};

const FriendsOverviewSidebarContent = ({ pathname }: { pathname: string }) => {
  const { friends, isLoadingFriends, getFriendUser } = useFriends();
  const t = useTranslations("home");

  const friendsPreview = useMemo(
    () =>
      [...friends]
        .sort(
          (left, right) =>
            new Date(right.createdAt).getTime() -
            new Date(left.createdAt).getTime(),
        )
        .slice(0, 3),
    [friends],
  );

  return (
    <div className="flex flex-1 flex-col overflow-x-hidden px-3 pt-4 pb-3">
      <div className="min-h-0 flex-1">
        <section className="flex h-full min-h-full min-w-0 flex-col rounded-2xl border border-border/60 bg-background/20 p-2">
          <div className="flex items-center justify-between px-1 pb-2">
            <span className="text-muted-foreground text-xs font-semibold uppercase">
              {t("friends")}
            </span>
          </div>
          {isLoadingFriends ? (
            <div className="flex flex-1 items-center justify-center rounded-xl bg-background/30 px-3 py-6">
              <Loader className="text-muted-foreground size-4 animate-spin" />
            </div>
          ) : friendsPreview.length === 0 ? (
            <EmptyStateCard
              icon={Users}
              title={t("emptyFriendsTitle")}
              description={t("emptyFriendsDescription")}
              size="sm"
              className="m-1 flex-1"
            />
          ) : (
            <div className="scrollbar-thin min-h-0 flex-1 space-y-1 overflow-y-auto">
              {friendsPreview.map(friendship => {
                const friend = getFriendUser(friendship);
                if (!friend) return null;

                const profilePath = `/${friend.id}`;
                const isActive = pathname === profilePath;

                return (
                  <Link
                    key={friendship.id}
                    href={profilePath}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border border-transparent px-2.5 py-2 text-sm transition-colors",
                      isActive
                        ? "border-primary/20 bg-primary/12 text-primary"
                        : "text-muted-foreground hover:border-border/60 hover:bg-background/35 hover:text-foreground",
                    )}
                  >
                    <EntityAvatar
                      name={friend.username}
                      avatarUrl={friend.avatarUrl}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {friend.username}
                      </p>
                      <p className="text-muted-foreground min-h-4 truncate text-[11px]">
                        {friend.bio?.trim() || ""}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const HomeSidebar = () => {
  const pathname = usePathname();
  const { isAuthenticated, hasHydrated } = useAuth();
  const t = useTranslations("home");
  const tAuth = useTranslations("auth");
  const isFriendsPage = pathname === "/friends";

  // Пока zustand не загрузился из localStorage — показываем скелетон
  if (!hasHydrated) {
    return (
      <aside className="flex w-60 flex-col border-r border-border bg-card">
        <div className="flex h-12 items-center border-b border-border px-4 shadow-sm">
          <div className="flex items-center gap-3">
            <BrandMark className="size-8 rounded-xl" imageClassName="p-[10%]" />
            <h2 className="text-sm font-semibold">МесАгат</h2>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <Loader className="text-muted-foreground size-5 animate-spin" />
        </div>
      </aside>
    );
  }

  if (!isAuthenticated) {
    return (
      <aside className="flex w-60 flex-col border-r border-border bg-card">
        <div className="flex h-12 items-center border-b border-border px-4 shadow-sm">
          <div className="flex items-center gap-3">
            <BrandMark className="size-8 rounded-xl" imageClassName="p-[10%]" />
            <h2 className="text-sm font-semibold">МесАгат</h2>
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center justify-end gap-3 px-4 pb-6">
          <div className="flex flex-col items-center gap-2">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Users className="size-8 text-primary" />
            </div>
            <p className="text-muted-foreground text-center text-sm leading-snug">
              {tAuth("loginToChat")}
            </p>
          </div>
          <Button className="w-full" asChild>
            <Link href="/account/login">
              <LogIn className="mr-2 size-4" />
              {tAuth("login")}
            </Link>
          </Button>
          <Button className="w-full" variant="outline" asChild>
            <Link href="/account/create">
              <UserPlus className="mr-2 size-4" />
              {tAuth("register")}
            </Link>
          </Button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex w-60 flex-col border-r border-border bg-card">
      {/* Header */}
      <div className="flex h-12 items-center border-b border-border px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <BrandMark className="size-8 rounded-xl" imageClassName="p-[10%]" />
          <h2 className="text-sm font-semibold">МесАгат</h2>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-0.5 px-2 pt-3 pb-2">
        <Link
          href="/friends"
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/friends"
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:bg-primary/10 hover:text-foreground",
          )}
        >
          <Users className="size-5" />
          {t("friends")}
        </Link>
        <Link
          href="/dm"
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/dm"
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:bg-primary/10 hover:text-foreground",
          )}
        >
          <MessageSquare className="size-5" />
          {t("messages")}
        </Link>
      </nav>

      {isFriendsPage ? (
        <DirectMessagesSidebarContent pathname={pathname} />
      ) : (
        <FriendsOverviewSidebarContent pathname={pathname} />
      )}

      {/* User Panel */}
      <UserPanel />
    </aside>
  );
};

export default HomeSidebar;
