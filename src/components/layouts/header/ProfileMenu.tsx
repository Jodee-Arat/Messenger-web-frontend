"use client";

import { LayoutDashboard, Loader, LogOut, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/common/DropdownMenu";

import { useLogoutUserMutation } from "@/graphql/generated/output";

import { useAuth } from "@/hooks/useAuth";
import { useCurrent } from "@/hooks/useCurrent";

const ProfileMenu = () => {
  const router = useRouter();

  const { exit } = useAuth();
  const { user, isLoadingProfile } = useCurrent();

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
      <DropdownMenu>
        <DropdownMenuTrigger className="outline-primary cursor-pointer rounded-full outline-0">
          <Image
            src={"/images/avatar/avatar.png"}
            alt={user.username}
            width={40}
            height={40}
            className="size-12 rounded-full object-cover"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[230px]">
          <div className="flex items-center gap-x-3 p-2">
            <h2 className="text-foreground font-medium">{user.username}</h2>
          </div>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => logout()}>
            <LogOut className="mr-2 size-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default ProfileMenu;
