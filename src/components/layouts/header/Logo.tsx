"use client";

import Link from "next/link";

import BrandMark from "@/components/ui/elements/BrandMark";

const Logo = () => {
  return (
    <Link
      href="/"
      className="flex items-center gap-x-3 transition-opacity hover:opacity-75"
    >
      <BrandMark priority />

      <div className="hidden leading-tight lg:block">
        <h2 className="text-foreground text-lg font-semibold uppercase tracking-[0.18em]">
          МесАгат
        </h2>
      </div>
    </Link>
  );
};

export default Logo;
