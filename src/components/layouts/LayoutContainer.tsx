"use client";

import { type PropsWithChildren } from "react";

const LayoutContainer = ({ children }: PropsWithChildren<unknown>) => {
  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto p-4 sm:p-6">
      {children}
    </main>
  );
};

export default LayoutContainer;
