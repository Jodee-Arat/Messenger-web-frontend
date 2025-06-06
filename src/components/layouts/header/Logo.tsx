"use client";

import Image from "next/image";
import Link from "next/link";

const Logo = () => {
  return (
    <Link
      href="/"
      className="flex items-center gap-x-4 transition-opacity hover:opacity-75"
    >
      <Image
        src="/images/logo256x256.ico"
        alt="MesArat"
        className="size-20"
        width={80}
        height={80}
      />

      <div className="hidden leading-tight lg:block">
        <h2 className="text-accent-foreground text-lg font-semibold tracking-wider">
          MesArat
        </h2>
      </div>
    </Link>
  );
};

export default Logo;
