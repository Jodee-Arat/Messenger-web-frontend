"use client";

import {
  FindAllGroupsByUserQuery,
  useDeleteGroupMutation,
  useFindAllGroupsByUserQuery,
  useGroupAddedSubscription,
  useGroupDeletedSubscription,
  useLogoutUserMutation,
} from "@/shared/graphql/generated/output";
import { useAuth } from "@/shared/hooks/useAuth";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { revokeCurrentWebSecretSession } from "@/shared/libs/secret/web-secret-session-lifecycle";
import { cn } from "@/shared/utils/tw-merge";
import { Loader, LogOut, Menu, Search, Settings2, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/common/Button";
import BrandMark from "@/components/ui/elements/BrandMark";
import EmptyStateCard from "@/components/ui/elements/EmptyStateCard";
import EntityAvatar from "@/components/ui/elements/EntityAvatar";

import CreateGroupModal from "./CreateGroupModal";
import GroupDropdownTrigger from "./GroupDropdownTrigger";

const GroupsSidebar = () => {
  const [allGroups, setAllGroups] = useState<
    FindAllGroupsByUserQuery["findAllGroupsByUser"]
  >([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { user } = useCurrentUser();
  const { exit } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("groups");
  const tProfile = useTranslations("profile");
  const debouncedSearch = useDebouncedValue(searchQuery);
  const filteredGroups = useMemo(() => {
    const normalized = debouncedSearch.trim().toLowerCase();

    if (!normalized) {
      return allGroups;
    }

    return allGroups.filter((group) =>
      group.groupName.toLowerCase().includes(normalized),
    );
  }, [allGroups, debouncedSearch]);

  const { data: allGroupsData, loading: isLoadingFindAllGroups } =
    useFindAllGroupsByUserQuery({
      variables: {
        filters: {},
      },
      skip: !user?.id,
    });

  const { data: newGroupData } = useGroupAddedSubscription({
    variables: { userId: user?.id ?? "" },
    skip: !user?.id,
  });

  const [deleteGroup, { loading: isLoadingDeleteGroup }] =
    useDeleteGroupMutation({
      onCompleted() {
        toast.success(t("groupDeleted"));
      },
      onError() {
        toast.error(t("deleteError"));
      },
    });

  const [logout] = useLogoutUserMutation({
    onCompleted() {
      router.push("/account/login");
      exit();
      toast.success(tProfile("logoutSuccess"));
    },
    onError() {
      toast.error(tProfile("logoutError"));
    },
  });

  const { data: deleteGroupData } = useGroupDeletedSubscription({
    variables: {
      userId: user?.id ?? "",
    },
  });

  const handleDeleteGroup = (groupId: string) => {
    deleteGroup({
      variables: {
        groupId,
      },
    });
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleLogout = async () => {
    handleCloseDrawer();
    await revokeCurrentWebSecretSession();
    await logout();
  };

  useEffect(() => {
    if (!allGroupsData || !allGroupsData.findAllGroupsByUser) return;

    setAllGroups(allGroupsData.findAllGroupsByUser || []);
  }, [allGroupsData]);

  useEffect(() => {
    if (!newGroupData || !newGroupData.groupAdded) return;

    setAllGroups((prevGroups) => {
      const existingIndex = prevGroups.findIndex(
        (group) => group.id === newGroupData.groupAdded.id,
      );

      if (existingIndex === -1) {
        return [newGroupData.groupAdded, ...prevGroups];
      }

      return prevGroups.map((group) =>
        group.id === newGroupData.groupAdded.id
          ? newGroupData.groupAdded
          : group,
      );
    });
  }, [newGroupData]);

  useEffect(() => {
    if (!deleteGroupData || !deleteGroupData.groupDeleted) {
      return;
    }

    setAllGroups((prevGroups) =>
      prevGroups.filter(
        (group) => group.id !== deleteGroupData.groupDeleted.id,
      ),
    );
  }, [deleteGroupData]);

  useEffect(() => {
    handleCloseDrawer();
  }, [pathname]);

  useEffect(() => {
    if (isDrawerOpen) return;

    setSearchQuery("");
  }, [isDrawerOpen]);

  return (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:hidden">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10 rounded-full bg-background-tertiary"
          onClick={() => setIsDrawerOpen(true)}
          aria-label={t("title")}
        >
          <Menu className="size-5" />
        </Button>

        <Link href="/" className="mx-3 flex min-w-0 flex-1 items-center gap-3">
          <BrandMark className="size-10 rounded-xl" imageClassName="p-[10%]" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              МесАгат
            </p>
            <p className="truncate text-base font-bold text-foreground">
              {user?.username ?? t("title")}
            </p>
          </div>
        </Link>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10 rounded-full bg-background-tertiary"
          onClick={() => router.push("/settings")}
          aria-label={tProfile("settings")}
        >
          <Settings2 className="size-5" />
        </Button>
      </div>

      <aside className="hidden h-full w-[72px] flex-shrink-0 flex-col items-center border-r border-border bg-background py-3 md:flex">
        {/* Home button - like Discord's DM icon */}
        <Link
          href="/"
          className={cn(
            "mb-2 flex size-12 shrink-0 items-center justify-center rounded-2xl transition-all hover:rounded-xl",
            pathname === "/" || pathname === "/friends" || pathname === "/dm"
              ? "bg-primary text-primary-foreground rounded-xl"
              : "bg-card text-foreground hover:bg-primary hover:text-primary-foreground",
          )}
        >
          <BrandMark
            className="size-7 rounded-none bg-transparent ring-0 shadow-none"
            imageClassName="p-0"
          />
        </Link>

        {/* Separator */}
        <div className="mx-auto mb-2 h-0.5 w-8 rounded-full bg-border" />

        {/* Group list */}
        {user?.id ? (
          <div className="scrollbar-thin scrollbar-transparent flex min-h-0 flex-1 flex-col items-center space-y-2 overflow-y-auto overflow-x-hidden [&>*]:shrink-0">
            {allGroups.map((group) => (
              <GroupDropdownTrigger
                key={group.id}
                group={group}
                deleteGroup={handleDeleteGroup}
              />
            ))}
            <CreateGroupModal />
          </div>
        ) : null}
      </aside>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/60 animate-in fade-in-0 duration-200"
            onClick={handleCloseDrawer}
          />

          <aside className="absolute inset-y-0 left-0 flex w-[min(84vw,320px)] flex-col border-r border-border bg-card shadow-2xl animate-in slide-in-from-left-full duration-200">
            <div className="border-b border-border bg-card px-5 pb-4 pt-[calc(0.75rem+env(safe-area-inset-top))]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <BrandMark
                    className="size-9 rounded-xl"
                    imageClassName="p-[10%]"
                  />
                  <p className="truncate text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                    МесАгат
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 rounded-full bg-background-tertiary"
                  onClick={handleCloseDrawer}
                  aria-label="Close"
                >
                  <X className="size-4" />
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <EntityAvatar
                  name={user?.username}
                  avatarUrl={user?.avatarUrl}
                  size="lg"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-bold">
                    {user?.username ?? t("title")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tProfile("settings")}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 rounded-full bg-background-tertiary"
                  onClick={() => {
                    handleCloseDrawer();
                    router.push("/settings");
                  }}
                  aria-label={tProfile("settings")}
                >
                  <Settings2 className="size-4" />
                </Button>
              </div>
            </div>

            <div className="border-b border-border px-4 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={t("searchGroups")}
                  className="h-10 w-full rounded-xl border border-border bg-background-tertiary px-9 text-sm outline-none transition-colors focus:border-primary"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {t("title")}
              </p>
              <CreateGroupModal />
            </div>

            <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
              {isLoadingFindAllGroups ? (
                <div className="flex h-28 items-center justify-center">
                  <Loader className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : filteredGroups.length === 0 ? (
                <div className="px-5 pt-3">
                  <EmptyStateCard
                    icon={Search}
                    title={t("noGroups")}
                    description={searchQuery || t("createGroupHint")}
                    size="sm"
                  />
                </div>
              ) : (
                filteredGroups.map((group) => (
                  <GroupDropdownTrigger
                    key={group.id}
                    group={group}
                    deleteGroup={handleDeleteGroup}
                    variant="row"
                    onNavigate={handleCloseDrawer}
                  />
                ))
              )}
            </div>

            <div className="border-t border-border px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                onClick={() => void handleLogout()}
              >
                <LogOut className="size-4" />
                {tProfile("logout")}
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

export default GroupsSidebar;
