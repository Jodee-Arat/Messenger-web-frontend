"use client";

import { Loader } from "lucide-react";
import { FC } from "react";

import { Button } from "@/components/ui/common/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/common/Card";
import EntityAvatar from "@/components/ui/elements/EntityAvatar";

import { useCurrentUser } from "@/hooks/useCurrentUser";

import ProfileHeader from "./ProfileHeader";

interface ProfileProp {
  profileId: string;
}

const Profile: FC<ProfileProp> = ({ profileId }) => {
  const { user, isLoadingProfile, refetch } = useCurrentUser();

  return isLoadingProfile || !user ? (
    <Loader className="text-muted-foreground size-6 animate-spin" />
  ) : (
    <div
      style={{ height: "calc(100vh - 107px)" }}
      className="ml-[50px] mt-[75px] grid w-[90%] grid-cols-4 gap-2"
    >
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
            <p className="text-muted-foreground mt-2">{user.id}</p>
            <Button className="" onClick={() => refetch()} variant="outline">
              Refresh Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
