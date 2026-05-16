import { PropsWithChildren } from "react";

import HomeSidebar from "@/components/layouts/sidebar/HomeSidebar";

const HomeLayout = ({ children }: PropsWithChildren<unknown>) => {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden md:flex-row">
      <HomeSidebar />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-background/60 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
};

export default HomeLayout;
