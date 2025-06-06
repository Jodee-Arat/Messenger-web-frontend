"use client";

import { type PropsWithChildren, useEffect } from "react";

// import { useMediaQuery } from "@/hooks/useMediaQuery";
// import { useSidebar } from "@/hooks/useSidebar";

import { cn } from "@/utils/tw-merge";

const LayoutContainer = ({ children }: PropsWithChildren<unknown>) => {
  // const isMobile = useMediaQuery("(max-width: 1024px)");

  // const { close, isCollapsed, open } = useSidebar();

  // useEffect(() => {
  //   if (isMobile && !isCollapsed) {
  //     close();
  //   } else if (!isMobile && isCollapsed) {
  //     open();
  //   }
  // }, [isMobile]);

  return (
    <main
      className={
        cn("flex-1 flex-row px-8")
        // "mt-[75px] flex-1 flex-row px-8 py-4"
        // isCollapsed ? "ml-16" : "ml-16 lg:ml-64"
      }
    >
      {children}
    </main>
  );
};

export default LayoutContainer;
