import { cn } from "@/shared/utils/tw-merge";
import { HTMLAttributes } from "react";

function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("bg-muted animate-pulse rounded-lg", className)}
      {...props}
    />
  );
}

export { Skeleton };
