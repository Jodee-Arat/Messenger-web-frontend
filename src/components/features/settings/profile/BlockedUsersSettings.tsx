"use client";

import { Loader2, ShieldOff } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/common/Button";
import { Card, CardContent } from "@/components/ui/common/Card";
import { Skeleton } from "@/components/ui/common/Skeleton";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/common/Alert";
import EntityAvatar from "@/components/ui/elements/EntityAvatar";
import Heading from "@/components/ui/elements/Heading";

import {
  useGetBlockedUsersQuery,
  useUnblockUserMutation,
} from "@/shared/graphql/generated/output";
import { getGraphQLErrorMessage } from "@/shared/utils/direct-contact-blocked";

const BlockedUsersSettings = () => {
  const tSettings = useTranslations("settings");
  const tFriend = useTranslations("friendProfile");
  const tHome = useTranslations("home");
  const tCommon = useTranslations("common");

  const [pendingUnblockId, setPendingUnblockId] = useState<string | null>(null);

  const {
    data,
    loading,
    error,
    refetch: refetchBlockedUsers,
  } = useGetBlockedUsersQuery({
    fetchPolicy: "cache-and-network",
  });

  const [unblockUser] = useUnblockUserMutation({
    refetchQueries: ["GetBlockedUsers", "FindAllChatsByUser"],
    awaitRefetchQueries: true,
  });

  const handleUnblock = async (friendshipId: string) => {
    try {
      setPendingUnblockId(friendshipId);
      await unblockUser({ variables: { friendshipId } });
      toast.success(tFriend("userUnblocked"));
    } catch (mutationError) {
      toast.error(getGraphQLErrorMessage(mutationError));
    } finally {
      setPendingUnblockId(null);
    }
  };

  if (loading) {
    return (
      <div className="mt-5 space-y-6">
        <Heading
          title={tSettings("blockedUsersTitle")}
          description={tSettings("blockedUsersDescription")}
        />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="flex items-center gap-3 p-4">
                <Skeleton className="size-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-9 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-5 space-y-6">
        <Heading
          title={tSettings("blockedUsersTitle")}
          description={tSettings("blockedUsersDescription")}
        />
        <Alert variant="destructive">
          <ShieldOff className="size-4" />
          <AlertTitle>{tSettings("blockedUsersLoadError")}</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>{getGraphQLErrorMessage(error)}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchBlockedUsers()}
            >
              {tCommon("retry")}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const blockedUsers = data?.getBlockedUsers ?? [];

  return (
    <div className="mt-5 space-y-6">
      <Heading
        title={tSettings("blockedUsersTitle")}
        description={tSettings("blockedUsersDescription")}
      />

      {blockedUsers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-primary/10">
              <ShieldOff className="text-primary size-7" />
            </div>
            <p className="text-sm font-semibold">{tHome("noBlockedUsers")}</p>
            <p className="text-muted-foreground mt-1 text-sm">
              {tSettings("blockedUsersEmptyDescription")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {blockedUsers.map((friendship) => {
            const blockedUser = friendship.friend;

            if (!blockedUser) {
              return null;
            }

            return (
              <Card key={friendship.id}>
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <Link
                    href={`/${blockedUser.id}`}
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    <EntityAvatar
                      name={blockedUser.username}
                      avatarUrl={blockedUser.avatarUrl}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold hover:underline">
                        {blockedUser.username}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {tSettings("blockedSince")}{" "}
                        {new Date(friendship.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pendingUnblockId === friendship.id}
                    onClick={() => handleUnblock(friendship.id)}
                  >
                    {pendingUnblockId === friendship.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ShieldOff className="size-4" />
                    )}
                    {tFriend("unblockUser")}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BlockedUsersSettings;
