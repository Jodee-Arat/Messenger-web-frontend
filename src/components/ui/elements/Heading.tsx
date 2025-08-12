import { type VariantProps, cva } from "class-variance-authority";

import { FindProfileQuery } from "@/graphql/generated/output";

import { getMediaSource } from "@/utils/get-media-source";
import { cn } from "@/utils/tw-merge";

import { Avatar, AvatarFallback, AvatarImage } from "../common/Avatar";

const headingSizes = cva("", {
  variants: {
    size: {
      sm: "text-lg",
      default: "text-2xl",
      lg: "text-4xl",
      xl: "text-5xl",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface HeadingProps extends VariantProps<typeof headingSizes> {
  title: string;
  description?: string;
}

const Heading = ({ size, title, description }: HeadingProps) => {
  return (
    <div className="space-y-2">
      <h1
        className={cn("text-foreground font-semibold", headingSizes({ size }))}
      >
        {title}
      </h1>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
};

export default Heading;
