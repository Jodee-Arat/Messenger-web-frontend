"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/common/Button";
import EntityAvatar from "@/components/ui/elements/EntityAvatar";
import Hint from "@/components/ui/elements/Hint";

import { FindAllGroupsByUserQuery } from "@/graphql/generated/output";

import { cn } from "@/utils/tw-merge";

interface GroupsSidebarItemProps {
  group: FindAllGroupsByUserQuery["findAllGroupsByUser"][0];
}

const GroupsSidebarItem = ({ group }: GroupsSidebarItemProps) => {
  const pathname = usePathname();

  const isActive = pathname === "http://localhost:3000/group/" + group.id;

  return (
    <Hint label={group.groupName} asChild side="right">
      <Button
        className={cn("flex h-11 justify-center", isActive && "bg-accent")}
        variant="ghost"
        asChild
      >
        <Link className="" href={"http://localhost:3000/group/" + group.id}>
          <EntityAvatar name={group.groupName} avatarUrl={group.avatarUrl} />
        </Link>
      </Button>
    </Hint>
  );
};

export default GroupsSidebarItem;
