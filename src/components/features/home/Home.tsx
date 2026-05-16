"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Clock,
  Loader2,
  MessageSquare,
  Search,
  Send,
  UserMinus,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/common/Button";
import { Card, CardContent } from "@/components/ui/common/Card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/common/Dialog";
import { Input } from "@/components/ui/common/Input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/common/Tabs";
import { Skeleton } from "@/components/ui/common/Skeleton";
import EmptyStateCard from "@/components/ui/elements/EmptyStateCard";
import EntityAvatar from "@/components/ui/elements/EntityAvatar";

import { useFriends } from "@/shared/hooks/useFriends";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import {
  useFindAllUsersQuery,
  useFindOrCreateDirectChatMutation,
  useGetBlockedUsersQuery,
} from "@/shared/graphql/generated/output";
import {
  getGraphQLErrorMessage,
  isDirectContactBlockedError,
} from "@/shared/utils/direct-contact-blocked";
import { getChatRoute } from "@/shared/utils/chat-route";
import { markDirectChatStarted } from "@/shared/utils/direct-chat-visibility";
import { useUser } from "@/shared/hooks/useUser";

const Home = () => {
  const router = useRouter();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [findPeopleQuery, setFindPeopleQuery] = useState("");
  const [runtimeBlockedUserIds, setRuntimeBlockedUserIds] = useState<string[]>(
    [],
  );
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const tSettings = useTranslations("settings");
  const { userId } = useUser();
  const normalizedFindPeopleQuery = findPeopleQuery.trim();
  const debouncedFindPeopleQuery = useDebouncedValue(normalizedFindPeopleQuery);
  const hasFindPeopleQuery = debouncedFindPeopleQuery.length > 0;
  const isWaitingForFindPeopleSearch =
    normalizedFindPeopleQuery.length > 0 &&
    normalizedFindPeopleQuery !== debouncedFindPeopleQuery;
  const hasSettledFindPeopleQuery =
    normalizedFindPeopleQuery.length > 0 &&
    normalizedFindPeopleQuery === debouncedFindPeopleQuery &&
    hasFindPeopleQuery;

  const {
    data: usersData,
    loading: isLoadingUsers,
    error: usersError,
  } = useFindAllUsersQuery({
    variables: {
      filters: {
        searchTerm: debouncedFindPeopleQuery,
        take: 20,
      },
    },
    skip: !addDialogOpen || !hasFindPeopleQuery,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });
  const { data: blockedUsersData, refetch: refetchBlockedUsers } =
    useGetBlockedUsersQuery({
      fetchPolicy: "cache-and-network",
    });

  const filteredUsers = useMemo(
    () => usersData?.findAllUsers ?? [],
    [usersData],
  );
  const visibleUsers = useMemo(() => {
    if (
      normalizedFindPeopleQuery.length === 0 ||
      normalizedFindPeopleQuery !== debouncedFindPeopleQuery
    ) {
      return [];
    }

    return filteredUsers;
  }, [debouncedFindPeopleQuery, filteredUsers, normalizedFindPeopleQuery]);

  const blockedUserIds = useMemo(() => {
    const blockedByCurrentUser =
      blockedUsersData?.getBlockedUsers.flatMap((friendship) =>
        friendship.friend?.id ? [friendship.friend.id] : [],
      ) ?? [];

    return new Set([...blockedByCurrentUser, ...runtimeBlockedUserIds]);
  }, [blockedUsersData, runtimeBlockedUserIds]);

  const {
    friends,
    incoming,
    outgoing,
    isLoadingFriends,
    handleAccept,
    handleDecline,
    handleCancel,
    handleRemoveFriend,
    getFriendUser,
    refetchFriends,
  } = useFriends();

  const [findOrCreateDM] = useFindOrCreateDirectChatMutation();
  const handleMessage = async (friendUserId: string) => {
    if (blockedUserIds.has(friendUserId)) {
      toast.error(tCommon("directContactUnavailable"));
      return;
    }

    try {
      const { data } = await findOrCreateDM({
        variables: { friendUserId: friendUserId },
      });
      if (data?.findOrCreateDirectChat) {
        const chat = data.findOrCreateDirectChat;
        markDirectChatStarted(userId, chat.id);
        router.push(
          getChatRoute({
            chatId: chat.id,
            groupId: chat.groupId,
            isGroup: chat.isGroup,
          }),
        );
      }
    } catch (error) {
      if (isDirectContactBlockedError(error)) {
        setRuntimeBlockedUserIds((prev) =>
          prev.includes(friendUserId) ? prev : [...prev, friendUserId],
        );
        await Promise.allSettled([refetchFriends(), refetchBlockedUsers()]);
        toast.error(tCommon("directContactUnavailable"));
        return;
      }

      toast.error(getGraphQLErrorMessage(error));
    }
  };

  const handleSelectUser = (user: (typeof filteredUsers)[number]) => {
    setAddDialogOpen(false);
    setFindPeopleQuery("");
    router.push(`/${user.id}`);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setAddDialogOpen(open);
    if (!open) {
      setFindPeopleQuery("");
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold sm:text-3xl">{t("friends")}</h1>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button variant="outline" className="w-full sm:w-auto" asChild>
            <Link href="/dm">
              <MessageSquare className="mr-2 size-4" />
              {t("messages")}
            </Link>
          </Button>
          <Dialog open={addDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Search className="mr-2 size-4" />
                {t("findPeople")}
              </Button>
            </DialogTrigger>
            <DialogContent className="overflow-hidden p-0 sm:max-w-lg">
              <DialogHeader className="border-b border-border/60 bg-background px-6 pb-4 pt-6 pr-12">
                <DialogTitle>{t("findPeople")}</DialogTitle>
                <Input
                  placeholder={t("enterUsername")}
                  value={findPeopleQuery}
                  onChange={(e) => setFindPeopleQuery(e.target.value)}
                />
              </DialogHeader>
              <div className="max-h-[calc(100dvh-10rem)] overflow-y-auto px-4 py-4 sm:max-h-[calc(100vh-16rem)] sm:px-6">
                <div className="space-y-2">
                  {isWaitingForFindPeopleSearch ||
                  (hasSettledFindPeopleQuery && isLoadingUsers) ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="text-muted-foreground size-5 animate-spin" />
                    </div>
                  ) : hasSettledFindPeopleQuery && usersError ? (
                    <p className="text-destructive text-sm">
                      {getGraphQLErrorMessage(usersError)}
                    </p>
                  ) : visibleUsers.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      {normalizedFindPeopleQuery
                        ? tSettings("noUsersFound")
                        : t("enterUsername")}
                    </p>
                  ) : (
                    visibleUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelectUser(user)}
                        className="flex w-full items-center gap-3 rounded-lg border border-border/60 px-3 py-2 text-left transition-colors hover:bg-muted/50"
                      >
                        <EntityAvatar
                          name={user.username}
                          avatarUrl={user.avatarUrl}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {user.username}
                          </p>
                          <p className="text-muted-foreground truncate text-xs">
                            {user.bio || `@${user.username}`}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="grid h-auto w-full grid-cols-1 gap-1 sm:grid-cols-3 md:inline-flex md:w-auto">
          <TabsTrigger className="whitespace-normal" value="all">
            {t("all")}{" "}
            {friends.length > 0 && (
              <span className="text-muted-foreground ml-1">
                ({friends.length})
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger className="whitespace-normal" value="incoming">
            {t("incoming")}{" "}
            {incoming.length > 0 && (
              <span className="text-muted-foreground ml-1">
                ({incoming.length})
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger className="whitespace-normal" value="outgoing">
            {t("outgoing")}{" "}
            {outgoing.length > 0 && (
              <span className="text-muted-foreground ml-1">
                ({outgoing.length})
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* All Friends */}
        <TabsContent value="all" className="mt-4 space-y-2">
          {isLoadingFriends ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="size-9 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))
          ) : friends.length === 0 ? (
            <EmptyStateCard
              icon={Users}
              title={t("emptyFriendsTitle")}
              description={t("emptyFriendsDescription")}
            />
          ) : (
            friends.map((f) => {
              const u = getFriendUser(f);
              if (!u) return null;

              const isDirectContactUnavailable = blockedUserIds.has(u.id);

              return (
                <Card key={f.id} className="group">
                  <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
                    <Link
                      href={`/${u.id}`}
                      className="flex w-full min-w-0 flex-1 items-center gap-3"
                    >
                      <EntityAvatar name={u.username} avatarUrl={u.avatarUrl} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold hover:underline">
                          {u.username}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {isDirectContactUnavailable
                            ? t("blocked")
                            : `${t("friendsSince")} ${new Date(f.createdAt).toLocaleDateString()}`}
                        </p>
                      </div>
                    </Link>
                    <div className="flex w-full justify-end gap-1 opacity-100 transition-opacity sm:w-auto sm:opacity-0 sm:group-hover:opacity-100">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleMessage(u.id)}
                        disabled={isDirectContactUnavailable}
                        title={
                          isDirectContactUnavailable
                            ? tCommon("directContactUnavailable")
                            : t("sendMessage")
                        }
                      >
                        <MessageSquare className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() =>
                          handleRemoveFriend(f.id, t("friendRemoved"))
                        }
                        title={t("removeFriend")}
                      >
                        <UserMinus className="size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Incoming Requests */}
        <TabsContent value="incoming" className="mt-4 space-y-2">
          {incoming.length === 0 ? (
            <EmptyStateCard
              icon={Clock}
              title={t("emptyIncomingTitle")}
              description={t("emptyIncomingDescription")}
            />
          ) : (
            incoming.map((req) => {
              const u = req.user;
              if (!u) return null;
              return (
                <Card key={req.id}>
                  <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
                    <EntityAvatar name={u.username} avatarUrl={u.avatarUrl} />
                    <div className="w-full min-w-0 flex-1">
                      <p className="text-sm font-semibold">{u.username}</p>
                      <p className="text-muted-foreground text-xs">
                        {t("incomingFriendRequest")}
                      </p>
                    </div>
                    <div className="flex w-full justify-end gap-1 sm:w-auto">
                      <Button
                        size="icon"
                        variant="default"
                        onClick={() => handleAccept(req.id)}
                        title={t("accept")}
                      >
                        <Check className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDecline(req.id)}
                        title={t("decline")}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Outgoing Requests */}
        <TabsContent value="outgoing" className="mt-4 space-y-2">
          {outgoing.length === 0 ? (
            <EmptyStateCard
              icon={Send}
              title={t("emptyOutgoingTitle")}
              description={t("emptyOutgoingDescription")}
            />
          ) : (
            outgoing.map((req) => {
              const u = req.friend;
              if (!u) return null;
              return (
                <Card key={req.id}>
                  <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
                    <EntityAvatar name={u.username} avatarUrl={u.avatarUrl} />
                    <div className="w-full min-w-0 flex-1">
                      <p className="text-sm font-semibold">{u.username}</p>
                      <p className="text-muted-foreground text-xs">
                        {t("outgoingPending")}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="outline"
                      className="self-end sm:self-auto"
                      onClick={() => handleCancel(req.id)}
                      title={t("cancel")}
                    >
                      <X className="size-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Home;
