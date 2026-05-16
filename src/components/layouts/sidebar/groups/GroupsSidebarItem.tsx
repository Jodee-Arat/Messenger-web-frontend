"use client";

import { FindAllGroupsByUserQuery } from "@/shared/graphql/generated/output";
import { cn } from "@/shared/utils/tw-merge";
import Link from "next/link";
import { usePathname } from "next/navigation";

import EntityAvatar from "@/components/ui/elements/EntityAvatar";
import Hint from "@/components/ui/elements/Hint";

interface GroupsSidebarItemProps {
  group: FindAllGroupsByUserQuery["findAllGroupsByUser"][0];
  variant?: "icon" | "row";
  onNavigate?: () => void;
}

const GroupsSidebarItem = ({
  group,
  variant = "icon",
  onNavigate,
}: GroupsSidebarItemProps) => {
  const pathname = usePathname();

  const isActive = pathname.startsWith("/group/" + group.id);

  if (variant === "row") {
    return (
      <Link
        href={"/group/" + group.id}
        onClick={onNavigate}
        className={cn(
          "flex min-w-0 items-center gap-3 border-b border-border/50 px-5 py-3 transition-colors",
          isActive
            ? "bg-primary/12 text-primary"
            : "text-foreground hover:bg-primary/10",
        )}
      >
        <EntityAvatar name={group.groupName} avatarUrl={group.avatarUrl} />
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {group.groupName}
        </span>
      </Link>
    );
  }

  return (
    <Hint label={group.groupName} asChild side="right">
      <Link
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-[24px] transition-all hover:rounded-[16px]",
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
