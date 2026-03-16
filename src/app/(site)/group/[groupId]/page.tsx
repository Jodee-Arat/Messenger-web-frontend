"use client";

import { Settings, Users } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

import { Card, CardContent } from "@/components/ui/common/Card";
import { Button } from "@/components/ui/common/Button";
import EntityAvatar from "@/components/ui/elements/EntityAvatar";
import { useCurrentGroup } from "@/shared/hooks/useCurrentGroup";

export default function GroupPage() {
  const params = useParams<{ groupId: string }>();
  const groupId = params.groupId;
  const { group, isLoadingGroup } = useCurrentGroup(groupId);
  const t = useTranslations("groups");
  const tCommon = useTranslations("common");

  if (isLoadingGroup) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">{tCommon("loading")}</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">{t("groupNotFound")}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-6">
      <EntityAvatar
        size="xl"
        name={group.groupName}
        avatarUrl={group.avatarUrl ?? undefined}
      />

      <div className="text-center">
        <h1 className="text-2xl font-bold">{group.groupName}</h1>
        {group.description && (
          <p className="text-muted-foreground mt-2 max-w-md">
            {group.description}
          </p>
        )}
      </div>

      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Users className="size-5" />
            <span>{t("membersCount", { count: group.members?.length ?? 0 })}</span>
          </div>
        </CardContent>
      </Card>

      <p className="text-muted-foreground text-sm">
        {t("selectChatHint")}
      </p>

      <Link href={`/group/${groupId}/settings`}>
        <Button variant="outline" className="gap-2">
          <Settings className="size-4" />
          {t("groupSettings")}
        </Button>
      </Link>
    </div>
  );
}
