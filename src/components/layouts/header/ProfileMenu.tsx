"use client";

import { useLogoutUserMutation } from "@/shared/graphql/generated/output";
import { useAuth } from "@/shared/hooks/useAuth";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import { Loader, LogOut, Settings2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/common/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/common/DropdownMenu";
import EntityAvatar from "@/components/ui/elements/EntityAvatar";

const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const router = useRouter();

  const { exit } = useAuth();
  const { user, isLoadingProfile } = useCurrentUser();

  const [logout] = useLogoutUserMutation({
    onCompleted() {
      router.push("/account/login");
      exit();
      toast.success("Successfully");
    },
    onError() {
      toast.error("Error");
    },
  });

  return isLoadingProfile || !user ? (
    <Loader className="text-muted-foreground size-6 animate-spin" />
  ) : (
    <>
      <DropdownMenu
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
        }}
      >
        <DropdownMenuTrigger className="outline-primary cursor-pointer rounded-full outline-0">
          <EntityAvatar
            name={user.username}
            avatarUrl={user.avatarUrl}
            size="lg"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[230px]">
          <DropdownMenuItem onClick={() => router.push(`/${user.id}`)}>
            <Button className="w-full justify-start" variant="ghost" asChild>
              <Link onClick={() => setIsOpen(false)} href={`/${user.id}`}>
                <h2 className="text-foreground font-medium">{user.username}</h2>
              </Link>
            </Button>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push(`/settings`)}
          >
            <Settings2 className="mr-2 size-4" />
            Settings
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem className="cursor-pointer" onClick={() => logout()}>
            <LogOut className="mr-2 size-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default ProfileMenu;
