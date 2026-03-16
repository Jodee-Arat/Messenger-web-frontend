"use client";

import { type PropsWithChildren } from "react";

const LayoutContainer = ({ children }: PropsWithChildren<unknown>) => {
  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-y-auto p-6">
      {children}
    </main>
  );
};

export default LayoutContainer;
