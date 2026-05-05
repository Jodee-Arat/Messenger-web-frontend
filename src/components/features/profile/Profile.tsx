"use client";

import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import {
  Calendar,
  Copy,
  Loader,
  type LucideIcon,
  MessageCircle,
  Shield,
  ShieldOff,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FC, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/common/Alert";
import { Button } from "@/components/ui/common/Button";
import { Card, CardContent } from "@/components/ui/common/Card";
import BackButton from "@/components/ui/elements/BackButton";
import EntityAvatar from "@/components/ui/elements/EntityAvatar";
import ConfirmModal from "@/components/ui/elements/ConfirmModal";

import {
  useBlockUserMutation,
  useFindAllUsersQuery,
  useFindOrCreateDirectChatMutation,
  useGetBlockedUsersQuery,
  useGetOutgoingFriendRequestsQuery,
  useGetFriendsQuery,
  useRemoveFriendMutation,
  useSendFriendRequestByUsernameMutation,
  useUnblockUserMutation,
} from "@/shared/graphql/generated/output";
import { cn } from "@/shared/utils/tw-merge";
import {
  getGraphQLErrorMessage,
  isDirectContactBlockedError,
} from "@/shared/utils/direct-contact-blocked";
import { getChatRoute } from "@/shared/utils/chat-route";
import { markDirectChatStarted } from "@/shared/utils/direct-chat-visibility";

interface ProfileProp {
  profileId: string;
}

interface ProfileActionButtonProps {
  icon: LucideIcon;
  label: string;
  disabled?: boolean;
  variant?: "default" | "outline" | "destructive";
  onClick?: () => void;
}

const ProfileActionButton = ({
  icon: Icon,
  label,
  disabled,
  variant = "outline",
  onClick,
}: ProfileActionButtonProps) => {
  const iconToneClass =
    variant === "default"
      ? "bg-background/12 text-primary-foreground"
      : variant === "destructive"
        ? "bg-black/10 text-destructive-foreground"
        : "bg-primary/10 text-primary";

  return (
    <Button
      variant={variant}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-auto min-h-28 w-full flex-col items-start justify-between gap-4 whitespace-normal rounded-2xl px-4 py-4 text-left shadow-sm",
        variant === "outline" &&
          "border-border/60 bg-card/60 hover:bg-muted/30",
        variant === "default" &&
          "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-95",
        variant === "destructive" &&
          "bg-destructive text-destructive-foreground hover:bg-destructive/95",
      )}
    >
      <span
        className={cn(
          "flex size-10 items-center justify-center rounded-xl",
          iconToneClass,
        )}
      >
        <Icon className="size-4" />
      </span>
      <span className="text-sm font-semibold leading-snug">{label}</span>
    </Button>
  );
};

