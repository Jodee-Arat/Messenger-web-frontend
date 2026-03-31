"use client";

import { useAuth } from "@/shared/hooks/useAuth";
import { useDirectChats } from "@/shared/hooks/useDirectChats";
import { useUser } from "@/shared/hooks/useUser";
import { cn } from "@/shared/utils/tw-merge";
import { Loader, LogIn, MessageSquare, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/common/Button";
import BrandMark from "@/components/ui/elements/BrandMark";
import EntityAvatar from "@/components/ui/elements/EntityAvatar";

import UserPanel from "./UserPanel";

const HomeSidebar = () => {
  const pathname = usePathname();
  const { isAuthenticated, hasHydrated } = useAuth();
  const { userId } = useUser();
  const { pinnedChats, unpinnedChats } = useDirectChats();
  const t = useTranslations("home");
  const tAuth = useTranslations("auth");
  const tDm = useTranslations("dm");

  const allDMs = [...pinnedChats, ...unpinnedChats];

  // Пока zustand не загрузился из localStorage — показываем скелетон
  if (!hasHydrated) {
    return (
      <aside className="flex w-60 flex-col border-r border-border bg-card">
        <div className="flex h-12 items-center border-b border-border px-4 shadow-sm">
          <div className="flex items-center gap-3">
            <BrandMark className="size-8 rounded-xl" imageClassName="p-[10%]" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
              МесАгат
            </h2>
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
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
              МесАгат
            </h2>
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
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
            МесАгат
          </h2>
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

      {/* DM list header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-1">
        <span className="text-muted-foreground text-xs font-semibold uppercase">
          {tDm("title")}
        </span>
      </div>

      {/* DM list - scrollable */}
      <div className="scrollbar-thin flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
        {allDMs.length === 0 ? (
          <p className="text-muted-foreground px-3 py-4 text-center text-xs">
            {tDm("noDMs")}
          </p>
        ) : (
          allDMs.map((chat) => {
            const otherUser = chat.members?.find(
              (m) => m.user.id !== userId,
            )?.user;
            const displayName = chat.chatName || otherUser?.username || "Chat";
            const chatPath = `/group/${chat.groupId}/${chat.id}`;
            const isActive = pathname === chatPath;

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
                  avatarUrl={otherUser?.avatarUrl}
                  size="sm"
                />
                <span className="min-w-0 flex-1 truncate">{displayName}</span>
              </Link>
            );
          })
        )}
      </div>

      {/* User Panel */}
      <UserPanel />
    </aside>
  );
};

export default HomeSidebar;
