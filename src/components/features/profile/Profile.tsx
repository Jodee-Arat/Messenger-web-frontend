"use client";

import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import {
  Calendar,
  Copy,
  Loader,
  MessageCircle,
  Shield,
  UserMinus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FC, useMemo } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/common/Button";
import { Card, CardContent } from "@/components/ui/common/Card";
import EntityAvatar from "@/components/ui/elements/EntityAvatar";
import ConfirmModal from "@/components/ui/elements/ConfirmModal";

import {
  useGetFriendsQuery,
  useFindAllUsersQuery,
  useFindOrCreateDirectChatMutation,
  useRemoveFriendMutation,
  useBlockUserMutation,
} from "@/shared/graphql/generated/output";

import ProfileHeader from "./ProfileHeader";

interface ProfileProp {
  profileId: string;
}

const Profile: FC<ProfileProp> = ({ profileId }) => {
  const { user, isLoadingProfile, refetch } = useCurrentUser();
  const router = useRouter();
  const t = useTranslations("profile");
  const tFriend = useTranslations("friendProfile");

  const isOwnProfile = user?.id === profileId;

  // ── Friend data ──
  const { data: friendsData, loading: isLoadingFriends } = useGetFriendsQuery({
    skip: isOwnProfile || !user,
  });

  const { data: allUsersData } = useFindAllUsersQuery({
    skip: isOwnProfile || !user,
  });

  const friendship = useMemo(() => {
    if (!friendsData?.getFriends || !user) return null;
    return friendsData.getFriends.find(f => {
      const friendUser = f.userId === user.id ? f.friend : f.user;
      return friendUser?.id === profileId;
    });
  }, [friendsData, user, profileId]);

  const targetUser = useMemo(() => {
    if (!user) return null;
    // Try from friendship first
    if (friendship) {
      return friendship.userId === user.id
        ? friendship.friend
        : friendship.user;
    }
    // Fallback to all users
    return allUsersData?.findAllUsers?.find(u => u.id === profileId) ?? null;
  }, [friendship, allUsersData, user, profileId]);

  const friendSinceFormatted = useMemo(() => {
    if (!friendship?.createdAt) return null;
    const d = new Date(friendship.createdAt);
    return d.toLocaleDateString("en-US", {
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
  }, [friendship]);

  // ── Mutations ──
  const [findOrCreateDM, { loading: isCreatingChat }] =
    useFindOrCreateDirectChatMutation();
  const [removeFriend] = useRemoveFriendMutation({
    refetchQueries: ["GetFriends"],
  });
  const [blockUser] = useBlockUserMutation();

  const handleSendMessage = async () => {
    try {
      const { data } = await findOrCreateDM({
        variables: { friendUserId: profileId },
      });
      if (data?.findOrCreateDirectChat) {
        const chat = data.findOrCreateDirectChat;
        router.push(`/group/${chat.groupId}/${chat.id}`);
      }
    } catch (e: any) {
      toast.error(e.message);
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
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleBlockUser = async () => {
    try {
      await blockUser({ variables: { targetUserId: profileId } });
      toast.success(tFriend("userBlocked"));
      router.push("/");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (isLoadingProfile || !user) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader className="text-muted-foreground size-6 animate-spin" />
      </div>
    );
  }

  // ── Own Profile ──
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

  // ── Friend / Other User Profile ──
  if (isLoadingFriends) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader className="text-muted-foreground size-6 animate-spin" />
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
      {/* Avatar & Name */}
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

      {/* Friend since badge */}
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

      {/* Actions */}
      <div className="space-y-2">
        <p className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wider">
          {tFriend("actions")}
        </p>

        {/* Send message */}
        <Button
          className="w-full justify-start gap-3"
          onClick={handleSendMessage}
          disabled={isCreatingChat}
        >
          <MessageCircle className="size-4" />
          {tFriend("sendMessage")}
        </Button>

        {/* Copy username */}
        <Button
          variant="outline"
          className="w-full justify-start gap-3"
          onClick={handleCopyUsername}
        >
          <Copy className="size-4" />
          {tFriend("copyUsername")}
        </Button>

        {/* Remove friend */}
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

        {/* Block user */}
        <ConfirmModal
          heading={tFriend("blockUser")}
          message={tFriend("blockUserConfirm", {
            username: targetUser.username,
          })}
          onConfirm={handleBlockUser}
        >
          <Button variant="destructive" className="w-full justify-start gap-3">
            <Shield className="size-4" />
            {tFriend("blockUser")}
          </Button>
        </ConfirmModal>
      </div>
    </div>
  );
};

export default Profile;