const Profile: FC<ProfileProp> = ({ profileId }) => {
  const { user, isLoadingProfile } = useCurrentUser();
  const router = useRouter();
  const t = useTranslations("profile");
  const tFriend = useTranslations("friendProfile");
  const tCommon = useTranslations("common");
  const tHome = useTranslations("home");
  const tSettings = useTranslations("profileSettings");

  const [hasRuntimeBlockedDirectContact, setHasRuntimeBlockedDirectContact] =
    useState(false);

  const isOwnProfile = user?.id === profileId;

  const {
    data: friendsData,
    loading: isLoadingFriends,
    error: friendsError,
    refetch: refetchFriends,
  } = useGetFriendsQuery({
    skip: isOwnProfile || !user,
    fetchPolicy: "cache-and-network",
  });

  const {
    data: allUsersData,
    loading: isLoadingAllUsers,
    error: allUsersError,
    refetch: refetchAllUsers,
  } = useFindAllUsersQuery({
    skip: isOwnProfile || !user,
    fetchPolicy: "cache-and-network",
  });

  const {
    data: blockedUsersData,
    error: blockedUsersError,
    refetch: refetchBlockedUsers,
  } = useGetBlockedUsersQuery({
    skip: isOwnProfile || !user,
    fetchPolicy: "cache-and-network",
  });
  const {
    data: outgoingRequestsData,
    loading: isLoadingOutgoingRequests,
    refetch: refetchOutgoingRequests,
  } = useGetOutgoingFriendRequestsQuery({
    skip: isOwnProfile || !user,
    fetchPolicy: "cache-and-network",
  });

  const friendship = useMemo(() => {
    if (!friendsData?.getFriends || !user) return null;

    return friendsData.getFriends.find((friendshipItem) => {
      const friendUser =
        friendshipItem.userId === user.id
          ? friendshipItem.friend
          : friendshipItem.user;

      return friendUser?.id === profileId;
    });
  }, [friendsData, profileId, user]);

  const blockedFriendship = useMemo(() => {
    return (
      blockedUsersData?.getBlockedUsers.find(
        (friendshipItem) => friendshipItem.friend?.id === profileId,
      ) ?? null
    );
  }, [blockedUsersData, profileId]);

  const hasOutgoingRequest = useMemo(
    () =>
      outgoingRequestsData?.getOutgoingFriendRequests.some(
        (request) => request.friend?.id === profileId,
      ) ?? false,
    [outgoingRequestsData, profileId],
  );

  const targetUser = useMemo(() => {
    if (!user) return null;

    if (friendship) {
      return friendship.userId === user.id
        ? friendship.friend
        : friendship.user;
    }

    return (
      allUsersData?.findAllUsers?.find((target) => target.id === profileId) ??
      null
    );
  }, [allUsersData, friendship, profileId, user]);

  const friendSinceFormatted = useMemo(() => {
    if (!friendship?.createdAt) return null;

    const date = new Date(friendship.createdAt);

    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [friendship]);

  const friendDuration = useMemo(() => {
    if (!friendship?.createdAt) return null;

    const now = new Date();
    const since = new Date(friendship.createdAt);
    const days = Math.floor(
      (now.getTime() - since.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (days < 1) return tFriend("today");
    if (days === 1) return tFriend("oneDay");
    if (days < 30) return tFriend("days", { count: days });

    const months = Math.floor(days / 30);
    if (months < 12) return tFriend("months", { count: months });

    const years = Math.floor(months / 12);
    return tFriend("years", { count: years });
  }, [friendship, tFriend]);

  const isBlockedByCurrentUser = !!blockedFriendship;
  const isDirectContactUnavailable =
    isBlockedByCurrentUser || hasRuntimeBlockedDirectContact;
  const canSendMessage = !!friendship && !isDirectContactUnavailable;

  const [findOrCreateDM, { loading: isCreatingChat }] =
    useFindOrCreateDirectChatMutation();
  const [removeFriend] = useRemoveFriendMutation({
    refetchQueries: ["GetFriends"],
    awaitRefetchQueries: true,
  });
  const [sendFriendRequest, { loading: isSendingFriendRequest }] =
    useSendFriendRequestByUsernameMutation();
  const [blockUser] = useBlockUserMutation({
    refetchQueries: ["GetFriends", "GetBlockedUsers", "FindAllChatsByUser"],
    awaitRefetchQueries: true,
  });
  const [unblockUser, { loading: isUnblockingUser }] = useUnblockUserMutation({
    refetchQueries: ["GetBlockedUsers", "FindAllChatsByUser"],
    awaitRefetchQueries: true,
  });

  const handleRetry = async () => {
    await Promise.allSettled([
      refetchFriends(),
      refetchAllUsers(),
      refetchBlockedUsers(),
      refetchOutgoingRequests(),
    ]);
  };

  const handleSendMessage = async () => {
    if (!friendship) {
      toast.error(tFriend("directMessagesFriendsOnly"));
      return;
    }

    if (isDirectContactUnavailable) {
      toast.error(tCommon("directContactUnavailable"));
      return;
    }

    try {
      const { data } = await findOrCreateDM({
        variables: { friendUserId: profileId },
      });

      if (data?.findOrCreateDirectChat) {
        const chat = data.findOrCreateDirectChat;
        markDirectChatStarted(user?.id, chat.id);
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
        setHasRuntimeBlockedDirectContact(true);
        await Promise.allSettled([refetchFriends(), refetchBlockedUsers()]);
        toast.error(tCommon("directContactUnavailable"));
        return;
      }

      toast.error(getGraphQLErrorMessage(error));
    }
  };

  const handleCopyUsername = () => {
    if (targetUser?.username) {
      navigator.clipboard.writeText(targetUser.username);
      toast.success(tFriend("usernameCopied"));
    }
  };

  const handleRemoveFriend = async () => {
    if (!friendship) return;

    try {
      await removeFriend({ variables: { friendshipId: friendship.id } });
      toast.success(tFriend("friendRemoved"));
      router.push("/");
    } catch (error) {
      toast.error(getGraphQLErrorMessage(error));
    }
  };

  const handleAddFriend = async () => {
    if (
      !targetUser?.username ||
      hasOutgoingRequest ||
      isDirectContactUnavailable
    ) {
      return;
    }

    try {
      await sendFriendRequest({
        variables: { username: targetUser.username },
      });
      await Promise.allSettled([refetchOutgoingRequests(), refetchFriends()]);
      toast.success(tHome("friendRequestSent"));
    } catch (error) {
      toast.error(getGraphQLErrorMessage(error));
    }
  };

  const handleBlockUser = async () => {
    try {
      await blockUser({ variables: { targetUserId: profileId } });
      setHasRuntimeBlockedDirectContact(true);
      toast.success(tFriend("userBlocked"));
    } catch (error) {
      const errorMessage = getGraphQLErrorMessage(error);

      if (errorMessage.toLowerCase().includes("already blocked")) {
        setHasRuntimeBlockedDirectContact(true);
        await Promise.allSettled([refetchFriends(), refetchBlockedUsers()]);
        toast.error(tCommon("directContactUnavailable"));
        return;
      }

      toast.error(errorMessage);
    }
  };

  const handleUnblockUser = async () => {
    if (!blockedFriendship) return;

    try {
      await unblockUser({ variables: { friendshipId: blockedFriendship.id } });
      setHasRuntimeBlockedDirectContact(false);
      toast.success(tFriend("userUnblocked"));
    } catch (error) {
      toast.error(getGraphQLErrorMessage(error));
    }
  };

  if (isLoadingProfile || !user) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader className="text-muted-foreground size-6 animate-spin" />
      </div>
    );
  }

  if (isOwnProfile) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
        <BackButton className="mb-5 w-fit" />

        <Card className="overflow-hidden border-border/60 bg-card/85 shadow-xl">
          <div className="h-36 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.36),transparent_58%),linear-gradient(135deg,rgba(139,92,246,0.24),rgba(18,18,28,0))]" />
          <CardContent className="-mt-20 px-6 pb-10 sm:px-8">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full border-[6px] border-background bg-background p-1.5 shadow-2xl">
                <EntityAvatar
                  name={user.username}
                  avatarUrl={user.avatarUrl}
                  size="2xl"
                />
              </div>

              <div className="mt-5 space-y-3">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                  {user.username}
                </h1>
                <p className="text-muted-foreground text-sm font-medium sm:text-base">
                  @{user.username}
                </p>
                <p className="text-muted-foreground text-sm sm:text-base">
                  {user.email}
                </p>
                <p className="text-muted-foreground mx-auto max-w-2xl text-sm leading-7 sm:text-base">
                  {user.bio || t("noBio")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 border-border/60 bg-card/70 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <p className="text-muted-foreground mb-4 text-xs font-semibold uppercase tracking-[0.18em]">
              {tSettings("personalInfo")}
            </p>

            <div className="overflow-hidden rounded-2xl border border-border/50 bg-background/20">
              <div className="grid gap-1 px-4 py-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.14em]">
                  {tSettings("username")}
                </p>
                <p className="text-sm font-semibold sm:text-base">
                  @{user.username}
                </p>
              </div>

              <div className="border-t border-border/50 grid gap-1 px-4 py-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.14em]">
                  {tSettings("email")}
                </p>
                <p className="break-all text-sm font-semibold sm:text-base">
                  {user.email}
                </p>
              </div>

              <div className="border-t border-border/50 grid gap-1 px-4 py-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.14em]">
                  {tSettings("bio")}
                </p>
                <p className="text-muted-foreground whitespace-pre-wrap text-sm leading-7 sm:text-base">
                  {user.bio || t("noBio")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoadingFriends || isLoadingAllUsers) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader className="text-muted-foreground size-6 animate-spin" />
      </div>
    );
  }

  if (friendsError || allUsersError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Alert variant="destructive">
          <ShieldOff className="size-4" />
          <AlertTitle>{tFriend("profileLoadError")}</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>{getGraphQLErrorMessage(friendsError ?? allUsersError)}</p>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              {tCommon("retry")}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div className="px-10">
        <h2 className="text-xl font-bold">{tFriend("userNotFound")}</h2>
        <p className="text-muted-foreground mt-2">
          {tFriend("userNotFoundDesc")}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:py-8">
      <BackButton className="mb-4 w-fit" />
      <Card className="overflow-hidden border-border/60 bg-card/80 shadow-xl">
        <div className="h-28 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.3),transparent_58%),linear-gradient(135deg,rgba(139,92,246,0.18),rgba(18,18,28,0))]" />
        <CardContent className="-mt-14 px-6 pb-6">
          <div className="flex flex-col items-center text-center">
            <div className="rounded-full border-4 border-background bg-background p-1 shadow-xl">
              <EntityAvatar
                name={targetUser.username}
                avatarUrl={targetUser.avatarUrl}
                size="xl"
              />
            </div>

            <div className="mt-4 space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">
                {targetUser.username}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-muted-foreground text-sm">
                  @{targetUser.username}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 rounded-full border border-border/60 bg-background/45 px-2.5 text-xs"
                  onClick={handleCopyUsername}
                >
                  <Copy className="size-3.5" />
                  {tFriend("copyUsername")}
                </Button>
              </div>
              <p className="text-muted-foreground mx-auto max-w-2xl text-sm leading-7">
                {targetUser.bio || t("noBio")}
              </p>
            </div>

            {friendship && friendSinceFormatted && (
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/45 px-4 py-2 text-sm shadow-sm">
                  <Calendar className="text-primary size-4" />
                  <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.14em]">
                    {tFriend("friendsSince")}
                  </span>
                  <span className="font-semibold">{friendSinceFormatted}</span>
                </div>
                {friendDuration && (
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-500 shadow-sm">
                    {friendDuration}
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 space-y-4">
        {isDirectContactUnavailable && (
          <Alert className="border-border bg-muted/50">
            <ShieldOff className="size-4" />
            <AlertTitle>
              {isBlockedByCurrentUser
                ? tFriend("blockedByYouTitle")
                : tFriend("directContactUnavailableTitle")}
            </AlertTitle>
            <AlertDescription>
              {isBlockedByCurrentUser
                ? tFriend("blockedByYouDescription")
                : tCommon("directContactUnavailable")}
            </AlertDescription>
          </Alert>
        )}

        {blockedUsersError && (
          <Alert variant="destructive">
            <ShieldOff className="size-4" />
            <AlertTitle>{tFriend("blockedStatusLoadError")}</AlertTitle>
            <AlertDescription className="space-y-3">
              <p>{getGraphQLErrorMessage(blockedUsersError)}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchBlockedUsers()}
              >
                {tCommon("retry")}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-border/60 bg-card/70 shadow-lg">
          <CardContent className="p-4 sm:p-5">
            <div className="mb-4 rounded-2xl border border-border/50 bg-background/30 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.18em]">
                    {tFriend("actions")}
                  </p>
                  <h2 className="mt-2 text-lg font-semibold tracking-tight">
                    {targetUser.username}
                  </h2>
                  <p className="text-muted-foreground mt-1 text-sm leading-6">
                    {isBlockedByCurrentUser
                      ? tFriend("blockedByYouDescription")
                      : targetUser.bio || t("noBio")}
                  </p>
                </div>

                <div className="rounded-2xl border border-primary/15 bg-primary/10 p-3">
                  <MessageCircle className="text-primary size-5" />
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {!friendship && !isDirectContactUnavailable && (
                <ProfileActionButton
                  icon={UserPlus}
                  label={
                    hasOutgoingRequest
                      ? tHome("outgoingPending")
                      : tHome("addFriend")
                  }
                  onClick={handleAddFriend}
                  disabled={
                    isSendingFriendRequest ||
                    isLoadingOutgoingRequests ||
                    hasOutgoingRequest
                  }
                />
              )}

              {friendship && (
                <ProfileActionButton
                  icon={MessageCircle}
                  label={tFriend("sendMessage")}
                  variant="default"
                  onClick={handleSendMessage}
                  disabled={!canSendMessage || isCreatingChat}
                />
              )}

              <ProfileActionButton
                icon={Copy}
                label={tFriend("copyUsername")}
                onClick={handleCopyUsername}
              />

              {friendship && (
                <ConfirmModal
                  heading={tFriend("removeFriend")}
                  message={tFriend("removeFriendConfirm", {
                    username: targetUser.username,
                  })}
                  onConfirm={handleRemoveFriend}
                >
                  <div>
                    <ProfileActionButton
                      icon={UserMinus}
                      label={tFriend("removeFriend")}
                    />
                  </div>
                </ConfirmModal>
              )}

              {isBlockedByCurrentUser ? (
                <ProfileActionButton
                  icon={ShieldOff}
                  label={tFriend("unblockUser")}
                  onClick={handleUnblockUser}
                  disabled={isUnblockingUser}
                />
              ) : (
                <ConfirmModal
                  heading={tFriend("blockUser")}
                  message={tFriend("blockUserConfirm", {
                    username: targetUser.username,
                  })}
                  onConfirm={handleBlockUser}
                >
                  <div>
                    <ProfileActionButton
                      icon={Shield}
                      label={tFriend("blockUser")}
                      variant="destructive"
                    />
                  </div>
                </ConfirmModal>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
