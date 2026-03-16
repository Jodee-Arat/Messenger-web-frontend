"use client";

import { FindAllGroupsByUserQuery } from "@/shared/graphql/generated/output";
import { cn } from "@/shared/utils/tw-merge";
import Link from "next/link";
import { usePathname } from "next/navigation";

import EntityAvatar from "@/components/ui/elements/EntityAvatar";
import Hint from "@/components/ui/elements/Hint";

interface GroupsSidebarItemProps {
  group: FindAllGroupsByUserQuery["findAllGroupsByUser"][0];
}

const GroupsSidebarItem = ({ group }: GroupsSidebarItemProps) => {
  const pathname = usePathname();

  const isActive = pathname.startsWith("/group/" + group.id);

  return (
    <Hint label={group.groupName} asChild side="right">
      <Link
        className={cn(
          "flex size-12 items-center justify-center rounded-[24px] transition-all hover:rounded-[16px]",
          isActive
            ? "bg-primary text-primary-foreground rounded-[16px]"
            : "bg-card text-foreground hover:bg-primary hover:text-primary-foreground",
        )}
        href={"/group/" + group.id}
      >
        <EntityAvatar name={group.groupName} avatarUrl={group.avatarUrl} />
      </Link>
    </Hint>
  );
};

export default GroupsSidebarItem;
