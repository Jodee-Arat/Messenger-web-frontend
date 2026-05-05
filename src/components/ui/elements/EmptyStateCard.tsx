"use client";

import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

import { cn } from "@/shared/utils/tw-merge";

interface EmptyStateCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  size?: "sm" | "md";
  className?: string;
  children?: ReactNode;
}

const EmptyStateCard = ({
  icon: Icon,
  title,
  description,
  size = "md",
  className,
  children,
}: EmptyStateCardProps) => {
  const isSmall = size === "sm";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[24px] border border-dashed border-border/70 bg-background/40 backdrop-blur-sm",
        isSmall ? "px-4 py-5" : "px-6 py-8",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.14),transparent_58%)]" />
      <div className="relative flex flex-col items-center text-center">
        <div
          className={cn(
            "mb-3 flex items-center justify-center rounded-[18px] border border-primary/15 bg-primary/10 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]",
            isSmall ? "size-11" : "size-14",
          )}
        >
          <Icon
            className={cn(
              "text-primary",
              isSmall ? "size-5" : "size-6",
            )}
          />
        </div>

        <p
          className={cn(
            "font-semibold text-foreground",
            isSmall ? "text-sm" : "text-base",
          )}
        >
          {title}
        </p>

        {description ? (
          <p
            className={cn(
              "mt-1.5 max-w-md text-muted-foreground",
              isSmall ? "text-xs leading-5" : "text-sm leading-6",
            )}
          >
            {description}
          </p>
        ) : null}

        {children ? <div className="mt-4">{children}</div> : null}
      </div>
    </div>
  );
};

export default EmptyStateCard;
