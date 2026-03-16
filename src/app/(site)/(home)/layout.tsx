import { PropsWithChildren } from "react";

import HomeSidebar from "@/components/layouts/sidebar/HomeSidebar";

const HomeLayout = ({ children }: PropsWithChildren<unknown>) => {
  return (
    <div className="flex min-w-0 flex-1">
      <HomeSidebar />
      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-background/60 p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
};

export default HomeLayout;
