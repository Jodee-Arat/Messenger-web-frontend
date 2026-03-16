import { PropsWithChildren } from "react";

import GroupsSidebar from "@/components/layouts/sidebar/groups/GroupsSidebar";

const SiteLayout = ({ children }: PropsWithChildren<unknown>) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <GroupsSidebar />
      {children}
    </div>
  );
};

export default SiteLayout;
