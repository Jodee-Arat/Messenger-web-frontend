"use client";

import Image from "next/image";

import { cn } from "@/shared/utils/tw-merge";

interface BrandMarkProps {
  alt?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
}

const BrandMark = ({
  alt = "МесАгат",
  className,
  imageClassName,
  priority = false,
}: BrandMarkProps) => {
  return (
    <div
      className={cn(
        "relative flex size-10 shrink-0 items-center justify-center overflow-visible",
        className,
      )}
    >
      <Image
        src="/brand/logo-mark.png"
        alt={alt}
        fill
        priority={priority}
        sizes="80px"
        className={cn("object-contain", imageClassName)}
      />
    </div>
  );
};

export default BrandMark;
