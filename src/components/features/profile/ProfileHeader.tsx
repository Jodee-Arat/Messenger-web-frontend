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

interface ProfileHeaderProp {
  profileId: string;
}

const ProfileHeader: FC<ProfileHeaderProp> = ({ profileId }) => {
  const { user, isLoadingProfile, refetch } = useCurrentUser();

  return isLoadingProfile || !user ? (
    <Loader className="text-muted-foreground size-6 animate-spin" />
  ) : (
    <Card className="col-span-4">
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
  );
};

export default ProfileHeader;
