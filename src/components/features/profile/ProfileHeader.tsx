import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import { Loader } from "lucide-react";
import { useTranslations } from "next-intl";
import { FC } from "react";

import { Button } from "@/components/ui/common/Button";
import { Card, CardContent } from "@/components/ui/common/Card";
import EntityAvatar from "@/components/ui/elements/EntityAvatar";

interface ProfileHeaderProp {
  profileId: string;
}

const ProfileHeader: FC<ProfileHeaderProp> = ({ profileId }) => {
  const { user, isLoadingProfile, refetch } = useCurrentUser();
  const t = useTranslations("profile");

  return isLoadingProfile || !user ? (
    <Loader className="text-muted-foreground size-6 animate-spin" />
  ) : (
    <Card className="col-span-4 overflow-hidden">
      <div className="h-24 w-full bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)]" />
      <CardContent className="flex h-full items-center gap-10 px-20 -mt-12">
        <EntityAvatar
          name={user.username}
          avatarUrl={user.avatarUrl}
          size="xl"
        />
        <div className="mt-4 space-y-2">
          <h2 className="text-2xl font-bold">{user.username}</h2>
          <p className="text-muted-foreground mt-2">{user.id}</p>
          <Button className="" onClick={() => refetch()} variant="outline">
            {t("refreshProfile")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
