import { type VariantProps, cva } from "class-variance-authority";
import { memo } from "react";

import {
  FindAllGroupsByUserQuery,
  FindProfileQuery,
} from "@/graphql/generated/output";

import { getMediaSource } from "@/utils/get-media-source";
import { cn } from "@/utils/tw-merge";

import { Avatar, AvatarFallback, AvatarImage } from "../common/Avatar";

const avatarSizes = cva("", {
  variants: {
    size: {
      sm: "size-7",
      default: "size-9",
      lg: "size-12",
      xl: "size-32",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface EntityAvatarProps extends VariantProps<typeof avatarSizes> {
  name?: string | null;
  avatarUrl?: string | null;
}

const EntityAvatar = memo(({ size, name, avatarUrl }: EntityAvatarProps) => {
  return (
    <div className="relative">
      <Avatar className={cn(avatarSizes({ size }))}>
        <AvatarImage
          src={avatarUrl ? getMediaSource(avatarUrl) : undefined}
          className="object-cover"
        />
        <AvatarFallback className={cn(size === "xl" && "text-4xl")}>
          {name?.[0]}
        </AvatarFallback>
      </Avatar>
    </div>
  );
});

export default EntityAvatar;
