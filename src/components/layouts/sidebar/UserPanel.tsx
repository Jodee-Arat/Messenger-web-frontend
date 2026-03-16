"use client";

import { useLogoutUserMutation } from "@/shared/graphql/generated/output";
import { useAuth } from "@/shared/hooks/useAuth";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import { Loader, LogOut, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/common/Button";
import EntityAvatar from "@/components/ui/elements/EntityAvatar";

const UserPanel = () => {
  const router = useRouter();
  const { exit } = useAuth();
  const { user, isLoadingProfile } = useCurrentUser();
  const t = useTranslations("profile");

  const [logout] = useLogoutUserMutation({
    onCompleted() {
      router.push("/account/login");
      exit();
      toast.success(t("logoutSuccess"));
    },
    onError() {
      toast.error(t("logoutError"));
    },
  });

  if (isLoadingProfile || !user) {
    return (
      <div className="flex h-[52px] items-center justify-center border-t border-border bg-background/50">
        <Loader className="text-muted-foreground size-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 border-t border-border bg-background/50 px-2 py-2">
      <EntityAvatar name={user.username} avatarUrl={user.avatarUrl} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{user.username}</p>
      </div>
      <Button
        size="icon"
        variant="ghost"
        className="size-8"
        onClick={() => router.push("/settings")}
        title={t("settings")}
      >
        <Settings2 className="size-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="text-destructive size-8"
        onClick={() => logout()}
        title={t("logout")}
      >
        <LogOut className="size-4" />
      </Button>
    </div>
  );
};

export default UserPanel;
