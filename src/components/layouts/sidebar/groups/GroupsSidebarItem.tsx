"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/common/Button";
import Hint from "@/components/ui/elements/Hint";

import { cn } from "@/utils/tw-merge";

import { Route } from "./route.interface";

interface GroupsSidebarItemProps {
  route: Route;
}

const GroupsSidebarItem = ({ route }: GroupsSidebarItemProps) => {
  const pathname = usePathname();

  const isActive = pathname === route.href;

  return (
    <Hint label={route.label} asChild side="right">
      <Button
        className={cn(
          "flex h-11 w-[80%] justify-center",
          isActive && "bg-accent"
        )}
        size="icon"
        variant="ghost"
        asChild
      >
        <Link className="" href={route.href}>
          {route.icon}
        </Link>
      </Button>
    </Hint>
  );
};

export default GroupsSidebarItem;
