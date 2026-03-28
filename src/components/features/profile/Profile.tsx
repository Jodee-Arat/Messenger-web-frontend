"use client";

import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import {
  Calendar,
  Copy,
  Loader,
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
import {
  getGraphQLErrorMessage,
  isDirectContactBlockedError,
} from "@/shared/utils/direct-contact-blocked";

import ProfileHeader from "./ProfileHeader";

interface ProfileProp {
  profileId: string;
}

const Profile: FC<ProfileProp> = ({ profileId }) => {
  const { user, isLoadingProfile, refetch } = useCurrentUser();
  const router = useRouter();
  const t = useTranslations("profile");
  const tFriend = useTranslations("friendProfile");
  const tCommon = useTranslations("common");
  const tHome = useTranslations("home");

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
        router.push(`/group/${chat.groupId}/${chat.id}`);
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
      <div className="grid w-full grid-cols-4 gap-2">
        <ProfileHeader profileId={profileId} />
        <Card className="col-span-2">
          <CardContent className="flex h-full items-center gap-10 px-20">
            <EntityAvatar
              name={user.username}
              avatarUrl={user.avatarUrl}
              size="xl"
            />
            <div className="mt-4 space-y-2">
              <h2 className="text-2xl font-bold">{user.username}</h2>
              <p className="text-muted-foreground mt-2">
                {user.bio || t("noBio")}
              </p>
              <Button onClick={() => refetch()} variant="outline">
                {t("refreshProfile")}
              </Button>
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
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-col items-center pt-8 pb-6">
        <div className="rounded-full border-4 border-primary p-1">
          <EntityAvatar
            name={targetUser.username}
            avatarUrl={targetUser.avatarUrl}
            size="xl"
          />
        </div>
        <h1 className="mt-4 text-2xl font-bold">{targetUser.username}</h1>
        <button
          onClick={handleCopyUsername}
          className="text-muted-foreground mt-1 flex items-center gap-1 text-sm hover:underline"
        >
          @{targetUser.username}
          <Copy className="size-3" />
        </button>
      </div>

      {isDirectContactUnavailable && (
        <Alert className="mb-5 border-border bg-muted/50">
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
        <Alert variant="destructive" className="mb-5">
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

      {friendship && friendSinceFormatted && (
        <Card className="mb-5">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="bg-primary/10 flex size-10 items-center justify-center rounded-full">
              <Calendar className="text-primary size-5" />
            </div>
            <div className="flex-1">
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                {tFriend("friendsSince")}
              </p>
              <p className="text-sm font-semibold">{friendSinceFormatted}</p>
            </div>
            <span className="bg-green-500/10 text-green-500 rounded-full px-3 py-1 text-xs font-bold">
              {friendDuration}
            </span>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <p className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wider">
          {tFriend("actions")}
        </p>

        {!friendship && !isDirectContactUnavailable && (
          <Button
            className="w-full justify-start gap-3"
            onClick={handleAddFriend}
            disabled={
              isSendingFriendRequest ||
              isLoadingOutgoingRequests ||
              hasOutgoingRequest
            }
          >
            <UserPlus className="size-4" />
            {hasOutgoingRequest ? tHome("outgoingPending") : tHome("addFriend")}
          </Button>
        )}

        <Button
          className="w-full justify-start gap-3"
          onClick={handleSendMessage}
          disabled={isCreatingChat || isDirectContactUnavailable}
        >
          <MessageCircle className="size-4" />
          {tFriend("sendMessage")}
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start gap-3"
          onClick={handleCopyUsername}
        >
          <Copy className="size-4" />
          {tFriend("copyUsername")}
        </Button>

        {friendship && (
          <ConfirmModal
            heading={tFriend("removeFriend")}
            message={tFriend("removeFriendConfirm", {
              username: targetUser.username,
            })}
            onConfirm={handleRemoveFriend}
          >
            <Button
              variant="outline"
              className="text-destructive w-full justify-start gap-3"
            >
              <UserMinus className="size-4" />
              {tFriend("removeFriend")}
            </Button>
          </ConfirmModal>
        )}

        {isBlockedByCurrentUser ? (
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={handleUnblockUser}
            disabled={isUnblockingUser}
          >
            <ShieldOff className="size-4" />
            {tFriend("unblockUser")}
          </Button>
        ) : (
          <ConfirmModal
            heading={tFriend("blockUser")}
            message={tFriend("blockUserConfirm", {
              username: targetUser.username,
            })}
            onConfirm={handleBlockUser}
          >
            <Button
              variant="destructive"
              className="w-full justify-start gap-3"
            >
              <Shield className="size-4" />
              {tFriend("blockUser")}
            </Button>
          </ConfirmModal>
        )}
      </div>
    </div>
  );
};

export default Profile;
