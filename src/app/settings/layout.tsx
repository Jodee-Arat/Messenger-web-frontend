import { PropsWithChildren } from "react";

import LayoutContainer from "@/components/layouts/LayoutContainer";
import Header from "@/components/layouts/header/Header";
import GroupsSidebar from "@/components/layouts/sidebar/groups/GroupsSidebar";

const SiteLayout = ({ children }: PropsWithChildren<unknown>) => {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 py-2">
        <div className="fixed inset-y-0 z-50 h-[75px] w-full">
          <Header />
        </div>
        <GroupsSidebar />
        <LayoutContainer>{children}</LayoutContainer>
      </div>
    </div>
  );
};

export default SiteLayout;
